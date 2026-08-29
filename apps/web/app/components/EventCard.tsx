'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MapPin, Calendar, Users } from 'lucide-react';
import { EventItem } from '../types';
import { formatDateShort } from '../lib/data';

interface EventCardProps {
  event: EventItem;
  liked: boolean;
  bookmarked: boolean;
  onReserve: (event: EventItem) => void;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
  animDelay: number;
}

export default function EventCard({
  event,
  liked,
  bookmarked,
  onReserve,
  onLike,
  onBookmark,
  animDelay,
}: EventCardProps) {
  const [showFullDesc, setShowFullDesc] = useState(false);

  const seatsPercent = (event.availableSeats / event.totalSeats) * 100;
  const seatsClass = event.availableSeats === 0 ? 'full' : seatsPercent < 20 ? 'low' : '';
  const isSoldOut = event.availableSeats === 0;

  return (
    <article
      className="event-card"
      style={{ animationDelay: `${animDelay}ms` }}
      id={`event-card-${event.id}`}
      aria-label={`Événement : ${event.title}`}
    >
      <div className="card-header">
        <div className="singer-avatar-wrap">
          <div
            className="story-avatar"
            style={{
              background: event.bgColor,
              fontSize: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid var(--bg-primary)',
              borderRadius: '50%',
              width: '100%',
              height: '100%',
            }}
          >
            {event.emoji}
          </div>
        </div>
        <div className="singer-info">
          <div className="singer-name">{event.singer}</div>
          <div className="event-meta-line">
            <MapPin size={10} />
            {event.venue}, {event.wilaya}
            <span style={{ margin: '0 4px', opacity: 0.4 }}>·</span>
            <Calendar size={10} />
            {formatDateShort(event.date)}
          </div>
        </div>
        <span className="genre-badge" data-genre={event.genre}>
          {event.genre}
        </span>
      </div>

      <div className="banner-wrapper" onClick={() => onReserve(event)}>
        <div
          className="banner-emoji-bg"
          style={{ background: event.bgColor }}
          role="img"
          aria-label={`Affiche de ${event.title}`}
        >
          <span style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))', fontSize: 72 }}>
            {event.emoji}
          </span>
          <div className="banner-overlay-visible">
            <div className="banner-event-title">{event.title}</div>
            <div className="banner-event-sub">
              <Calendar size={12} />
              {formatDateShort(event.date)} · {event.time}
              <span style={{ margin: '0 4px', opacity: 0.4 }}>·</span>
              <span
                style={{
                  background: 'rgba(139,92,246,0.6)',
                  padding: '2px 8px',
                  borderRadius: 99,
                  backdropFilter: 'blur(4px)',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {event.price.toLocaleString()} DZD
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-actions">
        <button
          className={`action-btn ${liked ? 'liked' : ''}`}
          onClick={() => onLike(event.id)}
          aria-label={liked ? 'Ne plus aimer' : 'Aimer'}
          id={`like-btn-${event.id}`}
        >
          <Heart size={22} fill={liked ? 'currentColor' : 'none'} />
        </button>
        <button className="action-btn" aria-label="Commenter" id={`comment-btn-${event.id}`}>
          <MessageCircle size={22} />
        </button>
        <button className="action-btn" aria-label="Partager" id={`share-btn-${event.id}`}>
          <Send size={22} />
        </button>
        <button
          className={`action-btn action-btn-right ${bookmarked ? 'bookmarked' : ''}`}
          onClick={() => onBookmark(event.id)}
          aria-label={bookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          id={`bookmark-btn-${event.id}`}
        >
          <Bookmark size={22} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="card-info">
        <div className="card-likes">{event.likes.toLocaleString()} personnes aiment ça</div>

        <div className="card-desc">
          <strong>{event.singer}</strong>{' '}
          {showFullDesc
            ? event.description
            : event.description.slice(0, 80) + (event.description.length > 80 ? '...' : '')}
          {event.description.length > 80 && (
            <button
              onClick={() => setShowFullDesc(!showFullDesc)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 13,
                fontFamily: 'inherit',
                padding: 0,
                marginLeft: 4,
              }}
            >
              {showFullDesc ? 'moins' : 'plus'}
            </button>
          )}
        </div>

        <div className="seats-info">
          <Users size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span className={`seats-count ${seatsClass}`}>
            {isSoldOut ? 'COMPLET' : event.availableSeats.toLocaleString()}
          </span>
          <span className="seats-label">
            {isSoldOut ? '— Places épuisées' : `places restantes / ${event.totalSeats.toLocaleString()}`}
          </span>
          <span className="price-tag">{event.price.toLocaleString()} DZD</span>
        </div>

        <div style={{ height: 3, background: 'var(--bg-input)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${seatsPercent}%`,
              background: seatsPercent < 20 ? 'var(--orange)' : 'var(--green)',
              borderRadius: 2,
              transition: 'width 0.5s ease',
            }}
          />
        </div>

        <button
          className="reserve-btn"
          style={{ display: 'block', width: '100%', marginTop: 12 }}
          onClick={() => onReserve(event)}
          disabled={isSoldOut}
          id={`reserve-btn-${event.id}`}
          aria-label={isSoldOut ? 'Événement complet' : `Réserver pour ${event.title}`}
        >
          {isSoldOut ? '❌ Complet' : '🎟️ Réserver ma place'}
        </button>
      </div>
    </article>
  );
}
