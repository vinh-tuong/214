import React, { useMemo, useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, ChevronLeft, ChevronRight, ChevronsLeft, Volume2, Monitor } from "lucide-react";
import RADICALS from "../radicals";
import { useSpeechSynthesis } from "./hooks/useSpeechSynthesis";
import FlashcardModal from "./components/FlashcardModal";

/**
 * Flashcards for 214 Chinese Radicals grouped by stroke count
 * -----------------------------------------------------------
 * Dataset schema per item:
 * { stt: number, boThu: string, tenBoThu: string, phienAm: string, yNghia: string, soNet: number }
 *
 * Full dataset (214 radicals) collected from ThanhMaiHSK:
 * https://thanhmaihsk.edu.vn/214-bo-thu-tieng-trung-thong-dung-y-nghia-va-cach-hoc-de-nho/
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
  <Button variant="outline" className="rounded-2xl px-5" onClick={onClick} disabled={disabled}>
    <span className="flex items-center gap-2">{icon}{text}</span>
  </Button>
);

export default function App() {
  const [allData] = useState(RADICALS);
  const [stroke, setStroke] = useState(1);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  useEffect(() => { setIdx(0); }, [stroke]);

  const goFirst = () => setIdx(0);
  const goPrev = () => setIdx((i) => (i - 1 + total) % total);
  const goNext = () => setIdx((i) => (i + 1) % total);

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

  // smooth slide animation (left → right)
  useEffect(() => {
    if (!slideRef.current) return;
    slideRef.current.animate([
      { transform: 'translateX(-30px)', opacity: 0.7 },
      { transform: 'translateX(0px)', opacity: 1 }
    ], { duration: 400, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' });
  }, [idx, stroke]);

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
              <div className="flex flex-wrap gap-2">
                {/* Difficult group button */}
                <Button
                  key="popular"
                  variant={stroke==="popular"?"default":"outline"}
                  className="rounded-full h-9 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  onClick={()=>setStroke("popular")}
                >
                  🔥 Popular ({popularGroup.length})
                </Button>
                <Button
                  key="difficult"
                  variant={stroke==="difficult"?"default":"outline"}
                  className="rounded-full h-9 bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  onClick={()=>setStroke("difficult")}
                >
                  ⭐ Difficult ({difficultGroup.length})
                </Button>
                
                {/* Stroke count buttons */}
                {strokesAvailable.map((n) => (
                  <Button key={n} variant={stroke===n?"default":"outline"} className="rounded-full h-9" onClick={()=>setStroke(n)}>
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
              <p className="mt-2">Nguồn dữ liệu: 214 bộ thủ tiếng Trung – ThanhMaiHSK.</p>
            </div>
          </aside>

          <main>
            {cur ? (
              <div ref={slideRef}>
                <Card className="w-full max-w-2xl mx-auto shadow-xl rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="text-gray-500">{idx + 1} / {total}</div>
                      <label className="flex items-center gap-2 text-sm text-gray-500 select-none">
                        <span>difficult?</span>
                        <input type="checkbox" checked={isDiff} onChange={toggleDiff} />
                      </label>
                    </div>

                    <div className="mt-6">
                      <div className="text-emerald-700 text-5xl font-bold">{cur.boThu}</div>
                      <div className="italic text-xl mt-3 text-gray-700">{cur.tenBoThu} • {cur.phienAm}</div>
                      <div className="mt-6 text-lg">{cur.yNghia}</div>
                      {formatGhepTu(cur.ghepTu) && (
                        <div className="mt-4 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                          {formatGhepTu(cur.ghepTu)}
                        </div>
                      )}
                    </div>

                    <div className="mt-8 flex gap-3 justify-center">
                      <Button variant={playing?"destructive":"default"} className="rounded-2xl" onClick={() => setPlaying(p=>!p)}>
                        {playing ? (<span className="flex items-center gap-2"><Square size={18}/>Stop</span>) : (<span className="flex items-center gap-2"><Play size={18}/>Play</span>)}
                      </Button>
                      
                      {/* Slideshow button */}
                      <Button 
                        variant="outline" 
                        className="rounded-2xl bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100" 
                        onClick={() => setIsModalOpen(true)}
                      >
                        <span className="flex items-center gap-2">
                          <Monitor size={18}/>
                          Slideshow
                        </span>
                      </Button>
                      
                      {/* Audio button */}
                      {isSupported && (
                        <Button 
                          variant="outline" 
                          className="rounded-2xl" 
                          onClick={speakRadical}
                          disabled={isSpeaking}
                        >
                          <span className="flex items-center gap-2">
                            <Volume2 size={18}/>
                            Audio
                          </span>
                        </Button>
                      )}
                      
                      <SmallButton icon={<ChevronsLeft size={18}/>} text="First" onClick={goFirst} />
                      <SmallButton icon={<ChevronLeft size={18}/>} text="Prev" onClick={goPrev} />
                      <SmallButton icon={<ChevronRight size={18}/>} text="Next" onClick={goNext} />
                    </div>
                  </CardContent>
                </Card>
              </div>
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
      />
    </div>
  );
}
