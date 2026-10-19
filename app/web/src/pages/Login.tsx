import { useState } from 'react';
import { api } from '../api';

export function Login({ onLogin, devBypass }: { onLogin: () => void; devBypass: boolean }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/login', { password });
      onLogin();
    } catch {
      setError('Incorrect password');
    }
  };
  return (
    <main className="page page-narrow">
      <h1>Study System</h1>
      <p className="page-sub">Sign in to continue.</p>
      {devBypass && <div className="banner banner-info">Development bypass is active — any password continues.</div>}
      {error && <div className="banner banner-error" role="alert">{error}</div>}
      <form onSubmit={submit} className="card">
        <label className="field">
          <span className="field-label">Password</span>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        </label>
        <button className="btn btn-primary" type="submit">Sign in</button>
      </form>
    </main>
  );
}
