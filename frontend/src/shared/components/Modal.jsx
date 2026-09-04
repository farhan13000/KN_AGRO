import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function Modal({ children, isOpen, onClose, title }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousActiveElement = document.activeElement;
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    requestAnimationFrame(() => {
      const firstFocusable = dialogRef.current?.querySelector(focusableSelector);
      firstFocusable?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = Array.from(dialogRef.current.querySelectorAll(focusableSelector)).filter(
        (element) => !element.disabled && element.getAttribute("aria-hidden") !== "true",
      );
      if (!focusableElements.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/45 px-4 py-6"
      onMouseDown={onClose}
    >
      <div
        aria-label={typeof title === "string" ? title : "Dialog"}
        aria-modal="true"
        // Capped to the viewport with a scrollable body: a taller form
        // (the transfer dialog, for one) would otherwise push its own
        // submit buttons off-screen with no way to reach them.
        className="flex max-h-full w-full max-w-lg flex-col rounded-2xl bg-white shadow-card ring-1 ring-forest/10"
        onMouseDown={(event) => event.stopPropagation()}
        ref={dialogRef}
        role="dialog"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-forest/10 px-5 py-4">
          <h2 className="text-lg font-black text-ink">{title}</h2>
          <button
            aria-label="Close dialog"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:bg-mint hover:text-forest"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
