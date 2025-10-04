import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, ChevronLeft, ChevronRight, ChevronsLeft, Volume2, X, ArrowLeft, ArrowRight } from "lucide-react";

const SmallButton = ({ icon, text, onClick, disabled=false }) => (
  <Button variant="outline" className="rounded-2xl px-5" onClick={onClick} disabled={disabled}>
    <span className="flex items-center gap-2">{icon}{text}</span>
  </Button>
);

const ImageCarousel = ({ images, currentIndex, onImageChange }) => {
  if (!images || images.length === 0) {
    return (
      <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400 text-sm">No Image</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
        <img 
          src={`/images/${images[0]}`} 
          alt={`Bộ thủ hình ảnh`}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm" style={{display: 'none'}}>
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
    <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gray-100 rounded-lg overflow-hidden">
      <img 
        src={`/images/${images[currentIndex]}`} 
        alt={`Bộ thủ hình ảnh ${currentIndex + 1}`}
        className="w-full h-full object-contain"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm" style={{display: 'none'}}>
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
      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-sm px-2 py-1 rounded">
        {currentIndex + 1}/{images.length}
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

  // Helper function to get radical by STT
  const getRadicalByStt = (stt) => {
    return allData.find(item => item.stt === stt);
  };

  // Helper function to format ghepTu information
  const formatGhepTu = (ghepTu) => {
    if (!ghepTu || ghepTu.length === 0) return null;
    
    const components = ghepTu.map(stt => {
      const radical = getRadicalByStt(stt);
      return radical ? `${radical.boThu} (${stt})` : `STT ${stt}`;
    });
    
    return `Ghép từ: ${components.join(' và ')}`;
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

  // Smooth slide animation (left → right)
  useEffect(() => {
    if (!slideRef.current) return;
    slideRef.current.animate([
      { transform: 'translateX(-30px)', opacity: 0.7 },
      { transform: 'translateX(0px)', opacity: 1 }
    ], { duration: 400, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' });
  }, [currentIndex]);

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
        <div ref={slideRef} className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <Card className="border-0 shadow-none">
            <CardContent className="p-8 md:p-12">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
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
              <div className="text-center mb-12">
                {/* Radical */}
                <div className="flex items-center justify-center gap-8 mb-6">
                  <div className="text-emerald-700 text-8xl md:text-9xl font-bold">
                    {currentRadical.boThu}
                  </div>
                  <ImageCarousel 
                    images={currentRadical.hinhAnh}
                    currentIndex={currentImageIndex}
                    onImageChange={onImageChange}
                  />
                </div>
                
                {/* Name and Pinyin */}
                <div className="italic text-2xl md:text-3xl mb-8 text-gray-700">
                  {currentRadical.tenBoThu} • {currentRadical.phienAm}
                </div>
                
                {/* Meaning */}
                <div className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
                  {currentRadical.yNghia}
                </div>
                
                {/* GhepTu information */}
                {formatGhepTu(currentRadical.ghepTu) && (
                  <div className="mt-6 text-lg text-blue-600 bg-blue-50 px-4 py-3 rounded-xl max-w-2xl mx-auto">
                    {formatGhepTu(currentRadical.ghepTu)}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-wrap gap-4 justify-center">
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
                  onClick={onGoFirst} 
                />
                <SmallButton 
                  icon={<ChevronLeft size={20}/>} 
                  text="Prev" 
                  onClick={onGoPrev} 
                />
                <SmallButton 
                  icon={<ChevronRight size={20}/>} 
                  text="Next" 
                  onClick={onGoNext} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FlashcardModal;
