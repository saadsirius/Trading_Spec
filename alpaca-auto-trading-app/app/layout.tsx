import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Alpaca IQ',
  description: 'TradingView-like + Alpaca execution',
  icons: {
    icon: '/icon.png',           // resolves to app/icon.png
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-900 text-white">
          <nav className="bg-gray-800 p-4">
            <h1 className="text-xl font-bold">Alpaca IQ Trading</h1>
          </nav>
          <main className="container mx-auto p-4">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}