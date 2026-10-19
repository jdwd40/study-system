export function Pill({ status }: { status: string }) {
  return <span className={`pill pill-${status}`}>{status.replace('_', ' ')}</span>;
}
