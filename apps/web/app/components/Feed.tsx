'use client';

import React from 'react';
import EventCard from './EventCard';
import { EventItem } from '../types';

interface FeedProps {
  events: EventItem[];
  likedEvents: Record<string, boolean>;
  bookmarkedEvents: Record<string, boolean>;
  onReserve: (event: EventItem) => void;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
}

export default function Feed({
  events,
  likedEvents,
  bookmarkedEvents,
  onReserve,
  onLike,
  onBookmark,
}: FeedProps) {
  if (events.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🎵</div>
        <div className="empty-state-title">Aucun événement trouvé</div>
        <div className="empty-state-text">
          Essayez d'autres filtres ou revenez plus tard pour découvrir de nouveaux concerts et festivités !
        </div>
      </div>
    );
  }

  return (
    <div className="feed" role="feed" aria-label="Fil d'événements">
      {events.map((event, index) => (
        <EventCard
          key={event.id}
          event={event}
          liked={!!likedEvents[event.id]}
          bookmarked={!!bookmarkedEvents[event.id]}
          onReserve={onReserve}
          onLike={onLike}
          onBookmark={onBookmark}
          animDelay={index * 50}
        />
      ))}
    </div>
  );
}
