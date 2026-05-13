"use client"
import React, { useState } from 'react';
import { Heart, Share2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';

// ── 10 video edukasi gempa & bencana alam ──
const EDUCATION_REELS = [
  {
    id: 'r1',
    youtubeId: 'G61B0FVeyZA',
    title: 'Bisa Seberapa Kuat Gempa Bumi?',
    author: 'Kok Bisa?',
    authorBadge: 'GEMPA',
    badgeColor: '#ef4444',
    description: 'Seberapa kuat gempa bumi sesungguhnya? Penjelasan skala kekuatan gempa dari Kok Bisa. 🏚️',
    likes: 12400,
  },
  {
    id: 'r2',
    youtubeId: 'alDDFM62lds',
    title: 'Seberapa Tinggi Tsunami Bisa Terbentuk?',
    author: 'Kok Bisa?',
    authorBadge: 'TSUNAMI',
    badgeColor: '#3b82f6',
    description: 'Tsunami tertinggi yang pernah terjadi — seberapa tinggi gelombang tsunami bisa terbentuk? 🌊',
    likes: 9800,
  },
  {
    id: 'r3',
    youtubeId: '6epVjbnZ0q8',
    title: 'Apakah Tsunami Rawan Terjadi di Indonesia?',
    author: 'Kok Bisa?',
    authorBadge: 'TSUNAMI',
    badgeColor: '#3b82f6',
    description: 'Apakah Indonesia rawan tsunami? Penjelasan ilmiah mengapa Indonesia sangat rentan. 🌊',
    likes: 15600,
  },
  {
    id: 'r4',
    youtubeId: 'xgSp2FppSyA',
    title: 'Kenapa Gunung Berapi Meletus?',
    author: 'Kok Bisa?',
    authorBadge: 'VULKANIK',
    badgeColor: '#dc2626',
    description: 'Kenapa gunung berapi bisa meletus? Proses ilmiah di balik letusan gunung api Indonesia. 🌋',
    likes: 11200,
  },
  {
    id: 'r5',
    youtubeId: 'q0Cr9G0PCA4',
    title: '20 Tahun Gempa Dan Tsunami Aceh 2004',
    author: 'Adrasa ID',
    authorBadge: 'SEJARAH',
    badgeColor: '#f59e0b',
    description: 'Gempa Megathrust 9,3 M — Gempa dan Tsunami Aceh 2004, bencana terbesar di Indonesia. 📜',
    likes: 7400,
  },
  {
    id: 'r6',
    youtubeId: 'v8ij209gdIg',
    title: 'Mengenal Gempa Bumi — Modul 4',
    author: 'MAIPARK Learning',
    authorBadge: 'EDUKASI',
    badgeColor: '#8b5cf6',
    description: 'Mengenal gempa bumi secara ilmiah — amplifikasi, jenis tanah, dan dampaknya terhadap bangunan. 📚',
    likes: 5600,
  },
  {
    id: 'r7',
    youtubeId: 'Rh-kizm720g',
    title: 'Bagaimana Tsunami Raksasa Terjadi?',
    author: 'Ridddle IN',
    authorBadge: 'TSUNAMI',
    badgeColor: '#06b6d4',
    description: 'Kecepatan tsunami raksasa bisa mencapai 621 mil/jam — bagaimana proses terjadinya? 🌊',
    likes: 13800,
  },
  {
    id: 'r8',
    youtubeId: 'u0QD0MUGt4s',
    title: 'Bagaimana Sains Menjelaskan Terjadinya Gempa Bumi',
    author: 'West Edukasi',
    authorBadge: 'SAINS',
    badgeColor: '#f97316',
    description: 'Proses terjadinya gempa bumi — kekuatan yang bisa mengubah dunia! Penjelasan sains lengkap. 🔬',
    likes: 6900,
  },
  {
    id: 'r9',
    youtubeId: 'rgISfN3B7FE',
    title: 'Bisakah Kita Selamat dari Hantaman Asteroid Raksasa?',
    author: 'Kok Bisa?',
    authorBadge: 'BENCANA',
    badgeColor: '#6366f1',
    description: 'Hantaman asteroid raksasa — bisakah manusia selamat? Skenario bencana kosmik dari Kok Bisa. ☄️',
    likes: 5300,
  },
  {
    id: 'r10',
    youtubeId: '44Sd3c_ajDg',
    title: 'Inilah Asal-Usul Lempeng Tektonik & Penyebab Gempa Bumi',
    author: 'INVOICE INDONESIA',
    authorBadge: 'TEKTONIK',
    badgeColor: '#22c55e',
    description: 'Asal-usul lempeng tektonik dan alasan Indonesia sering gempa bumi — penjelasan geologi lengkap. 🗺️',
    likes: 8100,
  },
];

export default function ReelsEducation() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [liked, setLiked] = useState({});
  const { triggerHaptic } = useHaptics();

  const active = EDUCATION_REELS[activeIndex];

  const goNext = () => {
    if (activeIndex < EDUCATION_REELS.length - 1) {
      setActiveIndex(activeIndex + 1);
      triggerHaptic('light');
    }
  };

  const goPrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
      triggerHaptic('light');
    }
  };

  const handleLike = () => {
    triggerHaptic('success');
    setLiked((prev) => ({ ...prev, [active.id]: !prev[active.id] }));
  };

  const handleShare = () => {
    triggerHaptic('light');
    const url = `https://www.youtube.com/watch?v=${active.youtubeId}`;
    const text = `📹 ${active.title} — ${active.description}\n${url}`;
    if (navigator.share) {
      navigator.share({ title: active.title, text: active.description, url }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div className="reels-edu-wrap">

      {/* YouTube embed — ada thumbnail otomatis dari YouTube */}
      <div className="reels-edu-player">
        <div className="reels-edu-yt-frame">
          <iframe
            key={active.id}
            src={`https://www.youtube.com/embed/${active.youtubeId}?rel=0&modestbranding=1`}
            title={active.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      </div>

      {/* Info */}
      <div className="reels-edu-info">
        <div className="reels-edu-author">
          <span className="reels-edu-author__badge" style={{ background: active.badgeColor }}>
            {active.authorBadge}
          </span>
          <span className="reels-edu-author__name">{active.author}</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {activeIndex + 1} / {EDUCATION_REELS.length}
          </span>
        </div>
        <p className="reels-edu-title">{active.title}</p>
        <p className="reels-edu-desc">{active.description}</p>

        <div className="reels-edu-actions">
          <button
            type="button"
            className={`reels-edu-btn ${liked[active.id] ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <Heart size={16} fill={liked[active.id] ? 'currentColor' : 'none'} />
            <span>{(liked[active.id] ? active.likes + 1 : active.likes).toLocaleString('id-ID')}</span>
          </button>
          <button type="button" className="reels-edu-btn" onClick={handleShare}>
            <Share2 size={16} />
            <span>Bagikan</span>
          </button>
          <a
            href={`https://www.youtube.com/watch?v=${active.youtubeId}`}
            target="_blank"
            rel="noreferrer"
            className="reels-edu-btn"
          >
            <ExternalLink size={16} />
            <span>YouTube</span>
          </a>
        </div>
      </div>

      {/* Navigasi */}
      <div className="reels-edu-nav">
        <button
          type="button"
          className="reels-edu-nav-btn"
          onClick={goPrev}
          disabled={activeIndex === 0}
        >
          <ChevronLeft size={18} /> Sebelumnya
        </button>
        <div className="reels-edu-dots">
          {EDUCATION_REELS.map((r, i) => (
            <button
              key={r.id}
              type="button"
              className={`reels-edu-dot ${i === activeIndex ? 'active' : ''}`}
              onClick={() => { setActiveIndex(i); triggerHaptic('light'); }}
              aria-label={r.title}
            />
          ))}
        </div>
        <button
          type="button"
          className="reels-edu-nav-btn"
          onClick={goNext}
          disabled={activeIndex === EDUCATION_REELS.length - 1}
        >
          Berikutnya <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
