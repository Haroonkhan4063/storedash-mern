import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Route guard. Unauthenticated visitors are redirected to sign-in; authenticated
 * non-administrators are returned to the storefront.
 * @param {{children: import('react').ReactNode, adminOnly?: boolean}} props
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-slate-400">
        <Loader2 className="animate-spin" size={22} />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
}
