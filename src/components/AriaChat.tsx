'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, Trash2, AlertTriangle, Info, Search, X, ChevronUp, ChevronDown } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isTyping?: boolean
}

interface AriaChatProps {
  latestEarthquake?: {
    magnitude: number
    location: string
    time: string
    depth: string
    potensi: string
  } | null
  esp32Connected?: boolean
  esp32Status?: string
  esp32AlertLevel?: number
}

const QUICK_QUESTIONS = [
  '🌊 Apa itu potensi tsunami?',
  '📊 Jelaskan skala MMI',
  '🏃 Prosedur evakuasi gempa',
  '📍 Zona rawan gempa Indonesia',
  '⚡ Apa itu gempa susulan?',
  '🔴 Gempa terkini apa artinya?',
]

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '4px 0' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: '#8b5cf6',
          animation: `ariaBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`
        @keyframes ariaBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function highlight(text: string, query: string) {
  if (!query.trim()) return text
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? `<mark style="background:rgba(139,92,246,0.35);color:#c4b5fd;border-radius:3px;padding:0 2px">${part}</mark>`
      : part
  ).join('')
}

function MessageBubble({ msg, searchQuery }: { msg: Message; searchQuery: string }) {
  const isUser = msg.role === 'user'

  const formatContent = (text: string) => {
    let out = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code style="background:rgba(139,92,246,0.15);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.85em">$1</code>')
      .replace(/\n/g, '<br/>')
    if (searchQuery.trim()) {
      out = highlight(out, searchQuery)
    }
    return out
  }

  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      marginBottom: '16px',
    }}>
      {/* Avatar */}
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
        background: isUser ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : 'linear-gradient(135deg, #0f172a, #1e3a5f)',
        border: isUser ? '2px solid rgba(139,92,246,0.4)' : '2px solid rgba(59,130,246,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isUser ? <User size={16} color="#fff" /> : <Bot size={16} color="#60a5fa" />}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: '75%',
        padding: '12px 16px',
        borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
        background: isUser
          ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
          : 'rgba(15, 23, 42, 0.8)',
        border: isUser ? 'none' : '1px solid rgba(255,255,255,0.08)',
        color: '#f1f5f9',
        fontSize: '14px',
        lineHeight: '1.6',
        boxShadow: isUser
          ? '0 4px 15px rgba(139,92,246,0.3)'
          : '0 2px 8px rgba(0,0,0,0.2)',
      }}>
        {msg.isTyping ? (
          <TypingIndicator />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
        )}
        {!msg.isTyping && (
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '6px', textAlign: isUser ? 'right' : 'left' }}>
            {msg.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AriaChat({ latestEarthquake, esp32Connected, esp32Status, esp32AlertLevel }: AriaChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Search state
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchIdx, setSearchIdx] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filter messages by search
  const filteredMessages = searchQuery.trim()
    ? messages.filter(m => !m.isTyping && m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages

  const matchCount = filteredMessages.filter(m => !m.isTyping).length

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem('aria_chat_history')
    setTimeout(() => {
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setMessages(parsed.map((m: Message) => ({ ...m, timestamp: new Date(m.timestamp) })))
        } catch {}
      } else {
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: `Halo! Saya **ARIA** 🤖 — AI asisten khusus gempa bumi untuk TECTRA PRO.\n\nSaya bisa membantu kamu:\n• 📊 Analisis data gempa real-time\n• 🌊 Informasi potensi tsunami\n• 🏃 Prosedur keselamatan & evakuasi\n• 🔬 Penjelasan fenomena seismik\n• ⚡ Interpretasi data sensor ESP32\n\nAda yang ingin kamu tanyakan?`,
          timestamp: new Date(),
        }])
      }
      setIsInitialized(true)
    }, 0)
  }, [])

  // Save history
  useEffect(() => {
    if (isInitialized && messages.length > 0) {
      localStorage.setItem('aria_chat_history', JSON.stringify(messages))
    }
  }, [messages, isInitialized])

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  useEffect(() => { if (!searchQuery) scrollToBottom() }, [messages, searchQuery])

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus()
  }, [searchOpen])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }
    const typingMsg: Message = {
      id: 'typing',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    }

    setMessages(prev => [...prev, userMsg, typingMsg])
    setInput('')
    setLoading(true)

    try {
      const history = messages
        .filter(m => !m.isTyping && m.id !== 'welcome')
        .slice(-8)
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/aria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history,
          context: { latestEarthquake, esp32Connected, esp32Status, esp32AlertLevel },
        }),
      })

      const data = await res.json()
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'typing'),
        {
          id: `aria-${Date.now()}`,
          role: 'assistant',
          content: data.reply || data.error || 'Maaf, terjadi kesalahan.',
          timestamp: new Date(),
        },
      ])
    } catch {
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'typing'),
        {
          id: `aria-err-${Date.now()}`,
          role: 'assistant',
          content: '⚠️ Koneksi ke ARIA terputus. Periksa API key di environment variables.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [loading, messages, latestEarthquake, esp32Connected, esp32Status, esp32AlertLevel])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  const clearChat = () => {
    localStorage.removeItem('aria_chat_history')
    setMessages([{
      id: 'welcome-new',
      role: 'assistant',
      content: 'Ingatan chat telah dihapus! Ada yang ingin kamu tanyakan lagi? 😊',
      timestamp: new Date(),
    }])
  }

  const toggleSearch = () => {
    setSearchOpen(v => !v)
    setSearchQuery('')
    setSearchIdx(0)
  }

  const displayMessages = searchQuery.trim() ? filteredMessages : messages

  return (
    <div className="aria-chat">
      {/* ── Header ── */}
      <div className="aria-chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="aria-avatar-icon">
            <Bot size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '15px', color: '#f1f5f9' }}>
              ARIA
              <span className="aria-online-badge">● ONLINE</span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Adaptive Response Intelligence for Alerts
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Search toggle */}
          <button
            onClick={toggleSearch}
            title="Cari pesan"
            className={`aria-header-btn${searchOpen ? ' aria-header-btn--active' : ''}`}
          >
            <Search size={14} />
          </button>
          {/* Clear */}
          <button onClick={clearChat} title="Bersihkan chat" className="aria-header-btn">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* ── Gemini-style Search bar ── */}
      {searchOpen && (
        <div className="aria-search-bar">
          <Search size={14} className="aria-search-ico" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Cari di percakapan..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setSearchIdx(0) }}
            className="aria-search-inp"
          />
          {searchQuery && (
            <span className="aria-search-count">
              {matchCount} hasil
            </span>
          )}
          {searchQuery && (
            <>
              <button className="aria-search-nav" onClick={() => setSearchIdx(i => Math.max(0, i - 1))} title="Sebelumnya">
                <ChevronUp size={13} />
              </button>
              <button className="aria-search-nav" onClick={() => setSearchIdx(i => Math.min(matchCount - 1, i + 1))} title="Berikutnya">
                <ChevronDown size={13} />
              </button>
            </>
          )}
          <button className="aria-search-nav" onClick={toggleSearch} title="Tutup">
            <X size={13} />
          </button>
        </div>
      )}

      {/* ── Context bar ── */}
      {latestEarthquake && (
        <div className="aria-context-bar">
          <AlertTriangle size={12} />
          <span>Konteks aktif: Gempa M{latestEarthquake.magnitude} — {latestEarthquake.location}</span>
        </div>
      )}

      {/* ── Messages ── */}
      <div className="aria-messages">
        {searchQuery.trim() && matchCount === 0 ? (
          <div className="aria-search-empty">
            <Search size={24} style={{ opacity: 0.3 }} />
            <span>Tidak ada pesan yang cocok dengan &ldquo;{searchQuery}&rdquo;</span>
          </div>
        ) : (
          displayMessages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} searchQuery={searchOpen ? searchQuery : ''} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick questions (hidden while searching) ── */}
      {!searchQuery && (
        <div className="aria-quick-row">
          {QUICK_QUESTIONS.map(q => (
            <button key={q} onClick={() => sendMessage(q)} disabled={loading} className="aria-quick-btn">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ── */}
      <div className="aria-input-row">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tanya ARIA tentang gempa..."
          disabled={loading}
          className="aria-input"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className={`aria-send-btn${loading || !input.trim() ? ' aria-send-btn--disabled' : ''}`}
        >
          <Send size={16} color="#fff" />
        </button>
      </div>

      {/* ── Footer ── */}
      <div className="aria-footer">
        <Info size={10} style={{ display: 'inline', marginRight: '4px' }} />
        Powered by Groq · ARIA dapat membuat kesalahan, selalu verifikasi dengan BMKG resmi
      </div>
    </div>
  )
}
