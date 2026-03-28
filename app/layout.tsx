import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HieroWeb Editor - SVG Hieroglyphic Editor',
  description: 'JSesh-inspired web-based hieroglyphic editor with true SVG copy/paste',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}