import { Link } from 'react-router-dom';

/** Fallback route for unmatched URLs. */
export default function NotFound() {
  return (
    <main className="mx-auto grid max-w-md place-items-center px-4 py-32 text-center">
      <p className="font-display text-7xl font-extrabold text-white/10">404</p>
      <h1 className="mt-2 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-slate-400">The page you are looking for has moved or no longer exists.</p>
      <Link to="/" className="btn-primary mt-8">Back to the store</Link>
    </main>
  );
}
