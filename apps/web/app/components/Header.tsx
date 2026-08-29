'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { RoleType } from '../types';

interface HeaderProps {
  role: RoleType;
  onRoleChange: (role: RoleType) => void;
  ticketCount: number;
}

const ROLE_LABELS: Record<RoleType, string> = {
  client: 'Client',
  organizer: 'Organisateur',
  admin: 'Admin',
};

export default function Header({ role, onRoleChange }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-logo">VRconcerneDZ</div>
      
      <div className="role-selector" role="group" aria-label="Changer de rôle">
        {(Object.keys(ROLE_LABELS) as RoleType[]).map((key) => (
          <button
            key={key}
            className={`role-btn ${role === key ? 'active' : ''}`}
            onClick={() => onRoleChange(key)}
            aria-pressed={role === key}
            id={`role-btn-${key}`}
          >
            {ROLE_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="header-actions">
        <button className="icon-btn" aria-label="Notifications" id="btn-notifications">
          <Bell size={18} />
          <span className="notification-badge" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
