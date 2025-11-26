import { useState, useEffect } from 'react';
import { SharedContext } from '../types/types';

// API endpoint for shared context
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const SHARED_CONTEXT_PATH = `${API_BASE_URL}/api/context`;

export const useSharedContext = (pollInterval: number = 2000) => {
  const [data, setData] = useState<SharedContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContext = async () => {
    try {
      const response = await fetch(SHARED_CONTEXT_PATH, {
        cache: 'no-cache',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const json = await response.json();
      setData(json as SharedContext);
      setError(null);
    } catch (err) {
      console.error('Error fetching shared context:', err);
      setError(`Could not load shared context. Make sure the API server is running on ${API_BASE_URL}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContext();
    const interval = setInterval(fetchContext, pollInterval);
    return () => clearInterval(interval);
  }, [pollInterval]);

  return { data, loading, error, refetch: fetchContext };
};

