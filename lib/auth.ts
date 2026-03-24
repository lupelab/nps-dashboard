import { cookies } from 'next/headers';
import { compare } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import { getUsersFromEnv, requiredEnv } from '@/lib/env';
import { SessionUser } from '@/lib/types';

const COOKIE_NAME = 'nps_texo_session';

function getSecret() {
  return new TextEncoder().encode(requiredEnv('AUTH_SECRET'));
}

export async function validateUser(username: string, password: string): Promise<SessionUser | null> {
  const users = getUsersFromEnv();
  const user = users.find((item) => item.username.toLowerCase() === username.toLowerCase());
  if (!user) return null;
  const valid = await compare(password, user.passwordHash);
  if (!valid) return null;
  return { username: user.username, agency: user.agency, role: user.role };
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user as unknown as Record<string, string>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
}

export async function destroySession() {
  cookies().set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
}

export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      username: String(payload.username),
      agency: payload.agency as SessionUser['agency'],
      role: payload.role as SessionUser['role']
    };
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}
