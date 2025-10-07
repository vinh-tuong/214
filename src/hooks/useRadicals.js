import { useMemo, useState, useCallback } from 'react';
import { ALL_RADICALS, POPULAR_RADICALS_STT } from '../constants/radicals';
import { groupByStroke } from '../utils/radicalUtils';

/**
 * Custom hook for managing radicals data and groups
 */
export const useRadicals = () => {
  const [difficultSet, setDifficultSet] = useState(() => {
    // Load from localStorage on initialization
    const saved = localStorage.getItem('difficultRadicals');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Create groups
  const groups = useMemo(() => groupByStroke(ALL_RADICALS), []);
  
  const popularGroup = useMemo(() => {
    return ALL_RADICALS.filter(item => POPULAR_RADICALS_STT.includes(item.stt));
  }, []);

  const allGroup = useMemo(() => {
    return [...ALL_RADICALS]; // All radicals in original order
  }, []);

  const randomGroup = useMemo(() => {
    const shuffled = [...ALL_RADICALS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const difficultGroup = useMemo(() => {
    return ALL_RADICALS.filter(item => difficultSet.has(item.stt));
  }, [difficultSet]);

  // Toggle difficult status
  const toggleDifficult = useCallback((stt) => {
    const next = new Set(difficultSet);
    if (next.has(stt)) {
      next.delete(stt);
    } else {
      next.add(stt);
    }
    setDifficultSet(next);
    localStorage.setItem('difficultRadicals', JSON.stringify([...next]));
  }, [difficultSet]);

  return {
    groups,
    popularGroup,
    allGroup,
    randomGroup,
    difficultGroup,
    difficultSet,
    toggleDifficult
  };
};
