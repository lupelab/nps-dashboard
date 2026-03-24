import Link from 'next/link';
import { LogoutButton } from '@/components/LogoutButton';
import { SessionUser } from '@/lib/types';

export function DashboardShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const holding = user.role === 'holding';
  return (
    <div className="layout">
      <aside className="sidebar">
        <h2 style={{ marginTop: 0 }}>NPS TEXO</h2>
        <p className="small">{user.username} · {holding ? 'Holding TEXO' : user.agency}</p>
        <nav style={{ marginTop: 24 }}>
          <Link href="/dashboard" className="nav-link active">Dashboard</Link>
        </nav>
        <div style={{ marginTop: 24 }}>
          <LogoutButton />
        </div>
      </aside>
      <main className="main">
        <div className="container">{children}</div>
      </main>
    </div>
  );
}
