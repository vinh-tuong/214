import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Universal API call function that handles localhost vs production environments
 * @param {string} path - API path (e.g., '/api/decompose?ch=好')
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function callApi(path, options = {}) {
  // Determine base URL based on environment
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.includes('localhost'));
  
  const baseUrl = isLocalhost 
    ? 'https://214-hsk.vercel.app'  // Use production API for localhost
    : '';  // Use relative path for production
  
  const url = `${baseUrl}${path}`;
  
  // Add default headers
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  
  try {
    const response = await fetch(url, defaultOptions);
    return response;
  } catch (error) {
    console.error(`API call failed for ${url}:`, error);
    throw error;
  }
}
