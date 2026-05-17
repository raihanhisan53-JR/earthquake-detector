'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { ArrowLeft, Camera, Check, Lock, Loader2, Save, X } from 'lucide-react'

interface Props {
  user: User
  onBack: () => void
  onLogout: () => void
}

const ADMIN_EMAIL = 'raihanhisan36@gmail.com'

const LOCAL_KEY = (uid: string) => `tectra_profile_${uid}`

interface ProfileData {
  displayName: string
  username: string
  bio: string
  phone: string
  address: string
  contactEmail: string
  birthdate: string
  relationship: string
  avatarDataUrl: string
}

const defaultProfile = (user: User): ProfileData => ({
  displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '',
  username: user.user_metadata?.full_name?.replace(/\s+/g, '_') || user.email?.split('@')[0] || '',
  bio: user.user_metadata?.bio || '',
  phone: user.user_metadata?.phone || '',
  address: user.user_metadata?.address || '',
  contactEmail: user.user_metadata?.contact_email || '',
  birthdate: user.user_metadata?.birthdate || '',
  relationship: user.user_metadata?.relationship || '',
  avatarDataUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
})

export default function ProfilePage({ user, onBack, onLogout }: Props) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isAdmin = user.email === ADMIN_EMAIL

  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [profile, setProfile] = useState<ProfileData>(() => defaultProfile(user))
  const [draft, setDraft] = useState<ProfileData>(() => defaultProfile(user))
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY(user.id))
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<ProfileData>
        setProfile(p => ({ ...p, ...parsed }))
        setDraft(p => ({ ...p, ...parsed }))
      }
    } catch { /* ignore */ }
  }, [user.id])

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { showToast('error', 'Foto terlalu besar (maks 5MB)'); return }
    const reader = new FileReader()
    reader.onload = () => {
      // Resize via canvas
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX = 256
        const ratio = Math.min(MAX / img.width, MAX / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        setDraft(d => ({ ...d, avatarDataUrl: dataUrl }))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      // Save to localStorage
      localStorage.setItem(LOCAL_KEY(user.id), JSON.stringify(draft))

      // Update Supabase metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: draft.displayName,
          bio: draft.bio,
          phone: draft.phone,
          address: draft.address,
          contact_email: draft.contactEmail,
          birthdate: draft.birthdate,
          relationship: draft.relationship,
          // avatar via localStorage only (Supabase metadata has size limits)
        }
      })
      if (error) throw error

      setProfile(draft)
      setMode('view')
      showToast('success', 'Profil berhasil diperbarui')
    } catch {
      showToast('error', 'Gagal menyimpan. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }, [draft, supabase.auth, user.id])

  const handleCancel = () => {
    setDraft(profile)
    setMode('view')
  }

  const avatarSrc = mode === 'edit' ? draft.avatarDataUrl : profile.avatarDataUrl
  const displayName = mode === 'edit' ? draft.displayName : profile.displayName

  return (
    <div className="pp-root">
      {/* Toast */}
      {toast && (
        <div className={`pp-toast pp-toast--${toast.type}`}>
          {toast.type === 'success' ? <Check size={15} /> : <X size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="pp-header">
        <button className="pp-back-btn" onClick={onBack}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <h2 className="pp-title">{mode === 'edit' ? 'Edit Profil' : 'Profil Pengguna'}</h2>
        {mode === 'view' && (
          <button className="pp-edit-btn" onClick={() => setMode('edit')}>
            ✏️ Edit Profil
          </button>
        )}
        {mode === 'edit' && <div style={{ width: 100 }} />}
      </div>

      {/* Avatar section */}
      <div className="pp-avatar-section">
        <div className="pp-avatar-wrap">
          {avatarSrc ? (
            <img src={avatarSrc} alt="avatar" className="pp-avatar-img" />
          ) : (
            <div className="pp-avatar-init">
              {(displayName || user.email || 'U')[0].toUpperCase()}
            </div>
          )}
          {mode === 'edit' && (
            <button className="pp-avatar-cam" onClick={() => fileInputRef.current?.click()} title="Ubah foto">
              <Camera size={16} />
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
          {mode === 'edit' && (
            <div className="pp-avatar-hint">Ubah foto profil</div>
          )}
        </div>

        <div className="pp-identity">
          <div className="pp-identity-name">{displayName || '—'}</div>
          <div className="pp-identity-email">{user.email}</div>
          <div className="pp-identity-badges">
            {isAdmin && <span className="pp-badge pp-badge--admin">👑 Admin Utama</span>}
            <span className="pp-badge pp-badge--pro">⚡ TECTRA PRO</span>
            {profile.relationship && (
              <span className="pp-badge pp-badge--rel">
                {profile.relationship === 'Single' ? '🙋' :
                 profile.relationship === 'Pacaran' ? '💑' :
                 profile.relationship === 'Menikah' ? '💍' :
                 profile.relationship === 'Rahasia' ? '🤫' : '❤️'}{' '}
                {profile.relationship}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Form grid */}
      <div className="pp-grid">

        {/* Informasi Akun */}
        <div className="pp-card">
          <div className="pp-card-title">📋 Informasi Akun</div>
          <div className="pp-field">
            <label>Nama Lengkap</label>
            {mode === 'edit' ? (
              <input className="pp-input" value={draft.displayName}
                onChange={e => setDraft(d => ({ ...d, displayName: e.target.value }))}
                placeholder="Nama kamu..." />
            ) : (
              <div className="pp-value">{profile.displayName || '—'}</div>
            )}
          </div>
          <div className="pp-field">
            <label>Username</label>
            {mode === 'edit' ? (
              <input className="pp-input" value={draft.username}
                onChange={e => setDraft(d => ({ ...d, username: e.target.value }))}
                placeholder="@username" />
            ) : (
              <div className="pp-value">{profile.username || '—'}</div>
            )}
          </div>
          <div className="pp-field">
            <label>Bio Singkat</label>
            {mode === 'edit' ? (
              <textarea className="pp-input pp-textarea" value={draft.bio}
                onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))}
                placeholder="Ceritakan sedikit tentang kamu..." rows={3} />
            ) : (
              <div className="pp-value pp-value--bio">{profile.bio || '—'}</div>
            )}
          </div>
        </div>

        {/* Kontak & Lokasi */}
        <div className="pp-card">
          <div className="pp-card-title">📍 Kontak & Lokasi</div>
          <div className="pp-field">
            <label>Nomor HP</label>
            {mode === 'edit' ? (
              <input className="pp-input" value={draft.phone} type="tel"
                onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))}
                placeholder="08xxxxxxxxxx" />
            ) : (
              <div className="pp-value">{profile.phone || '—'}</div>
            )}
          </div>
          <div className="pp-field">
            <label>Email Kontak</label>
            {mode === 'edit' ? (
              <input className="pp-input" value={draft.contactEmail} type="email"
                onChange={e => setDraft(d => ({ ...d, contactEmail: e.target.value }))}
                placeholder="email@kontak.com" />
            ) : (
              <div className="pp-value">{profile.contactEmail || '—'}</div>
            )}
          </div>
          <div className="pp-field">
            <label>Alamat</label>
            {mode === 'edit' ? (
              <input className="pp-input" value={draft.address}
                onChange={e => setDraft(d => ({ ...d, address: e.target.value }))}
                placeholder="Kota / alamat..." />
            ) : (
              <div className="pp-value">{profile.address || '—'}</div>
            )}
          </div>
          <div className="pp-field pp-field--locked">
            <label><Lock size={11} /> Email Akun (Terkunci - dari login)</label>
            <div className="pp-value pp-value--locked">{user.email}</div>
          </div>
        </div>

        {/* Data Personal */}
        <div className="pp-card pp-card--full">
          <div className="pp-card-title">🎂 Data Personal</div>
          <div className="pp-row2">
            <div className="pp-field">
              <label>Tanggal Lahir</label>
              {mode === 'edit' ? (
                <input className="pp-input" type="date" value={draft.birthdate}
                  onChange={e => setDraft(d => ({ ...d, birthdate: e.target.value }))} />
              ) : (
                <div className="pp-value">
                  {profile.birthdate
                    ? new Date(profile.birthdate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '—'}
                </div>
              )}
            </div>
            <div className="pp-field">
              <label>Status Hubungan</label>
              {mode === 'edit' ? (
                <select className="pp-input" value={draft.relationship}
                  onChange={e => setDraft(d => ({ ...d, relationship: e.target.value }))}>
                  <option value="">Pilih status...</option>
                  <option value="Single">Single</option>
                  <option value="Pacaran">Pacaran 💑</option>
                  <option value="Menikah">Menikah 💍</option>
                  <option value="Rahasia">Rahasia 🤫</option>
                </select>
              ) : (
                <div className="pp-value">{profile.relationship || '—'}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {mode === 'edit' && (
        <div className="pp-actions">
          <button className="pp-btn pp-btn--cancel" onClick={handleCancel} disabled={saving}>
            Batal
          </button>
          <button className="pp-btn pp-btn--save" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      )}

      {mode === 'view' && (
        <div className="pp-actions pp-actions--view">
          <button className="pp-btn pp-btn--danger" onClick={onLogout}>
            🚪 Keluar dari Akun
          </button>
        </div>
      )}
    </div>
  )
}
