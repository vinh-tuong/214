// api/_utils/hanzi.js
import Hanzi from 'hanzi';

let started = false;

/** Ensure hanzi data is loaded exactly once */
export function ensureHanzi() {
  if (!started) {
    Hanzi.start(); // loads decomposition + CC-CEDICT data
    started = true;
  }
  return Hanzi;
}
