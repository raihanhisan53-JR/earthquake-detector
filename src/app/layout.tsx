import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Earthquake Detector',
  description: 'Sistem deteksi dan monitoring gempa bumi real-time',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-theme="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
