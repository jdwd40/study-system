import { useEffect, useRef } from 'react';
import type { KeyConcept } from '../types';

/**
 * Tutor-style key-concept explainer. Colourful and friendly, not an admin
 * dialog: labelled heading, close button, Escape/backdrop close, a light focus
 * trap, and initial focus on the close button. The opener restores focus.
 */
export function ConceptModal({ concept, lessonTitle, onClose }: { concept: KeyConcept; lessonTitle: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const trapTab = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return;
    const focusables = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusables.length === 0) return;
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onCloseRef.current(); }}
      onKeyDown={trapTab}
    >
      <div className="modal concept-modal" role="dialog" aria-modal="true" aria-labelledby="concept-modal-title" ref={modalRef}>
        <div className="concept-modal-head">
          <div>
            <p className="concept-eyebrow">Key concept · {lessonTitle}</p>
            <h2 className="concept-modal-title" id="concept-modal-title">{concept.term}</h2>
          </div>
          <button type="button" className="concept-close" onClick={() => onCloseRef.current()} aria-label="Close explainer" ref={closeRef}>
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="concept-modal-body">
          {concept.explanation ? (
            <p className="concept-explainer">{concept.explanation}</p>
          ) : (
            <p className="concept-explainer concept-fallback">
              No quick explainer for this one yet — the lesson content, examples and flashcards are the best place to pin it down.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
