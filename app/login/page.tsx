export const dynamic = 'force-dynamic';

import { getSession } from '@/lib/auth';
import { LoginForm } from '@/components/LoginForm';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect('/dashboard');

  return (
    <div className="login-wrap">
      <LoginForm />
    </div>
  );
}
