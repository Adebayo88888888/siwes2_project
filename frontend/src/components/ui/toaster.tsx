import { useToast } from './use-toast';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg border text-sm flex justify-between items-start transition-all ${
            toast.variant === 'destructive'
              ? 'bg-red-600 text-white border-red-700'
              : 'bg-card text-card-foreground border-border bg-white dark:bg-zinc-800'
          }`}
        >
          <div>
            {toast.title && <h4 className="font-semibold">{toast.title}</h4>}
            {toast.description && <p className="mt-1 opacity-90">{toast.description}</p>}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="ml-4 opacity-70 hover:opacity-100 font-bold"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
