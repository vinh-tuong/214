import RADICALS from "../data/radicals";
import { VARIANT_TO_RADICAL } from "../data/radical-variants";

/**
 * Extract all variants from boThu field
 * @param {string} boThu - Radical field (e.g., "人 (亻)" or "齒(齿, 歯 )")
 * @returns {string[]} Array of variant characters
 */
export const extractRadicalVariants = (boThu) => {
  const variants = [];
  
  // Extract main radical (before parentheses) - handle both " (..." and "(..." cases
  const mainRadical = boThu.split(/[ (]/)[0];
  variants.push(mainRadical);
  
  // Extract variants in parentheses
  const parenthesesMatch = boThu.match(/\(([^)]+)\)/);
  if (parenthesesMatch) {
    const variantsInParens = parenthesesMatch[1].split(/[,，、]/);
    variants.push(...variantsInParens.map(v => v.trim()));
  }
  
  return variants;
};

/**
 * Create a mapping of all radical variants to radical data
 * @returns {Map<string, Object>} Mapping of variant characters to radical objects
 */
export const createRadicalMapping = () => {
  const mapping = new Map();
  
  RADICALS.forEach(radical => {
    // Extract variants from boThu field (e.g., "人 (亻)" -> ["人", "亻"])
    const variants = extractRadicalVariants(radical.boThu);
    variants.forEach(variant => {
      mapping.set(variant, radical);
    });
    
    // Also map from VARIANT_TO_RADICAL if the canonical radical matches
    const canonicalRadical = radical.boThu.split(' (')[0]; // Get main radical
    Object.entries(VARIANT_TO_RADICAL).forEach(([variant, canonical]) => {
      if (canonical === canonicalRadical) {
        mapping.set(variant, radical);
      }
    });
  });
  
  return mapping;
};

/**
 * Group radicals by stroke count
 * @param {Array} data - Array of radical objects
 * @returns {Object} Object with stroke count as keys and arrays of radicals as values
 */
export const groupByStroke = (data) => {
  return data.reduce((acc, item) => {
    const k = item.soNet;
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
};

/**
 * Format ghepTu information for display
 * @param {Array} ghepTu - Array of STT numbers
 * @param {Function} getRadicalByStt - Function to get radical by STT
 * @returns {string|null} Formatted string or null if empty
 */
export const formatGhepTu = (ghepTu, getRadicalByStt) => {
  if (!ghepTu || ghepTu.length === 0) return null;
  
  const components = ghepTu.map(stt => {
    const radical = getRadicalByStt(stt);
    return radical ? `${radical.boThu} (${radical.tenBoThu})` : `STT ${stt}`;
  });
  
  return `Ghép từ: ${components.join(' và ')}`;
};
