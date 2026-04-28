import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VectorLens — Archives culturelles',
  description:
    'Explorez les archives du Carnet de la fringale culturelle avec la recherche sémantique IA.',
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
    <html lang="fr" className="dark">
      <body className="h-[100dvh] overflow-hidden bg-canvas">{children}</body>
    </html>
  )
}
