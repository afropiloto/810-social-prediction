'use client';

import { useState, useEffect } from 'react';

export function useFavourites() {
  const [favourites, setFavourites] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('favourites');
    if (saved) {
      setFavourites(JSON.parse(saved));
    }
  }, []);

  const toggleFavourite = (id: string) => {
    setFavourites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('favourites', JSON.stringify(next));
      return next;
    });
  };

  return { favourites, toggleFavourite };
}
