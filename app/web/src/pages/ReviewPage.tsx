import { useState } from 'react';
import { api } from '../api';
import { Err } from '../components/Err';
import { Spinner } from '../components/Spinner';
import { useData } from '../hooks/useData';
import type { FlashcardCard, FlashcardsResponse, Grade } from '../types';

export function ReviewPage() {
  const { data, error, loading, reload } = useData<FlashcardsResponse>('/flashcards');
  const [dueOnly, setDueOnly] = useState(true);
  const [lessonFilter, setLessonFilter] = useState('');
  const [flipped, setFlipped] = useState(false);
  const [idx, setIdx] = useState(0);
  if (loading) return <Spinner />;
  if (error) return <Err error={error} />;
  const today = new Date().toISOString().slice(0, 10);
  let cards: FlashcardCard[] = data!.cards;
  if (dueOnly) cards = cards.filter((c) => c.dueDate <= today);
  if (lessonFilter) cards = cards.filter((c) => c.lessonId === lessonFilter);
  const card = cards[Math.min(idx, Math.max(cards.length - 1, 0))];
  const lessons: string[] = Array.from(new Set(data!.cards.map((c) => c.lessonId)));
  const grade = async (g: Grade) => {
    if (!card) return;
    await api.post('/flashcards/review', { cardId: card.cardId, lessonId: card.lessonId, grade: g });
    setFlipped(false); setIdx((i) => i + 1); reload();
  };
  return (
    <main className="page page-narrow">
      <h1>Revision &amp; Flashcards</h1>
      <p className="page-sub">Due suggestions first — browse anything, in any order.</p>
      <div className="filter-row">
        <select className="input" value={lessonFilter} onChange={(e) => { setLessonFilter(e.target.value); setIdx(0); }} aria-label="Filter by lesson">
          <option value="">All lessons</option>
          {lessons.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <button className={`btn ${dueOnly ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { setDueOnly(!dueOnly); setIdx(0); }}>{dueOnly ? 'Showing due only' : 'Showing all'}</button>
      </div>
      {!card ? <div className="empty">No cards here. Nothing due — good state to be in.</div> : (
        <div className="card">
          <p className="meta">{card.lessonTitle} · card {Math.min(idx, Math.max(cards.length - 1, 0)) + 1} of {cards.length} {card.isNew && '· new'}</p>
          <div className="flashcard">
            <div className="flashcard-q">{card.q}</div>
            {flipped && <div className="flashcard-a">{card.a}</div>}
          </div>
          {!flipped ? (
            <button className="btn btn-primary" onClick={() => setFlipped(true)}>Reveal</button>
          ) : (
            <div className="grade-row">
              <button className="grade-btn grade-again" onClick={() => grade('again')}>Again</button>
              <button className="grade-btn grade-hard" onClick={() => grade('hard')}>Hard</button>
              <button className="grade-btn grade-good" onClick={() => grade('good')}>Good</button>
              <button className="grade-btn grade-easy" onClick={() => grade('easy')}>Easy</button>
            </div>
          )}
          <div className="btn-row" style={{ marginTop: '0.75rem' }}>
            <button className="btn btn-ghost" disabled={idx === 0} onClick={() => { setIdx(idx - 1); setFlipped(false); }}>← Previous</button>
            <button className="btn btn-ghost" disabled={idx >= cards.length - 1} onClick={() => { setIdx(idx + 1); setFlipped(false); }}>Next →</button>
          </div>
        </div>
      )}
    </main>
  );
}
