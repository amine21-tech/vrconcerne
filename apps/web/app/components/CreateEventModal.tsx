'use client';

import React, { useState } from 'react';
import { X, Calendar, MapPin, DollarSign, Users, Music } from 'lucide-react';
import { GENRES, WILAYAS } from '../lib/data';
import { EventItem, GenreType, RoleType } from '../types';
import { apiFetch, ApiError } from '../lib/apiClient';

interface CreateEventModalProps {
  onClose: () => void;
  onSubmit: (newEvent: EventItem) => void;
  role: RoleType;
}

/** Deux semaines a partir d'aujourd'hui, au format AAAA-MM-JJ attendu par <input type="date">. */
function defaultEventDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

const TODAY = new Date().toISOString().slice(0, 10);

export default function CreateEventModal({ onClose, onSubmit, role }: CreateEventModalProps) {
  const [singer, setSinger] = useState('');
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState<GenreType>('RAI');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(defaultEventDate);
  const [time, setTime] = useState('21:00');
  const [venue, setVenue] = useState('');
  const [wilaya, setWilaya] = useState('Alger');
  const [totalSeats, setTotalSeats] = useState(1000);
  const [price, setPrice] = useState(2000);
  const [emoji, setEmoji] = useState('🎤');

  const EMOJIS = ['🎤', '👑', '🌟', '🎷', '😂', '🪘', '🎧', '🌙', '🏜️', '🎭', '🔥', '⚡'];
  const BG_COLORS = [
    'linear-gradient(135deg, #8B5CF6, #EC4899)',
    'linear-gradient(135deg, #FF6B35, #FF4757)',
    'linear-gradient(135deg, #3B82F6, #1D4ED8)',
    'linear-gradient(135deg, #10B981, #059669)',
    'linear-gradient(135deg, #FBBF24, #F59E0B)',
  ];

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singer || !title || !venue) return;

    setSubmitting(true);
    setError(null);
    try {
      const newEvent = await apiFetch<EventItem>('/events', {
        method: 'POST',
        body: {
          title,
          singer,
          genre,
          description:
            description || `Grand concert de ${singer} à ${venue}, ${wilaya}. Festivités estivales 2026 !`,
          eventDate: date,
          eventTime: time,
          venue,
          wilaya,
          totalSeats: Number(totalSeats),
          price: Number(price),
          emoji,
          bgColor: BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)],
        },
      });
      onSubmit(newEvent);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "La création a échoué.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Créer un événement">
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        <div className="modal-header">
          <span className="modal-title">✨ Organiser un événement</span>
          <button className="modal-close-btn" onClick={onClose} aria-label="Fermer">
            <X size={16} />
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          <div
            style={{
              padding: 12,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid var(--border-primary)',
              fontSize: 12,
              color: 'var(--text-secondary)',
              marginBottom: 16,
              lineHeight: 1.5,
            }}
          >
            ℹ️ {role === 'admin' ? 'En tant qu\'Administrateur, votre événement sera directement publié.' : 'Votre événement sera soumis aux administrateurs VRconcerneDZ pour validation avant publication.'}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="singer-name">
              Chanteur / Groupe *
            </label>
            <input
              id="singer-name"
              className="form-input"
              placeholder="Ex: Soolking, Cheb Khaled, Djalil Palermo..."
              value={singer}
              onChange={(e) => setSinger(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="event-title">
              Titre de l'événement *
            </label>
            <input
              id="event-title"
              className="form-input"
              placeholder="Ex: Summer Bash 2026, Hommage Rai..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="event-genre">
                Genre Musical *
              </label>
              <select
                id="event-genre"
                className="form-select"
                value={genre}
                onChange={(e) => setGenre(e.target.value as GenreType)}
              >
                {GENRES.filter((g) => g.id !== 'Tout').map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="event-wilaya">
                Wilaya *
              </label>
              <select
                id="event-wilaya"
                className="form-select"
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
              >
                {WILAYAS.filter((w) => w !== 'Toutes les Wilayas').map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="event-venue">
              Lieu / Salle / Théâtre *
            </label>
            <input
              id="event-venue"
              className="form-input"
              placeholder="Ex: Théâtre de Verdure, Opéra d'Alger, Stade..."
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="event-date">
                Date *
              </label>
              <input
                id="event-date"
                className="form-input"
                type="date"
                value={date}
                min={TODAY}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="event-time">
                Heure *
              </label>
              <input
                id="event-time"
                className="form-input"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="event-seats">
                Places Total *
              </label>
              <input
                id="event-seats"
                className="form-input"
                type="number"
                min="10"
                step="10"
                value={totalSeats}
                onChange={(e) => setTotalSeats(Number(e.target.value))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="event-price">
                Prix du billet (DZD) *
              </label>
              <input
                id="event-price"
                className="form-input"
                type="number"
                min="0"
                step="100"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Icône de l'événement</label>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {EMOJIS.map((em) => (
                <button
                  type="button"
                  key={em}
                  onClick={() => setEmoji(em)}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    border: emoji === em ? '2px solid var(--brand-primary)' : '1px solid var(--border-card)',
                    background: emoji === em ? 'rgba(139,92,246,0.2)' : 'var(--bg-input)',
                    fontSize: 20,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="event-desc">
              Description de l'événement
            </label>
            <textarea
              id="event-desc"
              className="form-textarea"
              placeholder="Rédigez une présentation attractive de votre concert..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && (
            <div style={{ color: 'var(--red, #ef4444)', fontSize: 13, marginBottom: 12 }}>{error}</div>
          )}

          <button type="submit" className="btn-primary" id="btn-submit-event" disabled={submitting}>
            {submitting
              ? 'Envoi en cours...'
              : `🚀 ${role === 'admin' ? 'Publier directement' : "Soumettre à l'administration"}`}
          </button>
        </form>
      </div>
    </div>
  );
}
