"use client"
import { useI18n } from '@/hooks/useI18n';

export default function LanguageToggle({ compact = false }) {
  const { lang, setLang } = useI18n();

  return (
    <div className="lang-toggle" role="group" aria-label="Language / Bahasa">
      <button
        type="button"
        className={`lang-btn ${lang === 'id' ? 'active' : ''}`}
        onClick={() => setLang('id')}
        aria-pressed={lang === 'id'}
        title="Bahasa Indonesia"
      >
        {compact ? '🇮🇩' : '🇮🇩 ID'}
      </button>
      <button
        type="button"
        className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        title="English"
      >
        {compact ? '🇺🇸' : '🇺🇸 EN'}
      </button>
    </div>
  );
}
