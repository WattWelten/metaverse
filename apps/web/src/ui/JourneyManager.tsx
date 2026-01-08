import { useState, useEffect, useCallback } from 'react';

export type JourneyState = 'login' | 'prejoin' | 'enter' | 'metaverse' | 'error';

interface JourneyManagerProps {
  initialState?: JourneyState;
  onStateChange?: (state: JourneyState) => void;
}

export function useJourneyManager(initialState: JourneyState = 'login') {
  const [state, setState] = useState<JourneyState>(initialState);
  const [error, setError] = useState<string | null>(null);

  const transition = useCallback((newState: JourneyState, errorMessage?: string) => {
    if (errorMessage) {
      setError(errorMessage);
      setState('error');
    } else {
      setError(null);
      setState(newState);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setState('login');
  }, []);

  const retry = useCallback(() => {
    setError(null);
    // Retry from current state (or go back to login)
    setState('login');
  }, []);

  return {
    state,
    error,
    transition,
    reset,
    retry,
  };
}

export function JourneyManager({ initialState = 'login', onStateChange }: JourneyManagerProps) {
  const journey = useJourneyManager(initialState);

  useEffect(() => {
    onStateChange?.(journey.state);
  }, [journey.state, onStateChange]);

  return null; // This is a hook-based manager, no UI
}

// JourneyState is already exported above
