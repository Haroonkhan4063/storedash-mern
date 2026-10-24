import { useEffect, useState } from 'react';

/**
 * Delays propagation of a rapidly changing value.
 * @template T
 * @param {T} value
 * @param {number} [delay=250] Milliseconds to wait after the last change.
 * @returns {T}
 */
export function useDebounce(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
