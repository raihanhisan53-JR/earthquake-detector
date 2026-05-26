"use client"
import { useState } from 'react';
import { ClipboardList, FileText, CheckCircle, Plus, ShieldCheck, Info, Download, Trash2 } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';

interface ChecklistItem {
  id: number;
  task: string;
  checked: boolean;
}

interface DocumentItem {
  id: number;
  name: string;
  type: string;
  date: string;
}

export default function SurvivalKitVault() {
  const { lang, t } = useI18n();
  const [activeTab, setActiveTab] = useState('checklist');

  // Survival Checklist State (Mock for now, can be persisted to localStorage)
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: 1, task: lang === 'ar' ? 'مياه شرب (3 لتر/شخص/يوم)' : 'Air minum (3 liter/orang/hari)', checked: false },
    { id: 2, task: lang === 'ar' ? 'أطعمة تدوم طويلاً (بسكويت، معلبات)' : 'Makanan tahan lama (biskuit, kaleng)', checked: false },
    { id: 3, task: lang === 'ar' ? 'صندوق الإسعافات الأولية والأدوية الشخصية' : 'Kotak P3K & Obat-obatan pribadi', checked: true },
    { id: 4, task: lang === 'ar' ? 'مصباح يدوي وبطاريات احتياطية' : 'Senter & Baterai cadangan', checked: false },
    { id: 5, task: lang === 'ar' ? 'صافرة (لطلب المساعدة)' : 'Peluit (untuk memanggil bantuan)', checked: false },
    { id: 6, task: lang === 'ar' ? 'كمامة ومعقم يدين' : 'Masker & Hand Sanitizer', checked: true },
    { id: 7, task: lang === 'ar' ? 'نقود نقدية كافية' : 'Uang tunai secukupnya', checked: false },
    { id: 8, task: lang === 'ar' ? 'ملابس بديلة وبطانية' : 'Pakaian ganti & Selimut', checked: false },
  ]);

  const [documents, setDocuments] = useState<DocumentItem[]>([
    { id: 1, name: lang === 'ar' ? 'الهوية الوطنية - نسخة رقمية' : 'KTP - Digital Copy', type: 'PDF/Image', date: '12 Mei 2026' },
    { id: 2, name: lang === 'ar' ? 'بطاقة العائلة' : 'Kartu Keluarga', type: 'PDF', date: '15 Mei 2026' },
  ]);

  const toggleCheck = (id: number) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const progress = Math.round((checklist.filter(i => i.checked).length / checklist.length) * 100);

  return (
    <div className="card survival-vault">
      <div className="card-header">
        <h2><ShieldCheck size={18} className="text-accent" /> {t('survivalVault')}</h2>
      </div>

      <div className="assistant-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <button 
          onClick={() => setActiveTab('checklist')}
          style={{ flex: 1, padding: '12px', background: 'none', border: 'none', color: activeTab === 'checklist' ? 'var(--accent)' : 'var(--text-muted)', borderBottom: activeTab === 'checklist' ? '2px solid var(--accent)' : 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <ClipboardList size={16} /> {t('checklist')}
        </button>
        <button 
          onClick={() => setActiveTab('docs')}
          style={{ flex: 1, padding: '12px', background: 'none', border: 'none', color: activeTab === 'docs' ? 'var(--accent)' : 'var(--text-muted)', borderBottom: activeTab === 'docs' ? '2px solid var(--accent)' : 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <FileText size={16} /> {t('documents')}
        </button>
      </div>

      {activeTab === 'checklist' && (
        <div className="assistant-content">
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', fontWeight: '700' }}>
              <span>{t('readiness')}</span>
              <span>{progress}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--bg-card-alt)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s ease' }}></div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
            {checklist.map(item => (
              <div 
                key={item.id} 
                onClick={() => toggleCheck(item.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '8px', background: item.checked ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-card-alt)', border: item.checked ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: item.checked ? 'var(--accent)' : 'transparent' }}>
                  {item.checked && <CheckCircle size={14} color="white" />}
                </div>
                <span style={{ fontSize: '13px', color: item.checked ? 'var(--text-primary)' : 'var(--text-secondary)', textDecoration: item.checked ? 'line-through' : 'none' }}>{item.task}</span>
              </div>
            ))}
          </div>
          
          <button className="btn btn-outline" style={{ width: '100%', marginTop: '16px', fontSize: '12px' }}>
            <Plus size={14} /> {t('addItems')}
          </button>
        </div>
      )}

      {activeTab === 'docs' && (
        <div className="assistant-content">
          <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '16px', display: 'flex', gap: '10px' }}>
            <Info size={20} style={{ color: '#3b82f6', flexShrink: 0 }} />
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Simpan salinan digital dokumen penting Anda di sini. Data dienkripsi dan hanya dapat diakses oleh Anda.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {documents.map(doc => (
              <div key={doc.id} style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-card-alt)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '13px' }}>{doc.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{doc.type} · {doc.date}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Download size={16} /></button>
                  <button style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.6 }}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
            
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '6px', gap: '8px' }}>
              <Plus size={16} /> Upload Dokumen Baru
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
