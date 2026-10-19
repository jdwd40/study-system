export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`modal ${wide ? 'modal-wide' : ''}`}>
        <h2 style={{ marginTop: 0 }}>{title}</h2>
        {children}
        <div className="btn-row" style={{ marginTop: '1rem' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
