'use client';

import React, { useState } from 'react';
import { EventItem, TicketItem } from '../types';
import { formatDateShort } from '../lib/data';

interface AdminPanelProps {
  events: EventItem[];
  tickets: TicketItem[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function AdminPanel({ events, tickets, onApprove, onReject }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'all'>('pending');

  const pendingEvents = events.filter((e) => e.status === 'pending');
  const publishedEvents = events.filter((e) => e.status === 'published');
  const totalRevenue = tickets.reduce((sum, t) => sum + t.total, 0);
  const totalTicketsSold = tickets.reduce((sum, t) => sum + t.quantity, 0);

  const displayedEvents =
    activeTab === 'pending'
      ? pendingEvents
      : activeTab === 'published'
      ? publishedEvents
      : events;

  return (
    <div>
      <div style={{ padding: '16px 16px 0' }}>
        <h2 className="section-title" style={{ fontSize: 20 }}>
          🛡️ Panneau d'Administration VRconcerneDZ
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          Modération des événements et suivi global de l'application
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{pendingEvents.length}</div>
          <div className="stat-label">En attente</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{publishedEvents.length}</div>
          <div className="stat-label">En Ligne</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalTicketsSold}</div>
          <div className="stat-label">Billets Vendus</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: 18 }}>
            {(totalRevenue / 1000).toFixed(0)}k DZD
          </div>
          <div className="stat-label">Recettes</div>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          En Attente ({pendingEvents.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'published' ? 'active' : ''}`}
          onClick={() => setActiveTab('published')}
        >
          Publiés ({publishedEvents.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Tous ({events.length})
        </button>
      </div>

      <div style={{ padding: 16 }}>
        {displayedEvents.length === 0 ? (
          <div className="empty-state" style={{ padding: 30 }}>
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">Aucun événement dans cette section</div>
          </div>
        ) : (
          displayedEvents.map((ev) => (
            <div key={ev.id} className="admin-event-card" id={`admin-card-${ev.id}`}>
              <div className="admin-event-header">
                <div>
                  <div className="admin-event-title">
                    {ev.emoji} {ev.title}
                  </div>
                  <div className="admin-event-meta">
                    🎤 {ev.singer} · 📍 {ev.venue}, {ev.wilaya} · 📅 {formatDateShort(ev.date)}
                  </div>
                  <div className="admin-event-meta" style={{ marginTop: 2 }}>
                    💰 {ev.price.toLocaleString()} DZD · 🎟️ {ev.totalSeats} places
                  </div>
                </div>
                <span className={`status-badge ${ev.status}`}>{ev.status}</span>
              </div>

              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.4 }}>
                {ev.description}
              </p>

              {ev.status === 'pending' && (
                <div className="admin-actions">
                  <button
                    className="btn-success"
                    onClick={() => onApprove(ev.id)}
                    id={`btn-approve-${ev.id}`}
                  >
                    ✅ Approuver & Publier
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => onReject(ev.id)}
                    id={`btn-reject-${ev.id}`}
                  >
                    ❌ Refuser
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
