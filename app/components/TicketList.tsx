'use client';

import React, { useState } from 'react';
import { Ticket, MapPin, Calendar, X } from 'lucide-react';
import { TicketItem, EventItem } from '../types';
import { formatDate } from '../lib/data';

interface TicketListProps {
  tickets: TicketItem[];
  events: EventItem[];
}

export default function TicketList({ tickets }: TicketListProps) {
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);

  if (tickets.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🎟️</div>
        <div className="empty-state-title">Aucun billet réservé</div>
        <div className="empty-state-text">
          Vous n'avez pas encore réservé de place pour les concerts ou festivités estivales. Parcourez l'accueil pour réserver !
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div className="section-header" style={{ padding: '0 0 12px' }}>
        <h2 className="section-title">Mes Billets ({tickets.length})</h2>
      </div>

      {tickets.map((t) => (
        <div key={t.id} className="my-ticket-item" onClick={() => setSelectedTicket(t)} id={`ticket-item-${t.id}`}>
          <div className="my-ticket-icon">{t.emoji}</div>
          <div className="my-ticket-info">
            <div className="my-ticket-title">{t.eventTitle}</div>
            <div className="my-ticket-sub">
              🎤 {t.singer} · 📍 {t.wilaya}
            </div>
            <div className="my-ticket-sub" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>
              📅 {formatDate(t.date)} à {t.time}
            </div>
          </div>
          <span className="my-ticket-badge">{t.quantity} place{t.quantity > 1 ? 's' : ''}</span>
        </div>
      ))}

      {selectedTicket && (
        <div className="modal-overlay center" onClick={() => setSelectedTicket(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span className="modal-title">E-Billet Officiel</span>
              <button className="modal-close-btn" onClick={() => setSelectedTicket(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="ticket-card">
              <div className="ticket-qr">
                {selectedTicket.qrPattern.map((filled, i) => (
                  <div
                    key={i}
                    className="qr-cell"
                    style={{ background: filled ? '#111' : 'white', opacity: filled ? 1 : 0 }}
                  />
                ))}
              </div>

              <div className="ticket-event-name">{selectedTicket.eventTitle}</div>
              <div className="ticket-singer">🎤 {selectedTicket.singer}</div>

              <div className="ticket-divider">
                <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedTicket.venue}</span>
              </div>

              <div className="ticket-detail-row">
                <span className="ticket-detail-key">Wilaya</span>
                <span className="ticket-detail-value">{selectedTicket.wilaya}</span>
              </div>
              <div className="ticket-detail-row">
                <span className="ticket-detail-key">Date</span>
                <span className="ticket-detail-value">{formatDate(selectedTicket.date)}</span>
              </div>
              <div className="ticket-detail-row">
                <span className="ticket-detail-key">Heure</span>
                <span className="ticket-detail-value">{selectedTicket.time}</span>
              </div>
              <div className="ticket-detail-row">
                <span className="ticket-detail-key">Places</span>
                <span className="ticket-detail-value">{selectedTicket.quantity}</span>
              </div>
              <div className="ticket-detail-row">
                <span className="ticket-detail-key">Paiement</span>
                <span className="ticket-detail-value">
                  {selectedTicket.paymentMethod === 'cib' ? 'Carte CIB' : 'Edahabia'}
                </span>
              </div>

              <div className="ticket-code">Code : {selectedTicket.confirmCode}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
