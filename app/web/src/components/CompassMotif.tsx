/** Small decorative compass motif. Purely visual — hidden from assistive tech. */
export function CompassMotif({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false" className="compass-motif">
      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <circle cx="32" cy="32" r="3" fill="currentColor" opacity="0.6" />
      <path d="M32 10 L36 32 L32 54 L28 32 Z" fill="currentColor" opacity="0.5" />
      <path d="M10 32 L32 28 L54 32 L32 36 Z" fill="currentColor" opacity="0.25" />
      <path d="M32 14 L34.5 32 L32 50 L29.5 32 Z" fill="currentColor" opacity="0.85" />
      <circle cx="32" cy="6" r="1.6" fill="currentColor" opacity="0.6" />
      <circle cx="58" cy="32" r="1.2" fill="currentColor" opacity="0.45" />
      <circle cx="6" cy="32" r="1.2" fill="currentColor" opacity="0.45" />
      <circle cx="32" cy="58" r="1.2" fill="currentColor" opacity="0.45" />
    </svg>
  );
}
