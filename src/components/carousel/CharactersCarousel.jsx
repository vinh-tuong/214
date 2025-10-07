import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CHARACTERS_PER_PAGE } from '../../constants/radicals';

/**
 * Carousel component for displaying characters
 */
export const CharactersCarousel = ({ characters, radicalStt, charactersIndex, setCharactersIndex, onCharacterClick }) => {
  const currentIndex = charactersIndex.get(radicalStt) || 0;
  const totalPages = Math.ceil(characters.length / CHARACTERS_PER_PAGE);
  
  const startIndex = currentIndex * CHARACTERS_PER_PAGE;
  const endIndex = Math.min(startIndex + CHARACTERS_PER_PAGE, characters.length);
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
