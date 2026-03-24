import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NPS TEXO Dashboard',
  description: 'Dashboard de NPS por agencia y holding'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
