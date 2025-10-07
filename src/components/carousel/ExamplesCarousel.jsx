import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Carousel component for displaying character examples
 */
export const ExamplesCarousel = ({ examples, currentIndex, onIndexChange }) => {
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
