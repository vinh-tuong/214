import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, ChevronLeft, ChevronRight, ChevronsLeft, Volume2, Monitor, ArrowLeft, ArrowRight } from "lucide-react";
import RADICALS from "../radicals";
import { useSpeechSynthesis } from "./hooks/useSpeechSynthesis";
import FlashcardModal from "./components/FlashcardModal";

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

// Hook for swipe gestures
const useSwipe = (onSwipeLeft, onSwipeRight, threshold = 50) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
    
    // Reset touch states
    setTouchStart(null);
    setTouchEnd(null);
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
};

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
  if (!images || images.length === 0) {
    return (
      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400 text-sm">No Image</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
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
    <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
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
          className="w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <ArrowLeft size={12} />
        </button>
        <button
          onClick={goToNextImage}
          className="w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <ArrowRight size={12} />
        </button>
      </div>
      
      {/* Image counter */}
      <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1 rounded">
        {currentIndex + 1}/{images.length}
      </div>
    </div>
  );
};

export default function App() {
  const [allData] = useState(RADICALS);
  const [stroke, setStroke] = useState(1);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState('next'); // 'next' or 'prev'
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

  // Create popular group with 50 most common radicals
  const popularGroup = useMemo(() => {
    const popularStt = [
      9, 18, 19, 30, 31, 32, 37, 38, 40, 46, 50, 53, 60, 61, 64, 66, 72, 75, 85, 86,
      93, 94, 96, 102, 104, 109, 112, 115, 118, 119, 120, 130, 140, 142, 145, 149,
      154, 157, 159, 162, 163, 167, 169, 170, 173, 181, 184, 187, 195, 196
    ];
    return allData.filter(item => popularStt.includes(item.stt));
  }, [allData]);
  
  // Determine current group based on stroke value
  const currentGroup = stroke === 'difficult' ? difficultGroup : 
                      stroke === 'popular' ? popularGroup : 
                      (groups[stroke] ?? []);
  const total = currentGroup.length;
  const cur = currentGroup[idx] ?? null;
  const isDiff = cur ? difficultSet.has(cur.stt) : false;

  // autoplay every 3s
  useEffect(() => {
    if (!playing || total === 0) return;
    timer.current && clearInterval(timer.current);
    timer.current = setInterval(() => {
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

  const goFirst = () => {
    setSlideDirection('next');
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

  // Helper function to format ghepTu information
  const formatGhepTu = (ghepTu) => {
    if (!ghepTu || ghepTu.length === 0) return null;
    
    const components = ghepTu.map(stt => {
      const radical = getRadicalByStt(stt);
      return radical ? `${radical.boThu} (${stt})` : `STT ${stt}`;
    });
    
    return `Ghép từ: ${components.join(' và ')}`;
  };

  const slideRef = useRef(null);

  // smooth slide animation with direction
  useEffect(() => {
    if (!slideRef.current) return;
    
    // Determine animation direction
    const isNextSlide = slideDirection === 'next';
    
    slideRef.current.animate([
      { transform: isNextSlide ? 'translateX(30px)' : 'translateX(-30px)', opacity: 0.7 },
      { transform: 'translateX(0px)', opacity: 1 }
    ], { duration: 400, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' });
  }, [idx, stroke, slideDirection]);

  const strokesAvailable = useMemo(() => Object.keys(groups).map(Number).sort((a,b)=>a-b), [groups]);

  return (
    <div className="min-h-screen bg-amber-50 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Flashcards 214 Bộ thủ – nhóm theo số nét</h1>
        </header>

        <section className="mt-4 grid md:grid-cols-[260px_1fr] gap-6">
          <aside className="space-y-4">
            <div className="p-4 bg-white rounded-2xl shadow">
              <div className="text-sm text-gray-600 mb-2">Nhóm theo số nét</div>
              <div className="flex flex-wrap gap-2 max-w-full overflow-hidden">
                {/* Difficult group button */}
                <Button
                  key="popular"
                  variant={stroke==="popular"?"default":"outline"}
                  className="rounded-full h-9 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 text-xs sm:text-sm whitespace-nowrap"
                  onClick={()=>setStroke("popular")}
                >
                  🔥 Popular ({popularGroup.length})
                </Button>
                <Button
                  key="difficult"
                  variant={stroke==="difficult"?"default":"outline"}
                  className="rounded-full h-9 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 text-xs sm:text-sm whitespace-nowrap"
                  onClick={()=>setStroke("difficult")}
                >
                  ⭐ Difficult ({difficultGroup.length})
                </Button>
                
                {/* Stroke count buttons */}
                {strokesAvailable.map((n) => (
                  <Button key={n} variant={stroke===n?"default":"outline"} className="rounded-full h-9 text-xs sm:text-sm whitespace-nowrap" onClick={()=>setStroke(n)}>
                    {n} nét ({groups[n].length})
                  </Button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl shadow text-sm text-gray-600 leading-relaxed">
              <p>Nút Play sẽ tự động chuyển thẻ mỗi 3s. Bạn có thể đánh dấu "difficult?" để ôn tập.</p>
              <p className="mt-2">Nút Audio sẽ đọc bộ thủ bằng tiếng Trung (hỗ trợ trình duyệt hiện đại).</p>
              <p className="mt-2"><strong>Popular:</strong> 50 bộ thủ phổ biến nhất trong tiếng Trung.</p>
              <p className="mt-2"><strong>Difficult:</strong> Nhóm bộ thủ bạn đánh dấu khó để ôn tập.</p>
              <p className="mt-2">Nguồn dữ liệu: từ và nghĩa được lấy từ 214 bộ thủ tiếng Trung – ThanhMaiHSK. Hình ảnh được lấy từ Radical Images — Pichinese.</p>
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
                       <div className="flex items-center justify-center gap-6">
                         <div className="text-emerald-700 text-5xl font-bold">{cur.boThu}</div>
                         <ImageCarousel 
                           images={cur.hinhAnh}
                           currentIndex={currentImageIndex}
                           onImageChange={setCurrentImageIndex}
                         />
                       </div>
                       <div className="italic text-xl mt-3 text-gray-700">{cur.tenBoThu} • {cur.phienAm}</div>
                       <div className="mt-6 text-lg">{cur.yNghia}</div>
                       {formatGhepTu(cur.ghepTu) && (
                         <div className="mt-4 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                           {formatGhepTu(cur.ghepTu)}
                         </div>
                       )}
                     </div>

                    <div className="mt-8 flex flex-wrap gap-2 sm:gap-3 justify-center">
                      <Button variant={playing?"destructive":"default"} className="rounded-2xl text-sm" onClick={() => setPlaying(p=>!p)}>
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
                  : `Không có dữ liệu cho nhóm ${stroke} nét.`
                }
              </div>
            )}
          </main>
        </section>

        <footer className="mt-8 text-xs text-gray-500">
          <p>© 2025 – Flashcards Bộ thủ. Tự động chạy: 3 giây / thẻ. Hiệu ứng trượt trái → phải.</p>
          <p className="mt-1">💡 Trên mobile: Vuốt trái/phải trên thẻ để chuyển slide.</p>
        </footer>
      </div>

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
        onTogglePlay={() => setPlaying(p => !p)}
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
