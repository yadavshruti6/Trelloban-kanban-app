"use client";

import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useKanbanStore } from '@/store/use-kanban-store';

const iconByKind = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info
};

const classesByKind = {
  success: 'border-emerald-400/40 bg-emerald-500/20 text-emerald-50',
  error: 'border-rose-400/40 bg-rose-500/20 text-rose-50',
  info: 'border-sky-400/40 bg-sky-500/20 text-sky-50'
};

export function ToastStack() {
  const toasts = useKanbanStore((state) => state.toasts);
  const dismissToast = useKanbanStore((state) => state.dismissToast);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[min(90vw,380px)] flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconByKind[toast.kind];
          return (
            <motion.div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-soft backdrop-blur-xl ${classesByKind[toast.kind]}`}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Icon className="h-4 w-4" />
              <p className="flex-1 text-sm font-medium leading-6">{toast.message}</p>
              <button type="button" className="rounded-lg p-1 text-current/80 transition hover:bg-white/15" onClick={() => dismissToast(toast.id)}>
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
