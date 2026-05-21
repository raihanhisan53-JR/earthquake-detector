'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          margin: '16px',
          borderRadius: '12px',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          color: 'var(--text-color, #e2e8f0)',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '32px' }}>⚠️</span>
          <h3 style={{ margin: 0, color: '#ef4444' }}>Terjadi Kesalahan</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary, #94a3b8)', fontSize: '14px', maxWidth: '400px' }}>
            {this.state.error?.message || 'Komponen ini gagal dimuat. Silakan refresh halaman.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '8px',
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#3b82f6',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
            }}
          >
            Refresh Halaman
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
