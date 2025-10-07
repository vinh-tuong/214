import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, ChevronLeft, ChevronRight, ChevronsLeft, Volume2, Monitor, ArrowLeft, ArrowRight } from "lucide-react";
import RADICALS from "../radicals";
import { VARIANT_TO_RADICAL } from "../radical-variants";
import { useSpeechSynthesis } from "./hooks/useSpeechSynthesis";
import { useSwipe } from "./hooks/useSwipe";
import FlashcardModal from "./components/FlashcardModal";
import { callApi } from "./lib/utils";

// Utility function to extract all variants from boThu field
const extractRadicalVariants = (boThu) => {
  // Handle cases like "人 (亻)" -> ["人", "亻"] or "齒(齿, 歯 )" -> ["齒", "齿", "歯"]
  const variants = [];
  
  // Extract main radical (before parentheses) - handle both " (..." and "(..." cases
  const mainRadical = boThu.split(/[ (]/)[0];
  variants.push(mainRadical);
  
  // Extract variants in parentheses
  const parenthesesMatch = boThu.match(/\(([^)]+)\)/);
  if (parenthesesMatch) {
    const variantsInParens = parenthesesMatch[1].split(/[,，、]/);
    variants.push(...variantsInParens.map(v => v.trim()));
  }
  
  return variants;
};

// Create a mapping of all radical variants to radical data
const createRadicalMapping = () => {
  const mapping = new Map();
  
  RADICALS.forEach(radical => {
    // Extract variants from boThu field (e.g., "人 (亻)" -> ["人", "亻"])
    const variants = extractRadicalVariants(radical.boThu);
    variants.forEach(variant => {
      mapping.set(variant, radical);
    });
    
    // Also map from VARIANT_TO_RADICAL if the canonical radical matches
    const canonicalRadical = radical.boThu.split(' (')[0]; // Get main radical
    Object.entries(VARIANT_TO_RADICAL).forEach(([variant, canonical]) => {
      if (canonical === canonicalRadical) {
        mapping.set(variant, radical);
      }
    });
  });
  
  return mapping;
};

/**
 * Flashcards for 214 Chinese Radicals grouped by stroke count
 * -----------------------------------------------------------
 * Dataset schema per item:
 * { stt: number, boThu: string, tenBoThu: string, phienAm: string, yNghia: string, soNet: number, hinhAnh: string[] }
 *
 * Data sources:
 * - Text and meanings: 214 bộ thủ tiếng Trung – ThanhMaiHSK
 *   https://thanhmaihsk.edu.vn/214-bo-thu-tieng-trung-thong-dung-y-nghia-va-cach-hoc-de-nho/
 * - Images: Radical Images — Pichinese
 */

