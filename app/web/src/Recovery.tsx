import React, { useState } from 'react';
import { api } from './api';

export function RecoverySettings() {
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [codes, setCodes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  return <main className="page page-narrow">
    <h1>Account recovery</h1>
    <p>Keep recovery codes offline, separate from your password. Each code can reset your password once.</p>
    {codes.length > 0 ? <section className="card" aria-label="New recovery codes">
      <h2>Save these codes now</h2>
      <p>Shown once. They cannot be retrieved after leaving this page. Do not share them in chat.</p>
      <ol>{codes.map((code) => <li key={code}><code style={{ overflowWrap: 'anywhere' }}>{code}</code></li>)}</ol>
      <button className="btn btn-primary" type="button" onClick={() => { setCodes([]); setMessage('Codes hidden. Keep your offline copy safe.'); }}>I saved my codes — hide them</button>
    </section> : <form className="card" onSubmit={async (event) => {
      event.preventDefault();
      if (busy || !confirmed) return;
      setBusy(true); setMessage('');
      try {
        const result = await api.post<{ codes: string[] }>('/auth/recovery-codes', { password });
        setCodes(result.codes); setConfirmed(false);
      } catch { setMessage('Could not rotate codes. Check your password or try again later.'); }
      finally { setPassword(''); setBusy(false); }
    }}>
      <label className="field"><span className="field-label">Current password</span><input className="input" type="password" autoComplete="current-password" required maxLength={256} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      <label className="field"><span><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} required /> I understand this will invalidate all previous recovery codes.</span></label>
      <button className="btn btn-primary" disabled={busy || !confirmed} type="submit">Generate new recovery codes</button>
    </form>}
    <p role="status">{message}</p>
  </main>;
}

export function RecoveryForm() {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  return <form className="card" onSubmit={async (event) => {
    event.preventDefault();
    if (busy) return;
    if (password !== confirmation) { setMessage('Passwords do not match.'); return; }
    setBusy(true);
    setMessage('');
    try {
      await api.post('/auth/recover', { code, password });
      setMessage('Password reset. Sign in with your new password. All previous sessions were signed out.');
    } catch { setMessage('Recovery failed. Check your code and password, or try again later.'); }
    finally { setCode(''); setPassword(''); setConfirmation(''); setBusy(false); }
  }}>
    <h2>Forgot password</h2>
    <p>Use one unused recovery code. New passwords must be 12–256 characters. Codes are case-sensitive.</p>
    <label className="field"><span className="field-label">Recovery code</span><input className="input" type="password" autoComplete="off" spellCheck={false} required maxLength={32} minLength={32} value={code} onChange={(e) => setCode(e.target.value)} /></label>
    <label className="field"><span className="field-label">New password</span><input className="input" type="password" autoComplete="new-password" required minLength={12} maxLength={256} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
    <label className="field"><span className="field-label">Confirm new password</span><input className="input" type="password" autoComplete="new-password" required minLength={12} maxLength={256} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} /></label>
    <button className="btn btn-primary" disabled={busy} type="submit">Reset password</button>
    <p role="status">{message}</p>
  </form>;
}
