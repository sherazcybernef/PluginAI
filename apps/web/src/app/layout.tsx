import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PluginAI — SEO, speed & AIO',
  description: 'Unified optimization dashboard (MVP)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
