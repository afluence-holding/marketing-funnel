'use client';

import { useState, type CSSProperties, type FormEvent } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/browser';

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: signInError } = await getSupabaseBrowser().auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      // Middleware will pick up the session cookie on the next request.
      window.location.href = nextPath;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }

  const labelStyle: CSSProperties = {
    fontSize: '0.66rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 700,
    color: 'var(--color-text-secondary)',
  };
  const inputStyle: CSSProperties = {
    marginTop: 5,
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'var(--color-bg-card)',
    color: 'var(--color-text-primary)',
    padding: '9px 12px',
    fontSize: '0.88rem',
    fontFamily: 'inherit',
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <label style={{ display: 'block' }}>
        <span style={labelStyle}>Email</span>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
      </label>
      <label style={{ display: 'block' }}>
        <span style={labelStyle}>Password</span>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
      </label>
      {error && (
        <p role="alert" style={{ fontSize: '0.82rem', color: 'var(--color-critical)', margin: 0 }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          borderRadius: 8,
          border: 'none',
          background: 'var(--color-accent)',
          color: '#fff',
          padding: '11px 16px',
          fontSize: '0.88rem',
          fontWeight: 700,
          fontFamily: 'inherit',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
