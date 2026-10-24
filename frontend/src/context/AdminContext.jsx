import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

const AdminContext = createContext(null);

/**
 * Shared data layer for every dashboard view. Core collections load once when
 * the admin shell mounts, so moving between sections never refetches them;
 * analytics are re-queried when the reporting window changes or when a
 * mutation could alter the aggregates.
 * @param {{children: import('react').ReactNode}} props
 */
export function AdminProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = useCallback(async (range) => {
    try {
      setAnalytics(await api.getAnalytics(range));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    Promise.all([api.getProducts(), api.getOrders(), api.getCustomers()])
      .then(([productList, orderList, customerList]) => {
        setProducts(productList);
        setOrders(orderList);
        setCustomers(customerList);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadAnalytics(days);
  }, [days, loadAnalytics]);

  const actions = useMemo(() => {
    const replaceProduct = (updated) => setProducts((list) => list.map((p) => (p._id === updated._id ? updated : p)));

    const guard = async (task) => {
      try {
        return await task();
      } catch (err) {
        setError(err.message);
        return undefined;
      }
    };

    return {
      dismissError: () => setError(''),
      saveProduct: async (id, payload) => {
        if (id) {
          replaceProduct(await api.updateProduct(id, payload));
        } else {
          const created = await api.createProduct(payload);
          setProducts((list) => [created, ...list]);
        }
        loadAnalytics(days);
      },
      deleteProduct: (product) =>
        guard(async () => {
          await api.deleteProduct(product._id);
          setProducts((list) => list.filter((p) => p._id !== product._id));
          loadAnalytics(days);
        }),
      adjustStock: (product, delta) =>
        guard(async () => {
          replaceProduct(await api.updateProduct(product._id, { stockLevel: Math.max(0, product.stockLevel + delta) }));
          loadAnalytics(days);
        }),
      changeOrderStatus: (order, status) =>
        guard(async () => {
          const updated = await api.updateOrderStatus(order._id, status);
          setOrders((list) => list.map((o) => (o._id === updated._id ? updated : o)));
          const [fresh] = await Promise.all([api.getCustomers(), loadAnalytics(days)]);
          setCustomers(fresh);
        }),
    };
  }, [days, loadAnalytics]);

  const value = useMemo(
    () => ({ products, orders, customers, analytics, days, setDays, loading, error, ...actions }),
    [products, orders, customers, analytics, days, loading, error, actions]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

/** @returns {ReturnType<typeof Object>} Dashboard data and mutation helpers. */
export const useAdmin = () => useContext(AdminContext);