function groupByStroke(data) {
  return data.reduce((acc, item) => {
    const k = item.soNet;
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

const Slide = ({ item, index, total, difficult, onToggleDiff }) => {
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl rounded-2xl">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="text-gray-500">{index + 1} / {total}</div>
          <label className="flex items-center gap-2 text-sm text-gray-500 select-none">
            <span>difficult?</span>
            <input type="checkbox" checked={difficult} onChange={onToggleDiff} />
          </label>
        </div>

        <div className="mt-6">
          <div className="text-emerald-700 text-4xl font-bold">{item.boThu}</div>
          <div className="italic text-xl mt-2 text-gray-700">{item.tenBoThu} · {item.phienAm}</div>
          <div className="mt-6 text-lg">{item.yNghia}</div>
        </div>

        <div className="mt-8 flex gap-3 justify-center">
          <SmallButton icon={<Play size={18} />} text="Play" onClick={() => {}} disabled />
          <SmallButton icon={<ChevronsLeft size={18} />} text="First" onClick={() => {}} disabled />
          <SmallButton icon={<ChevronLeft size={18} />} text="Prev" onClick={() => {}} disabled />
          <SmallButton icon={<ChevronRight size={18} />} text="Next" onClick={() => {}} disabled />
        </div>
      </CardContent>
    </Card>
  );
};

const SmallButton = ({ icon, text, onClick, disabled=false }) => (
  <Button variant="outline" className="rounded-2xl px-3 sm:px-5 text-sm" onClick={onClick} disabled={disabled}>
    <span className="flex items-center gap-1 sm:gap-2">{icon}<span className="hidden sm:inline">{text}</span></span>
  </Button>
);

const ImageCarousel = ({ images, currentIndex, onImageChange }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState(new Set());

  // Preload next and previous images
  useEffect(() => {
    if (!images || images.length === 0) return;

    const preloadImage = (src) => {
      if (preloadedImages.has(src)) return;
      
      const img = new Image();
      img.onload = () => {
        setPreloadedImages(prev => new Set([...prev, src]));
      };
      img.src = `/images/${src}`;
    };

    // Preload current, next, and previous images
    const currentImage = images[currentIndex];
    const nextIndex = (currentIndex + 1) % images.length;
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    
    preloadImage(currentImage);
    if (images.length > 1) {
      preloadImage(images[nextIndex]);
      preloadImage(images[prevIndex]);
    }
  }, [images, currentIndex, preloadedImages]);

  // Reset loading state when image changes
  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  if (!images || images.length === 0) {
    return (
      <div className="w-48 h-48 sm:w-56 sm:h-56 bg-gray-100 rounded-xl flex items-center justify-center">
        <span className="text-gray-400 text-lg">No Image</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="w-48 h-48 sm:w-56 sm:h-56 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden relative">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <img 
          src={`/images/${images[0]}`} 
          alt={`Bộ thủ hình ảnh`}
          className={`w-full h-full object-contain transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg" style={{display: 'none'}}>
          No Image
        </div>
      </div>
    );
  }

  const goToPrevImage = () => {
    onImageChange((currentIndex - 1 + images.length) % images.length);
  };

  const goToNextImage = () => {
    onImageChange((currentIndex + 1) % images.length);
  };

  return (
    <div className="relative w-48 h-48 sm:w-56 sm:h-56 bg-gray-100 rounded-xl overflow-hidden">
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img 
        src={`/images/${images[currentIndex]}`} 
        alt={`Bộ thủ hình ảnh ${currentIndex + 1}`}
        className={`w-full h-full object-contain transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setImageLoaded(true)}
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg" style={{display: 'none'}}>
        No Image
      </div>
      
      {/* Navigation buttons */}
      <div className="absolute inset-0 flex items-center justify-between opacity-0 hover:opacity-100 transition-opacity">
        <button
          onClick={goToPrevImage}
          className="w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <button
          onClick={goToNextImage}
          className="w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <ArrowRight size={16} />
        </button>
      </div>
      
      {/* Image counter */}
      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

// Search Image Carousel Component
const SearchImageCarousel = ({ images, currentIndex, onImageChange, alt }) => {
  if (!images || images.length === 0) return null;
  
  if (images.length === 1) {
    return (
      <div className="flex justify-center">
        <img
          src={`/images/${images[0]}`}
          alt={alt}
          className="w-48 h-48 object-contain rounded-lg border"
        />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center gap-4">
      <Button
        onClick={() => onImageChange((currentIndex - 1 + images.length) % images.length)}
        variant="outline"
        size="sm"
        className="rounded-full"
      >
        <ArrowLeft size={16} />
      </Button>
      
      <div className="relative">
        <img
          src={`/images/${images[currentIndex]}`}
          alt={alt}
          className="w-48 h-48 object-contain rounded-lg border"
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {currentIndex + 1}/{images.length}
        </div>
      </div>
      
      <Button
        onClick={() => onImageChange((currentIndex + 1) % images.length)}
        variant="outline"
        size="sm"
        className="rounded-full"
      >
        <ArrowRight size={16} />
      </Button>
    </div>
  );
};

export default function App() {
  const [allData] = useState(RADICALS);
  const [stroke, setStroke] = useState('popular');
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState('next'); // 'next' or 'prev'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchModalIndex, setSearchModalIndex] = useState(0);
  const [searchModalImageIndex, setSearchModalImageIndex] = useState(0);
  const [charDefinition, setCharDefinition] = useState(null);
  const [charExamples, setCharExamples] = useState(null);
  const [examplesIndex, setExamplesIndex] = useState(0);
  
  // Characters data state
  const [charactersData, setCharactersData] = useState(new Map()); // Cache for characters
  const [loadingCharacters, setLoadingCharacters] = useState(new Set()); // Track loading states
  const [showCharacters, setShowCharacters] = useState(new Set()); // Track which radicals show characters
  const [errorCharacters, setErrorCharacters] = useState(new Set()); // Track which radicals have errors
  const [charactersIndex, setCharactersIndex] = useState(new Map()); // Track carousel index for each radical
  
  const [difficultSet, setDifficultSet] = useState(() => {
    // Load from localStorage on initialization
    const saved = localStorage.getItem('difficultRadicals');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const timer = useRef(null);
  
  // Speech synthesis hook
  const { isSupported, isSpeaking, speak } = useSpeechSynthesis();

  const groups = useMemo(() => groupByStroke(allData), [allData]);
  
  // Create difficult group
  const difficultGroup = useMemo(() => {
    return allData.filter(item => difficultSet.has(item.stt));
  }, [allData, difficultSet]);

  // ExamplesCarousel component
  const ExamplesCarousel = ({ examples, currentIndex, onIndexChange }) => {
    // Flatten all examples from all groups
    const allExamples = examples.flat();
    
    if (allExamples.length === 0) return null;
    
    const currentExample = allExamples[currentIndex];
    
    return (
      <div className="flex items-center gap-3">
        {/* Left arrow */}
        <Button
          onClick={() => onIndexChange((currentIndex - 1 + allExamples.length) % allExamples.length)}
          variant="outline"
          size="sm"
          className="rounded-full flex-shrink-0"
          disabled={allExamples.length <= 1}
        >
          <ChevronLeft size={16} />
        </Button>
        
        {/* Example content */}
        <div className="flex-1 text-center min-w-0">
          <div className="text-green-800 font-medium mb-1">
            {currentExample.traditional} {currentExample.simplified !== currentExample.traditional && `(${currentExample.simplified})`}
          </div>
          <div className="text-green-700 text-xs mb-1">
            {currentExample.pinyin}
          </div>
          <div className="text-green-600 text-xs">
            {currentExample.definition}
          </div>
        </div>
        
        {/* Right arrow */}
        <Button
          onClick={() => onIndexChange((currentIndex + 1) % allExamples.length)}
          variant="outline"
          size="sm"
          className="rounded-full flex-shrink-0"
          disabled={allExamples.length <= 1}
        >
          <ChevronRight size={16} />
        </Button>
        
        {/* Counter */}
        {allExamples.length > 1 && (
          <div className="text-xs text-green-600 flex-shrink-0">
            {currentIndex + 1}/{allExamples.length}
          </div>
        )}
      </div>
    );
  };

  // CharactersCarousel component
  const CharactersCarousel = ({ characters, radicalStt, onCharacterClick }) => {
    const currentIndex = charactersIndex.get(radicalStt) || 0;
    const charactersPerPage = 8; // Number of characters to show at once
    const totalPages = Math.ceil(characters.length / charactersPerPage);
    
    const startIndex = currentIndex * charactersPerPage;
    const endIndex = Math.min(startIndex + charactersPerPage, characters.length);
    const visibleCharacters = characters.slice(startIndex, endIndex);
    
    const handlePrev = () => {
      const newIndex = (currentIndex - 1 + totalPages) % totalPages;
      setCharactersIndex(prev => new Map([...prev, [radicalStt, newIndex]]));
    };
    
    const handleNext = () => {
      const newIndex = (currentIndex + 1) % totalPages;
      setCharactersIndex(prev => new Map([...prev, [radicalStt, newIndex]]));
    };
    
    return (
      <div className="flex items-center gap-2">
        {/* Left arrow */}
        <Button
          onClick={handlePrev}
          variant="outline"
          size="sm"
          className="rounded-full flex-shrink-0"
          disabled={totalPages <= 1}
        >
          <ChevronLeft size={16} />
        </Button>
        
        {/* Characters display */}
        <div className="flex-1 flex flex-wrap gap-1 justify-center min-w-0">
          {visibleCharacters.map((char, index) => (
            <span
              key={startIndex + index}
              className="inline-block px-2 py-1 bg-white border border-gray-200 rounded text-sm hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors flex-shrink-0"
              title={`Click to search for "${char}"`}
              onClick={() => onCharacterClick(char)}
            >
              {char}
            </span>
          ))}
        </div>
        
        {/* Right arrow */}
        <Button
          onClick={handleNext}
          variant="outline"
          size="sm"
          className="rounded-full flex-shrink-0"
          disabled={totalPages <= 1}
        >
          <ChevronRight size={16} />
        </Button>
        
        {/* Counter */}
        {totalPages > 1 && (
          <div className="text-xs text-gray-500 flex-shrink-0">
            {currentIndex + 1}/{totalPages}
          </div>
        )}
      </div>
    );
  };

  // Create popular group with 50 most common radicals
  const popularGroup = useMemo(() => {
    const popularStt = [
      9, 18, 19, 30, 31, 32, 37, 38, 40, 46, 50, 53, 60, 61, 64, 66, 72, 75, 85, 86,
      93, 94, 96, 102, 104, 109, 112, 115, 118, 119, 120, 130, 140, 142, 145, 149,
      154, 157, 159, 162, 163, 167, 169, 170, 173, 181, 184, 187, 195, 196
    ];
    return allData.filter(item => popularStt.includes(item.stt));
  }, [allData]);

  // Create all group with all 214 radicals
  const allGroup = useMemo(() => {
    return [...allData]; // All radicals in original order
  }, [allData]);

  // Create random group with all radicals shuffled
  const randomGroup = useMemo(() => {
    const shuffled = [...allData];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [allData, stroke]); // Re-shuffle when stroke changes to 'random'
  
  // Determine current group based on stroke value
  const currentGroup = stroke === 'difficult' ? difficultGroup : 
                      stroke === 'popular' ? popularGroup : 
                      stroke === 'all' ? allGroup :
                      stroke === 'random' ? randomGroup :
                      (groups[stroke] ?? []);
  const total = currentGroup.length;
  const cur = currentGroup[idx] ?? null;
  const isDiff = cur ? difficultSet.has(cur.stt) : false;

  // autoplay every 3s
  useEffect(() => {
    if (!playing || total === 0) return;
    timer.current && clearInterval(timer.current);
    timer.current = setInterval(() => {
      setSlideDirection('next');
      setIdx((i) => (i + 1) % total);
    }, 3000);
    return () => timer.current && clearInterval(timer.current);
  }, [playing, total]);

  // reset index when group changes
  useEffect(() => { 
    setIdx(0); 
    setCurrentImageIndex(0);
  }, [stroke]);

  // reset image index when radical changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [idx, stroke]);

  // Reset image index when changing radicals in search modal
  useEffect(() => {
    setSearchModalImageIndex(0);
  }, [searchModalIndex]);

  const goFirst = () => {
    setSlideDirection('prev');
    setIdx(0);
  };
  const goPrev = () => {
    setSlideDirection('prev');
    setIdx((i) => (i - 1 + total) % total);
  };
  const goNext = () => {
    setSlideDirection('next');
    setIdx((i) => (i + 1) % total);
  };

  // Swipe gestures
  const swipeHandlers = useSwipe(goNext, goPrev);

  const toggleDiff = () => {
    if (!cur) return;
    const next = new Set(difficultSet);
    if (next.has(cur.stt)) {
      next.delete(cur.stt);
    } else {
      next.add(cur.stt);
    }
    setDifficultSet(next);
    // Save to localStorage
    localStorage.setItem('difficultRadicals', JSON.stringify([...next]));
  };

  const speakRadical = () => {
    if (!cur || !isSupported) return;
    
    // Speak the Chinese character (boThu) instead of pinyin
    const textToSpeak = cur.boThu;
    
    speak(textToSpeak, {
      rate: 0.9,  // Slightly slower for better pronunciation
      pitch: 1.0,
      volume: 1.0,
      lang: 'zh-CN'
    });
  };

  // Helper function to get radical by STT
  const getRadicalByStt = (stt) => {
    return allData.find(item => item.stt === stt);
  };

  // Create radical mapping once
  const radicalMapping = useMemo(() => {
    const mapping = createRadicalMapping();
    // Debug: check if "齒" is in mapping
    console.log('齒 in mapping:', mapping.has('齒'));
    console.log('齒 mapping value:', mapping.get('齒'));
    console.log('extractRadicalVariants("齒(齿, 歯 )"):', extractRadicalVariants("齒(齿, 歯 )"));
    console.log('extractRadicalVariants("齊 (斉 , 齐)"):', extractRadicalVariants("齊 (斉 , 齐)"));
    return mapping;
  }, []);

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
          // Debug: log components
          console.log('API components:', allComponents);
          
          // Find radicals that match the decomposed components
          const matchingRadicals = allComponents
            .map(component => {
              const radical = radicalMapping.get(component);
              console.log(`Component "${component}" -> radical:`, radical);
              return radical;
            })
            .filter(Boolean) // Remove undefined values
            .filter((radical, index, array) => 
              array.findIndex(r => r.stt === radical.stt) === index
            ); // Remove duplicates
          
          console.log('Final matching radicals:', matchingRadicals);
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
    setIsSearching(true);
    
    try {
      // Search for radicals
      await handleSearch(searchQuery);
      
      // Fetch character definition and examples in parallel
      const [definition, examples] = await Promise.all([
        fetchCharDefinition(searchQuery),
        fetchCharExamples(searchQuery)
      ]);
      
      setCharDefinition(definition);
      setCharExamples(examples);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, handleSearch, fetchCharDefinition, fetchCharExamples]);

  // Helper function to format ghepTu information
  const formatGhepTu = (ghepTu) => {
    if (!ghepTu || ghepTu.length === 0) return null;
    
    const components = ghepTu.map(stt => {
      const radical = getRadicalByStt(stt);
      return radical ? `${radical.boThu} (${radical.tenBoThu})` : `STT ${stt}`;
    });
    
    return `Ghép từ: ${components.join(' và ')}`;
  };

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
    setIsSearching(true);
    
    try {
      await handleSearch(char);
      const [definition, examples] = await Promise.all([
        fetchCharDefinition(char),
        fetchCharExamples(char)
      ]);
      setCharDefinition(definition);
      setCharExamples(examples);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [handleSearch, fetchCharDefinition, fetchCharExamples]);

  // Reset examples index when examples change
  useEffect(() => {
    setExamplesIndex(0);
  }, [charExamples]);

  const slideRef = useRef(null);

  // smooth slide animation with direction
  useEffect(() => {
    if (!slideRef.current) return;
    
    // Determine animation direction
    const isNextSlide = slideDirection === 'next';
    
    slideRef.current.animate([
      { transform: isNextSlide ? 'translateX(120px)' : 'translateX(-120px)', opacity: 0.7 },
      { transform: 'translateX(0px)', opacity: 1 }
    ], { duration: 300, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' });
  }, [idx, stroke, slideDirection]);


  const strokesAvailable = useMemo(() => Object.keys(groups).map(Number).sort((a,b)=>a-b), [groups]);

  return (
    <div className="min-h-screen bg-amber-50 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Flashcards 214 Bộ thủ – nhóm theo số nét</h1>
          
          {/* Search Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Tìm kiếm hán tự..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleManualSearch();
                }
              }}
            />
            <Button
              onClick={handleManualSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Đang tìm...' : 'Tìm kiếm'}
            </Button>
          </div>
        </header>

        <section className="mt-4 grid md:grid-cols-[260px_1fr] gap-6">
          <aside className="space-y-4">
            <div className="p-4 sm:p-6 bg-white rounded-2xl shadow">
              <div className="text-sm text-gray-600 mb-2">Nhóm theo số nét</div>
              <div className="flex flex-wrap gap-2 max-w-full overflow-hidden">
                {/* Difficult group button */}
                <Button
                  key="popular"
                  variant={stroke==="popular"?"default":"outline"}
                  className={`rounded-full h-9 text-xs sm:text-sm whitespace-nowrap ${
                    stroke === "popular"
                      ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                      : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  }`}
                  onClick={()=>setStroke("popular")}
                >
                  🔥 Popular ({popularGroup.length})
                </Button>
                <Button
                  key="difficult"
                  variant={stroke==="difficult"?"default":"outline"}
                  className={`rounded-full h-9 text-xs sm:text-sm whitespace-nowrap ${
                    stroke === "difficult"
                      ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                      : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  }`}
                  onClick={()=>setStroke("difficult")}
                >
                  ⭐ Difficult ({difficultGroup.length})
                </Button>
                
                {/* Stroke count buttons */}
                {strokesAvailable.map((n) => (
                  <Button 
                    key={n} 
                    variant={stroke===n?"default":"outline"} 
                    className={`rounded-full h-9 text-xs sm:text-sm whitespace-nowrap ${
                      stroke === n 
                        ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600" 
                        : "hover:bg-gray-50"
                    }`} 
                    onClick={()=>setStroke(n)}
                  >
                    {n} nét ({groups[n].length})
                  </Button>
                ))}
                
                {/* Additional group buttons */}
                <Button
                  key="all"
                  variant={stroke==="all"?"default":"outline"}
                  className={`rounded-full h-9 text-xs sm:text-sm whitespace-nowrap ${
                    stroke === "all"
                      ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                      : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  }`}
                  onClick={()=>setStroke("all")}
                >
                  📚 Tất cả ({allGroup.length})
                </Button>
                <Button
                  key="random"
                  variant={stroke==="random"?"default":"outline"}
                  className={`rounded-full h-9 text-xs sm:text-sm whitespace-nowrap ${
                    stroke === "random"
                      ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                      : "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                  }`}
                  onClick={()=>setStroke("random")}
                >
                  🎲 Ngẫu nhiên ({randomGroup.length})
                </Button>
              </div>
            </div>
          </aside>

          <main>
            {cur ? (
              <Card 
                className="w-full max-w-2xl mx-auto shadow-xl rounded-2xl touch-pan-y"
                {...swipeHandlers}
              >
                <CardContent className="p-6">
                  <div ref={slideRef}>
                    <div className="flex justify-between items-start">
                      <div className="text-gray-500">{idx + 1} / {total}</div>
                      <label className="flex items-center gap-2 text-sm text-gray-500 select-none">
                        <span>difficult?</span>
                        <input type="checkbox" checked={isDiff} onChange={toggleDiff} />
                      </label>
                    </div>

                     <div className="mt-6">
                       {/* Image as center focus */}
                       <div className="flex justify-center mb-6">
                         <ImageCarousel 
                           images={cur.hinhAnh}
                           currentIndex={currentImageIndex}
                           onImageChange={setCurrentImageIndex}
                         />
                       </div>
                       
                       {/* Radical character */}
                       <div className="text-center mb-4">
                         <div className="text-emerald-700 text-6xl font-bold">{cur.boThu}</div>
                       </div>
                       
                       {/* Supporting information */}
                       <div className="text-center">
                         <div className="italic text-xl mb-4 text-gray-700">{cur.tenBoThu} • {cur.phienAm}</div>
                         <div className="text-lg text-gray-600">{cur.yNghia}</div>
                         {formatGhepTu(cur.ghepTu) && (
                           <div className="mt-4 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg inline-block">
                             {formatGhepTu(cur.ghepTu)}
                           </div>
                         )}
                       </div>

                       {/* Characters section */}
                       <div className="mt-6">
                         <Button
                           variant="outline"
                           className="rounded-full text-sm bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                           onClick={() => toggleShowCharacters(cur)}
                           disabled={loadingCharacters.has(cur.stt)}
                         >
                           <span className="flex items-center gap-1 sm:gap-2">
                             {loadingCharacters.has(cur.stt) ? (
                               <>
                                 <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                 <span className="hidden sm:inline">Loading...</span>
                               </>
                             ) : showCharacters.has(cur.stt) ? (
                               <>
                                 <span>📖</span>
                                 <span className="hidden sm:inline">Hide Characters</span>
                               </>
                             ) : (
                               <>
                                 <span>📚</span>
                                 <span className="hidden sm:inline">Show Characters</span>
                               </>
                             )}
                           </span>
                         </Button>

                         {showCharacters.has(cur.stt) && (
                           <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                             <div className="text-sm font-semibold text-gray-700 mb-3">
                               Hán tự chứa bộ thủ "{cur.boThu}":
                             </div>
                             {charactersData.has(cur.stt) ? (
                               <CharactersCarousel
                                 characters={charactersData.get(cur.stt)}
                                 radicalStt={cur.stt}
                                 onCharacterClick={handleCharacterClick}
                               />
                             ) : errorCharacters.has(cur.stt) ? (
                               <div className="text-sm text-red-500 flex items-center gap-2">
                                 <span>❌ Không thể tải danh sách hán tự</span>
                                 <button
                                   onClick={() => {
                                     // Clear error state and retry
                                     setErrorCharacters(prev => {
                                       const newSet = new Set(prev);
                                       newSet.delete(cur.stt);
                                       return newSet;
                                     });
                                     fetchCharactersForRadical(cur);
                                   }}
                                   className="text-blue-600 hover:text-blue-800 underline text-xs"
                                 >
                                   Thử lại
                                 </button>
                               </div>
                             ) : (
                               <div className="text-sm text-gray-500">
                                 Loading characters...
                               </div>
                             )}
                           </div>
                         )}
                       </div>
                     </div>

                    <div className="mt-8 flex flex-wrap gap-2 sm:gap-3 justify-center">
                      <Button variant={playing?"destructive":"default"} className="rounded-2xl text-sm" onClick={() => {
                        setSlideDirection('next');
                        setPlaying(p=>!p);
                      }}>
                        {playing ? (<span className="flex items-center gap-1 sm:gap-2"><Square size={16}/><span className="hidden sm:inline">Stop</span></span>) : (<span className="flex items-center gap-1 sm:gap-2"><Play size={16}/><span className="hidden sm:inline">Play</span></span>)}
                      </Button>
                      
                      {/* Slideshow button */}
                      <Button 
                        variant="outline" 
                        className="rounded-2xl bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 text-sm" 
                        onClick={() => setIsModalOpen(true)}
                      >
                        <span className="flex items-center gap-1 sm:gap-2">
                          <Monitor size={16}/>
                          <span className="hidden sm:inline">Slideshow</span>
                        </span>
                      </Button>
                      
                      {/* Audio button */}
                      {isSupported && (
                        <Button 
                          variant="outline" 
                          className="rounded-2xl text-sm" 
                          onClick={speakRadical}
                          disabled={isSpeaking}
                        >
                          <span className="flex items-center gap-1 sm:gap-2">
                            <Volume2 size={16}/>
                            <span className="hidden sm:inline">Audio</span>
                          </span>
                        </Button>
                      )}
                      
                      <SmallButton icon={<ChevronsLeft size={16}/>} text="First" onClick={goFirst} />
                      <SmallButton icon={<ChevronLeft size={16}/>} text="Prev" onClick={goPrev} />
                      <SmallButton icon={<ChevronRight size={16}/>} text="Next" onClick={goNext} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center text-gray-500">
                {stroke === 'difficult'
                  ? 'Chưa có bộ thủ nào được đánh dấu difficult.'
                  : stroke === 'popular'
                  ? 'Nhóm Popular chứa 50 bộ thủ phổ biến nhất.'
                  : stroke === 'all'
                  ? 'Nhóm Tất cả chứa đầy đủ 214 bộ thủ theo thứ tự.'
                  : stroke === 'random'
                  ? 'Nhóm Ngẫu nhiên chứa đầy đủ 214 bộ thủ được xáo trộn.'
                  : `Không có dữ liệu cho nhóm ${stroke} nét.`
                }
              </div>
            )}
          </main>
        </section>

        {/* Information Section */}
        <div className="mt-8 p-4 bg-white rounded-2xl shadow text-sm text-gray-600 leading-relaxed">
          <div className="space-y-3">
            <p><strong>Nút Play</strong> sẽ tự động chuyển thẻ mỗi 3s. Bạn có thể đánh dấu "difficult?" để ôn tập.</p>
            <p><strong>Nút Audio</strong> sẽ đọc bộ thủ bằng tiếng Trung (hỗ trợ trình duyệt hiện đại).</p>
            <p><strong>Popular:</strong> 50 bộ thủ phổ biến nhất trong tiếng Trung.</p>
            <p><strong>Tất cả:</strong> Đầy đủ 214 bộ thủ theo thứ tự từ 1 đến 17 nét.</p>
            <p><strong>Ngẫu nhiên:</strong> Đầy đủ 214 bộ thủ được xáo trộn ngẫu nhiên.</p>
            <p><strong>Difficult:</strong> Nhóm bộ thủ bạn đánh dấu khó để ôn tập.</p>
            <p className="text-xs text-gray-500 mt-4">
              <strong>Nguồn dữ liệu:</strong> từ và nghĩa được lấy từ 214 bộ thủ tiếng Trung – ThanhMaiHSK. Hình ảnh được lấy từ Radical Images — Pichinese.
            </p>
          </div>
        </div>

        <footer className="mt-8 text-xs text-gray-500">
          <p>© 2025 – Flashcards Bộ thủ. Tự động chạy: 3 giây / thẻ. Hiệu ứng trượt trái → phải.</p>
          <p className="mt-1">💡 Trên mobile: Vuốt trái/phải trên thẻ để chuyển slide.</p>
          <p className="mt-8 text-center text-gray-400">From Munich with love ❤️</p>
        </footer>
      </div>

      {/* Search Results Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b flex-shrink-0">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">
                  Kết quả tìm kiếm cho "{searchQuery}"
                </h2>
                {isSearching ? (
                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Đang tìm kiếm...
                  </p>
                ) : searchResults.length > 0 ? (
                  <p className="text-gray-600 mt-1">
                    Tìm thấy {searchResults.length} bộ thủ
                  </p>
                ) : (
                  <p className="text-gray-600 mt-1">
                    Không có kết quả tìm kiếm cho "{searchQuery}"
                  </p>
                )}
              </div>
              <Button
                onClick={() => setIsSearchModalOpen(false)}
                variant="outline"
                className="rounded-full ml-2 flex-shrink-0"
              >
                ✕
              </Button>
            </div>

            {/* Character Definition */}
            {charDefinition && (
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-blue-50 border-b flex-shrink-0">
                <div className="text-sm">
                  <div className="font-semibold text-blue-800 mb-2">
                    Định nghĩa của "{searchQuery}":
                  </div>
                  {Array.isArray(charDefinition) ? (
                    // Single character - array of definitions
                    <div className="space-y-1">
                      {charDefinition.map((entry, index) => (
                        <div key={index} className="text-blue-700">
                          <span className="font-medium">{entry.pinyin}</span>
                          <span className="mx-2">•</span>
                          <span>{entry.definition}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Multiple characters - object with character as key
                    <div className="space-y-3">
                      {Object.entries(charDefinition).map(([char, definitions]) => (
                        <div key={char} className="border-l-2 border-blue-300 pl-3">
                          <div className="font-semibold text-blue-900 mb-1">
                            {char}:
                          </div>
                          <div className="space-y-1">
                            {definitions.map((entry, index) => (
                              <div key={index} className="text-blue-700">
                                <span className="font-medium">{entry.pinyin}</span>
                                <span className="mx-2">•</span>
                                <span>{entry.definition}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Character Examples */}
            {charExamples && charExamples.length > 0 && (
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-green-50 border-b flex-shrink-0">
                <div className="text-sm">
                  <div className="font-semibold text-green-800 mb-3">
                    Ví dụ từ vựng chứa "{searchQuery}":
                  </div>
                  <ExamplesCarousel 
                    examples={charExamples}
                    currentIndex={examplesIndex}
                    onIndexChange={setExamplesIndex}
                  />
                </div>
              </div>
            )}

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {isSearching ? (
                // Loading state
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tìm kiếm bộ thủ...</p>
                  </div>
                </div>
              ) : searchResults.length === 0 ? (
                // No results state
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-gray-600 text-lg mb-2">
                      Không tìm thấy bộ thủ nào cho "{searchQuery}"
                    </p>
                    <p className="text-gray-500 text-sm">
                      Thử tìm kiếm với ký tự khác hoặc kiểm tra chính tả
                    </p>
                  </div>
                </div>
              ) : searchResults.length === 1 ? (
                // Single result - show full details
                <div className="text-center">
                  <div className="text-4xl sm:text-6xl font-bold text-emerald-700 mb-4">
                    {searchResults[0].boThu}
                  </div>
                  <div className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
                    {searchResults[0].tenBoThu}
                  </div>
                  <div className="text-lg sm:text-xl text-gray-600 mb-4">
                    {searchResults[0].phienAm}
                  </div>
                  <div className="text-base sm:text-lg text-gray-700 mb-6">
                    {searchResults[0].yNghia}
                  </div>
                  {searchResults[0].hinhAnh && searchResults[0].hinhAnh.length > 0 && (
                    <SearchImageCarousel
                      images={searchResults[0].hinhAnh}
                      currentIndex={searchModalImageIndex}
                      onImageChange={setSearchModalImageIndex}
                      alt={searchResults[0].tenBoThu}
                    />
                  )}
                </div>
              ) : (
                // Multiple results - show slider
                <div className="space-y-6">
                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={() => setSearchModalIndex((i) => (i - 1 + searchResults.length) % searchResults.length)}
                      variant="outline"
                      className="rounded-full"
                    >
                      <ChevronLeft size={20} />
                    </Button>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-500">
                        {searchModalIndex + 1} / {searchResults.length}
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => setSearchModalIndex((i) => (i + 1) % searchResults.length)}
                      variant="outline"
                      className="rounded-full"
                    >
                      <ChevronRight size={20} />
                    </Button>
                  </div>

                  {/* Current Radical Display */}
                  <div className="text-center">
                    <div className="text-4xl sm:text-6xl font-bold text-emerald-700 mb-4">
                      {searchResults[searchModalIndex].boThu}
                    </div>
                    <div className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
                      {searchResults[searchModalIndex].tenBoThu}
                    </div>
                    <div className="text-lg sm:text-xl text-gray-600 mb-4">
                      {searchResults[searchModalIndex].phienAm}
                    </div>
                    <div className="text-base sm:text-lg text-gray-700 mb-6">
                      {searchResults[searchModalIndex].yNghia}
                    </div>
                    {searchResults[searchModalIndex].hinhAnh && searchResults[searchModalIndex].hinhAnh.length > 0 && (
                      <SearchImageCarousel
                        images={searchResults[searchModalIndex].hinhAnh}
                        currentIndex={searchModalImageIndex}
                        onImageChange={setSearchModalImageIndex}
                        alt={searchResults[searchModalIndex].tenBoThu}
                      />
                    )}
                  </div>

                  {/* Dots indicator */}
                  <div className="flex justify-center gap-2">
                    {searchResults.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSearchModalIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === searchModalIndex ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Flashcard Modal */}
      <FlashcardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentRadical={cur}
        currentIndex={idx}
        total={total}
        isPlaying={playing}
        isSpeaking={isSpeaking}
        isDifficult={isDiff}
        onTogglePlay={() => {
          setSlideDirection('next');
          setPlaying(p => !p);
        }}
        onToggleDiff={toggleDiff}
        onSpeakRadical={speakRadical}
        onGoFirst={goFirst}
        onGoPrev={goPrev}
        onGoNext={goNext}
        allData={allData}
        currentImageIndex={currentImageIndex}
        onImageChange={setCurrentImageIndex}
      />
    </div>
  );
}
