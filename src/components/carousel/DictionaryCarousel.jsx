import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { convertPinyinTones } from '../../utils/pinyinUtils';

const DictionaryCarousel = ({ dictionaryResults, currentIndex, onIndexChange }) => {
  if (!dictionaryResults || dictionaryResults.length === 0) return null;

  const currentResult = dictionaryResults[currentIndex];
  const allEntries = currentResult.flat(); // Flatten the array of arrays

  if (allEntries.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button
          onClick={() => onIndexChange((currentIndex - 1 + dictionaryResults.length) % dictionaryResults.length)}
          variant="outline"
          size="sm"
          className="rounded-full flex-shrink-0"
          disabled={dictionaryResults.length <= 1}
        >
          <ChevronLeft size={16} />
        </Button>

        <div className="flex-1 min-w-0">
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-800 mb-2">
              {allEntries[0].simplified}
            </div>
            <div className="text-purple-700 text-sm mb-1">
              {convertPinyinTones(allEntries[0].pinyin)}
            </div>
            <div className="text-purple-600 text-sm">
              {allEntries[0].definition}
            </div>
          </div>
        </div>

        <Button
          onClick={() => onIndexChange((currentIndex + 1) % dictionaryResults.length)}
          variant="outline"
          size="sm"
          className="rounded-full flex-shrink-0"
          disabled={dictionaryResults.length <= 1}
        >
          <ChevronRight size={16} />
        </Button>

        {dictionaryResults.length > 1 && (
          <div className="text-xs text-purple-600 flex-shrink-0">
            {currentIndex + 1}/{dictionaryResults.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default DictionaryCarousel;
