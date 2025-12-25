'use client';

import { useBookmarks } from '@/hooks/use-bookmarks';
import { useState } from 'react';

interface BookmarkButtonProps {
  skillId: number;
}

export function BookmarkButton({ skillId }: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark, isLoading } = useBookmarks();
  const [localLoading, setLocalLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalLoading(true);
    try {
      await toggleBookmark(skillId);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || localLoading}
      className="absolute bottom-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full shadow transition-all disabled:opacity-50"
    >
      <span className="text-xl">
        {isBookmarked(skillId) ? '❤️' : '🤍'}
      </span>
    </button>
  );
}
