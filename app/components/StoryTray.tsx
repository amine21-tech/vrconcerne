'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ArtistStory } from '../types';

interface StoryTrayProps {
  stories: ArtistStory[];
  onSeenStory: (id: string) => void;
}

export default function StoryTray({ stories, onSeenStory }: StoryTrayProps) {
  const [viewingStory, setViewingStory] = useState<ArtistStory | null>(null);

  const handleOpenStory = (story: ArtistStory) => {
    setViewingStory(story);
    onSeenStory(story.id);
    setTimeout(() => setViewingStory(null), 5000);
  };

  return (
    <>
      <div className="stories-container">
        <div className="stories-scroll" role="list" aria-label="Histoires des artistes">
          <div className="story-item" role="listitem">
            <div className="story-ring seen" style={{ background: 'var(--bg-card)', border: '2px dashed var(--border-card)' }}>
              <div className="story-avatar" style={{
                background: 'var(--bg-input)',
                fontSize: 26,
                color: 'var(--text-muted)',
                border: '3px solid var(--bg-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                ＋
              </div>
            </div>
            <span className="story-label" style={{ color: 'var(--text-muted)' }}>Votre story</span>
          </div>

          {stories.map((story) => (
            <div
              key={story.id}
              className="story-item"
              role="listitem"
              onClick={() => handleOpenStory(story)}
              aria-label={`Story de ${story.name}`}
              id={`story-${story.id}`}
            >
              <div className={`story-ring ${story.seen ? 'seen' : ''}`}>
                <div className="story-avatar" style={{
                  background: 'var(--bg-card)',
                  fontSize: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '3px solid var(--bg-primary)'
                }}>
                  {story.emoji}
                </div>
              </div>
              <span className="story-label">{story.name}</span>
            </div>
          ))}
        </div>
      </div>

      {viewingStory && (
        <div className="story-viewer-overlay" onClick={() => setViewingStory(null)}>
          <div className="story-viewer-content" onClick={e => e.stopPropagation()}>
            <div className="story-progress-bars">
              {stories.map((s) => (
                <div key={s.id} className="story-progress-bar">
                  {s.id === viewingStory.id && (
                    <div className="story-progress-fill" key={viewingStory.id} />
                  )}
                  {stories.findIndex(st => st.id === s.id) < stories.findIndex(st => st.id === viewingStory.id) && (
                    <div style={{ width: '100%', height: '100%', background: 'white', borderRadius: 2 }} />
                  )}
                </div>
              ))}
            </div>

            <div className="story-viewer-header">
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22
              }}>
                {viewingStory.emoji}
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{viewingStory.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{viewingStory.genre} · il y a 2h</div>
              </div>
              <button
                className="story-viewer-close"
                onClick={() => setViewingStory(null)}
                aria-label="Fermer la story"
              >
                <X size={24} />
              </button>
            </div>

            <div className="story-viewer-body">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 100, marginBottom: 20 }}>{viewingStory.emoji}</div>
                <div style={{
                  color: 'white', fontSize: 22, fontWeight: 800,
                  textShadow: '0 2px 20px rgba(0,0,0,0.5)'
                }}>
                  {viewingStory.name}
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 8,
                  background: 'rgba(139,92,246,0.3)', padding: '6px 16px',
                  borderRadius: 99, display: 'inline-block', backdropFilter: 'blur(10px)'
                }}>
                  🎵 {viewingStory.genre}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 24 }}>
                  🔥 Nouveau concert annoncé cette semaine !
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
