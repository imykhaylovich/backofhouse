import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Tiny fetch hook: { data, loading, error, refresh }.
 * refresh() keeps the current data on screen while it reloads.
 */
export function useApi(fn, deps = []) {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });

  const [state, setState] = useState({ data: null, loading: true, error: null });

  const load = useCallback(async () => {
    try {
      const data = await fnRef.current();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error });
    }
  }, []);

  const key = JSON.stringify(deps);
  useEffect(() => {
    void key; // refetch whenever the caller's deps change
    load();
  }, [key, load]);

  return { ...state, refresh: load };
}
