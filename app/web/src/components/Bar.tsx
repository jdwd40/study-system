export function Bar({ percent, label = true }: { percent: number; label?: boolean }) {
  return (
    <div>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
      {label && <div className="progress-label">{percent}% of available lessons studied</div>}
    </div>
  );
}
