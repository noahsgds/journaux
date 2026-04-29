import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TomKiosque — Analyse de presse',
  description:
    'Interrogez les archives de presse avec la recherche sémantique IA.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="h-[100dvh] overflow-hidden bg-canvas">{children}</body>
    </html>
  )
}
