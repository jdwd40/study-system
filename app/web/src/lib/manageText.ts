import type { Flashcard, KeyConcept } from '../../../src/shared/types.js';

export const lines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean);
export const unlines = (a: string[]) => a.join('\n');
/** Concepts edit as "Term" or "Term :: explanation" lines (canonical form). */
export const conceptsToText = (cs: KeyConcept[]) =>
  cs.map((c) => (c.explanation ? `${c.term} :: ${c.explanation}` : c.term)).join('\n');
export const cardsToText = (cards: Flashcard[]) => cards.map((c) => `Q: ${c.q} | A: ${c.a}`).join('\n');
export const textToCards = (s: string): Flashcard[] =>
  lines(s).map((l) => {
    const m = l.match(/^Q:\s*(.+?)\s*\|\s*A:\s*(.+)$/);
    return m ? { q: m[1]!, a: m[2]! } : { q: l, a: '' };
  }).filter((c) => c.q && c.a);
