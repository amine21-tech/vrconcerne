'use client';

import React from 'react';
import { EventItem } from '../types';

interface ExplorePageProps {
  events: EventItem[];
  onReserve: (event: EventItem) => void;
}

export default function ExplorePage({ events, onReserve }: ExplorePageProps) {
  return (
    <div>
      <div style={{ padding: '16px 16px 8px' }}>
        <h2 className="section-title">🔍 Galerie d'événements</h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          Découvrez la grille visuelle des festivités en Algérie
        </p>
      </div>

      <div className="explore-grid">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="explore-item"
            style={{ background: ev.bgColor }}
            onClick={() => onReserve(ev)}
            id={`explore-item-${ev.id}`}
          >
            <span>{ev.emoji}</span>
            <div className="explore-item-overlay">
              <div className="explore-item-title">{ev.singer}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
