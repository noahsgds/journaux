import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VectorLens — RAG Knowledge Platform',
  description:
    'Search and explore your journal archive with AI-powered semantic retrieval.',
  keywords: ['RAG', 'knowledge base', 'journal', 'AI', 'semantic search'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="h-screen overflow-hidden bg-canvas">{children}</body>
    </html>
  )
}
