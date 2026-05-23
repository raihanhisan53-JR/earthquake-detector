'use client'

import {
  ExternalLink, CheckCircle2, Search, FileText, Code2,
  Zap, Globe, ArrowRight, TrendingUp, DollarSign, Leaf,
  BadgeCheck, Clock, Rocket,
} from 'lucide-react'

const organicSteps = [
  {
    icon: <Search size={18} />,
    number: '01',
    title: 'Daftarkan ke Google Search Console',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.12)',
    desc: 'Ini langkah paling wajib. Buka Google Search Console, masukkan domain websitemu, dan verifikasi kepemilikannya. Ini ibarat "memberi tahu" Google bahwa website kamu itu ada.',
    action: { label: 'Buka Google Search Console', url: 'https://search.google.com/search-console' },
    tips: [
      'Verifikasi via DNS record (direkomendasikan untuk Vercel)',
      'Submit sitemap setelah verifikasi berhasil',
      'Pantau error crawling secara rutin',
    ],
  },
  {
    icon: <FileText size={18} />,
    number: '02',
    title: 'Buat file sitemap.xml dan robots.txt',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    desc: 'Ini adalah peta jalan yang membantu bot Google menelusuri halaman-halaman di websitemu.',
    code: `// app/sitemap.ts (Next.js 13+)
export default function sitemap() {
  return [
    { url: 'https://domain.vercel.app', lastModified: new Date() },
  ]
}

// public/robots.txt
User-agent: *
Allow: /
Sitemap: https://domain.vercel.app/sitemap.xml`,
    tips: [
      'Next.js 13+ bisa auto-generate sitemap via app/sitemap.ts',
      'Blokir /api/ dan route internal dari crawling',
    ],
  },
  {
    icon: <Code2 size={18} />,
    number: '03',
    title: 'Optimasi Meta Tags',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    desc: 'Pastikan setiap halaman memiliki <title> dan <meta name="description"> yang jelas dan mengandung kata kunci yang ingin kamu targetkan.',
    code: `// app/layout.tsx
export const metadata = {
  title: 'Earthquake Detector — TECTRA PRO',
  description: 'Monitor gempa bumi real-time Indonesia. Data BMKG & USGS.',
  keywords: ['gempa bumi', 'BMKG', 'seismograf'],
  openGraph: { title: '...', description: '...' },
}`,
    tips: [
      'Title optimal: 50–60 karakter',
      'Description optimal: 150–160 karakter',
      'Setiap halaman harus punya meta unik',
    ],
  },
  {
    icon: <Zap size={18} />,
    number: '04',
    title: 'Manfaatkan SSR / SSG di Next.js + Vercel',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
    desc: 'Google lebih mudah membaca halaman yang sudah di-render dari server (SSR) dibandingkan halaman yang murni di-render di browser (CSR biasa). Next.js di Vercel mendukung ini secara native.',
    tips: [
      'Gunakan Server Components untuk konten publik yang perlu di-index',
      'generateStaticParams() untuk route dinamis yang bisa di-prerender',
      'Hindari Client-only rendering untuk konten SEO kritis',
    ],
  },
  {
    icon: <Globe size={18} />,
    number: '05',
    title: 'Prisma + Supabase → Core Web Vitals Cepat',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.12)',
    desc: 'Kombinasi Prisma dan Supabase memastikan data mengalir cepat ke frontend — sangat bagus untuk skor Core Web Vitals yang dinilai oleh Google.',
    tips: [
      'LCP < 2.5 detik: Optimasi gambar dengan next/image',
      'INP < 200ms: Minimalkan JavaScript blocking',
      'CLS < 0.1: Set dimensi gambar & hindari layout shift',
      'Aktifkan Supabase Connection Pooling untuk query cepat',
    ],
  },
]

