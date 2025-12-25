'use client';

import { useState, useEffect } from 'react';
import { bookmarksAPI } from '@/lib/api';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load bookmarks from backend on mount
  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const response = await bookmarksAPI.list();
        if (response.success && response.data && Array.isArray(response.data)) {
          const skillIds = response.data.map((skill: any) => skill.skill_id || skill.id);
          setBookmarks(skillIds);
        }
      } catch (error) {
        console.error('Error loading bookmarks:', error);
        setBookmarks([]);
      } finally {
        setIsLoaded(true);
      }
    };

    loadBookmarks();
  }, []);

  const addBookmark = async (skillId: number) => {
    if (bookmarks.includes(skillId)) return;
    
    setIsLoading(true);
    try {
      const response = await bookmarksAPI.add(skillId);
      if (response.success) {
        setBookmarks((prev) => [...prev, skillId]);
      }
    } catch (error) {
      console.error('Error adding bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeBookmark = async (skillId: number) => {
    if (!bookmarks.includes(skillId)) return;
    
    setIsLoading(true);
    try {
      const response = await bookmarksAPI.remove(skillId);
      if (response.success) {
        setBookmarks((prev) => prev.filter((id) => id !== skillId));
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookmark = (skillId: number) => {
    if (bookmarks.includes(skillId)) {
      removeBookmark(skillId);
    } else {
      addBookmark(skillId);
    }
  };

  const isBookmarked = (skillId: number) => {
    return bookmarks.includes(skillId);
  };

  const getBookmarkedSkills = (allSkills: any[]) => {
    return allSkills.filter((skill) => bookmarks.includes(skill.id));
  };

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    getBookmarkedSkills,
    isLoaded,
    isLoading,
  };
}
