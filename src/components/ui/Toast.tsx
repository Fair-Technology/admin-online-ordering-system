import { CheckCircle, XCircle } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface ToastContainerProps {
  toasts: Toast[];
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-xl px-4 py-3 shadow-lg flex items-center gap-2 animate-fade-in"
        >
          {toast.type === 'success' ? (
            <CheckCircle size={16} className="text-emerald-200 shrink-0" />
          ) : (
            <XCircle size={16} className="text-red-300 shrink-0" />
          )}
          <span className={`text-sm ${toast.type === 'success' ? 'text-emerald-200' : 'text-red-300'}`}>
            {toast.message}
          </span>
        </div>
      ))}
    </div>
  );
}
