"use client";

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmLoading = false,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/16 bg-slate-950/85 p-5 text-white shadow-[0_24px_80px_rgba(2,6,23,0.48)] backdrop-blur-2xl">
        <h4 className="text-lg font-semibold tracking-tight text-white">{title}</h4>
        <p className="mt-2 text-sm leading-6 text-white/70">{description}</p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={confirmLoading} className="rounded-xl border border-white/16 px-4 py-2 text-sm text-white/80 transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-60">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} disabled={confirmLoading} className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-70">
            {confirmLoading ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/60 border-t-transparent" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
