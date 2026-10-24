import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import ToastViewport from '../components/ui/ToastViewport.jsx';

const ToastContext = createContext(null);
const DEFAULT_DURATION_MS = 4200;
let sequence = 0;

/**
 * Application-wide notification service. Mounted above the router so a toast
 * raised just before a navigation (for example after sign-in) survives the
 * route change and is still visible on the destination page.
 * @param {{children: import('react').ReactNode}} props
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((toast) => toast.id !== id)), []);

  const push = useCallback(
    (type, message, duration = DEFAULT_DURATION_MS) => {
      sequence += 1;
      const id = sequence;
      setToasts((list) => [...list.slice(-3), { id, type, message }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      success: (message, duration) => push('success', message, duration),
      error: (message, duration) => push('error', message, duration),
      info: (message, duration) => push('info', message, duration),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/** @returns {{success: Function, error: Function, info: Function}} Toast dispatchers. */
export const useToast = () => useContext(ToastContext);
