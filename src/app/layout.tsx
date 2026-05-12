import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Earthquake Detector',
  description: 'Sistem deteksi dan monitoring gempa bumi real-time',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
