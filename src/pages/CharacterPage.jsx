import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search } from 'lucide-react';
import DictionaryCarousel from '../components/carousel/DictionaryCarousel';
import { CharacterWriter } from '../components/carousel/CharacterWriter';
import { ImageCarousel } from '../components/carousel/ImageCarousel';
import { callApi } from '../lib/utils';
import { createRadicalMapping } from '../utils/radicalUtils';

/**
 * Character detail page - displays full information about a Chinese character
 */
export const CharacterPage = () => {
  const { character: rawCharacter } = useParams();
  const navigate = useNavigate();
  
  // Decode URL-encoded character
  const character = rawCharacter ? decodeURIComponent(rawCharacter) : '';
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [charDefinition, setCharDefinition] = useState(null);
  const [charExamples, setCharExamples] = useState(null);
  const [dictionaryResults, setDictionaryResults] = useState(null);
  const [radicalInfo, setRadicalInfo] = useState(null);
  const [decomposedRadicals, setDecomposedRadicals] = useState(null);
  const [dictionaryIndex, setDictionaryIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [showAllExamples, setShowAllExamples] = useState(false);

  // Create radical mapping
  const radicalMapping = React.useMemo(() => createRadicalMapping(), []);

  // Fetch character definition
  const fetchCharDefinition = useCallback(async (text) => {
    try {
      const chars = [...text];
      let response;
      
      if (chars.length > 1) {
        response = await callApi(`/api/define-many?text=${encodeURIComponent(text)}&variant=s`);
      } else {
        response = await callApi(`/api/define?char=${encodeURIComponent(text)}&variant=s`);
      }
      
      if (!response.ok) return null;
      const data = await response.json();
      
      if (data.entries) {
        return data.entries;
      } else if (data.result) {
        return data.result;
      }
      return null;
    } catch (error) {
      console.error('Error fetching definition:', error);
      return null;
    }
  }, []);

  // Fetch character examples
  const fetchCharExamples = useCallback(async (text) => {
    try {
      const chars = [...text].filter(ch => /[\u4e00-\u9fff]/.test(ch));
      if (chars.length === 0) return null;
      
      const firstChar = chars[0];
      const response = await callApi(`/api/examples?char=${encodeURIComponent(firstChar)}`);
      
      if (!response.ok) return null;
      const data = await response.json();
      
      if (data.examples && data.examples.length > 0) {
        return data.examples;
      }
      return null;
    } catch (error) {
      console.error('Error fetching examples:', error);
      return null;
    }
  }, []);

  // Fetch dictionary results
  const fetchDictionaryResults = useCallback(async (text) => {
    try {
      const response = await callApi(`/api/dictionary-search?text=${encodeURIComponent(text)}&mode=all`);
      
      if (!response.ok) return null;
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results;
      }
      return null;
    } catch (error) {
      console.error('Error fetching dictionary results:', error);
      return null;
    }
  }, []);

  // Search for radical info (check if character IS a radical)
  const searchRadical = useCallback((query) => {
    if (!query) return null;
    
    const chars = [...query];
    const results = [];
    
    for (const char of chars) {
      if (radicalMapping.has(char)) {
        const radical = radicalMapping.get(char);
        if (!results.find(r => r.stt === radical.stt)) {
          results.push(radical);
        }
      }
    }
    
    return results.length > 0 ? results : null;
  }, [radicalMapping]);

  // Decompose character to find its radicals
  const fetchDecomposition = useCallback(async (text) => {
    try {
      const chars = [...text].filter(ch => /[\u4e00-\u9fff]/.test(ch));
      if (chars.length === 0) return null;
      
      const results = [];
      
      for (const char of chars) {
        // Skip if the character itself is a radical
        if (radicalMapping.has(char)) continue;
        
        const response = await callApi(`/api/decompose?ch=${encodeURIComponent(char)}`);
        if (!response.ok) continue;
        
        const data = await response.json();
        
        // Get components from level 2 (radical level)
        const components = data.components2 || data.components || [];
        
        // Find radicals in the components
        for (const component of components) {
          if (radicalMapping.has(component)) {
            const radical = radicalMapping.get(component);
            if (!results.find(r => r.stt === radical.stt)) {
              results.push({
                ...radical,
                fromChar: char
              });
            }
          }
        }
      }
      
      return results.length > 0 ? results : null;
    } catch (error) {
      console.error('Error fetching decomposition:', error);
      return null;
    }
  }, [radicalMapping]);

  // Load all data
  useEffect(() => {
    if (!character) return;
    
    const loadData = async () => {
      setIsLoading(true);
      setDictionaryIndex(0);
      setImageIndex(0);
      setShowAllExamples(false);
      
      // Search for radical info (sync) - check if character IS a radical
      const radicals = searchRadical(character);
      setRadicalInfo(radicals);
      
      // Fetch all data in parallel
      const [definition, examples, dictionary, decomposed] = await Promise.all([
        fetchCharDefinition(character),
        fetchCharExamples(character),
        fetchDictionaryResults(character),
        fetchDecomposition(character)
      ]);
      
      setCharDefinition(definition);
      setCharExamples(examples);
      setDecomposedRadicals(decomposed);
      setDictionaryResults(dictionary);
      setIsLoading(false);
    };
    
    loadData();
  }, [character, fetchCharDefinition, fetchCharExamples, fetchDictionaryResults, fetchDecomposition, searchRadical]);

  // Check if character contains Chinese characters
  const hasChinese = character && [...character].some(ch => /[\u4e00-\u9fff]/.test(ch));

  // Empty state - show search page like HanziCraft
  if (!character) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col">
        {/* Main content - centered */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-center max-w-2xl mx-auto">
            {/* Logo/Title */}
            <h1 className="text-4xl sm:text-5xl font-bold text-amber-800 mb-4">
              漢字 <span className="text-amber-600">Hán Tự</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Tra cứu thông tin chi tiết về ký tự Trung Quốc: nét viết, bộ thủ, định nghĩa, từ vựng phổ biến
            </p>
            
            {/* Search Box */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <p className="text-gray-500 mb-4 text-sm">
                Nhập ký tự Trung Quốc để bắt đầu khám phá
              </p>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Ví dụ: 安, 好, 中国..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && searchInput.trim()) {
                        navigate(`/character/${encodeURIComponent(searchInput.trim())}`);
                      }
                    }}
                    className="w-full px-4 py-3 pl-12 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    style={{ fontSize: '18px' }}
                    autoFocus
                  />
                  <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <Button
                  onClick={() => {
                    if (searchInput.trim()) {
                      navigate(`/character/${encodeURIComponent(searchInput.trim())}`);
                    }
                  }}
                  disabled={!searchInput.trim()}
                  className="px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
                >
                  Tìm kiếm
                </Button>
              </div>
            </div>
            
            {/* Quick examples */}
            <div className="mt-8">
              <p className="text-gray-500 text-sm mb-3">Ví dụ nhanh:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['安', '好', '中', '国', '人', '心', '水', '火', '木', '金'].map((char) => (
                  <Link
                    key={char}
                    to={`/character/${encodeURIComponent(char)}`}
                    className="px-4 py-2 bg-white rounded-full text-xl font-medium text-amber-700 hover:bg-amber-100 transition-colors shadow-sm border border-amber-200"
                  >
                    {char}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="text-center py-6 text-sm text-gray-500">
          <Link to="/" className="text-amber-600 hover:underline">
            ← Quay về trang Flashcards
          </Link>
          <p className="mt-2 text-gray-400">From Munich with love ❤️</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link to="/character">
              <Button variant="outline" className="rounded-full">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Ký tự: {character}
            </h1>
          </div>
          
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm ký tự khác..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && searchInput.trim()) {
                    navigate(`/character/${encodeURIComponent(searchInput.trim())}`);
                    setSearchInput('');
                  }
                }}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ fontSize: '16px' }}
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <Button
              onClick={() => {
                if (searchInput.trim()) {
                  navigate(`/character/${encodeURIComponent(searchInput.trim())}`);
                  setSearchInput('');
                }
              }}
              disabled={!searchInput.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tìm
            </Button>
          </div>
        </header>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải thông tin...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Radical Info */}
            {radicalInfo && radicalInfo.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-semibold text-emerald-700 mb-4">Thông tin bộ thủ</h2>
                {radicalInfo.map((radical, idx) => (
                  <div key={idx} className="text-center mb-4">
                    <div className="text-4xl sm:text-5xl font-bold text-emerald-700 mb-3">
                      {radical.boThu}
                    </div>
                    <div className="text-base sm:text-lg text-gray-700 mb-4">
                      <span className="font-bold">{radical.tenBoThu}</span>
                      <span className="mx-2">•</span>
                      <span>{radical.phienAm}</span>
                      <span className="mx-2">•</span>
                      <span className="italic">{radical.yNghia}</span>
                    </div>
                    {radical.hinhAnh && radical.hinhAnh.length > 0 && (
                      <ImageCarousel
                        images={radical.hinhAnh}
                        currentIndex={imageIndex}
                        onImageChange={setImageIndex}
                        alt={radical.tenBoThu}
                        size="medium"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Character Writer - Stroke Animation */}
            {hasChinese && (
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-semibold text-amber-700 mb-4">Nét viết</h2>
                <div className="flex flex-wrap justify-center gap-6">
                  {[...character]
                    .filter(ch => /[\u4e00-\u9fff]/.test(ch))
                    .map((char, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <CharacterWriter character={char} size={150} />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Decomposed Radicals - Radicals found in the character */}
            {decomposedRadicals && decomposedRadicals.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-semibold text-teal-700 mb-4">
                  Bộ thủ của "{character}"
                </h2>
                <div className="space-y-4">
                  {decomposedRadicals.map((radical, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-teal-50 rounded-xl">
                      <Link 
                        to={`/character/${encodeURIComponent(radical.boThu)}`}
                        className="text-4xl font-bold text-teal-700 hover:text-teal-900 transition-colors"
                      >
                        {radical.boThu}
                      </Link>
                      <div className="flex-1">
                        <div className="font-bold text-teal-800">
                          {radical.tenBoThu}
                        </div>
                        <div className="text-sm text-teal-600">
                          {radical.phienAm} • <span className="italic">{radical.yNghia}</span>
                        </div>
                        {radical.fromChar && radical.fromChar !== character && (
                          <div className="text-xs text-teal-500 mt-1">
                            Từ ký tự: {radical.fromChar}
                          </div>
                        )}
                      </div>
                      {radical.hinhAnh && radical.hinhAnh.length > 0 && (
                        <img 
                          src={`/images/${radical.hinhAnh[0]}`} 
                          alt={radical.tenBoThu}
                          className="w-16 h-16 object-contain rounded-lg bg-white"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Character Definition */}
            {charDefinition && (
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-semibold text-blue-700 mb-4">Định nghĩa</h2>
                {Array.isArray(charDefinition) ? (
                  <div className="space-y-2">
                    {charDefinition.map((entry, index) => (
                      <div key={index} className="text-gray-700 p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium text-blue-800">{entry.pinyin}</span>
                        <span className="mx-2">•</span>
                        <span>{entry.definition}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(charDefinition).map(([char, definitions]) => (
                      <div key={char} className="border-l-4 border-blue-300 pl-4">
                        <div className="font-bold text-blue-900 text-xl mb-2">{char}</div>
                        <div className="space-y-2">
                          {definitions.map((entry, index) => (
                            <div key={index} className="text-gray-700 p-2 bg-blue-50 rounded-lg">
                              <span className="font-medium text-blue-800">{entry.pinyin}</span>
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
            )}

            {/* Character Examples - High Frequency Words (like HanziCraft) */}
            {charExamples && charExamples.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-semibold text-green-700 mb-4">
                  Từ vựng phổ biến chứa "{character}"
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({charExamples.flat().length} từ)
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {charExamples.flat().slice(0, 15).map((example, index) => (
                    <Link
                      key={index}
                      to={`/character/${encodeURIComponent(example.simplified)}`}
                      className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-100"
                    >
                      <div className="text-xl font-bold text-green-800 mb-1">
                        {example.simplified}
                      </div>
                      <div className="text-sm text-green-600 mb-1">
                        {example.pinyin}
                      </div>
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {example.definition}
                      </div>
                    </Link>
                  ))}
                </div>
                {charExamples.flat().length > 15 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setShowAllExamples(!showAllExamples)}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      {showAllExamples ? 'Thu gọn' : `Xem thêm ${charExamples.flat().length - 15} từ...`}
                    </button>
                  </div>
                )}
                {showAllExamples && charExamples.flat().length > 15 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                    {charExamples.flat().slice(15).map((example, index) => (
                      <Link
                        key={index + 15}
                        to={`/character/${encodeURIComponent(example.simplified)}`}
                        className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-100"
                      >
                        <div className="text-xl font-bold text-green-800 mb-1">
                          {example.simplified}
                        </div>
                        <div className="text-sm text-green-600 mb-1">
                          {example.pinyin}
                        </div>
                        <div className="text-sm text-gray-600 line-clamp-2">
                          {example.definition}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Dictionary Results */}
            {dictionaryResults && dictionaryResults.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-semibold text-purple-700 mb-4">Từ điển</h2>
                <DictionaryCarousel 
                  dictionaryResults={dictionaryResults}
                  currentIndex={dictionaryIndex}
                  onIndexChange={setDictionaryIndex}
                />
              </div>
            )}

            {/* No results - only show if no Chinese character and no other data */}
            {!hasChinese && !radicalInfo && !charDefinition && !charExamples && !dictionaryResults && (
              <div className="bg-white rounded-2xl shadow p-6 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-600 text-lg mb-2">
                  Không tìm thấy thông tin cho "{character}"
                </p>
                <p className="text-gray-500 text-sm">
                  Thử tìm kiếm với ký tự khác
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-gray-500">
          <Link to="/character" className="text-blue-500 hover:underline">
            ← Quay về trang tra cứu
          </Link>
          <p className="mt-4 text-gray-400">From Munich with love ❤️</p>
        </footer>
      </div>
    </div>
  );
};

export default CharacterPage;
