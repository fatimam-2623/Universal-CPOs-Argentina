'use client';

import { useState } from 'react';
import { login } from './actions';

export default function LoginPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData) {
    setLoading(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--paper)' }}>
      <form action={handleSubmit} className="w-full max-w-sm bg-white rounded-2xl border border-line shadow-sm p-8">
        <div className="mb-8 text-center">
          <div
            className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center font-display font-bold text-white text-lg"
            style={{ backgroundColor: 'var(--blue)' }}
          >
            CC
          </div>
          <h1 className="font-display font-semibold text-xl" style={{ color: 'var(--blue)' }}>
            Centro de Control
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--gray)' }}>
            Ingresá con tu cuenta
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#5B6472' }}>
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-line focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#5B6472' }}>
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-line focus:outline-none"
            />
          </div>
          {error && (
            <p className="text-sm" style={{ color: 'var(--red)' }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-sm font-medium py-2.5 rounded-lg text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: 'var(--blue)' }}
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </div>
      </form>
    </div>
  );
}
