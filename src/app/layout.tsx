import type { Metadata, Viewport } from 'next'
import './globals.css'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://earthquake-detector.vercel.app'

export const metadata: Metadata = {
  // ── Core SEO ──────────────────────────────────────────────
  title: {
    default: 'TECTRA PRO — Earthquake Detector Indonesia Real-Time',
    template: '%s | TECTRA PRO Earthquake Detector',
  },
  description:
    'Monitor gempa bumi Indonesia secara real-time. Data langsung dari BMKG & USGS, sensor ESP32, peta interaktif, dan notifikasi otomatis. Sistem deteksi gempa terlengkap.',
  keywords: [
    'earthquake detector',
    'earthquake detector Indonesia',
    'deteksi gempa bumi',
    'monitoring gempa real-time',
    'BMKG gempa',
    'seismograf online',
    'sensor gempa ESP32',
    'earthquake alarm',
    'TECTRA PRO',
    'gempa bumi hari ini',
  ],

  // ── Canonical & Indexing ──────────────────────────────────
  metadataBase: new URL(APP_URL),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ── Open Graph (Facebook / WhatsApp preview) ─────────────
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: APP_URL,
    siteName: 'TECTRA PRO Earthquake Detector',
    title: 'TECTRA PRO — Earthquake Detector Indonesia Real-Time',
    description:
      'Monitor gempa bumi Indonesia secara real-time. Data BMKG & USGS, sensor ESP32, peta interaktif, dan notifikasi otomatis.',
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'TECTRA PRO Earthquake Detector Dashboard',
      },
    ],
  },

  // ── Twitter / X Card ──────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: 'TECTRA PRO — Earthquake Detector Indonesia',
    description: 'Monitor gempa bumi real-time. Data BMKG & USGS langsung di dashboard.',
    images: [`${APP_URL}/og-image.png`],
  },

  // ── PWA & Icons ───────────────────────────────────────────
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TECTRA PRO',
  },
  icons: {
    icon:     [{ url: '/logo.png', sizes: '32x32' }],
    apple:    [{ url: '/logo.png', sizes: '180x180' }],
    shortcut: '/logo.png',
  },
  // ── Verification (isi setelah verifikasi di Google Search Console) ──
  // verification: {
  //   google: 'PASTE_YOUR_GOOGLE_SITE_VERIFICATION_CODE_HERE',
  // },
}

export const viewport: Viewport = {
  themeColor: '#1a2744',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TECTRA PRO" />
        <link rel="apple-touch-icon" href="/logo.png" />
        {/* Structured Data — JSON-LD untuk Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'TECTRA PRO Earthquake Detector',
              url: APP_URL,
              description:
                'Sistem monitoring gempa bumi real-time Indonesia menggunakan data BMKG, USGS, dan sensor ESP32.',
              applicationCategory: 'UtilityApplication',
              operatingSystem: 'Web',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
              author: { '@type': 'Person', name: 'Raihan Hisan' },
              keywords: 'earthquake detector, gempa bumi, BMKG, seismograf, Indonesia',
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}

