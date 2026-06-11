import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://earthquake-detector-blue.vercel.app'
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''
const GSC_VERIFICATION_CODE = process.env.NEXT_PUBLIC_GSC_VERIFICATION_CODE || ''

export const metadata: Metadata = {
  // ── Core SEO ──────────────────────────────────────────────
  title: {
    default: 'Earthquake Detector Indonesia Real-Time | TECTRA PRO',
    template: '%s | Earthquake Detector',
  },
  description:
    'Earthquake detector for Indonesia with real-time BMKG and USGS data, interactive map, and instant notifications. Complete earthquake monitoring system.',
  keywords: [
    'earthquake detector',
    'earthquake monitor',
    'gempa bumi',
    'BMKG',
    'seismograph',
    'earthquake alert',
    'Indonesia earthquake',
    'real-time earthquake',
    'earthquake tracker',
    'earthquake map',
    'gempa hari ini',
    'deteksi gempa',
    'monitor gempa',
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
    siteName: 'Earthquake Detector',
    title: 'Earthquake Detector Indonesia Real-Time | TECTRA PRO',
    description:
      'Monitor earthquakes in Indonesia in real-time using BMKG and USGS data, with an interactive map and instant notifications.',
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Earthquake Detector Dashboard',
      },
    ],
  },

  // ── Twitter / X Card ──────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: 'Earthquake Detector Indonesia Real-Time',
    description: 'Real-time earthquake monitoring using BMKG and USGS data directly on the dashboard.',
    images: [`${APP_URL}/og-image.png`],
  },

  // ── PWA & Icons ───────────────────────────────────────────
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Earthquake Detector',
  },
  icons: {
    icon:     [{ url: '/logo-v2.png', sizes: '32x32' }],
    apple:    [{ url: '/logo-v2.png', sizes: '180x180' }],
    shortcut: '/logo-v2.png',
  },
  // ─── Verification for Google Search Console ──
  verification: GSC_VERIFICATION_CODE ? {
    google: GSC_VERIFICATION_CODE,
  } : undefined,
}

export const viewport: Viewport = {
  themeColor: '#1a2744',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const dynamic = 'force-dynamic'

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
        <meta name="apple-mobile-web-app-title" content="Earthquake Detector" />
        <link rel="apple-touch-icon" href="/logo-v2.png" />
        {/* Structured Data — JSON-LD untuk Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Earthquake Detector',
              url: APP_URL,
              description:
                'Real-time earthquake monitoring system for Indonesia using BMKG, USGS, and ESP32 sensor data.',
              applicationCategory: 'UtilityApplication',
              operatingSystem: 'Web',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
              author: { '@type': 'Person', name: 'Raihan Hisan' },
              keywords: 'earthquake detector, gempa bumi, BMKG, seismograf, Indonesia',
            }),
          }}
        />
        {/* Google Analytics 4 */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  )
}
