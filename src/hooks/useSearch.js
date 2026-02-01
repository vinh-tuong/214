import { useState, useCallback, useMemo } from 'react';
import { callApi } from '../lib/utils';
import { createRadicalMapping } from '../utils/radicalUtils';

/**
 * Custom hook for managing search functionality
 */
export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState('安');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchModalIndex, setSearchModalIndex] = useState(0);
  const [searchModalImageIndex, setSearchModalImageIndex] = useState(0);
  const [charDefinition, setCharDefinition] = useState(null);
  const [charExamples, setCharExamples] = useState(null);
  const [examplesIndex, setExamplesIndex] = useState(0);
  const [dictionaryResults, setDictionaryResults] = useState(null);
  const [dictionaryIndex, setDictionaryIndex] = useState(0);

  // Create radical mapping once
  const radicalMapping = useMemo(() => createRadicalMapping(), []);

  // Search function for character decomposition
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const characters = [...query.trim()];
      const isMultipleChars = characters.length > 1;
      
      let response;
      if (isMultipleChars) {
        // Use decompose-many for multiple characters
        response = await callApi(`/api/decompose-many?text=${encodeURIComponent(query)}&level=2`);
      } else {
        // Use decompose for single character
        response = await callApi(`/api/decompose?ch=${encodeURIComponent(query)}&level=2`);
      }
      
      const data = await response.json();
      
      if (response.ok) {
        let allComponents = [];
        
        if (isMultipleChars && data.result) {
          // Extract components from all characters
          Object.values(data.result).forEach(components => {
            allComponents.push(...components);
          });
        } else if (!isMultipleChars && data.components) {
          allComponents = data.components;
        }
        
        if (allComponents.length > 0) {
          // Find radicals that match the decomposed components
          const matchingRadicals = allComponents
            .map(component => {
              const radical = radicalMapping.get(component);
              return radical;
            })
            .filter(Boolean) // Remove undefined values
            .filter((radical, index, array) => 
              array.findIndex(r => r.stt === radical.stt) === index
            ); // Remove duplicates
          
          setSearchResults(matchingRadicals);
        } else {
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [radicalMapping]);

  // Fetch character definition
  const fetchCharDefinition = useCallback(async (text) => {
    try {
      const characters = [...text.trim()];
      const isMultipleChars = characters.length > 1;
      
      let response;
      if (isMultipleChars) {
        // Use define-many for multiple characters
        response = await callApi(`/api/define-many?text=${encodeURIComponent(text)}&variant=s`);
      } else {
        // Use define for single character
        response = await callApi(`/api/define?char=${encodeURIComponent(text)}&variant=s`);
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch character definition');
      }
      
      const data = await response.json();
      
      if (isMultipleChars && data.result) {
        // Return object with character as key and definitions as value
        return data.result;
      } else if (!isMultipleChars && data.entries) {
        // Return array of definitions for single character
        return data.entries;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching character definition:', error);
      return [];
    }
  }, []);

  // Fetch character examples
  const fetchCharExamples = useCallback(async (text) => {
    try {
      const characters = [...text.trim()];
      const isMultipleChars = characters.length > 1;
      
      if (isMultipleChars) {
        // For multiple characters, we'll only get examples for the first character
        // to keep it simple and avoid too much data
        const firstChar = characters[0];
        const response = await callApi(`/api/examples?char=${encodeURIComponent(firstChar)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch character examples');
        }
        const data = await response.json();
        return data.examples || [];
      } else {
        // Single character
        const response = await callApi(`/api/examples?char=${encodeURIComponent(text)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch character examples');
        }
        const data = await response.json();
        return data.examples || [];
      }
    } catch (error) {
      console.error('Error fetching character examples:', error);
      return [];
    }
  }, []);

  // Fetch dictionary search results
  const fetchDictionaryResults = useCallback(async (text) => {
    try {
      console.log('🔍 Fetching dictionary results for:', text);
      const response = await callApi(`/api/dictionary-search?text=${encodeURIComponent(text)}&mode=all`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Dictionary API Error:', errorData);
        throw new Error('Failed to fetch dictionary results');
      }
      
      const data = await response.json();
      console.log('✅ Dictionary results:', data);
      return data.results || [];
    } catch (error) {
      console.error('❌ Error fetching dictionary results:', error);
      return [];
    }
  }, []);

  // Manual search function
  const handleManualSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    // Show modal immediately
    setIsSearchModalOpen(true);
    setSearchModalIndex(0);
    setSearchModalImageIndex(0);
    setSearchResults([]); // Clear previous results
    setCharDefinition(null);
    setCharExamples(null);
    setExamplesIndex(0);
    setDictionaryResults(null);
    setDictionaryIndex(0);
    setIsSearching(true);
    
    try {
      // Search for radicals
      await handleSearch(searchQuery);
      
      console.log('🚀 Starting parallel API calls for:', searchQuery);
      // Fetch character definition, examples, and dictionary results in parallel
      const [definition, examples, dictionary] = await Promise.all([
        fetchCharDefinition(searchQuery),
        fetchCharExamples(searchQuery),
        fetchDictionaryResults(searchQuery)
      ]);
      
      console.log('📊 API Results:', { definition, examples, dictionary });
      setCharDefinition(definition);
      setCharExamples(examples);
      setDictionaryResults(dictionary);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, handleSearch, fetchCharDefinition, fetchCharExamples]);

  // Handle character click from carousel
  const handleCharacterClick = useCallback(async (char) => {
    setSearchQuery(char);
    
    // Show modal immediately
    setIsSearchModalOpen(true);
    setSearchModalIndex(0);
    setSearchModalImageIndex(0);
    setSearchResults([]); // Clear previous results
    setCharDefinition(null);
    setCharExamples(null);
    setExamplesIndex(0);
    setDictionaryResults(null);
    setDictionaryIndex(0);
    setIsSearching(true);
    
    try {
      await handleSearch(char);
      console.log('🚀 Starting parallel API calls for character click:', char);
      const [definition, examples, dictionary] = await Promise.all([
        fetchCharDefinition(char),
        fetchCharExamples(char),
        fetchDictionaryResults(char)
      ]);
      console.log('📊 Character click API Results:', { definition, examples, dictionary });
      setCharDefinition(definition);
      setCharExamples(examples);
      setDictionaryResults(dictionary);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [handleSearch, fetchCharDefinition, fetchCharExamples, fetchDictionaryResults]);

  return {
    // State
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    isSearchModalOpen,
    setIsSearchModalOpen,
    searchModalIndex,
    setSearchModalIndex,
    searchModalImageIndex,
    setSearchModalImageIndex,
    charDefinition,
    charExamples,
    examplesIndex,
    setExamplesIndex,
    dictionaryResults,
    dictionaryIndex,
    setDictionaryIndex,
    
    // Actions
    handleManualSearch,
    handleCharacterClick,
    handleSearch,
    fetchCharDefinition,
    fetchCharExamples
  };
};
