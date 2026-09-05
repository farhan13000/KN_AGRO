import { useCallback, useMemo } from "react";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { payrollApi } from "../services";

export const useMyPayroll = (query = {}, options) => {
  const requestQuery = useMemo(() => ({ page: 1, limit: 12, ...query }), [query]);
  const request = useCallback(() => payrollApi.listMyPayroll(requestQuery), [requestQuery]);
  const state = useAsyncResource(["payroll", "me", requestQuery], request, options);

  return { ...state, payrolls: state.data?.payrolls || [], pagination: state.data?.pagination || {} };
};

export const useAllPayroll = (query = {}, options) => {
  const requestQuery = useMemo(() => ({ page: 1, limit: 20, ...query }), [query]);
  const request = useCallback(() => payrollApi.listAllPayroll(requestQuery), [requestQuery]);
  const state = useAsyncResource(["payroll", "all", requestQuery], request, options);

  return { ...state, payrolls: state.data?.payrolls || [], pagination: state.data?.pagination || {} };
};

export const usePayrollActions = ({ onSuccess } = {}) => ({
  generatePayroll: useAsyncMutation(payrollApi.generatePayroll, { onSuccess }),
  generateBulkPayroll: useAsyncMutation(payrollApi.generateBulkPayroll, { onSuccess }),
  processPayroll: useAsyncMutation(payrollApi.processPayroll, { onSuccess }),
  markPayrollPaid: useAsyncMutation(payrollApi.markPayrollPaid, { onSuccess }),
  updatePayrollDraft: useAsyncMutation(payrollApi.updatePayrollDraft, { onSuccess }),
});
