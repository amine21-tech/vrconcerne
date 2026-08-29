'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin, Calendar, Clock, Users, ChevronRight, ExternalLink } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { EventItem, TicketItem } from '../types';
import { formatDate, qrPatternFromCode } from '../lib/data';
import { apiFetch, ApiError } from '../lib/apiClient';

/** Ouvre la page de paiement hebergee : onglet systeme sur Android/iOS, nouvel onglet sur le web. */
async function openCheckout(url: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url });
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

const STEPS = ['Détails', 'Billets', 'Paiement', 'Confirmation'];
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

interface BookingModalProps {
  event: EventItem;
  onClose: () => void;
  onConfirm: () => void;
}

export default function BookingModal({ event, onClose, onConfirm }: BookingModalProps) {
  const [step, setStep] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [creatingCheckout, setCreatingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [ticket, setTicket] = useState<TicketItem | null>(null);
  const [waitingPayment, setWaitingPayment] = useState(false);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollDeadline = useRef<number>(0);

  const total = event.price * quantity;
  const maxQty = Math.min(10, event.availableSeats);

  useEffect(() => () => stopPolling(), []);

  // Sur Android/iOS, l'onglet systeme (Chrome Custom Tabs) envoie cet
  // evenement des que l'utilisateur le ferme pour revenir a l'app : on en
  // profite pour verifier le paiement tout de suite plutot que d'attendre le
  // prochain intervalle de sondage.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const listenerPromise = Browser.addListener('browserFinished', () => {
      if (bookingId) checkBookingStatus(bookingId);
    });
    return () => {
      listenerPromise.then((l) => l.remove());
    };
  }, [bookingId]);

  const stopPolling = () => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
    setWaitingPayment(false);
  };

  const checkBookingStatus = async (id: string) => {
    try {
      const booking = await apiFetch<TicketItem>(`/bookings/${id}`);
      if (booking.paymentStatus === 'paid') {
        stopPolling();
        setTicket(booking);
        setStep(3);
        onConfirm();
      } else if (booking.paymentStatus === 'failed') {
        stopPolling();
        setCheckoutError('Le paiement a échoué ou a été annulé. Vous pouvez réessayer.');
      } else if (Date.now() > pollDeadline.current) {
        stopPolling();
        setCheckoutError(
          "Nous n'avons pas encore reçu de confirmation de paiement. Vérifiez « Mes billets » dans quelques minutes.",
        );
      }
    } catch {
      /* on retente au prochain intervalle */
    }
  };

  const handlePayWithChargily = async () => {
    setCreatingCheckout(true);
    setCheckoutError(null);
    try {
      const res = await apiFetch<{ bookingId: string; checkoutUrl: string }>('/bookings', {
        method: 'POST',
        body: { eventId: event.id, quantity },
      });
      setBookingId(res.bookingId);
      await openCheckout(res.checkoutUrl);

      setWaitingPayment(true);
      pollDeadline.current = Date.now() + POLL_TIMEOUT_MS;
      pollTimer.current = setInterval(() => checkBookingStatus(res.bookingId), POLL_INTERVAL_MS);
    } catch (err) {
      setCheckoutError(err instanceof ApiError ? err.message : 'La création du paiement a échoué.');
    } finally {
      setCreatingCheckout(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Réservation">
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        <div className="steps-bar" aria-label="Étapes de réservation">
          {STEPS.map((s, i) => (
            <div key={s} className={`step-dot ${i === step ? 'active' : ''}`} aria-label={s} />
          ))}
        </div>

        <div className="modal-header">
          <span className="modal-title">
            {step === 0 && '🎪 Détails de l\'événement'}
            {step === 1 && '🎟️ Choisir mes billets'}
            {step === 2 && '💳 Paiement'}
            {step === 3 && '✅ Réservation confirmée'}
          </span>
          <button className="modal-close-btn" onClick={onClose} aria-label="Fermer">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {step === 0 && (
            <div>
              <div
                style={{
                  width: '100%',
                  aspectRatio: '16/7',
                  background: event.bgColor,
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 60,
                  marginBottom: 16,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <span style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))' }}>{event.emoji}</span>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>{event.title}</div>
                </div>
              </div>

              <h2 className="event-detail-title">{event.title}</h2>
              <div className="event-detail-singer">🎤 {event.singer}</div>

              <div className="detail-info-grid">
                <div className="detail-info-box">
                  <Calendar size={18} className="icon" />
                  <div>
                    <div className="detail-info-label">Date</div>
                    <div className="detail-info-value" style={{ fontSize: 11 }}>
                      {formatDate(event.date)}
                    </div>
                  </div>
                </div>
                <div className="detail-info-box">
                  <Clock size={18} className="icon" />
                  <div>
                    <div className="detail-info-label">Heure</div>
                    <div className="detail-info-value">{event.time}</div>
                  </div>
                </div>
                <div className="detail-info-box">
                  <MapPin size={18} className="icon" />
                  <div>
                    <div className="detail-info-label">Lieu</div>
                    <div className="detail-info-value" style={{ fontSize: 11 }}>
                      {event.venue}
                    </div>
                  </div>
                </div>
                <div className="detail-info-box">
                  <Users size={18} className="icon" />
                  <div>
                    <div className="detail-info-label">Places</div>
                    <div
                      className="detail-info-value"
                      style={{
                        color:
                          event.availableSeats < event.totalSeats * 0.2 ? 'var(--orange)' : 'var(--green)',
                      }}
                    >
                      {event.availableSeats.toLocaleString()} restantes
                    </div>
                  </div>
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
                {event.description}
              </p>

              <button className="btn-primary" onClick={() => setStep(1)} id="btn-next-to-tickets">
                Choisir mes billets <ChevronRight size={16} style={{ display: 'inline', marginLeft: 4 }} />
              </button>
            </div>
          )}

          {step === 1 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>Prix unitaire</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                  {event.price.toLocaleString()} DZD
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div className="form-label" style={{ marginBottom: 10 }}>
                  Nombre de billets
                </div>
                <div className="qty-selector">
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Diminuer la quantité"
                    id="qty-decrease"
                  >
                    −
                  </button>
                  <span className="qty-display" aria-live="polite">
                    {quantity}
                  </span>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty}
                    aria-label="Augmenter la quantité"
                    id="qty-increase"
                  >
                    +
                  </button>
                </div>
                <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                  Maximum {maxQty} billets par réservation
                </div>
              </div>

              <div className="total-price-display">
                <div className="total-price-label">Total à payer</div>
                <div className="total-price-amount">{total.toLocaleString()} DZD</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  {quantity} billet{quantity > 1 ? 's' : ''} × {event.price.toLocaleString()} DZD
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn-secondary" onClick={() => setStep(0)}>
                  Retour
                </button>
                <button className="btn-primary" onClick={() => setStep(2)} id="btn-go-to-payment">
                  Procéder au paiement
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="total-price-display" style={{ marginBottom: 16 }}>
                <div className="total-price-label">Total à payer</div>
                <div className="total-price-amount">{total.toLocaleString()} DZD</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  {quantity} billet{quantity > 1 ? 's' : ''} — {event.title}
                </div>
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                Le paiement se fait sur la page sécurisée de Chargily Pay (Carte CIB ou EDAHABIA).
                VRconcerneDZ ne voit et ne stocke jamais votre numéro de carte.
              </p>

              {checkoutError && (
                <div style={{ color: 'var(--red, #ef4444)', fontSize: 13, marginBottom: 12 }}>
                  {checkoutError}
                </div>
              )}

              {waitingPayment ? (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 20,
                      height: 20,
                      border: '2px solid rgba(139,92,246,0.3)',
                      borderTopColor: 'var(--brand-primary)',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                      marginBottom: 10,
                    }}
                  />
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    En attente de la confirmation du paiement...
                  </div>
                  {bookingId && (
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ marginTop: 12 }}
                      onClick={() => checkBookingStatus(bookingId)}
                    >
                      J'ai terminé le paiement
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button className="btn-secondary" onClick={() => setStep(1)}>
                    Retour
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handlePayWithChargily}
                    disabled={creatingCheckout}
                    id="btn-confirm-payment"
                  >
                    {creatingCheckout ? (
                      'Préparation du paiement...'
                    ) : (
                      <>
                        Payer avec Chargily <ExternalLink size={14} style={{ display: 'inline', marginLeft: 4 }} />
                      </>
                    )}
                  </button>
                </div>
              )}

              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {step === 3 && ticket && (
            <div className="success-screen">
              <div className="success-anim">✅</div>
              <div className="success-title">Réservation Confirmée !</div>
              <div className="success-sub">
                Votre billet pour <strong>{event.title}</strong> est prêt. Présentez ce QR code à l'entrée.
              </div>

              <div className="ticket-card" style={{ width: '100%', marginBottom: 20 }}>
                <div className="ticket-qr">
                  {qrPatternFromCode(ticket.confirmCode ?? ticket.id).map((filled, i) => (
                    <div
                      key={i}
                      className="qr-cell"
                      style={{ background: filled ? '#111' : 'white', opacity: filled ? 1 : 0 }}
                    />
                  ))}
                </div>

                <div className="ticket-event-name">{event.title}</div>
                <div className="ticket-singer">🎤 {event.singer}</div>

                <div className="ticket-divider">
                  <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{event.venue}</span>
                </div>

                <div className="ticket-detail-row">
                  <span className="ticket-detail-key">Date</span>
                  <span className="ticket-detail-value">{formatDate(event.date)}</span>
                </div>
                <div className="ticket-detail-row">
                  <span className="ticket-detail-key">Heure</span>
                  <span className="ticket-detail-value">{event.time}</span>
                </div>
                <div className="ticket-detail-row">
                  <span className="ticket-detail-key">Billets</span>
                  <span className="ticket-detail-value">
                    {ticket.quantity} place{ticket.quantity > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="ticket-detail-row" style={{ borderBottom: 'none' }}>
                  <span className="ticket-detail-key">Total payé</span>
                  <span className="ticket-detail-value">{ticket.total.toLocaleString()} DZD</span>
                </div>

                <div className="ticket-code">Code : {ticket.confirmCode}</div>
              </div>

              <button className="btn-primary" onClick={onClose} id="btn-close-confirmation">
                🎉 Voir mes billets
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
