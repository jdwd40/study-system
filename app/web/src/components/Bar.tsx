export function Bar({ percent }: { percent: number }) {
  return (
    <div>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
      <div className="progress-label">{percent}% of lessons complete</div>
    </div>
  );
}
