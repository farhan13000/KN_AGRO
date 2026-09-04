import { useCallback } from "react";
import { useAsyncResource } from "../../../shared/hooks";
import { auditApi } from "../services";

const auditQueryKeys = Object.freeze({
  list: (query) => ["audit", "list", query],
  detail: (auditId) => ["audit", "detail", auditId],
});

export const useAuditLogList = (query = {}, options) => {
  const request = useCallback(() => auditApi.listAuditLogs(query), [query]);
  const state = useAsyncResource(auditQueryKeys.list(query), request, options);
  return {
    ...state,
    logs: state.data?.logs || [],
    pagination: state.data?.pagination || {},
  };
};

export const useAuditLogDetail = (auditId, options) => {
  const request = useCallback(() => auditApi.getAuditLog(auditId), [auditId]);
  const state = useAsyncResource(auditQueryKeys.detail(auditId), request, {
    enabled: Boolean(auditId) && options?.enabled !== false,
  });
  return { ...state, log: state.data?.log || null };
};
