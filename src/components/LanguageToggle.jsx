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
      <button
        type="button"
        className={`lang-btn ${lang === 'ar' ? 'active' : ''}`}
        onClick={() => setLang('ar')}
        aria-pressed={lang === 'ar'}
        title="العربية (Arabic)"
      >
        {compact ? '🇸🇦' : '🇸🇦 AR'}
      </button>
      <button
        type="button"
        className={`lang-btn ${lang === 'ja' ? 'active' : ''}`}
        onClick={() => setLang('ja')}
        aria-pressed={lang === 'ja'}
        title="日本語 (Japanese)"
      >
        {compact ? '🇯🇵' : '🇯🇵 JA'}
      </button>
    </div>
  );
}
