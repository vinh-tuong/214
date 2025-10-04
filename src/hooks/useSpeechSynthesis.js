import { useState, useEffect, useCallback } from 'react';

export const useSpeechSynthesis = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    // Check if speech synthesis is supported
    if ('speechSynthesis' in window) {
      setIsSupported(true);
      
      // Load available voices
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      // Load voices immediately
      loadVoices();

      // Load voices when they change
      speechSynthesis.addEventListener('voiceschanged', loadVoices);


      return () => {
        speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  const speak = useCallback((text, options = {}) => {
    if (!isSupported) {
      console.warn('Speech synthesis is not supported in this browser');
      return;
    }

    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Default options
    const defaultOptions = {
      rate: 0.8,        // Slower speech for better pronunciation
      pitch: 1.0,       // Normal pitch
      volume: 1.0,      // Full volume
      lang: 'zh-CN',    // Chinese language for better pronunciation
    };

    // Merge with provided options
    Object.assign(utterance, defaultOptions, options);

    // Try to find the best Chinese voice
    const chineseVoices = voices.filter(voice => 
      voice.lang.startsWith('zh') || 
      voice.name.toLowerCase().includes('chinese') ||
      voice.name.toLowerCase().includes('mandarin') ||
      voice.name.toLowerCase().includes('cantonese') ||
      voice.name.toLowerCase().includes('taiwan') ||
      voice.name.toLowerCase().includes('hong kong')
    );
    

    // Priority order for Chinese voices
    const preferredVoices = [
      'Microsoft Huihui Desktop - Chinese (Simplified, PRC)',
      'Microsoft Yaoyao Desktop - Chinese (Simplified, PRC)', 
      'Microsoft Kangkang Desktop - Chinese (Simplified, PRC)',
      'Google 普通话（中国大陆）',
      'Google 中文（中国）',
      'Samantha (Enhanced)',
      'Ting-Ting'
    ];

    let selectedVoice = null;
    
    // First try to find preferred voices
    for (const preferredName of preferredVoices) {
      selectedVoice = chineseVoices.find(voice => 
        voice.name.includes(preferredName) || 
        voice.name === preferredName
      );
      if (selectedVoice) break;
    }
    
    // If no preferred voice found, use any Chinese voice
    if (!selectedVoice && chineseVoices.length > 0) {
      selectedVoice = chineseVoices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    // Start speaking
    speechSynthesis.speak(utterance);
  }, [isSupported, voices]);

  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported && isSpeaking && !isPaused) {
      speechSynthesis.pause();
    }
  }, [isSupported, isSpeaking, isPaused]);

  const resume = useCallback(() => {
    if (isSupported && isSpeaking && isPaused) {
      speechSynthesis.resume();
    }
  }, [isSupported, isSpeaking, isPaused]);

  return {
    isSupported,
    isSpeaking,
    isPaused,
    voices,
    speak,
    stop,
    pause,
    resume,
  };
};
