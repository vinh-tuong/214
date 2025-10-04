import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, ChevronLeft, ChevronRight, ChevronsLeft, Volume2, Monitor, ArrowLeft, ArrowRight } from "lucide-react";
import RADICALS from "../radicals";
import { useSpeechSynthesis } from "./hooks/useSpeechSynthesis";
import { useSwipe } from "./hooks/useSwipe";
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
      <div className="w-48 h-48 sm:w-56 sm:h-56 bg-gray-100 rounded-xl flex items-center justify-center">
        <span className="text-gray-400 text-lg">No Image</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="w-48 h-48 sm:w-56 sm:h-56 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden relative">
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
    <div className="relative w-48 h-48 sm:w-56 sm:h-56 bg-gray-100 rounded-xl overflow-hidden">
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
      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default function App() {
  const [allData] = useState(RADICALS);
  const [stroke, setStroke] = useState('popular');
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

  // Create all group with all 214 radicals
  const allGroup = useMemo(() => {
    return [...allData]; // All radicals in original order
  }, [allData]);

  // Create random group with all radicals shuffled
  const randomGroup = useMemo(() => {
    const shuffled = [...allData];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [allData, stroke]); // Re-shuffle when stroke changes to 'random'
  
  // Determine current group based on stroke value
  const currentGroup = stroke === 'difficult' ? difficultGroup : 
                      stroke === 'popular' ? popularGroup : 
                      stroke === 'all' ? allGroup :
                      stroke === 'random' ? randomGroup :
                      (groups[stroke] ?? []);
  const total = currentGroup.length;
  const cur = currentGroup[idx] ?? null;
  const isDiff = cur ? difficultSet.has(cur.stt) : false;

  // autoplay every 3s
  useEffect(() => {
    if (!playing || total === 0) return;
    timer.current && clearInterval(timer.current);
    timer.current = setInterval(() => {
      setSlideDirection('next');
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
    setSlideDirection('prev');
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
      return radical ? `${radical.boThu} (${radical.tenBoThu})` : `STT ${stt}`;
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
      { transform: isNextSlide ? 'translateX(120px)' : 'translateX(-120px)', opacity: 0.7 },
      { transform: 'translateX(0px)', opacity: 1 }
    ], { duration: 300, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' });
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
            <div className="p-4 sm:p-6 bg-white rounded-2xl shadow">
              <div className="text-sm text-gray-600 mb-2">Nhóm theo số nét</div>
              <div className="flex flex-wrap gap-2 max-w-full overflow-hidden">
                {/* Difficult group button */}
                <Button
                  key="popular"
                  variant={stroke==="popular"?"default":"outline"}
                  className={`rounded-full h-9 text-xs sm:text-sm whitespace-nowrap ${
                    stroke === "popular"
                      ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                      : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  }`}
                  onClick={()=>setStroke("popular")}
                >
                  🔥 Popular ({popularGroup.length})
                </Button>
                <Button
                  key="difficult"
                  variant={stroke==="difficult"?"default":"outline"}
                  className={`rounded-full h-9 text-xs sm:text-sm whitespace-nowrap ${
                    stroke === "difficult"
                      ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                      : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  }`}
                  onClick={()=>setStroke("difficult")}
                >
                  ⭐ Difficult ({difficultGroup.length})
                </Button>
                
                {/* Stroke count buttons */}
                {strokesAvailable.map((n) => (
                  <Button 
                    key={n} 
                    variant={stroke===n?"default":"outline"} 
                    className={`rounded-full h-9 text-xs sm:text-sm whitespace-nowrap ${
                      stroke === n 
                        ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600" 
                        : "hover:bg-gray-50"
                    }`} 
                    onClick={()=>setStroke(n)}
                  >
                    {n} nét ({groups[n].length})
                  </Button>
                ))}
                
                {/* Additional group buttons */}
                <Button
                  key="all"
                  variant={stroke==="all"?"default":"outline"}
                  className={`rounded-full h-9 text-xs sm:text-sm whitespace-nowrap ${
                    stroke === "all"
                      ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                      : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  }`}
                  onClick={()=>setStroke("all")}
                >
                  📚 Tất cả ({allGroup.length})
                </Button>
                <Button
                  key="random"
                  variant={stroke==="random"?"default":"outline"}
                  className={`rounded-full h-9 text-xs sm:text-sm whitespace-nowrap ${
                    stroke === "random"
                      ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                      : "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                  }`}
                  onClick={()=>setStroke("random")}
                >
                  🎲 Ngẫu nhiên ({randomGroup.length})
                </Button>
              </div>
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
                       {/* Image as center focus */}
                       <div className="flex justify-center mb-6">
                         <ImageCarousel 
                           images={cur.hinhAnh}
                           currentIndex={currentImageIndex}
                           onImageChange={setCurrentImageIndex}
                         />
                       </div>
                       
                       {/* Radical character */}
                       <div className="text-center mb-4">
                         <div className="text-emerald-700 text-6xl font-bold">{cur.boThu}</div>
                       </div>
                       
                       {/* Supporting information */}
                       <div className="text-center">
                         <div className="italic text-xl mb-4 text-gray-700">{cur.tenBoThu} • {cur.phienAm}</div>
                         <div className="text-lg text-gray-600">{cur.yNghia}</div>
                         {formatGhepTu(cur.ghepTu) && (
                           <div className="mt-4 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg inline-block">
                             {formatGhepTu(cur.ghepTu)}
                           </div>
                         )}
                       </div>
                     </div>

                    <div className="mt-8 flex flex-wrap gap-2 sm:gap-3 justify-center">
                      <Button variant={playing?"destructive":"default"} className="rounded-2xl text-sm" onClick={() => {
                        setSlideDirection('next');
                        setPlaying(p=>!p);
                      }}>
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
                  : stroke === 'all'
                  ? 'Nhóm Tất cả chứa đầy đủ 214 bộ thủ theo thứ tự.'
                  : stroke === 'random'
                  ? 'Nhóm Ngẫu nhiên chứa đầy đủ 214 bộ thủ được xáo trộn.'
                  : `Không có dữ liệu cho nhóm ${stroke} nét.`
                }
              </div>
            )}
          </main>
        </section>

        {/* Information Section */}
        <div className="mt-8 p-4 bg-white rounded-2xl shadow text-sm text-gray-600 leading-relaxed">
          <div className="space-y-3">
            <p><strong>Nút Play</strong> sẽ tự động chuyển thẻ mỗi 3s. Bạn có thể đánh dấu "difficult?" để ôn tập.</p>
            <p><strong>Nút Audio</strong> sẽ đọc bộ thủ bằng tiếng Trung (hỗ trợ trình duyệt hiện đại).</p>
            <p><strong>Popular:</strong> 50 bộ thủ phổ biến nhất trong tiếng Trung.</p>
            <p><strong>Tất cả:</strong> Đầy đủ 214 bộ thủ theo thứ tự từ 1 đến 17 nét.</p>
            <p><strong>Ngẫu nhiên:</strong> Đầy đủ 214 bộ thủ được xáo trộn ngẫu nhiên.</p>
            <p><strong>Difficult:</strong> Nhóm bộ thủ bạn đánh dấu khó để ôn tập.</p>
            <p className="text-xs text-gray-500 mt-4">
              <strong>Nguồn dữ liệu:</strong> từ và nghĩa được lấy từ 214 bộ thủ tiếng Trung – ThanhMaiHSK. Hình ảnh được lấy từ Radical Images — Pichinese.
            </p>
          </div>
        </div>

        <footer className="mt-8 text-xs text-gray-500">
          <p>© 2025 – Flashcards Bộ thủ. Tự động chạy: 3 giây / thẻ. Hiệu ứng trượt trái → phải.</p>
          <p className="mt-1">💡 Trên mobile: Vuốt trái/phải trên thẻ để chuyển slide.</p>
          <p className="mt-8 text-center text-gray-400">From Munich with love ❤️</p>
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
        onTogglePlay={() => {
          setSlideDirection('next');
          setPlaying(p => !p);
        }}
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
