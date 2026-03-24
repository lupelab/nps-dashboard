'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || 'No se pudo iniciar sesión');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="panel login-card">
      <h1 style={{ marginTop: 0 }}>NPS TEXO</h1>
      <p className="small">Ingresá con el usuario de tu agencia. TEXO puede ver el holding completo.</p>
      <div style={{ display: 'grid', gap: 12 }}>
        <input className="input" placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="input" placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <div className="badge bad">{error}</div> : null}
        <button className="button" disabled={loading}>{loading ? 'Ingresando…' : 'Ingresar'}</button>
      </div>
    </form>
  );
}
