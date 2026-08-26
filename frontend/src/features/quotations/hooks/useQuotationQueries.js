import { useCallback, useMemo } from "react";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { DEFAULT_QUOTATION_QUERY } from "../constants";
import { quotationApi } from "../services";
import { quotationQueryKeys } from "./quotationQueryKeys";

const withDefaultQuotationQuery = (query) => ({ ...DEFAULT_QUOTATION_QUERY, ...query });

export const useQuotationList = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultQuotationQuery(query), [query]);
  const request = useCallback(() => quotationApi.getQuotations(requestQuery), [requestQuery]);
  return useAsyncResource(quotationQueryKeys.list(requestQuery), request, options);
};

export const useQuotationDetail = (quotationId, options) => {
  const request = useCallback(() => quotationApi.getQuotationById(quotationId), [quotationId]);
  return useAsyncResource(quotationQueryKeys.detail(quotationId), request, {
    enabled: Boolean(quotationId) && options?.enabled !== false,
  });
};

export const useQuotationPrintView = (quotationId, options) => {
  const request = useCallback(() => quotationApi.getQuotationPrintView(quotationId), [quotationId]);
  return useAsyncResource(quotationQueryKeys.print(quotationId), request, {
    enabled: Boolean(quotationId) && options?.enabled !== false,
  });
};

// Powers the "Quotations" section on a Lead's own detail page (Prompt 36) —
// the most direct, backend-provided way to "filter quotations by Lead",
// preferred over a generic Lead-ID picker on the global list.
export const useLeadQuotations = (leadId, query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultQuotationQuery(query), [query]);
  const request = useCallback(() => quotationApi.getQuotationsForLead(leadId, requestQuery), [leadId, requestQuery]);
  return useAsyncResource(quotationQueryKeys.forLead(leadId, requestQuery), request, {
    enabled: Boolean(leadId) && options?.enabled !== false,
  });
};

// One mutation per backend lifecycle action, deliberately NOT chained
// together here. Each consuming page/dialog composes `onSuccess` itself
// (e.g. refetch this quotation + refetch the list + refetch the related
// Lead) the same way LeadCommandDialogs does for Lead actions — this hook
// layer never assumes which resources are on screen, and never mutates
// local state to fake a new status (no optimistic status writes).
export const useQuotationActions = ({ onError, onSuccess } = {}) => ({
  createQuotation: useAsyncMutation(quotationApi.createQuotation, { onError, onSuccess }),
  updateQuotation: useAsyncMutation(quotationApi.updateQuotation, { onError, onSuccess }),
  sendQuotation: useAsyncMutation(quotationApi.sendQuotation, { onError, onSuccess }),
  acceptQuotation: useAsyncMutation(quotationApi.acceptQuotation, { onError, onSuccess }),
  rejectQuotation: useAsyncMutation(quotationApi.rejectQuotation, { onError, onSuccess }),
  cancelQuotation: useAsyncMutation(quotationApi.cancelQuotation, { onError, onSuccess }),
  reviseQuotation: useAsyncMutation(quotationApi.reviseQuotation, { onError, onSuccess }),
});
