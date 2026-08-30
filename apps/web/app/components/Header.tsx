'use client';

import React from 'react';
import { Bell, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from '../lib/ThemeContext';

const ROLE_LABELS: Record<string, string> = {
  client: 'Client',
  organizer: 'Organisateur',
  admin: 'Admin',
};

interface HeaderProps {
  onRequestAuth: () => void;
}

export default function Header({ onRequestAuth }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="app-header">
      <div className="header-logo">VRconcerneDZ</div>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {user ? (
          <>
            <span
              style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}
              id="current-user-label"
            >
              {user.displayName} · {ROLE_LABELS[user.role] ?? user.role}
            </span>
            <button className="icon-btn" aria-label="Déconnexion" onClick={logout} id="btn-logout">
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <button className="btn-secondary" onClick={onRequestAuth} id="btn-login">
            Se connecter
          </button>
        )}

        <button
          className="icon-btn"
          aria-label={theme === 'dark' ? 'Passer en mode normal' : 'Passer en mode nuit'}
          onClick={toggleTheme}
          id="btn-theme-toggle"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="icon-btn" aria-label="Notifications" id="btn-notifications">
          <Bell size={18} />
          <span className="notification-badge" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
