import { NextRequest, NextResponse } from 'next/server';
import { createSession, validateUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = body?.username;
    const password = body?.password;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Usuario y contraseña son obligatorios.' },
        { status: 400 }
      );
    }

    const user = await validateUser(username, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas.' },
        { status: 401 }
      );
    }

    await createSession(user);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error interno'
      },
      { status: 500 }
    );
  }
}
