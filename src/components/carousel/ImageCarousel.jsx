import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

/**
 * Carousel component for displaying images
 */
export const ImageCarousel = ({ images, currentIndex, onImageChange, alt, size = 'large' }) => {
  if (!images || images.length === 0) return null;
  
  const imageSize = size === 'small' ? 'w-24 h-24' : 'w-48 h-48';
  
  if (images.length === 1) {
    return (
      <div className="flex justify-center">
        <img 
          src={`/images/${images[0]}`} 
          alt={alt} 
          className={`${imageSize} object-contain rounded-lg border`}
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
          className={`${imageSize} object-contain rounded-lg border`}
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
