'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { formatDateShort } from '../lib/data';
import { apiFetch } from '../lib/apiClient';

interface AdminEvent {
  id: string;
  title: string;
  singer: string;
  emoji: string;
  date: string;
  venue: string;
  wilaya: string;
  price: number;
  totalSeats: number;
  description: string;
  status: 'pending' | 'published' | 'rejected';
  featured: boolean;
  organizerName: string;
}

interface AdminOrganizer {
  id: string;
  email: string;
  displayName: string;
  organizerBio: string | null;
  createdAt: string;
}

interface AdminStats {
  pendingEvents: number;
  publishedEvents: number;
  ticketsSold: number;
  revenue: number;
  pendingOrganizers: number;
}

type Tab = 'pending' | 'published' | 'all' | 'organizers';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [organizers, setOrganizers] = useState<AdminOrganizer[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const statsPromise = apiFetch<AdminStats>('/admin/stats');
      if (activeTab === 'organizers') {
        const [organizersRes, statsRes] = await Promise.all([
          apiFetch<{ items: AdminOrganizer[] }>('/admin/organizers', { query: { status: 'pending' } }),
          statsPromise,
        ]);
        setOrganizers(organizersRes.items);
        setStats(statsRes);
      } else {
        const status = activeTab === 'all' ? undefined : activeTab;
        const [eventsRes, statsRes] = await Promise.all([
          apiFetch<{ items: AdminEvent[] }>('/admin/events', { query: { status } }),
          statsPromise,
        ]);
        setEvents(eventsRes.items);
        setStats(statsRes);
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (id: string) => {
    await apiFetch(`/admin/events/${id}/approve`, { method: 'POST' });
    load();
  };

  const handleReject = async (id: string) => {
    await apiFetch(`/admin/events/${id}/reject`, { method: 'POST' });
    load();
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    await apiFetch(`/admin/events/${id}/feature`, { method: 'POST', body: { featured: !featured } });
    load();
  };

  const handleApproveOrganizer = async (id: string) => {
    await apiFetch(`/admin/organizers/${id}/approve`, { method: 'POST' });
    load();
  };

  const handleRejectOrganizer = async (id: string) => {
    await apiFetch(`/admin/organizers/${id}/reject`, { method: 'POST' });
    load();
  };

  return (
    <div>
      <div style={{ padding: '16px 16px 0' }}>
        <h2 className="section-title" style={{ fontSize: 20 }}>
          🛡️ Panneau d'Administration VRconcerneDZ
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          Modération des événements, partenariats et suivi global de l'application
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats?.pendingEvents ?? '—'}</div>
          <div className="stat-label">Événements en attente</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.publishedEvents ?? '—'}</div>
          <div className="stat-label">En Ligne</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.ticketsSold ?? '—'}</div>
          <div className="stat-label">Billets Vendus</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: 18 }}>
            {stats ? `${(stats.revenue / 1000).toFixed(0)}k DZD` : '—'}
          </div>
          <div className="stat-label">Recettes</div>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          En Attente
        </button>
        <button
          className={`admin-tab ${activeTab === 'published' ? 'active' : ''}`}
          onClick={() => setActiveTab('published')}
        >
          Publiés
        </button>
        <button
          className={`admin-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Tous
        </button>
        <button
          className={`admin-tab ${activeTab === 'organizers' ? 'active' : ''}`}
          onClick={() => setActiveTab('organizers')}
        >
          Partenaires{stats && stats.pendingOrganizers > 0 ? ` (${stats.pendingOrganizers})` : ''}
        </button>
      </div>

      <div style={{ padding: 16 }}>
        {loading ? (
          <div className="empty-state" style={{ padding: 30 }}>
            <div className="empty-state-title">Chargement...</div>
          </div>
        ) : activeTab === 'organizers' ? (
          organizers.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <div className="empty-state-icon">🤝</div>
              <div className="empty-state-title">Aucune demande de partenariat en attente</div>
            </div>
          ) : (
            organizers.map((org) => (
              <div key={org.id} className="admin-event-card" id={`admin-organizer-${org.id}`}>
                <div className="admin-event-header">
                  <div>
                    <div className="admin-event-title">{org.displayName}</div>
                    <div className="admin-event-meta">
                      ✉️ {org.email} · 📅 demande du {formatDateShort(org.createdAt)}
                    </div>
                  </div>
                  <span className="status-badge pending">pending</span>
                </div>

                {org.organizerBio && (
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.4 }}>
                    {org.organizerBio}
                  </p>
                )}

                <div className="admin-actions">
                  <button
                    className="btn-success"
                    onClick={() => handleApproveOrganizer(org.id)}
                    id={`btn-approve-organizer-${org.id}`}
                  >
                    ✅ Approuver le partenariat
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => handleRejectOrganizer(org.id)}
                    id={`btn-reject-organizer-${org.id}`}
                  >
                    ❌ Refuser
                  </button>
                </div>
              </div>
            ))
          )
        ) : events.length === 0 ? (
          <div className="empty-state" style={{ padding: 30 }}>
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">Aucun événement dans cette section</div>
          </div>
        ) : (
          events.map((ev) => (
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
                    💰 {ev.price.toLocaleString()} DZD · 🎟️ {ev.totalSeats} places · par {ev.organizerName}
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
                    onClick={() => handleApprove(ev.id)}
                    id={`btn-approve-${ev.id}`}
                  >
                    ✅ Approuver & Publier
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => handleReject(ev.id)}
                    id={`btn-reject-${ev.id}`}
                  >
                    ❌ Refuser
                  </button>
                </div>
              )}

              {ev.status === 'published' && (
                <div className="admin-actions">
                  <button
                    className={ev.featured ? 'btn-danger' : 'btn-success'}
                    onClick={() => handleToggleFeatured(ev.id, ev.featured)}
                    id={`btn-feature-${ev.id}`}
                  >
                    {ev.featured ? '☆ Retirer de la une' : '⭐ Mettre en avant cette semaine'}
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
