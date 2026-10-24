import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const VARIANTS = {
  success: { icon: CheckCircle2, ring: 'ring-neon-mint/40', tint: 'text-neon-mint', bar: 'from-neon-mint to-neon-cyan' },
  error: { icon: AlertCircle, ring: 'ring-rose-400/40', tint: 'text-rose-300', bar: 'from-rose-400 to-amber-300' },
  info: { icon: Info, ring: 'ring-neon-violet/40', tint: 'text-neon-violet', bar: 'from-neon-violet to-neon-cyan' },
};

/**
 * Fixed-position stack rendering active toasts. Announced politely to assistive technology.
 * @param {{toasts: Array<{id: number, type: keyof typeof VARIANTS, message: string}>, onDismiss: (id: number) => void}} props
 */
export default function ToastViewport({ toasts, onDismiss }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-3 px-4 sm:inset-x-auto sm:right-6 sm:items-end">
      {toasts.map(({ id, type, message }) => {
        const { icon: Icon, ring, tint } = VARIANTS[type] ?? VARIANTS.info;
        return (
          <div key={id} role="status" className={`glass-strong pointer-events-auto flex w-full max-w-sm animate-toast-in items-center gap-3 rounded-2xl px-4 py-3.5 shadow-glow ring-1 ${ring}`}>
            <Icon size={22} className={`shrink-0 ${tint}`} />
            <p className="flex-1 text-sm font-medium text-white">{message}</p>
            <button type="button" onClick={() => onDismiss(id)} className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white" aria-label="Dismiss notification">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
