import React, { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, Pencil } from 'lucide-react';

/**
 * Component to display and animate Chinese characters using HanziWriter
 */
export const CharacterWriter = ({ character, size = 150 }) => {
  const writerRef = useRef(null);
  const containerRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [loadError, setLoadError] = useState(false);

  // Extract first character if string has multiple characters
  const char = character ? [...character][0] : null;

  useEffect(() => {
    if (!char || !containerRef.current) return;

    // Clear previous writer
    if (writerRef.current) {
      writerRef.current = null;
    }
    containerRef.current.innerHTML = '';
    setLoadError(false);
    setQuizResult(null);
    setIsQuizMode(false);

    try {
      writerRef.current = HanziWriter.create(containerRef.current, char, {
        width: size,
        height: size,
        padding: 5,
        strokeColor: '#333',
        outlineColor: '#DDD',
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 300,
        radicalColor: '#166534', // green-800 for radical
        onLoadCharDataError: () => {
          setLoadError(true);
        }
      });
    } catch (error) {
      setLoadError(true);
    }

    return () => {
      if (writerRef.current) {
        writerRef.current = null;
      }
    };
  }, [char, size]);

  const handleAnimate = () => {
    if (!writerRef.current || isAnimating) return;
    
    setIsAnimating(true);
    setIsQuizMode(false);
    setQuizResult(null);
    
    writerRef.current.hideCharacter();
    writerRef.current.animateCharacter({
      onComplete: () => {
        setIsAnimating(false);
      }
    });
  };

  const handleReset = () => {
    if (!writerRef.current) return;
    
    setIsAnimating(false);
    setIsQuizMode(false);
    setQuizResult(null);
    writerRef.current.cancelQuiz();
    writerRef.current.showCharacter();
    writerRef.current.showOutline();
  };

  const handleQuiz = () => {
    if (!writerRef.current) return;
    
    setIsQuizMode(true);
    setIsAnimating(false);
    setQuizResult(null);
    
    writerRef.current.quiz({
      showHintAfterMisses: 3,
      highlightOnComplete: true,
      onComplete: (summaryData) => {
        setQuizResult({
          totalMistakes: summaryData.totalMistakes,
          character: summaryData.character
        });
        setIsQuizMode(false);
      }
    });
  };

  if (!char) return null;

  if (loadError) {
    return (
      <div className="flex flex-col items-center">
        <div 
          className="flex items-center justify-center bg-gray-100 rounded-lg"
          style={{ width: size, height: size }}
        >
          <span className="text-6xl">{char}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Không có dữ liệu nét viết
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Character container with grid background */}
      <div 
        className="relative bg-white rounded-lg border-2 border-gray-200"
        style={{ width: size, height: size }}
      >
        {/* Grid background */}
        <svg 
          className="absolute inset-0" 
          width={size} 
          height={size}
          style={{ pointerEvents: 'none' }}
        >
          <line x1="0" y1="0" x2={size} y2={size} stroke="#EEE" strokeWidth="1" />
          <line x1={size} y1="0" x2="0" y2={size} stroke="#EEE" strokeWidth="1" />
          <line x1={size/2} y1="0" x2={size/2} y2={size} stroke="#EEE" strokeWidth="1" />
          <line x1="0" y1={size/2} x2={size} y2={size/2} stroke="#EEE" strokeWidth="1" />
        </svg>
        
        {/* HanziWriter container */}
        <div ref={containerRef} className="relative z-10" />
      </div>

      {/* Quiz result */}
      {quizResult && (
        <div className="mt-2 text-center">
          {quizResult.totalMistakes === 0 ? (
            <span className="text-green-600 text-sm font-medium">
              Hoàn hảo! 🎉
            </span>
          ) : (
            <span className="text-orange-600 text-sm">
              Hoàn thành với {quizResult.totalMistakes} lỗi
            </span>
          )}
        </div>
      )}

      {/* Quiz mode indicator */}
      {isQuizMode && (
        <div className="mt-2 text-center">
          <span className="text-blue-600 text-sm animate-pulse">
            Hãy viết ký tự "{char}"...
          </span>
        </div>
      )}

      {/* Control buttons */}
      <div className="flex gap-2 mt-3">
        <Button
          onClick={handleAnimate}
          variant="outline"
          size="sm"
          disabled={isAnimating || isQuizMode}
          className="rounded-full"
          title="Xem animation"
        >
          <Play size={16} />
        </Button>
        
        <Button
          onClick={handleQuiz}
          variant="outline"
          size="sm"
          disabled={isAnimating || isQuizMode}
          className="rounded-full"
          title="Tập viết"
        >
          <Pencil size={16} />
        </Button>
        
        <Button
          onClick={handleReset}
          variant="outline"
          size="sm"
          className="rounded-full"
          title="Reset"
        >
          <RotateCcw size={16} />
        </Button>
      </div>

      {/* Instructions */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        <span className="inline-flex items-center gap-1">
          <Play size={12} /> Xem nét viết
        </span>
        <span className="mx-2">•</span>
        <span className="inline-flex items-center gap-1">
          <Pencil size={12} /> Tập viết
        </span>
      </div>
    </div>
  );
};

export default CharacterWriter;
