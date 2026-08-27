import { formatPaymentMethod } from "../utils";

// Plain text, not a colored badge — a payment method (Cash/UPI/Cheque/...)
// is contextual metadata, not a state to draw attention to the way a
// status is. Safe fallback: an unrecognized method still renders its raw
// value via formatPaymentMethod, never throws or renders blank.
export default function PaymentMethodFormatter({ method }) {
  return <span className="text-sm font-semibold text-ink">{formatPaymentMethod(method)}</span>;
}