export default function SeoGuideCard() {
  return (
    <div className="seo-guide">

      {/* ══════════════════════════════════════════
          HERO ANSWER
         ══════════════════════════════════════════ */}
      <div className="seo-hero-card">
        <div className="seo-hero-left">
          <div className="seo-hero-icon-wrap">
            <BadgeCheck size={32} color="#fff" />
          </div>
          <div>
            <h1 className="seo-hero-title">
              Tentu saja bisa! 🎉
            </h1>
            <p className="seo-hero-desc">
              Website yang kamu bangun dengan kombinasi <strong>Vercel, Prisma, dan Supabase</strong>{' '}
              sangat bisa muncul di pencarian Google. Malahan, kombinasi ini (terutama dengan Next.js
              di Vercel) memiliki potensi performa yang <strong>sangat cepat</strong>, dan itu
              sangat disukai oleh algoritma Google.
            </p>
          </div>
        </div>
        {/* Stack badges */}
        <div className="seo-stack-row">
          {['Next.js ✓', 'Vercel ✓', 'Prisma ORM ✓', 'Supabase ✓'].map(s => (
            <span key={s} className="seo-stack-badge">{s}</span>
          ))}
          <span className="seo-stack-badge seo-stack-badge--highlight">
            Stack kamu sudah ideal untuk SEO! 🚀
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          DUA JALUR: BERBAYAR vs ORGANIK
         ══════════════════════════════════════════ */}
      <div>
        <h2 className="seo-section-heading">2 Cara Muncul di Google</h2>
        <div className="seo-two-paths">

          {/* Jalur Berbayar */}
          <div className="seo-path-card seo-path-card--paid">
            <div className="seo-path-header">
              <div className="seo-path-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                <DollarSign size={22} />
              </div>
              <div>
                <div className="seo-path-label" style={{ color: '#f59e0b' }}>Jalur 1</div>
                <h3 className="seo-path-title">Berbayar (Google Ads)</h3>
              </div>
            </div>
            <p className="seo-path-desc">
              Perhatikan hasil paling atas di Google yang memiliki tulisan{' '}
              <span className="seo-inline-badge seo-inline-badge--sponsored">Sponsored</span>.
              Pemilik website membayar Google agar situs mereka muncul di urutan teratas ketika
              seseorang mengetik kata kunci tertentu (misalnya <em>"earthquake detector"</em>).
            </p>
            <ul className="seo-path-facts">
              <li>
                <Clock size={13} style={{ color: '#f59e0b', flexShrink: 0 }} />
                <span><strong>Kecepatan:</strong> Instan — begitu kamu bayar, langsung muncul</span>
              </li>
              <li>
                <DollarSign size={13} style={{ color: '#f59e0b', flexShrink: 0 }} />
                <span><strong>Biaya:</strong> Per klik (CPC) — bisa dari ribuan hingga jutaan rupiah/bulan</span>
              </li>
              <li>
                <Globe size={13} style={{ color: '#f59e0b', flexShrink: 0 }} />
                <span><strong>Teknologi:</strong> Tidak peduli stack-nya — yang penting bayar iklannya</span>
              </li>
            </ul>
            <a
              href="https://ads.google.com"
              target="_blank"
              rel="noreferrer"
              className="seo-path-link"
              style={{ color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)' }}
            >
              Buka Google Ads <ExternalLink size={12} />
            </a>
          </div>

          {/* Jalur Organik */}
          <div className="seo-path-card seo-path-card--organic">
            <div className="seo-path-header">
              <div className="seo-path-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                <Leaf size={22} />
              </div>
              <div>
                <div className="seo-path-label" style={{ color: '#10b981' }}>Jalur 2 ⭐ Direkomendasikan</div>
                <h3 className="seo-path-title">Gratis / Organik (SEO)</h3>
              </div>
            </div>
            <p className="seo-path-desc">
              Ini adalah hasil pencarian murni dari Google seperti{' '}
              <span className="seo-inline-badge seo-inline-badge--organic">USGS Earthquake</span>.
              Google secara otomatis merayapi (<em>crawling</em>) dan menilai websitemu. Jika
              kontenmu dianggap relevan, berkualitas, dan cepat, Google menaruhnya di halaman
              pertama secara <strong>gratis</strong>.
            </p>
            <ul className="seo-path-facts">
              <li>
                <Clock size={13} style={{ color: '#10b981', flexShrink: 0 }} />
                <span><strong>Kecepatan:</strong> Butuh waktu berminggu-minggu hingga berbulan-bulan</span>
              </li>
              <li>
                <Leaf size={13} style={{ color: '#10b981', flexShrink: 0 }} />
                <span><strong>Biaya:</strong> Gratis! Hanya butuh waktu dan optimasi</span>
              </li>
              <li>
                <Rocket size={13} style={{ color: '#10b981', flexShrink: 0 }} />
                <span><strong>Stack kamu:</strong> Next.js + Vercel sangat optimal untuk SEO organik</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════
          5 LANGKAH ORGANIK
         ══════════════════════════════════════════ */}
      <div>
        <h2 className="seo-section-heading">
          Langkah Agar Websitemu Muncul di Google
          <span className="seo-section-sub"> (Gratis / Organik)</span>
        </h2>
        <p className="seo-section-lead">
          Karena kamu menggunakan <strong>Vercel</strong> (hosting/frontend), <strong>Prisma</strong>{' '}
          (database ORM), dan <strong>Supabase</strong> (database/backend), fokus utamamu untuk
          pencarian Google ada di bagian <strong>Frontend (Vercel)</strong>:
        </p>

        <div className="seo-steps">
          {organicSteps.map((step, i) => (
            <div key={i} className="seo-step-card">
              {/* Left: icon + connector */}
              <div className="seo-step-left">
                <div className="seo-step-icon-wrap" style={{ background: step.bg, color: step.color }}>
                  {step.icon}
                </div>
                {i < organicSteps.length - 1 && <div className="seo-step-connector" />}
              </div>

              {/* Right: content */}
              <div className="seo-step-body">
                <span className="seo-step-num" style={{ color: step.color }}>{step.number}</span>
                <h3 className="seo-step-title">{step.title}</h3>
                <p className="seo-step-desc">{step.desc}</p>

                {step.code && (
                  <div className="seo-code-block">
                    <pre><code>{step.code}</code></pre>
                  </div>
                )}

                {step.tips && (
                  <ul className="seo-tips-list">
                    {step.tips.map((tip, j) => (
                      <li key={j} className="seo-tip-item">
                        <CheckCircle2 size={13} style={{ color: step.color, flexShrink: 0, marginTop: '2px' }} />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {step.action && (
                  <a
                    href={step.action.url}
                    target="_blank"
                    rel="noreferrer"
                    className="seo-action-link"
                    style={{ color: step.color, borderColor: step.color + '44' }}
                  >
                    {step.action.label}
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          FRAMEWORK CONFIRMATION + CTA
         ══════════════════════════════════════════ */}
      <div className="seo-cta-box">
        <div className="seo-cta-left">
          <h3 className="seo-cta-title">Framework kamu: Next.js ✓</h3>
          <p className="seo-cta-desc">
            Karena kamu sudah pakai <strong>Next.js</strong> di Vercel, kamu bisa langsung
            memanfaatkan panduan teknis spesifik di atas — mulai dari <code>app/sitemap.ts</code>,{' '}
            <code>export const metadata</code>, hingga Server Components untuk SSR/SSG.{' '}
            Langkah pertama yang paling wajib: <strong>daftarkan ke Google Search Console</strong>.
          </p>
        </div>
        <a
          href="https://search.google.com/search-console"
          target="_blank"
          rel="noreferrer"
          className="seo-cta-btn"
        >
          Mulai di Search Console
          <ArrowRight size={15} />
        </a>
      </div>

    </div>
  )
}
