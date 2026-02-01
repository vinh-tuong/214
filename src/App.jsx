import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { useSpeechSynthesis } from "./hooks/useSpeechSynthesis";
import { useSwipe } from "./hooks/useSwipe";
import FlashcardModal from "./components/FlashcardModal";
import { SearchModal } from "./components/search/SearchModal";
import { Flashcard } from "./components/flashcard/Flashcard";
import { useRadicals } from "./hooks/useRadicals";
import { useSearch } from "./hooks/useSearch";
import { useCharacters } from "./hooks/useCharacters";
import { AUTOPLAY_INTERVAL } from "./constants/radicals";

/**
 * Main App component - Production Ready
 * Modular, maintainable, and scalable architecture
 */
function App() {
  // Custom hooks for business logic
  const {
    groups,
    popularGroup,
    allGroup,
    randomGroup,
    difficultGroup,
    difficultSet,
    toggleDifficult
  } = useRadicals();

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    isSearchModalOpen,
    setIsSearchModalOpen,
    searchModalIndex,
    setSearchModalIndex,
    searchModalImageIndex,
    setSearchModalImageIndex,
    charDefinition,
    charExamples,
    examplesIndex,
    setExamplesIndex,
    dictionaryResults,
    dictionaryIndex,
    setDictionaryIndex,
    handleManualSearch,
    handleCharacterClick
  } = useSearch();

  const {
    charactersData,
    loadingCharacters,
    showCharacters,
    errorCharacters,
    charactersIndex,
    setCharactersIndex,
    fetchCharactersForRadical,
    toggleShowCharacters
  } = useCharacters();

  // Local state
  const [stroke, setStroke] = useState('popular');
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState('next');

  // Speech synthesis
  const { speak, isSupported, isSpeaking } = useSpeechSynthesis();

  // Refs
  const timer = useRef(null);
  const slideRef = useRef(null);

  // Get current group based on stroke selection
  const currentGroup = useMemo(() => {
    switch (stroke) {
      case 'popular': return popularGroup;
      case 'all': return allGroup;
      case 'random': return randomGroup;
      case 'difficult': return difficultGroup;
      default: return groups[stroke] || [];
    }
  }, [stroke, popularGroup, allGroup, randomGroup, difficultGroup, groups]);

  // Current radical and total count
  const cur = currentGroup[idx];
  const total = currentGroup.length;
  const isDiff = cur ? difficultSet.has(cur.stt) : false;

  // Autoplay functionality
  useEffect(() => {
    if (!playing || total === 0) return;
    timer.current && clearInterval(timer.current);
    timer.current = setInterval(() => {
      setSlideDirection('next');
      setIdx((i) => (i + 1) % total);
    }, AUTOPLAY_INTERVAL);
    return () => timer.current && clearInterval(timer.current);
  }, [playing, total]);

  // Reset index when group changes
  useEffect(() => { 
    setIdx(0); 
    setCurrentImageIndex(0);
  }, [stroke]);

  // Reset image index when radical changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [idx, stroke]);

  // Reset examples index when examples change
  useEffect(() => {
    setExamplesIndex(0);
  }, [charExamples, setExamplesIndex]);

  // Navigation functions
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

  // Toggle difficult status
  const toggleDiff = () => {
    if (!cur) return;
    toggleDifficult(cur.stt);
  };

  // Speech functionality
  const speakRadical = () => {
    if (!cur || !isSupported) return;
    speak(cur.boThu, {
      rate: 0.9,
      pitch: 1.0,
      volume: 1.0,
      lang: 'zh-CN'
    });
  };

  // Handle retry characters
  const handleRetryCharacters = async (radical) => {
    // Clear error state and retry
    setErrorCharacters(prev => {
      const newSet = new Set(prev);
      newSet.delete(radical.stt);
      return newSet;
    });
    await fetchCharactersForRadical(radical);
  };

  // Slide animation
  useEffect(() => {
    if (!slideRef.current) return;
    
    const isNextSlide = slideDirection === 'next';
    
    slideRef.current.animate([
      { transform: isNextSlide ? 'translateX(120px)' : 'translateX(-120px)', opacity: 0.7 },
      { transform: 'translateX(0px)', opacity: 1 }
    ], { duration: 300, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' });
  }, [idx, stroke, slideDirection]);

  // Available stroke groups
  const strokesAvailable = useMemo(() => Object.keys(groups).map(Number).sort((a,b)=>a-b), [groups]);

  return (
    <div className="min-h-screen bg-amber-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Flashcards 214 Bộ thủ – nhóm theo số nét</h1>
          
          {/* Search Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Tìm kiếm hán tự..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ fontSize: '16px' }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleManualSearch();
                }
              }}
            />
            <Button
              onClick={handleManualSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Đang tìm...' : 'Tìm kiếm'}
            </Button>
            <Link to="/character">
              <Button
                variant="outline"
                className="px-4 py-2 rounded-lg border-amber-500 text-amber-700 hover:bg-amber-50"
                title="Tra cứu Hán tự"
              >
                <BookOpen size={18} className="mr-1" />
                <span className="hidden sm:inline">Tra cứu</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <section className="mt-4 grid md:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="p-4 sm:p-6 bg-white rounded-2xl shadow">
              {/* Main group buttons */}
              <div className="flex flex-wrap gap-2 max-w-full overflow-hidden">
                <Button
                  key="popular"
                  variant={stroke === "popular" ? "default" : "outline"}
                  className={`rounded-full h-9 text-xs sm:text-sm whitespace-nowrap ${
                    stroke === "popular"
                      ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                      : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  }`}
                  onClick={() => setStroke("popular")}
                >
                  ⭐ Phổ biến ({popularGroup.length})
                </Button>
                
                <Button
                  key="difficult"
                  variant={stroke === "difficult" ? "default" : "outline"}
                  className={`rounded-full h-9 text-xs sm:text-sm whitespace-nowrap ${
                    stroke === "difficult"
                      ? "bg-red-500 text-white border-red-500 hover:bg-red-600"
                      : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  }`}
                  onClick={() => setStroke("difficult")}
                >
                  🔥 Ghi nhớ từ khó ({difficultGroup.length})
                </Button>
              </div>
              
              {/* Stroke count buttons */}
              <div className="text-sm text-gray-600 mb-2 mt-4">Nhóm theo số nét</div>
              <div className="flex flex-wrap gap-2 max-w-full overflow-hidden">
                {strokesAvailable.map(strokeCount => (
                  <Button
                    key={strokeCount}
                    variant={stroke === strokeCount.toString() ? "default" : "outline"}
                    className={`rounded-full h-8 text-xs whitespace-nowrap ${
                      stroke === strokeCount.toString()
                        ? "bg-gray-700 text-white border-gray-700 hover:bg-gray-800"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setStroke(strokeCount.toString())}
                  >
                    {strokeCount} nét ({groups[strokeCount]?.length || 0})
                  </Button>
                ))}
              </div>
              
              {/* Additional group buttons at the end */}
              <div className="flex flex-wrap gap-2 max-w-full overflow-hidden mt-4">
                <Button
                  key="all"
                  variant={stroke === "all" ? "default" : "outline"}
                  className={`rounded-full h-9 text-xs sm:text-sm whitespace-nowrap ${
                    stroke === "all"
                      ? "bg-green-500 text-white border-green-500 hover:bg-green-600"
                      : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  }`}
                  onClick={() => setStroke("all")}
                >
                  📚 Tất cả ({allGroup.length})
                </Button>
                
                <Button
                  key="random"
                  variant={stroke === "random" ? "default" : "outline"}
                  className={`rounded-full h-9 text-xs sm:text-sm whitespace-nowrap ${
                    stroke === "random"
                      ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                      : "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                  }`}
                  onClick={() => setStroke("random")}
                >
                  🎲 Ngẫu nhiên ({randomGroup.length})
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main>
            {cur ? (
              <Flashcard
                currentRadical={cur}
                index={idx}
                total={total}
                isDifficult={isDiff}
                onToggleDifficult={toggleDiff}
                playing={playing}
                onTogglePlay={() => {
                  setSlideDirection('next');
                  setPlaying(p => !p);
                }}
                onSlideshow={() => setIsModalOpen(true)}
                onFirst={goFirst}
                onPrev={goPrev}
                onNext={goNext}
                onSpeak={speakRadical}
                isSupported={isSupported}
                isSpeaking={isSpeaking}
                currentImageIndex={currentImageIndex}
                onImageChange={setCurrentImageIndex}
                slideRef={slideRef}
                slideDirection={slideDirection}
                swipeHandlers={swipeHandlers}
                
                // Characters functionality
                showCharacters={showCharacters}
                charactersData={charactersData}
                loadingCharacters={loadingCharacters}
                errorCharacters={errorCharacters}
                charactersIndex={charactersIndex}
                setCharactersIndex={setCharactersIndex}
                onToggleShowCharacters={toggleShowCharacters}
                onCharacterClick={handleCharacterClick}
                onRetryCharacters={handleRetryCharacters}
              />
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

        {/* Footer */}
        <footer className="mt-8 text-xs text-gray-500">
          <p>© 2025 – Flashcards Bộ thủ. Tự động chạy: 3 giây / thẻ. Hiệu ứng trượt trái → phải.</p>
          <p className="mt-1">💡 Trên mobile: Vuốt trái/phải trên thẻ để chuyển slide.</p>
          <p className="mt-8 text-center text-gray-400">From Munich with love ❤️</p>
        </footer>
      </div>

      {/* Modals */}
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
        allData={currentGroup}
        currentImageIndex={currentImageIndex}
        onImageChange={setCurrentImageIndex}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        searchQuery={searchQuery}
        isSearching={isSearching}
        searchResults={searchResults}
        charDefinition={charDefinition}
        charExamples={charExamples}
        examplesIndex={examplesIndex}
        setExamplesIndex={setExamplesIndex}
        searchModalIndex={searchModalIndex}
        setSearchModalIndex={setSearchModalIndex}
        searchModalImageIndex={searchModalImageIndex}
        setSearchModalImageIndex={setSearchModalImageIndex}
        dictionaryResults={dictionaryResults}
        dictionaryIndex={dictionaryIndex}
        setDictionaryIndex={setDictionaryIndex}
      />
    </div>
  );
}

export default App;
