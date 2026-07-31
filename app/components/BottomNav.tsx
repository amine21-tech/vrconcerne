'use client';

import React from 'react';
import { Home, Search, PlusCircle, Ticket, ShieldCheck, LucideIcon } from 'lucide-react';
import { RoleType } from '../types';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  role: RoleType;
  ticketCount: number;
  pendingCount: number;
}

interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
  isCreate?: boolean;
}

export default function BottomNav({ activeTab, onTabChange, role, ticketCount, pendingCount }: BottomNavProps) {
  const navItems: NavItem[] = [
    { id: 'home', icon: Home, label: 'Accueil' },
    { id: 'explore', icon: Search, label: 'Explorer' },
    { id: 'create', icon: PlusCircle, label: role === 'admin' ? 'Admin' : 'Créer', isCreate: true },
    { id: 'tickets', icon: Ticket, label: 'Mes Billets' },
  ];

  if (role === 'admin') {
    navItems[2] = { id: 'admin', icon: ShieldCheck, label: 'Admin', isCreate: true };
  }

  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id || (item.id === 'admin' && activeTab === 'admin');
        return (
          <button
            key={item.id}
            className={`nav-item ${item.isCreate ? 'nav-add-btn' : ''} ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
            aria-label={item.label}
            id={`nav-${item.id}`}
          >
            <span className="nav-icon" style={{ position: 'relative' }}>
              <Icon size={item.isCreate ? 24 : 22} />
              {item.id === 'tickets' && ticketCount > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -8,
                  background: 'var(--brand-secondary)',
                  color: 'white', borderRadius: '50%',
                  width: 16, height: 16, fontSize: 9, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--bg-primary)'
                }}>{ticketCount > 9 ? '9+' : ticketCount}</span>
              )}
              {(item.id === 'admin' || item.id === 'create') && role === 'admin' && pendingCount > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -8,
                  background: 'var(--orange)',
                  color: 'white', borderRadius: '50%',
                  width: 16, height: 16, fontSize: 9, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--bg-primary)'
                }}>{pendingCount}</span>
              )}
            </span>
            {!item.isCreate && <span style={{ fontSize: 10, fontWeight: 600 }}>{item.label}</span>}
          </button>
        );
      })}
    </nav>
  );
}
