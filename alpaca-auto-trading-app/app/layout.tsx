import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AnimatedNavbar from '@/components/AnimatedNavbar';
import CommandPalette from '@/components/CommandPalette';
import { ToastViewport } from '@/lib/toast/ToastService';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Alpaca IQ',
  description: 'TradingView-like + Alpaca execution',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100`}>
        <Providers>
          <AnimatedNavbar />
          <CommandPalette />
          <main className="min-h-[calc(100vh-56px)]">{children}</main>
          <ToastViewport />
        </Providers>
      </body>
    </html>
  );
}