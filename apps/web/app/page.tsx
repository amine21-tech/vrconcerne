'use client';

import React, { useCallback, useEffect, useState } from 'react';
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
import AuthModal from './components/AuthModal';

import { ARTISTS_STORIES } from './lib/data';
import { apiFetch } from './lib/apiClient';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { EventItem, GenreType, ToastMessage, ArtistStory } from './types';

function HomeApp() {
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('home');

  const [homeEvents, setHomeEvents] = useState<EventItem[]>([]);
  const [exploreEvents, setExploreEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const [selectedGenre, setSelectedGenre] = useState<GenreType>('Tout');
  const [selectedWilaya, setSelectedWilaya] = useState<string>('Toutes les Wilayas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookingEvent, setBookingEvent] = useState<EventItem | null>(null);
  const [showCreateEvent, setShowCreateEvent] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [stories, setStories] = useState<ArtistStory[]>(ARTISTS_STORIES);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [likedEvents, setLikedEvents] = useState<Record<string, boolean>>({});
  const [bookmarkedEvents, setBookmarkedEvents] = useState<Record<string, boolean>>({});
  const [ticketsRefreshKey, setTicketsRefreshKey] = useState(0);
  const [ticketCount, setTicketCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  // Fil "Accueil" : re-interroge l'API a chaque changement de filtre plutot
  // que de filtrer une liste chargee une seule fois en memoire.
  useEffect(() => {
    setEventsLoading(true);
    const handle = setTimeout(() => {
      apiFetch<{ items: EventItem[] }>('/events', {
        auth: false,
        query: {
          genre: selectedGenre === 'Tout' ? undefined : selectedGenre,
          wilaya: selectedWilaya === 'Toutes les Wilayas' ? undefined : selectedWilaya,
          search: searchQuery || undefined,
        },
      })
        .then((res) => setHomeEvents(res.items))
        .catch(() => showToast('Impossible de charger les événements.', 'error'))
        .finally(() => setEventsLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [selectedGenre, selectedWilaya, searchQuery]);

  // Fil "Explorer" : la grille visuelle complete, sans filtre.
  useEffect(() => {
    if (activeTab !== 'explore') return;
    apiFetch<{ items: EventItem[] }>('/events', { auth: false }).then((res) => setExploreEvents(res.items));
  }, [activeTab]);

  // Pastilles de la barre de navigation (nombre de billets, evenements en attente).
  useEffect(() => {
    if (!user) {
      setTicketCount(0);
      setPendingCount(0);
      return;
    }
    apiFetch<{ items: unknown[] }>('/bookings/mine')
      .then((res) => setTicketCount(res.items.length))
      .catch(() => {});
    if (user.role === 'admin') {
      apiFetch<{ pendingEvents: number }>('/admin/stats')
        .then((res) => setPendingCount(res.pendingEvents))
        .catch(() => {});
    }
  }, [user, ticketsRefreshKey]);

  const requireAuth = useCallback(
    (action: () => void) => {
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      action();
    },
    [user],
  );

  const handleReserve = (event: EventItem) => requireAuth(() => setBookingEvent(event));

  const handleBookingConfirm = () => {
    setBookingEvent(null);
    setTicketsRefreshKey((k) => k + 1);
    showToast('🎉 Réservation confirmée ! Bon concert !', 'success');
    setActiveTab('tickets');
  };

  const handleCreateEvent = (newEvent: EventItem) => {
    setShowCreateEvent(false);
    if (newEvent.status === 'published') {
      showToast('✅ Événement créé et publié avec succès !', 'success');
      setHomeEvents((prev) => [newEvent, ...prev]);
    } else {
      showToast('✅ Événement soumis ! En attente de validation admin.', 'success');
    }
  };

  const handleLike = (eventId: string) => {
    requireAuth(() => {
      const isLiked = !likedEvents[eventId];
      setLikedEvents((prev) => ({ ...prev, [eventId]: isLiked }));
      setHomeEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, likes: e.likes + (isLiked ? 1 : -1) } : e)),
      );
      apiFetch(`/events/${eventId}/like`, { method: 'POST', body: { liked: isLiked } }).catch(() => {
        /* l'UI reste optimiste ; un rafraichissement resynchronise en cas d'echec */
      });
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
      if (user?.role === 'admin') {
        setActiveTab('admin');
      } else {
        requireAuth(() => setShowCreateEvent(true));
      }
    } else if (tab === 'tickets' || tab === 'admin') {
      requireAuth(() => setActiveTab(tab));
    } else {
      setActiveTab(tab);
    }
  };

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
              <span className="section-count">
                {eventsLoading ? '...' : `${homeEvents.length} événements`}
              </span>
            </div>
            <Feed
              events={homeEvents}
              likedEvents={likedEvents}
              bookmarkedEvents={bookmarkedEvents}
              onReserve={handleReserve}
              onLike={handleLike}
              onBookmark={handleBookmark}
            />
          </>
        );
      case 'explore':
        return <ExplorePage events={exploreEvents} onReserve={handleReserve} />;
      case 'tickets':
        return user ? <TicketList key={ticketsRefreshKey} /> : null;
      case 'admin':
        return user?.role === 'admin' ? (
          <AdminPanel />
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🔒</div>
            <div className="empty-state-title">Accès Refusé</div>
            <div className="empty-state-text">Cette section est réservée aux administrateurs.</div>
          </div>
        );
      default:
        return null;
    }
  };

  if (authLoading) return null;

  return (
    <div className="app-shell">
      <Header onRequestAuth={() => setShowAuthModal(true)} />
      <main className="main-content" id="main-content">
        {renderContent()}
      </main>
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        role={user?.role ?? 'client'}
        ticketCount={ticketCount}
        pendingCount={pendingCount}
      />

      {showCreateEvent && (
        <CreateEventModal
          onClose={() => setShowCreateEvent(false)}
          onSubmit={handleCreateEvent}
          role={user?.role ?? 'client'}
        />
      )}

      {bookingEvent && (
        <BookingModal
          event={bookingEvent}
          onClose={() => setBookingEvent(null)}
          onConfirm={handleBookingConfirm}
        />
      )}

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={() => setShowAuthModal(false)} />
      )}

      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast key={toast.id} msg={toast.msg} type={toast.type} />
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <HomeApp />
    </AuthProvider>
  );
}
