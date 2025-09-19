'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useUser } from './UserContext';

interface CompletionContextType {
  isCompleted: boolean;
  setIsCompleted: (completed: boolean) => void;
  checkCompletion: () => boolean;
}

const CompletionContext = createContext<CompletionContextType | undefined>(undefined);

export function CompletionProvider({ children }: { children: ReactNode }) {
  const [isCompleted, setIsCompleted] = useState(false);
  const { user } = useUser();

  const checkCompletion = useCallback(() => {
    if (!user) return false;
    
    const userStorageKey = `submittedFeedback_${user.email}`;
    const storedSubmissions = JSON.parse(localStorage.getItem(userStorageKey) || '[]');
    const TOTAL_PRODUCTS = 25;
    
    return storedSubmissions.length >= TOTAL_PRODUCTS;
  }, [user]);

  // Check completion status when user changes
  useEffect(() => {
    if (user) {
      // First check localStorage for existing completion state
      const storedCompletion = localStorage.getItem(`completion_${user.email}`);
      const globalCompletion = localStorage.getItem('completion_state');
      
      if (storedCompletion === 'true' || globalCompletion === 'true') {
        setIsCompleted(true);
      } else {
        // Check current feedback count
        const completed = checkCompletion();
        setIsCompleted(completed);
        // Store completion state in localStorage
        localStorage.setItem(`completion_${user.email}`, completed.toString());
      }
    } else {
      setIsCompleted(false);
    }
  }, [user, checkCompletion]);

  // Listen for feedback submission events to update completion status
  useEffect(() => {
    if (!user) return;

    const updateCompletion = () => {
      const completed = checkCompletion();
      setIsCompleted(completed);
      // Store completion state in localStorage
      if (user) {
        localStorage.setItem(`completion_${user.email}`, completed.toString());
      }
    };

    window.addEventListener('feedbackSubmitted', updateCompletion);
    return () => {
      window.removeEventListener('feedbackSubmitted', updateCompletion);
    };
  }, [user, checkCompletion]);

  return (
    <CompletionContext.Provider value={{ isCompleted, setIsCompleted, checkCompletion }}>
      {children}
    </CompletionContext.Provider>
  );
}

export function useCompletion() {
  const context = useContext(CompletionContext);
  if (context === undefined) {
    throw new Error('useCompletion must be used within a CompletionProvider');
  }
  return context;
}
