'use client';

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import StoryTray from './components/StoryTray';
import Filters from './components/Filters';
import Feed from './components/Feed';
import BookingModal from './components/BookingModal';
import CreateEventModal from './components/CreateEventModal';
import TicketList from './components/TicketList';
import AdminPanel from './components/AdminPanel';
import ExplorePage from './components/ExplorePage';
import Toast from './components/Toast';

import { INITIAL_EVENTS, ARTISTS_STORIES } from './lib/data';
import { EventItem, TicketItem, GenreType, RoleType, ToastMessage, ArtistStory } from './types';

const STORAGE_KEY_EVENTS = 'vrconcerne_events';
const STORAGE_KEY_TICKETS = 'vrconcerne_tickets';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [role, setRole] = useState<RoleType>('client');
  
  const [events, setEvents] = useState<EventItem[]>(() => {
    if (typeof window === 'undefined') return INITIAL_EVENTS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EVENTS);
      return saved ? JSON.parse(saved) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });

  const [tickets, setTickets] = useState<TicketItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TICKETS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedGenre, setSelectedGenre] = useState<GenreType>('Tout');
  const [selectedWilaya, setSelectedWilaya] = useState<string>('Toutes les Wilayas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookingEvent, setBookingEvent] = useState<EventItem | null>(null);
  const [showCreateEvent, setShowCreateEvent] = useState<boolean>(false);
  const [stories, setStories] = useState<ArtistStory[]>(ARTISTS_STORIES);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [likedEvents, setLikedEvents] = useState<Record<string, boolean>>({});
  const [bookmarkedEvents, setBookmarkedEvents] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
    }
  }, [events]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets));
    }
  }, [tickets]);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const handleReserve = (event: EventItem) => {
    setBookingEvent(event);
  };

  const handleBookingConfirm = (booking: TicketItem) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === booking.eventId
          ? { ...e, availableSeats: Math.max(0, e.availableSeats - booking.quantity) }
          : e
      )
    );
    setTickets((prev) => [...prev, booking]);
    setBookingEvent(null);
    showToast('🎉 Réservation confirmée ! Bon concert !', 'success');
    setActiveTab('tickets');
  };

  const handleCreateEvent = (newEvent: EventItem) => {
    setEvents((prev) => [...prev, newEvent]);
    setShowCreateEvent(false);
    if (newEvent.status === 'published') {
      showToast('✅ Événement créé et publié avec succès !', 'success');
    } else {
      showToast('✅ Événement soumis ! En attente de validation admin.', 'success');
    }
  };

  const handleAdminApprove = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: 'published' } : e))
    );
    showToast('✅ Événement approuvé & publié sur le fil !', 'success');
  };

  const handleAdminReject = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: 'rejected' } : e))
    );
    showToast('❌ Événement refusé.', 'error');
  };

  const handleLike = (eventId: string) => {
    setLikedEvents((prev) => {
      const isLiked = !prev[eventId];
      setEvents((evs) =>
        evs.map((e) =>
          e.id === eventId ? { ...e, likes: isLiked ? e.likes + 1 : e.likes - 1 } : e
        )
      );
      return { ...prev, [eventId]: isLiked };
    });
  };

  const handleBookmark = (eventId: string) => {
    setBookmarkedEvents((prev) => {
      const isBookmarked = !prev[eventId];
      showToast(isBookmarked ? '⭐ Ajouté aux favoris' : 'Retiré des favoris', 'info');
      return { ...prev, [eventId]: isBookmarked };
    });
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'create') {
      if (role === 'admin') {
        setActiveTab('admin');
      } else {
        setShowCreateEvent(true);
      }
    } else {
      setActiveTab(tab);
    }
  };

  const publishedEvents = events.filter((e) => e.status === 'published');

  const filteredEvents = publishedEvents.filter((e) => {
    const genreMatch = selectedGenre === 'Tout' || e.genre === selectedGenre;
    const wilayaMatch = selectedWilaya === 'Toutes les Wilayas' || e.wilaya === selectedWilaya;
    const searchMatch =
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.singer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.wilaya.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.genre.toLowerCase().includes(searchQuery.toLowerCase());
    return genreMatch && wilayaMatch && searchMatch;
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <StoryTray
              stories={stories}
              onSeenStory={(id) => {
                setStories((prev) => prev.map((s) => (s.id === id ? { ...s, seen: true } : s)));
              }}
            />
            <Filters
              selectedGenre={selectedGenre}
              onGenreChange={setSelectedGenre}
              selectedWilaya={selectedWilaya}
              onWilayaChange={setSelectedWilaya}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            <div className="section-header">
              <span className="section-title">Cette semaine en Algérie</span>
              <span className="section-count">{filteredEvents.length} événements</span>
            </div>
            <Feed
              events={filteredEvents}
              likedEvents={likedEvents}
              bookmarkedEvents={bookmarkedEvents}
              onReserve={handleReserve}
              onLike={handleLike}
              onBookmark={handleBookmark}
            />
          </>
        );
      case 'explore':
        return <ExplorePage events={publishedEvents} onReserve={handleReserve} />;
      case 'tickets':
        return <TicketList tickets={tickets} events={events} />;
      case 'admin':
        return role === 'admin' ? (
          <AdminPanel
            events={events}
            tickets={tickets}
            onApprove={handleAdminApprove}
            onReject={handleAdminReject}
          />
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🔒</div>
            <div className="empty-state-title">Accès Refusé</div>
            <div className="empty-state-text">
              Passez en mode Admin via la barre supérieure pour accéder au panneau de modération.
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-shell">
      <Header role={role} onRoleChange={setRole} ticketCount={tickets.length} />
      <main className="main-content" id="main-content">
        {renderContent()}
      </main>
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        role={role}
        ticketCount={tickets.length}
        pendingCount={events.filter((e) => e.status === 'pending').length}
      />

      {showCreateEvent && (
        <CreateEventModal
          onClose={() => setShowCreateEvent(false)}
          onSubmit={handleCreateEvent}
          role={role}
        />
      )}

      {bookingEvent && (
        <BookingModal
          event={bookingEvent}
          onClose={() => setBookingEvent(null)}
          onConfirm={handleBookingConfirm}
        />
      )}

      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast key={toast.id} msg={toast.msg} type={toast.type} />
        ))}
      </div>
    </div>
  );
}
