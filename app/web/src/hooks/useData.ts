import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';

export function useData<T>(path: string, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    api.get<T>(path).then(setData).catch(setError).finally(() => setLoading(false));
  }, [path, ...deps]);
  useEffect(() => { reload(); }, [reload]);
  return { data, error, loading, reload };
}
