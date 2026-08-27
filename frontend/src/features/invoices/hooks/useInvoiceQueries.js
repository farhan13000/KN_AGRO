import { useCallback, useMemo } from "react";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { DEFAULT_INVOICE_QUERY } from "../constants";
import { invoiceApi } from "../services";
import { invoiceQueryKeys } from "./invoiceQueryKeys";

const withDefaultInvoiceQuery = (query) => ({ ...DEFAULT_INVOICE_QUERY, ...query });

export const useInvoiceList = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultInvoiceQuery(query), [query]);
  const request = useCallback(() => invoiceApi.getInvoices(requestQuery), [requestQuery]);
  return useAsyncResource(invoiceQueryKeys.list(requestQuery), request, options);
};

export const useInvoiceDetail = (invoiceId, options) => {
  const request = useCallback(() => invoiceApi.getInvoiceById(invoiceId), [invoiceId]);
  return useAsyncResource(invoiceQueryKeys.detail(invoiceId), request, {
    enabled: Boolean(invoiceId) && options?.enabled !== false,
  });
};

// Prompt 51's real aggregate — see invoiceApi.getInvoiceSummary's own
// comment for why this, not a paginated-page sum, is the authoritative
// Outstanding figure.
export const useInvoiceSummary = (options) => {
  const request = useCallback(() => invoiceApi.getInvoiceSummary(), []);
  return useAsyncResource(invoiceQueryKeys.summary, request, options);
};

export const useInvoicePrintView = (invoiceId, options) => {
  const request = useCallback(() => invoiceApi.getInvoicePrintView(invoiceId), [invoiceId]);
  return useAsyncResource(invoiceQueryKeys.print(invoiceId), request, {
    enabled: Boolean(invoiceId) && options?.enabled !== false,
  });
};

// Prompt 15: after a Payment mutation, the Invoice detail/payment summary
// must be invalidated — that refetch is triggered by the consuming page
// passing this same `useInvoiceDetail`'s `refetch` into
// `usePaymentActions({onSuccess})`, mirroring how Quotations' lifecycle
// actions refetch the quotation they act on. This hook file owns only the
// Invoice-side fetch/mutation primitives, not cross-feature orchestration.
export const useInvoiceActions = ({ onError, onSuccess } = {}) => ({
  generateInvoice: useAsyncMutation(invoiceApi.generateInvoice, { onError, onSuccess }),
  issueInvoice: useAsyncMutation(invoiceApi.issueInvoice, { onError, onSuccess }),
  cancelInvoice: useAsyncMutation(invoiceApi.cancelInvoice, { onError, onSuccess }),
});
