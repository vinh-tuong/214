import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ExamplesCarousel } from '../components/carousel/ExamplesCarousel';
import DictionaryCarousel from '../components/carousel/DictionaryCarousel';
import { CharacterWriter } from '../components/carousel/CharacterWriter';
import { ImageCarousel } from '../components/carousel/ImageCarousel';
import { callApi } from '../lib/utils';
import { createRadicalMapping } from '../utils/radicalUtils';

/**
 * Character detail page - displays full information about a Chinese character
 */
export const CharacterPage = () => {
  const { character } = useParams();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [charDefinition, setCharDefinition] = useState(null);
  const [charExamples, setCharExamples] = useState(null);
  const [dictionaryResults, setDictionaryResults] = useState(null);
  const [radicalInfo, setRadicalInfo] = useState(null);
  const [examplesIndex, setExamplesIndex] = useState(0);
  const [dictionaryIndex, setDictionaryIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);

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
      
      if (response.entries) {
        return response.entries;
      } else if (response.result) {
        return response.result;
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
      
      if (response.examples && response.examples.length > 0) {
        return response.examples;
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
      
      if (response.results && response.results.length > 0) {
        return response.results;
      }
      return null;
    } catch (error) {
      console.error('Error fetching dictionary results:', error);
      return null;
    }
  }, []);

  // Search for radical info
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

  // Load all data
  useEffect(() => {
    if (!character) return;
    
    const loadData = async () => {
      setIsLoading(true);
      setExamplesIndex(0);
      setDictionaryIndex(0);
      setImageIndex(0);
      
      // Search for radical info (sync)
      const radicals = searchRadical(character);
      setRadicalInfo(radicals);
      
      // Fetch all data in parallel
      const [definition, examples, dictionary] = await Promise.all([
        fetchCharDefinition(character),
        fetchCharExamples(character),
        fetchDictionaryResults(character)
      ]);
      
      setCharDefinition(definition);
      setCharExamples(examples);
      setDictionaryResults(dictionary);
      setIsLoading(false);
    };
    
    loadData();
  }, [character, fetchCharDefinition, fetchCharExamples, fetchDictionaryResults, searchRadical]);

  // Check if character contains Chinese characters
  const hasChinese = character && [...character].some(ch => /[\u4e00-\u9fff]/.test(ch));

  return (
    <div className="min-h-screen bg-amber-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="outline" className="rounded-full">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Ký tự: {character}
          </h1>
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

            {/* Character Examples */}
            {charExamples && charExamples.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-semibold text-green-700 mb-4">Từ vựng liên quan</h2>
                <ExamplesCarousel 
                  examples={charExamples}
                  currentIndex={examplesIndex}
                  onIndexChange={setExamplesIndex}
                />
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

            {/* No results */}
            {!radicalInfo && !charDefinition && !charExamples && !dictionaryResults && (
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
          <Link to="/" className="text-blue-500 hover:underline">
            ← Quay về trang chủ
          </Link>
          <p className="mt-4 text-gray-400">From Munich with love ❤️</p>
        </footer>
      </div>
    </div>
  );
};

export default CharacterPage;
