import { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Boxes, ReceiptText, Users, Store, LogOut, Menu, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { AdminProvider, useAdmin } from '../../context/AdminContext.jsx';
import Logo from '../layout/Logo.jsx';

const NAV_ITEMS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Inventory', icon: Boxes },
  { to: '/admin/orders', label: 'Orders', icon: ReceiptText },
  { to: '/admin/customers', label: 'Customers', icon: Users },
];

const itemClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-gradient-to-r from-neon-violet/25 to-neon-cyan/10 text-white ring-1 ring-neon-violet/40' : 'text-slate-400 hover:bg-white/5 hover:text-white'
  }`;

/**
 * Sidebar contents shared by the fixed desktop rail and the mobile drawer.
 * @param {{onNavigate?: () => void}} props
 */
function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-6">
        <Link to="/admin" onClick={onNavigate} aria-label="Dashboard home">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3" aria-label="Dashboard">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onNavigate} className={itemClass}>
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 p-3">
        <Link to="/" onClick={onNavigate} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white">
          <Store size={18} /> View storefront
        </Link>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"
        >
          <LogOut size={18} /> Sign out
        </button>
        <p className="truncate px-3.5 pt-2 text-xs text-slate-500">{user?.name}</p>
      </div>
    </div>
  );
}

/**
 * Responsive dashboard shell: fixed sidebar from the `lg` breakpoint upward,
 * slide-in drawer with a top bar on tablet and mobile.
 */
function Shell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();
  const { loading } = useAdmin();

  useEffect(() => {
    setDrawerOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="min-h-screen">
      <aside className="glass-strong fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/10 lg:block">
        <SidebarContent />
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-ink-950/80 px-4 backdrop-blur-xl lg:hidden">
        <Logo className="!text-lg" />
        <button type="button" onClick={() => setDrawerOpen(true)} className="rounded-lg p-2 text-slate-300 hover:bg-white/10" aria-label="Open navigation">
          <Menu size={22} />
        </button>
      </header>

      <div className={`fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm transition-opacity lg:hidden ${drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`glass-strong fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 lg:hidden ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`} aria-hidden={!drawerOpen}>
        <button type="button" onClick={() => setDrawerOpen(false)} className="absolute right-3 top-4 rounded-lg p-2 text-slate-400 hover:bg-white/10" aria-label="Close navigation">
          <X size={20} />
        </button>
        <SidebarContent onNavigate={() => setDrawerOpen(false)} />
      </aside>

      <main className="px-4 py-8 sm:px-8 lg:ml-64 lg:px-10">
        {loading ? (
          <div className="grid min-h-[60vh] place-items-center text-slate-400">
            <Loader2 className="animate-spin" size={26} />
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}

/** Admin route element: provides dashboard data context around the responsive shell. */
export default function AdminLayout() {
  return (
    <AdminProvider>
      <Shell />
    </AdminProvider>
  );
}
