import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, ChevronLeft, ChevronRight, ChevronsLeft, Volume2, X, ArrowLeft, ArrowRight } from "lucide-react";
import { useSwipe } from '../hooks/useSwipe';

const SmallButton = ({ icon, text, onClick, disabled=false }) => (
  <Button variant="outline" className="rounded-2xl px-5" onClick={onClick} disabled={disabled}>
    <span className="flex items-center gap-2">{icon}{text}</span>
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
      <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 bg-gray-100 rounded-xl flex items-center justify-center">
        <span className="text-gray-400 text-lg">No Image</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden relative">
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
    <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 bg-gray-100 rounded-xl overflow-hidden">
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
          className="w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={goToNextImage}
          className="w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <ArrowRight size={20} />
        </button>
      </div>
      
      {/* Image counter */}
      <div className="absolute bottom-3 right-3 bg-black/50 text-white text-sm px-3 py-1 rounded">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

const FlashcardModal = ({ 
  isOpen, 
  onClose, 
  currentRadical, 
  currentIndex, 
  total, 
  isPlaying, 
  isSpeaking, 
  isDifficult,
  onTogglePlay, 
  onToggleDiff, 
  onSpeakRadical,
  onGoFirst,
  onGoPrev,
  onGoNext,
  allData,
  currentImageIndex,
  onImageChange
}) => {
  const modalRef = useRef(null);
  const slideRef = useRef(null);
  const [slideDirection, setSlideDirection] = useState('next'); // 'next' or 'prev'

  // Navigation wrappers to set direction
  const handleGoFirst = () => {
    setSlideDirection('prev');
    onGoFirst();
  };
  
  const handleGoPrev = () => {
    setSlideDirection('prev');
    onGoPrev();
  };
  
  const handleGoNext = () => {
    setSlideDirection('next');
    onGoNext();
  };

  // Swipe gestures
  const swipeHandlers = useSwipe(handleGoNext, handleGoPrev);

  // Helper function to get radical by STT
  const getRadicalByStt = (stt) => {
    return allData.find(item => item.stt === stt);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle click outside
  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  // Smooth slide animation with direction
  useEffect(() => {
    if (!slideRef.current) return;
    
    // Determine animation direction
    const isNextSlide = slideDirection === 'next';
    
    slideRef.current.animate([
      { transform: isNextSlide ? 'translateX(120px)' : 'translateX(-120px)', opacity: 0.7 },
      { transform: 'translateX(0px)', opacity: 1 }
    ], { duration: 300, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' });
  }, [currentIndex, slideDirection]);

  if (!isOpen || !currentRadical) return null;

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Close button */}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm"
          onClick={onClose}
        >
          <X size={20} />
        </Button>

        {/* Flashcard */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <Card className="border-0 shadow-none touch-pan-y" {...swipeHandlers}>
            <CardContent className="p-4 sm:p-8 md:p-12">
              <div ref={slideRef}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start items-center gap-4 mb-4 sm:mb-8 sm:pt-0">
                  <div className="text-gray-500 text-lg font-medium">
                    {currentIndex + 1} / {total}
                  </div>
                  <label className="flex items-center gap-3 text-sm text-gray-500 select-none">
                    <span className="font-medium">Difficult?</span>
                    <input 
                      type="checkbox" 
                      checked={isDifficult} 
                      onChange={onToggleDiff}
                      className="w-5 h-5 rounded border-2 border-gray-300"
                    />
                  </label>
                </div>

                {/* Main content */}
                <div className="text-center mb-4 sm:mb-6">
                  {/* Image as center focus */}
                  <div className="flex justify-center mb-4 sm:mb-8">
                    <ImageCarousel 
                      images={currentRadical.hinhAnh}
                      currentIndex={currentImageIndex}
                      onImageChange={onImageChange}
                    />
                  </div>
                  
                  {/* Radical character */}
                  <div className="text-emerald-700 text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-3 sm:mb-6">
                    {currentRadical.boThu}
                  </div>
                  
                  {/* Supporting information */}
                  <div className="italic text-lg sm:text-xl md:text-2xl mb-3 sm:mb-6 text-gray-700">
                    {currentRadical.tenBoThu} • {currentRadical.phienAm}
                  </div>
                  
                  <div className="text-base sm:text-lg md:text-xl text-gray-600 mb-4 sm:mb-6">
                    {currentRadical.yNghia}
                  </div>
                  
                </div>

              {/* Controls */}
              <div className="flex flex-wrap gap-4 justify-center pb-8">
                <Button 
                  variant={isPlaying ? "destructive" : "default"} 
                  className="rounded-2xl px-8 py-3 text-lg" 
                  onClick={onTogglePlay}
                >
                  {isPlaying ? (
                    <span className="flex items-center gap-3">
                      <Square size={20}/>Stop
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      <Play size={20}/>Play
                    </span>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="rounded-2xl px-8 py-3 text-lg" 
                  onClick={onSpeakRadical}
                  disabled={isSpeaking}
                >
                  <span className="flex items-center gap-3">
                    <Volume2 size={20}/>
                    Audio
                  </span>
                </Button>
                
                <SmallButton 
                  icon={<ChevronsLeft size={20}/>} 
                  text="First" 
                  onClick={handleGoFirst} 
                />
                <SmallButton 
                  icon={<ChevronLeft size={20}/>} 
                  text="Prev" 
                  onClick={handleGoPrev} 
                />
                <SmallButton 
                  icon={<ChevronRight size={20}/>} 
                  text="Next" 
                  onClick={handleGoNext} 
                />
              </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FlashcardModal;
