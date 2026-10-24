import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Checkout from './pages/Checkout.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';

const AdminLayout = lazy(() => import('./components/admin/AdminLayout.jsx'));
const Overview = lazy(() => import('./pages/admin/Overview.jsx'));
const Products = lazy(() => import('./pages/admin/Products.jsx'));
const Orders = lazy(() => import('./pages/admin/Orders.jsx'));
const Customers = lazy(() => import('./pages/admin/Customers.jsx'));

const AdminFallback = <div className="grid min-h-screen place-items-center text-slate-400">Loading dashboard…</div>;

/**
 * Route table. The storefront renders inside the public shell; `/admin/*`
 * mounts the dashboard shell behind a role guard. The API enforces the same
 * authorization server-side, so the guard exists for navigation ergonomics.
 * Dashboard routes are code-split so storefront visitors never download the charting library.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <Suspense fallback={AdminFallback}>
              <AdminLayout />
            </Suspense>
          </ProtectedRoute>
        }
      >
        <Route index element={<Suspense fallback={AdminFallback}><Overview /></Suspense>} />
        <Route path="products" element={<Suspense fallback={AdminFallback}><Products /></Suspense>} />
        <Route path="orders" element={<Suspense fallback={AdminFallback}><Orders /></Suspense>} />
        <Route path="customers" element={<Suspense fallback={AdminFallback}><Customers /></Suspense>} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
