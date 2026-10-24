import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import Logo from './Logo.jsx';
import { BRAND } from '../../config/brand.js';

const ASSURANCES = [
  { icon: Truck, text: 'Tracked worldwide shipping' },
  { icon: RotateCcw, text: '30-day hassle-free returns' },
  { icon: ShieldCheck, text: 'Two-year warranty on every device' },
];

/** Site footer with brand statement, service assurances, and attribution. */
export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-ink-900/60">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Considered hardware for people who build, create and play. Every product is inspected, tested and backed by real support.
            </p>
          </div>

          <nav aria-label="Footer">
            <h3 className="font-display text-sm font-semibold text-white">Explore</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li><Link to="/" className="transition hover:text-white">Shop all products</Link></li>
              <li><Link to="/checkout" className="transition hover:text-white">Checkout</Link></li>
              <li><Link to="/login" className="transition hover:text-white">Account</Link></li>
            </ul>
          </nav>

          <div>
            <h3 className="font-display text-sm font-semibold text-white">Our promise</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              {ASSURANCES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5">
                  <Icon size={16} className="text-neon-cyan" /> {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <p className="font-medium text-slate-300">Fully Developed by {BRAND.author}</p>
        </div>
      </div>
    </footer>
  );
}
