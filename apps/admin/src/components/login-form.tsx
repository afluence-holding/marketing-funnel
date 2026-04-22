'use client';

import { useState, type FormEvent } from 'react';
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

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block">
        <span className="text-xs uppercase tracking-wider text-zinc-500">Email</span>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
        />
      </label>
      <label className="block">
        <span className="text-xs uppercase tracking-wider text-zinc-500">Password</span>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
