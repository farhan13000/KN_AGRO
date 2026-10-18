import Modal from "./Modal";

// `danger` paints the confirm button red, for actions that cannot be
// undone. The default stays exactly what every existing caller had.
const CONFIRM_TONE_CLASS = {
  default: "bg-forest hover:bg-agriculture",
  danger: "bg-red-700 hover:bg-red-800",
};

export default function ConfirmDialog({
  cancelLabel = "Cancel",
  children,
  confirmDisabled = false,
  confirmLabel = "Confirm",
  description,
  isOpen,
  onCancel,
  onConfirm,
  title = "Confirm action",
  tone = "default",
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <p className="text-sm leading-6 text-muted">{description}</p>
      {/* Optional extra content under the description, e.g. an error. */}
      {children}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
          onClick={onCancel}
          type="button"
        >
          {cancelLabel}
        </button>
        <button
          className={`inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white shadow-soft transition disabled:cursor-not-allowed disabled:opacity-60 ${CONFIRM_TONE_CLASS[tone] || CONFIRM_TONE_CLASS.default}`}
          disabled={confirmDisabled}
          onClick={onConfirm}
          type="button"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

