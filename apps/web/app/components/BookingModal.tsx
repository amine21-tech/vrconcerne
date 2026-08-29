'use client';

import React, { useState } from 'react';
import { X, MapPin, Calendar, Users, Clock, CreditCard, Smartphone, ChevronRight } from 'lucide-react';
import { EventItem, TicketItem } from '../types';
import { formatDate, generateCode, generateQRPattern } from '../lib/data';

const STEPS = ['Détails', 'Billets', 'Paiement', 'Confirmation'];

interface BookingModalProps {
  event: EventItem;
  onClose: () => void;
  onConfirm: (booking: TicketItem) => void;
}

export default function BookingModal({ event, onClose, onConfirm }: BookingModalProps) {
  const [step, setStep] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'cib' | 'edahabia'>('cib');
  const [cardNum, setCardNum] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [edahabiaNum, setEdahabiaNum] = useState('');
  const [edahabiaCode, setEdahabiaCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmCode] = useState(generateCode());
  const [qrPattern] = useState(generateQRPattern());

  const total = event.price * quantity;
  const maxQty = Math.min(10, event.availableSeats);

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
      onConfirm({
        id: generateCode(),
        eventId: event.id,
        eventTitle: event.title,
        singer: event.singer,
        genre: event.genre,
        emoji: event.emoji,
        date: event.date,
        time: event.time,
        venue: event.venue,
        wilaya: event.wilaya,
        quantity,
        total,
        paymentMethod,
        confirmCode,
        qrPattern,
        bookedAt: new Date().toISOString(),
      });
    }, 1800);
  };

  const formatCardNum = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 16);
    return clean.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    return clean.length > 2 ? clean.slice(0, 2) + '/' + clean.slice(2) : clean;
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
              <div style={{ marginBottom: 16 }}>
                <div className="form-label" style={{ marginBottom: 10 }}>
                  Méthode de paiement
                </div>
                <div className="payment-methods">
                  <div
                    className={`payment-method-card ${paymentMethod === 'cib' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('cib')}
                    role="radio"
                    aria-checked={paymentMethod === 'cib'}
                    id="payment-cib"
                  >
                    <div className="payment-logo cib">CIB</div>
                    <div className="payment-info">
                      <h4>Carte CIB</h4>
                      <p>Carte Interbancaire Algérienne</p>
                    </div>
                    <div className="payment-radio" />
                  </div>
                  <div
                    className={`payment-method-card ${paymentMethod === 'edahabia' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('edahabia')}
                    role="radio"
                    aria-checked={paymentMethod === 'edahabia'}
                    id="payment-edahabia"
                  >
                    <div className="payment-logo edahabia">EDA</div>
                    <div className="payment-info">
                      <h4>Edahabia</h4>
                      <p>Carte Algérie Poste</p>
                    </div>
                    <div className="payment-radio" />
                  </div>
                </div>
              </div>

              {paymentMethod === 'cib' && (
                <div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="card-number">
                      Numéro de carte
                    </label>
                    <div className="card-input-group">
                      <input
                        id="card-number"
                        className="form-input"
                        placeholder="1234 5678 9012 3456"
                        value={cardNum}
                        onChange={(e) => setCardNum(formatCardNum(e.target.value))}
                        maxLength={19}
                        inputMode="numeric"
                      />
                      <span className="card-input-icon">
                        <CreditCard size={16} />
                      </span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="card-name">
                      Nom sur la carte
                    </label>
                    <input
                      id="card-name"
                      className="form-input"
                      placeholder="PRÉNOM NOM"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="card-expiry">
                        Expiration
                      </label>
                      <input
                        id="card-expiry"
                        className="form-input"
                        placeholder="MM/AA"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        maxLength={5}
                        inputMode="numeric"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="card-cvv">
                        CVV
                      </label>
                      <input
                        id="card-cvv"
                        className="form-input"
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        maxLength={3}
                        inputMode="numeric"
                        type="password"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'edahabia' && (
                <div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="edahabia-num">
                      Numéro de compte postal
                    </label>
                    <div className="card-input-group">
                      <input
                        id="edahabia-num"
                        className="form-input"
                        placeholder="00 XXX XXXXX XX"
                        value={edahabiaNum}
                        onChange={(e) => setEdahabiaNum(e.target.value)}
                        inputMode="numeric"
                      />
                      <span className="card-input-icon">
                        <Smartphone size={16} />
                      </span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="edahabia-code">
                      Code secret Edahabia
                    </label>
                    <input
                      id="edahabia-code"
                      className="form-input"
                      placeholder="••••••"
                      type="password"
                      value={edahabiaCode}
                      onChange={(e) => setEdahabiaCode(e.target.value.slice(0, 6))}
                      maxLength={6}
                      inputMode="numeric"
                    />
                  </div>
                </div>
              )}

              <div className="total-price-display" style={{ marginTop: 16 }}>
                <div className="total-price-label">Total à débiter</div>
                <div className="total-price-amount">{total.toLocaleString()} DZD</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  {quantity} billet{quantity > 1 ? 's' : ''} — {event.title}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn-secondary" onClick={() => setStep(1)}>
                  Retour
                </button>
                <button
                  className="btn-primary"
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  id="btn-confirm-payment"
                >
                  {isProcessing ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 16,
                          height: 16,
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: 'white',
                          borderRadius: '50%',
                          animation: 'spin 0.7s linear infinite',
                        }}
                      />
                      Traitement en cours...
                    </span>
                  ) : (
                    '💳 Confirmer le paiement'
                  )}
                </button>
              </div>

              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {step === 3 && (
            <div className="success-screen">
              <div className="success-anim">✅</div>
              <div className="success-title">Réservation Confirmée !</div>
              <div className="success-sub">
                Votre billet pour <strong>{event.title}</strong> est prêt. Présentez ce QR code à l'entrée.
              </div>

              <div className="ticket-card" style={{ width: '100%', marginBottom: 20 }}>
                <div className="ticket-qr">
                  {qrPattern.map((filled, i) => (
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
                    {quantity} place{quantity > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="ticket-detail-row">
                  <span className="ticket-detail-key">Total payé</span>
                  <span className="ticket-detail-value">{total.toLocaleString()} DZD</span>
                </div>
                <div className="ticket-detail-row" style={{ borderBottom: 'none' }}>
                  <span className="ticket-detail-key">Paiement</span>
                  <span className="ticket-detail-value">{paymentMethod === 'cib' ? 'CIB' : 'Edahabia'}</span>
                </div>

                <div className="ticket-code">Code : {confirmCode}</div>
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
