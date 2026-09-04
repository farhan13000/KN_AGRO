import { useCallback, useMemo } from "react";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { DEFAULT_PAYMENT_QUERY } from "../constants";
import { paymentApi } from "../services";
import { paymentQueryKeys } from "./paymentQueryKeys";

const withDefaultPaymentQuery = (query) => ({ ...DEFAULT_PAYMENT_QUERY, ...query });

export const usePaymentList = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultPaymentQuery(query), [query]);
  const request = useCallback(() => paymentApi.getPayments(requestQuery), [requestQuery]);
  return useAsyncResource(paymentQueryKeys.list(requestQuery), request, options);
};

export const useInvoicePaymentHistory = (invoiceId, query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultPaymentQuery(query), [query]);
  const request = useCallback(() => paymentApi.getInvoicePayments(invoiceId, requestQuery), [invoiceId, requestQuery]);
  return useAsyncResource(paymentQueryKeys.forInvoice(invoiceId, requestQuery), request, {
    enabled: Boolean(invoiceId) && options?.enabled !== false,
  });
};

// No `paymentDetail`/`updatePayment` hook — no such endpoints exist
// (Payments are append-only and have no detail-by-id route; see
// paymentApi.js). Prompt 16: after recording a payment, the consumer
// refetches Payments (this hook's own list/history) + the Invoice +
// (where shown) the Customer's financial view — composed by the page,
// same pattern as every other Phase 5/6 action hook.
export const usePaymentActions = ({ onError, onSuccess } = {}) => ({
  recordPayment: useAsyncMutation(paymentApi.recordPayment, { onError, onSuccess }),
});
