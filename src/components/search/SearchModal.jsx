import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ExamplesCarousel } from '../carousel/ExamplesCarousel';
import { ImageCarousel } from '../carousel/ImageCarousel';
import DictionaryCarousel from '../carousel/DictionaryCarousel';
import { CharacterWriter } from '../carousel/CharacterWriter';

/**
 * Search results modal component
 */
export const SearchModal = ({
  isOpen,
  onClose,
  searchQuery,
  isSearching,
  searchResults,
  charDefinition,
  charExamples,
  examplesIndex,
  setExamplesIndex,
  searchModalIndex,
  setSearchModalIndex,
  searchModalImageIndex,
  setSearchModalImageIndex,
  dictionaryResults,
  dictionaryIndex,
  setDictionaryIndex
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">
              Kết quả tìm kiếm cho "{searchQuery}"
            </h2>
            {isSearching ? (
              <div className="text-gray-600 mt-1 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Đang tìm kiếm...</span>
              </div>
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
            onClick={onClose}
            variant="outline"
            className="rounded-full ml-2 flex-shrink-0"
          >
            ✕
          </Button>
        </div>

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
              <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mb-3">
                {searchResults[0].boThu}
              </div>
              <div className="text-sm sm:text-base text-gray-700 mb-4">
                <span className="font-bold">{searchResults[0].tenBoThu}</span> • {searchResults[0].phienAm} • <span className="italic">{searchResults[0].yNghia}</span>
              </div>
              {searchResults[0].hinhAnh && searchResults[0].hinhAnh.length > 0 && (
                <div className="mb-4">
                  <ImageCarousel
                    images={searchResults[0].hinhAnh}
                    currentIndex={searchModalImageIndex}
                    onImageChange={setSearchModalImageIndex}
                    alt={searchResults[0].tenBoThu}
                    size="small"
                  />
                </div>
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
                <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mb-3">
                  {searchResults[searchModalIndex].boThu}
                </div>
                <div className="text-sm sm:text-base text-gray-700 mb-4">
                  <span className="font-bold">{searchResults[searchModalIndex].tenBoThu}</span> • {searchResults[searchModalIndex].phienAm} • <span className="italic">{searchResults[searchModalIndex].yNghia}</span>
                </div>
                {searchResults[searchModalIndex].hinhAnh && searchResults[searchModalIndex].hinhAnh.length > 0 && (
                  <div className="mb-4">
                    <ImageCarousel
                      images={searchResults[searchModalIndex].hinhAnh}
                      currentIndex={searchModalImageIndex}
                      onImageChange={setSearchModalImageIndex}
                      alt={searchResults[searchModalIndex].tenBoThu}
                      size="small"
                    />
                  </div>
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

          {/* Character Writer - Stroke Animation */}
          {searchQuery && [...searchQuery].some(ch => /[\u4e00-\u9fff]/.test(ch)) && (
            <div className="mt-6 p-4 bg-amber-50 rounded-lg">
              <div className="font-semibold text-amber-800 mb-4 text-sm">
                Nét viết của "{searchQuery}":
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                {[...searchQuery]
                  .filter(ch => /[\u4e00-\u9fff]/.test(ch))
                  .map((char, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <CharacterWriter character={char} size={120} />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Character Definition */}
          {charDefinition && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
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
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <div className="text-sm">
                <div className="font-semibold text-green-800 mb-3">
                  Từ vựng chứa "{searchQuery}":
                </div>
                <ExamplesCarousel 
                  examples={charExamples}
                  currentIndex={examplesIndex}
                  onIndexChange={setExamplesIndex}
                />
              </div>
            </div>
          )}

          {/* Dictionary Search Results */}
          {dictionaryResults && dictionaryResults.length > 0 ? (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <div className="text-sm">
                <div className="font-semibold text-purple-800 mb-3">
                  Từ điển chứa "{searchQuery}":
                </div>
                <DictionaryCarousel 
                  dictionaryResults={dictionaryResults}
                  currentIndex={dictionaryIndex}
                  onIndexChange={setDictionaryIndex}
                />
              </div>
            </div>
          ) : dictionaryResults !== null ? (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                🔍 Không tìm thấy từ vựng nào chứa "{searchQuery}" trong từ điển
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
