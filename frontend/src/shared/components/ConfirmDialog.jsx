import Modal from "./Modal";

export default function ConfirmDialog({
  cancelLabel = "Cancel",
  confirmDisabled = false,
  confirmLabel = "Confirm",
  description,
  isOpen,
  onCancel,
  onConfirm,
  title = "Confirm action",
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <p className="text-sm leading-6 text-muted">{description}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
          onClick={onCancel}
          type="button"
        >
          {cancelLabel}
        </button>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-agriculture disabled:cursor-not-allowed disabled:opacity-60"
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

