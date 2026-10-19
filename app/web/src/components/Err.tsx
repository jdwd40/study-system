import { ApiError } from '../api';

export function Err({ error }: { error: unknown }) {
  const msg = error instanceof ApiError ? error.message : 'Something went wrong';
  const sync = error instanceof ApiError && error.code === 'SYNC_ERROR';
  return <div className={sync ? 'banner banner-warn' : 'banner banner-error'} role="alert">{sync ? `Sync problem: ${msg}` : msg}</div>;
}
