export function Stars({ value }: { value: number | null }) {
  if (value === null) return <span className="stars stars-empty" aria-label="not rated">☆☆☆☆☆</span>;
  return <span className="stars" aria-label={`rated ${value} of 5`}>{'★'.repeat(value)}{'☆'.repeat(5 - value)}</span>;
}
