/**
 * Pinyin tone conversion utilities
 * Converts numbered pinyin (e.g., "bu4 dao4") to toned pinyin (e.g., "bù dào")
 */

// Tone marks for each vowel
const toneMarks = {
  a: ['ā', 'á', 'ǎ', 'à', 'a'],
  e: ['ē', 'é', 'ě', 'è', 'e'],
  i: ['ī', 'í', 'ǐ', 'ì', 'i'],
  o: ['ō', 'ó', 'ǒ', 'ò', 'o'],
  u: ['ū', 'ú', 'ǔ', 'ù', 'u'],
  ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü'],
  v: ['ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü'], // v is often used for ü
};

/**
 * Convert a single pinyin syllable with number to toned version
 * @param {string} syllable - e.g., "bu4", "nv3", "lv4"
 * @returns {string} - e.g., "bù", "nǚ", "lǜ"
 */
function convertSyllable(syllable) {
  if (!syllable) return '';
  
  // Check if the last character is a tone number (1-5)
  const match = syllable.match(/^([a-zA-ZüÜ]+)([1-5])?$/);
  if (!match) return syllable;
  
  let [, letters, toneNum] = match;
  
  // If no tone number, return as is
  if (!toneNum) return letters;
  
  const tone = parseInt(toneNum) - 1; // 0-indexed
  letters = letters.toLowerCase();
  
  // Replace 'v' with 'ü' for processing
  letters = letters.replace(/v/g, 'ü');
  
  // Find where to place the tone mark
  // Rules:
  // 1. If there's an 'a' or 'e', put the tone on it
  // 2. If there's 'ou', put the tone on 'o'
  // 3. Otherwise, put the tone on the last vowel
  
  let result = letters;
  let toneApplied = false;
  
  // Rule 1: 'a' or 'e' gets the tone
  if (letters.includes('a')) {
    result = letters.replace('a', toneMarks.a[tone]);
    toneApplied = true;
  } else if (letters.includes('e')) {
    result = letters.replace('e', toneMarks.e[tone]);
    toneApplied = true;
  }
  
  // Rule 2: 'ou' - tone goes on 'o'
  if (!toneApplied && letters.includes('ou')) {
    result = letters.replace('o', toneMarks.o[tone]);
    toneApplied = true;
  }
  
  // Rule 3: Put tone on last vowel
  if (!toneApplied) {
    const vowels = ['i', 'o', 'u', 'ü'];
    // Find the last vowel
    for (let i = letters.length - 1; i >= 0; i--) {
      const char = letters[i];
      if (vowels.includes(char) && toneMarks[char]) {
        result = letters.substring(0, i) + toneMarks[char][tone] + letters.substring(i + 1);
        toneApplied = true;
        break;
      }
    }
  }
  
  return result;
}

/**
 * Convert full pinyin string with numbers to toned version
 * @param {string} pinyin - e.g., "bu4 dao4 chang2", "ni3 hao3"
 * @returns {string} - e.g., "bù dào cháng", "nǐ hǎo"
 */
export function convertPinyinTones(pinyin) {
  if (!pinyin || typeof pinyin !== 'string') return pinyin;
  
  // Split by spaces and non-alphanumeric characters (keeping delimiters)
  // This handles cases like "bu4dao4" and "bu4 dao4" and "bu4/dao4"
  const parts = pinyin.split(/(\s+|[,，、/\\·])/);
  
  return parts.map(part => {
    // If it's a delimiter, keep it
    if (/^(\s+|[,，、/\\·])$/.test(part)) return part;
    
    // Split by word boundaries within the part
    // Handle cases like "bu4dao4" -> ["bu4", "dao4"]
    const syllables = part.match(/[a-zA-ZüÜv]+[1-5]?/g);
    if (!syllables) return part;
    
    return syllables.map(convertSyllable).join('');
  }).join('');
}

/**
 * Check if a string contains numbered pinyin
 * @param {string} text 
 * @returns {boolean}
 */
export function hasNumberedPinyin(text) {
  if (!text || typeof text !== 'string') return false;
  return /[a-zA-Z]+[1-5]/.test(text);
}

export default convertPinyinTones;
