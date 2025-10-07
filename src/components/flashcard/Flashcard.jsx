import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Square, ChevronLeft, ChevronRight, ChevronsLeft, Volume2, Monitor } from 'lucide-react';
import { ImageCarousel } from '../carousel/ImageCarousel';
import { CharactersCarousel } from '../carousel/CharactersCarousel';

/**
 * Small button component for navigation
 */
const SmallButton = ({ icon, text, onClick, disabled = false }) => (
  <Button
    variant="outline"
    size="sm"
    className="rounded-2xl text-xs"
    onClick={onClick}
    disabled={disabled}
  >
    <span className="flex items-center gap-1 sm:gap-2">
      {icon}
      <span className="hidden sm:inline">{text}</span>
    </span>
  </Button>
);

/**
 * Main flashcard component
 */
export const Flashcard = ({
  currentRadical,
  index,
  total,
  isDifficult,
  onToggleDifficult,
  playing,
  onTogglePlay,
  onSlideshow,
  onFirst,
  onPrev,
  onNext,
  onSpeak,
  isSupported,
  isSpeaking,
  currentImageIndex,
  onImageChange,
  slideRef,
  slideDirection,
  swipeHandlers,
  
  // Characters functionality
  showCharacters,
  charactersData,
  loadingCharacters,
  errorCharacters,
  charactersIndex,
  setCharactersIndex,
  onToggleShowCharacters,
  onCharacterClick,
  onRetryCharacters
}) => {
  if (!currentRadical) return null;

  return (
    <Card 
      className="w-full max-w-2xl mx-auto shadow-xl rounded-2xl touch-pan-y"
      {...swipeHandlers}
    >
      <CardContent className="p-6">
        <div ref={slideRef}>
          <div className="flex justify-between items-start">
            <div className="text-gray-500">{index + 1} / {total}</div>
            <label className="flex items-center gap-2 text-sm text-gray-500 select-none">
              <span>difficult?</span>
              <input type="checkbox" checked={isDifficult} onChange={onToggleDifficult} />
            </label>
          </div>

          <div className="mt-6">
            {/* Image as center focus */}
            <div className="flex justify-center mb-6">
              <ImageCarousel 
                images={currentRadical.hinhAnh}
                currentIndex={currentImageIndex}
                onImageChange={onImageChange}
                alt={currentRadical.tenBoThu}
              />
            </div>
            
            {/* Radical character */}
            <div className="text-center mb-4">
              <div className="text-emerald-700 text-6xl font-bold">{currentRadical.boThu}</div>
            </div>
            
            {/* Supporting information */}
            <div className="text-center">
              <div className="italic text-xl mb-4 text-gray-700">{currentRadical.tenBoThu} • {currentRadical.phienAm}</div>
              <div className="text-lg text-gray-600">{currentRadical.yNghia}</div>
            </div>

            {/* Characters section */}
            <div className="mt-6">
              <Button
                variant="outline"
                className="rounded-full text-sm bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                onClick={() => onToggleShowCharacters(currentRadical)}
                disabled={loadingCharacters.has(currentRadical.stt)}
              >
                <span className="flex items-center gap-1 sm:gap-2">
                  {loadingCharacters.has(currentRadical.stt) ? (
                    <>
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="hidden sm:inline">Loading...</span>
                    </>
                  ) : showCharacters.has(currentRadical.stt) ? (
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

              {showCharacters.has(currentRadical.stt) && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="text-sm font-semibold text-gray-700 mb-3">
                    Hán tự chứa bộ thủ "{currentRadical.boThu}":
                  </div>
                  {charactersData.has(currentRadical.stt) ? (
                    <CharactersCarousel
                      characters={charactersData.get(currentRadical.stt)}
                      radicalStt={currentRadical.stt}
                      charactersIndex={charactersIndex}
                      setCharactersIndex={setCharactersIndex}
                      onCharacterClick={onCharacterClick}
                    />
                  ) : errorCharacters.has(currentRadical.stt) ? (
                    <div className="text-sm text-red-500 flex items-center gap-2">
                      <span>❌ Không thể tải danh sách hán tự</span>
                      <button
                        onClick={() => onRetryCharacters(currentRadical)}
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
            <Button 
              variant={playing ? "destructive" : "default"} 
              className="rounded-2xl text-sm" 
              onClick={onTogglePlay}
            >
              {playing ? (
                <span className="flex items-center gap-1 sm:gap-2">
                  <Square size={16}/>
                  <span className="hidden sm:inline">Stop</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 sm:gap-2">
                  <Play size={16}/>
                  <span className="hidden sm:inline">Play</span>
                </span>
              )}
            </Button>
            
            {/* Slideshow button */}
            <Button 
              variant="outline" 
              className="rounded-2xl bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 text-sm" 
              onClick={onSlideshow}
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
                onClick={onSpeak}
                disabled={isSpeaking}
              >
                <span className="flex items-center gap-1 sm:gap-2">
                  <Volume2 size={16}/>
                  <span className="hidden sm:inline">Audio</span>
                </span>
              </Button>
            )}
            
            <SmallButton icon={<ChevronsLeft size={16}/>} text="First" onClick={onFirst} />
            <SmallButton icon={<ChevronLeft size={16}/>} text="Prev" onClick={onPrev} />
            <SmallButton icon={<ChevronRight size={16}/>} text="Next" onClick={onNext} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
