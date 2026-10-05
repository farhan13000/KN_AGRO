import { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * A value an admin is about to read out over the phone or paste into
 * WhatsApp, with a copy button that confirms it copied.
 *
 * The clipboard call is wrapped: `navigator.clipboard` is unavailable on
 * a page served over plain http (it is a secure-context API), and throws
 * rather than returning false. A copy button that silently does nothing
 * on the office desktop would be worse than no button, so a failure
 * falls back to selecting the text, which is the manual path anyway.
 */
export default function CopyableValue({ value, label, mono = false, size = "normal" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // No clipboard access (http, or a browser that refuses). Leave the
      // value on screen for the person to select by hand.
      setCopied(false);
    }
  };

  return (
    <span className="flex min-w-0 items-center gap-2">
      <span
        className={`min-w-0 break-all ${mono ? "font-mono" : ""} ${
          size === "large" ? "text-lg font-black text-ink" : "text-sm font-semibold text-ink"
        }`}
      >
        {value}
      </span>
      <button
        aria-label={copied ? `${label} copied` : `Copy ${label}`}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint"
        onClick={handleCopy}
        title={copied ? "Copied" : `Copy ${label}`}
        type="button"
      >
        {copied ? <Check className="h-4 w-4 text-green-700" /> : <Copy className="h-4 w-4" />}
      </button>
    </span>
  );
}
