'use client';

import React, { useEffect, useState } from 'react';
import { EventItem } from '../types';
import { formatDateShort } from '../lib/data';
import { apiFetch } from '../lib/apiClient';

interface FeaturedRailProps {
  onReserve: (event: EventItem) => void;
}

export default function FeaturedRail({ onReserve }: FeaturedRailProps) {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    apiFetch<{ items: EventItem[] }>('/events', { auth: false, query: { featured: true, limit: 10 } })
      .then((res) => setEvents(res.items))
      .catch(() => {});
  }, []);

  if (events.length === 0) return null;

  return (
    <div>
      <div className="section-header">
        <span className="section-title">🔥 Meilleurs de la semaine</span>
      </div>
      <div className="featured-rail-scroll" role="list" aria-label="Événements en vedette cette semaine">
        {events.map((event) => (
          <div
            key={event.id}
            className="featured-card"
            style={{ background: event.bgColor }}
            role="listitem"
            onClick={() => onReserve(event)}
            id={`featured-card-${event.id}`}
          >
            <span style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.5))' }}>{event.emoji}</span>
            <span className="featured-card-badge">TOP</span>
            <div className="featured-card-overlay">
              <div className="featured-card-title">{event.title}</div>
              <div className="featured-card-meta">
                {event.wilaya} · {formatDateShort(event.date)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
