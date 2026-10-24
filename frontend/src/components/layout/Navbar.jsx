import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, LayoutDashboard, LogIn, LogOut } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import Logo from './Logo.jsx';

const navClass = ({ isActive }) =>
  `inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
  }`;

/** Sticky glass navigation bar exposing storefront, dashboard, session and cart controls. */
export default function Navbar() {
  const { itemCount, setIsOpen } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" aria-label="StoreDash home">
          <Logo />
        </Link>

        <nav className="flex items-center gap-1" aria-label="Primary">
          <NavLink to="/" end className={navClass}>
            Shop
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={navClass}>
              <LayoutDashboard size={16} /> Dashboard
            </NavLink>
          )}
          {user ? (
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className={navClass({ isActive: false })}
              title={user.email}
            >
              <LogOut size={16} /> <span className="hidden sm:inline">Sign out</span>
            </button>
          ) : (
            <NavLink to="/login" className={navClass}>
              <LogIn size={16} /> <span className="hidden sm:inline">Sign in</span>
            </NavLink>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="glass relative ml-2 grid h-10 w-10 place-items-center rounded-xl text-slate-200 transition hover:border-neon-violet/60 hover:text-white"
            aria-label={`Open cart, ${itemCount} items`}
          >
            <ShoppingBag size={19} />
            {itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-to-r from-neon-violet to-neon-cyan px-1 text-[11px] font-bold text-ink-950">
                {itemCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
