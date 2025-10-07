import { useState, useCallback } from 'react';
import { callApi } from '../lib/utils';

/**
 * Custom hook for managing characters data and carousel
 */
export const useCharacters = () => {
  const [charactersData, setCharactersData] = useState(new Map()); // Cache for characters
  const [loadingCharacters, setLoadingCharacters] = useState(new Set()); // Track loading states
  const [showCharacters, setShowCharacters] = useState(new Set()); // Track which radicals show characters
  const [errorCharacters, setErrorCharacters] = useState(new Set()); // Track which radicals have errors
  const [charactersIndex, setCharactersIndex] = useState(new Map()); // Track carousel index for each radical

  // Fetch characters for a radical
  const fetchCharactersForRadical = useCallback(async (radical) => {
    const radicalChar = radical.boThu.split(' (')[0]; // Get main radical character
    const cacheKey = radical.stt;
    
    // Check if already cached
    if (charactersData.has(cacheKey)) {
      return charactersData.get(cacheKey);
    }
    
    // Check if already loading
    if (loadingCharacters.has(cacheKey)) {
      return null;
    }
    
    // Check if has error (don't retry automatically)
    if (errorCharacters.has(cacheKey)) {
      return [];
    }
    
    // Mark as loading
    setLoadingCharacters(prev => new Set([...prev, cacheKey]));
    
    try {
      const response = await callApi(`/api/characters-from-component?component=${encodeURIComponent(radicalChar)}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const characters = data.characters || [];
      
      // Cache the result
      setCharactersData(prev => new Map([...prev, [cacheKey, characters]]));
      
      // Remove from error state if it was there
      setErrorCharacters(prev => {
        const newSet = new Set(prev);
        newSet.delete(cacheKey);
        return newSet;
      });
      
      return characters;
    } catch (error) {
      console.error('Error fetching characters for radical:', radical.boThu, error);
      
      // Mark as error to prevent infinite retries
      setErrorCharacters(prev => new Set([...prev, cacheKey]));
      
      return [];
    } finally {
      // Remove from loading
      setLoadingCharacters(prev => {
        const newSet = new Set(prev);
        newSet.delete(cacheKey);
        return newSet;
      });
    }
  }, [charactersData, loadingCharacters, errorCharacters]);

  // Toggle show characters for a radical
  const toggleShowCharacters = useCallback(async (radical) => {
    const cacheKey = radical.stt;
    
    if (showCharacters.has(cacheKey)) {
      // Hide characters
      setShowCharacters(prev => {
        const newSet = new Set(prev);
        newSet.delete(cacheKey);
        return newSet;
      });
    } else {
      // Show characters - fetch if not cached and not in error state
      setShowCharacters(prev => new Set([...prev, cacheKey]));
      
      if (!charactersData.has(cacheKey) && !errorCharacters.has(cacheKey)) {
        await fetchCharactersForRadical(radical);
      }
    }
  }, [showCharacters, charactersData, errorCharacters, fetchCharactersForRadical]);

  return {
    // State
    charactersData,
    loadingCharacters,
    showCharacters,
    errorCharacters,
    charactersIndex,
    setCharactersIndex,
    
    // Actions
    fetchCharactersForRadical,
    toggleShowCharacters
  };
};
