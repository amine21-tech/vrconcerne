'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { GENRES, WILAYAS } from '../lib/data';
import { GenreType } from '../types';

interface FiltersProps {
  selectedGenre: GenreType;
  onGenreChange: (genre: GenreType) => void;
  selectedWilaya: string;
  onWilayaChange: (wilaya: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  weekendOnly: boolean;
  onWeekendToggle: (value: boolean) => void;
}

export default function Filters({
  selectedGenre,
  onGenreChange,
  selectedWilaya,
  onWilayaChange,
  searchQuery,
  onSearchChange,
  weekendOnly,
  onWeekendToggle,
}: FiltersProps) {
  return (
    <div className="filter-section">
      <div className="search-bar">
        <span className="search-icon" aria-hidden="true">
          <Search size={16} />
        </span>
        <input
          id="search-input"
          className="search-input"
          type="search"
          placeholder="Chercher un artiste, une ville, un style..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Rechercher un événement"
        />
      </div>

      <div className="filter-row">
        <div className="genre-chips" role="group" aria-label="Filtrer par genre">
          <button
            id="genre-weekend"
            className={`genre-chip ${weekendOnly ? 'active' : ''}`}
            onClick={() => onWeekendToggle(!weekendOnly)}
            aria-pressed={weekendOnly}
          >
            🎉 Ce week-end
          </button>
          {GENRES.map((genre) => (
            <button
              key={genre.id}
              id={`genre-${genre.id}`}
              className={`genre-chip ${selectedGenre === genre.id ? 'active' : ''}`}
              data-genre={genre.id}
              onClick={() => onGenreChange(genre.id)}
              aria-pressed={selectedGenre === genre.id}
            >
              {genre.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-row">
        <select
          id="wilaya-select"
          className="wilaya-select"
          value={selectedWilaya}
          onChange={(e) => onWilayaChange(e.target.value)}
          aria-label="Filtrer par wilaya"
        >
          {WILAYAS.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
          {selectedWilaya !== 'Toutes les Wilayas' && `📍 ${selectedWilaya}`}
        </span>
      </div>
    </div>
  );
}
