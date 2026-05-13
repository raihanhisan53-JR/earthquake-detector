"use client"
﻿import { useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, CloudRain, Flame, Maximize, Satellite, Sun, Waves, Wind, X, ZoomIn, ZoomOut } from 'lucide-react';

export default function VisualisasiCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  const visuals = [
    {
      title: 'Citra Satelit',
      desc: 'Citra satelit cuaca Himawari-9 IR Enhanced',
      img: 'https://dataweb.bmkg.go.id/cuaca/satelit/H08_EH_Indonesia.png',
      icon: <Satellite size={20} className="text-accent" />,
      link: 'https://www.bmkg.go.id/cuaca/satelit',
    },
    {
      title: 'Prakiraan Tinggi Gelombang',
      desc: 'Prakiraan tinggi gelombang di perairan Indonesia',
      img: 'https://dataweb.bmkg.go.id/maritim/gelombang-maritim.png',
      icon: <Waves size={20} style={{ color: '#0ea5e9' }} />,
      link: 'https://www.bmkg.go.id/cuaca/maritim',
    },
    {
      title: 'Prakiraan Angin',
      desc: 'Prakiraan angin lapisan 3000 kaki di Indonesia',
      img: 'https://dataweb.bmkg.go.id/cuaca/angin/streamline-d10.jpg',
      icon: <Wind size={20} style={{ color: '#94a3b8' }} />,
      link: 'https://www.bmkg.go.id/cuaca/prakiraan-angin',
    },
    {
      title: 'Prediksi Hujan',
      desc: 'Prediksi hujan bulanan di wilayah Indonesia',
      img: 'https://dataweb.bmkg.go.id/iklim/prediksi-hujan-bulanan/pch_bln_det_step2.png',
      icon: <CloudRain size={20} style={{ color: '#6366f1' }} />,
      link: 'https://www.bmkg.go.id/iklim/prediksi-hujan-bulanan',
    },
    {
      title: 'Hari Tanpa Hujan',
      desc: 'Jumlah hari berturut-turut tanpa hujan di Indonesia',
      img: 'https://dataweb.bmkg.go.id/iklim/hari-tanpa-hujan.png',
      icon: <Sun size={20} style={{ color: '#f59e0b' }} />,
      link: 'https://www.bmkg.go.id/iklim/hari-tanpa-hujan',
    },
    {
      title: 'Potensi Kebakaran Hutan',
      desc: 'Analisis potensi kemudahan terjadinya kebakaran hutan',
      img: 'https://dataweb.bmkg.go.id/cuaca/spartan/36_indonesia_ffmc_01.png',
      icon: <Flame size={20} style={{ color: '#ef4444' }} />,
      link: 'https://www.bmkg.go.id/cuaca/karhutla',
    },
  ];

  const handleOpen = (index) => {
    setActiveIndex(index);
    setIsOpen(true);
    setZoom(1);
  };

  const next = () => {
    setActiveIndex((prev) => (prev + 1) % visuals.length);
    setZoom(1);
  };

  const prev = () => {
    setActiveIndex((prev) => (prev - 1 + visuals.length) % visuals.length);
    setZoom(1);
  };

  const handleImgError = (event) => {
    event.target.style.display = 'none';
    event.target.parentNode.innerHTML += `
      <div class="img-fallback">
        <p>Preview tidak tersedia</p>
      </div>
    `;
  };

  return (
    <>
      <section className="card full-width visual-section">
        <div className="card-header">
          <h2><Satellite size={18} /> Visualisasi Cuaca dan Iklim</h2>
        </div>
        <div className="visual-grid">
          {visuals.map((visual, index) => (
            <div key={visual.title} className="visual-item" onClick={() => handleOpen(index)}>
              <div className="visual-media">
                <img
                  src={visual.img}
                  alt={visual.title}
                  onError={handleImgError}
                />
                <div className="visual-overlay">
                  <Maximize size={24} color="white" />
                  <span>Buka Peta Penuh</span>
                </div>
              </div>
              <div className="visual-info">
                <div className="visual-title-row">
                  {visual.icon}
                  <h3>{visual.title}</h3>
                </div>
                <p>{visual.desc}</p>
                <a
                  href={visual.link}
                  target="_blank"
                  rel="noreferrer"
                  className="visual-link"
                  onClick={(event) => event.stopPropagation()}
                >
                  Lihat Detail <ArrowRight size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {isOpen ? (
        <div className="gallery-modal" onClick={() => setIsOpen(false)}>
          <div className="gallery-content" onClick={(event) => event.stopPropagation()}>
            <div className="gallery-header">
              <div className="gh-title">
                {visuals[activeIndex].icon}
                <span>{visuals[activeIndex].title}</span>
                <small>({activeIndex + 1} / {visuals.length})</small>
              </div>
              <div className="gh-controls">
                <button type="button" onClick={() => setZoom((currentZoom) => Math.max(currentZoom - 0.5, 1))}><ZoomOut size={20} /></button>
                <button type="button" onClick={() => setZoom((currentZoom) => Math.min(currentZoom + 0.5, 3))}><ZoomIn size={20} /></button>
                <button type="button" onClick={() => setIsOpen(false)} className="close-btn"><X size={24} /></button>
              </div>
            </div>

            <div className="gallery-main">
              <button type="button" className="nav-btn prev" onClick={prev}><ChevronLeft size={48} /></button>
              <div className="image-stage">
                <img
                  src={visuals[activeIndex].img}
                  alt={visuals[activeIndex].title}
                  style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s ease' }}
                />
              </div>
              <button type="button" className="nav-btn next" onClick={next}><ChevronRight size={48} /></button>
            </div>

            <div className="gallery-footer">
              <p className="caption">{visuals[activeIndex].desc}</p>
              <div className="thumbnails">
                {visuals.map((visual, index) => (
                  <div
                    key={visual.title}
                    className={`thumb-item ${index === activeIndex ? 'active' : ''}`}
                    onClick={() => {
                      setActiveIndex(index);
                      setZoom(1);
                    }}
                  >
                    <img src={visual.img} alt={visual.title} onError={handleImgError} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
