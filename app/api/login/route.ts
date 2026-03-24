import { NextRequest, NextResponse } from 'next/server';
import { createSession, validateUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  if (!username || !password) {
    return NextResponse.json({ error: 'Usuario y contraseña son obligatorios.' }, { status: 400 });
  }

  const user = await validateUser(username, password);
  if (!user) {
    return NextResponse.json({ error: 'Credenciales inválidas.' }, { status: 401 });
  }

  await createSession(user);
  return NextResponse.json({ ok: true });
}
