import { useAdmin } from '../../context/AdminContext.jsx';

/** Dismissible banner surfacing the most recent dashboard API failure. */
export default function ErrorBanner() {
  const { error, dismissError } = useAdmin();
  if (!error) return null;

  return (
    <p role="alert" className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
      {error}
      <button type="button" onClick={dismissError} className="font-semibold underline-offset-2 hover:underline">
        Dismiss
      </button>
    </p>
  );
}
