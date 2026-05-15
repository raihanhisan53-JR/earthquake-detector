'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, Trash2, Zap, AlertTriangle, Info, Mic } from 'lucide-react'

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

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'

  // Simple markdown: bold, code, newlines
  const formatContent = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code style="background:rgba(139,92,246,0.15);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.85em">$1</code>')
      .replace(/\n/g, '<br/>')
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
        fontSize: '14px',
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Halo! Saya **ARIA** 🤖 — AI asisten khusus gempa bumi untuk TECTRA PRO.\n\nSaya bisa membantu kamu:\n• 📊 Analisis data gempa real-time\n• 🌊 Informasi potensi tsunami\n• 🏃 Prosedur keselamatan & evakuasi\n• 🔬 Penjelasan fenomena seismik\n• ⚡ Interpretasi data sensor ESP32\n\nAda yang ingin kamu tanyakan?`,
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom() }, [messages])

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
          context: {
            latestEarthquake,
            esp32Connected,
            esp32Status,
            esp32AlertLevel,
          },
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
        }
      ])
    } catch {
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'typing'),
        {
          id: `aria-err-${Date.now()}`,
          role: 'assistant',
          content: '⚠️ Koneksi ke ARIA terputus. Periksa API key di environment variables.',
          timestamp: new Date(),
        }
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [loading, messages, latestEarthquake, esp32Connected, esp32Status, esp32AlertLevel])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const clearChat = () => {
    setMessages([{
      id: 'welcome-new',
      role: 'assistant',
      content: 'Chat dibersihkan. Ada yang ingin kamu tanyakan? 😊',
      timestamp: new Date(),
    }])
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--bg-card, rgba(15,23,42,0.9))',
      border: '1px solid rgba(139,92,246,0.2)',
      borderRadius: '16px', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.1))',
        borderBottom: '1px solid rgba(139,92,246,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(139,92,246,0.4)',
          }}>
            <Bot size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '15px', color: '#f1f5f9' }}>
              ARIA
              <span style={{
                marginLeft: '8px', fontSize: '10px', fontWeight: '600',
                background: 'rgba(34,197,94,0.15)', color: '#22c55e',
                padding: '2px 8px', borderRadius: '99px', border: '1px solid rgba(34,197,94,0.3)',
              }}>● ONLINE</span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Adaptive Response Intelligence for Alerts
            </div>
          </div>
        </div>
        <button onClick={clearChat} title="Bersihkan chat" style={{
          background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#64748b',
          display: 'flex', alignItems: 'center',
        }}>
          <Trash2 size={14} />
        </button>
      </div>

      {/* Context bar - tampil jika ada gempa aktif */}
      {latestEarthquake && (
        <div style={{
          padding: '8px 16px', fontSize: '12px',
          background: 'rgba(249,115,22,0.08)',
          borderBottom: '1px solid rgba(249,115,22,0.2)',
          display: 'flex', alignItems: 'center', gap: '8px', color: '#f97316',
        }}>
          <AlertTriangle size={12} />
          <span>Konteks aktif: Gempa M{latestEarthquake.magnitude} — {latestEarthquake.location}</span>
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '20px',
        display: 'flex', flexDirection: 'column',
      }}>
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick questions */}
      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', gap: '6px', overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {QUICK_QUESTIONS.map(q => (
          <button key={q} onClick={() => sendMessage(q)} disabled={loading} style={{
            flexShrink: 0, padding: '5px 12px',
            background: 'rgba(139,92,246,0.08)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '99px', color: '#a78bfa',
            fontSize: '11px', fontWeight: '500', cursor: 'pointer',
            whiteSpace: 'nowrap', transition: 'all 0.2s',
          }}>
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', gap: '10px', alignItems: 'center',
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tanya ARIA tentang gempa..."
          disabled={loading}
          style={{
            flex: 1, padding: '10px 16px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '12px',
            color: 'var(--text-primary, #f1f5f9)',
            fontSize: '14px', outline: 'none',
            WebkitTextFillColor: 'var(--text-primary, #f1f5f9)',
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: loading || !input.trim()
              ? 'rgba(139,92,246,0.3)'
              : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: loading || !input.trim() ? 'none' : '0 4px 15px rgba(139,92,246,0.4)',
            transition: 'all 0.2s',
          }}
        >
          <Send size={16} color="#fff" />
        </button>
      </div>

      {/* Footer */}
      <div style={{
        padding: '6px 16px 10px',
        fontSize: '10px', color: '#334155', textAlign: 'center',
      }}>
        <Info size={10} style={{ display: 'inline', marginRight: '4px' }} />
        Powered by Gemini AI · ARIA dapat membuat kesalahan, selalu verifikasi dengan BMKG resmi
      </div>
    </div>
  )
}
