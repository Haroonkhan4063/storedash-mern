import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck, Zap, PackageCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { BRAND } from '../config/brand.js';
import Logo from '../components/layout/Logo.jsx';

const HIGHLIGHTS = [
  { icon: Zap, title: 'Faster checkout', text: 'Saved details across every order.' },
  { icon: PackageCheck, title: 'Order tracking', text: 'Follow each shipment from dock to door.' },
  { icon: ShieldCheck, title: 'Secure by design', text: 'Encrypted sessions and hashed credentials.' },
];

/**
 * Combined sign-in and registration screen. Administrators are routed to the
 * dashboard after authentication; customers return to the storefront.
 */
export default function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;

  const bind = (field) => ({
    value: form[field],
    onChange: (event) => setForm((current) => ({ ...current, [field]: event.target.value })),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const account = mode === 'login' ? await login(form.email, form.password) : await register(form.name, form.email, form.password);
      toast.success(mode === 'login' ? `Welcome back, ${account.name}!` : `Welcome to ${BRAND.name}, ${account.name}!`);
      navigate(account.role === 'admin' ? '/admin' : '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2">
      <div className="hidden lg:block">
        <Logo className="!text-2xl" />
        <h1 className="mt-8 font-display text-4xl font-extrabold leading-tight">Everything you order, in one place.</h1>
        <p className="mt-4 max-w-md text-slate-400">Sign in to manage orders, check out faster, and pick up where you left off.</p>
        <ul className="mt-10 space-y-5">
          {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-neon-violet/30 to-neon-cyan/20 text-neon-cyan ring-1 ring-white/10">
                <Icon size={20} />
              </span>
              <div>
                <p className="font-semibold text-white">{title}</p>
                <p className="text-sm text-slate-400">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="glass-strong mx-auto w-full max-w-md space-y-5 rounded-3xl p-8 shadow-glow">
        <div>
          <h2 className="text-2xl font-bold">{isLogin ? 'Welcome back' : 'Create your account'}</h2>
          <p className="mt-1 text-sm text-slate-400">{isLogin ? 'Sign in to continue.' : 'It takes less than a minute.'}</p>
        </div>

        {!isLogin && (
          <div>
            <label htmlFor="name" className="label">Full name</label>
            <input id="name" required autoComplete="name" className="input" {...bind('name')} />
          </div>
        )}
        <div>
          <label htmlFor="email" className="label">Email address</label>
          <input id="email" type="email" required autoComplete="email" className="input" {...bind('email')} />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={isLogin ? 1 : 8}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            className="input"
            {...bind('password')}
          />
          {!isLogin && <p className="mt-1.5 text-xs text-slate-500">Use at least 8 characters.</p>}
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn-primary w-full !py-3">
          {busy && <Loader2 size={16} className="animate-spin" />}
          {isLogin ? 'Sign in' : 'Create account'}
        </button>

        <p className="text-center text-sm text-slate-400">
          {isLogin ? 'New to StoreDash?' : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(isLogin ? 'register' : 'login');
              setError('');
            }}
            className="font-semibold text-neon-cyan transition hover:text-white"
          >
            {isLogin ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </form>
    </main>
  );
}
