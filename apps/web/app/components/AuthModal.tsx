'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth, ApiError } from '../lib/AuthContext';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'client' | 'organizer'>('client');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ email, password, displayName, role });
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Connexion">
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        <div className="modal-header">
          <span className="modal-title">
            {mode === 'login' ? '🔐 Se connecter' : '✨ Créer un compte'}
          </span>
          <button className="modal-close-btn" onClick={onClose} aria-label="Fermer">
            <X size={16} />
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              type="button"
              className={`btn-secondary ${mode === 'login' ? 'active' : ''}`}
              style={{ flex: 1, opacity: mode === 'login' ? 1 : 0.6 }}
              onClick={() => setMode('login')}
            >
              Connexion
            </button>
            <button
              type="button"
              className={`btn-secondary ${mode === 'register' ? 'active' : ''}`}
              style={{ flex: 1, opacity: mode === 'register' ? 1 : 0.6 }}
              onClick={() => setMode('register')}
            >
              Inscription
            </button>
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-name">
                Nom affiché
              </label>
              <input
                id="auth-name"
                className="form-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                minLength={2}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">
              Courriel
            </label>
            <input
              id="auth-email"
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">
              Mot de passe
            </label>
            <input
              id="auth-password"
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-role">
                Je suis...
              </label>
              <select
                id="auth-role"
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value as 'client' | 'organizer')}
              >
                <option value="client">Un client — je réserve des places</option>
                <option value="organizer">
                  Un organisateur / artiste — je publie des événements
                </option>
              </select>
            </div>
          )}

          {error && (
            <div style={{ color: 'var(--red, #ef4444)', fontSize: 13, marginBottom: 12 }}>{error}</div>
          )}

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Un instant...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>
      </div>
    </div>
  );
}
