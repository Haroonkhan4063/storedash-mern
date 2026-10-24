import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

/**
 * Loads the product catalogue and exposes imperative mutators so views can
 * update local state optimistically after successful API calls.
 * @returns {{products: any[], setProducts: Function, loading: boolean, error: string, reload: () => Promise<void>}}
 */
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setProducts(await api.getProducts());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { products, setProducts, loading, error, reload };
}
