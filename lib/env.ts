import { AppUser } from '@/lib/types';

export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

export function getUsersFromEnv(): AppUser[] {
  const raw = requiredEnv('APP_USERS_JSON');
  try {
    const parsed = JSON.parse(raw) as AppUser[];
    if (!Array.isArray(parsed)) throw new Error('APP_USERS_JSON debe ser un array');
    return parsed;
  } catch (error) {
    throw new Error(`APP_USERS_JSON inválido: ${(error as Error).message}`);
  }
}

export function getPrivateKey(): string {
  return requiredEnv('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n');
}
