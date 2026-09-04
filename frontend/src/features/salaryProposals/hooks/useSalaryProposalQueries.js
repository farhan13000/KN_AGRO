import { useCallback, useMemo } from "react";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { salaryProposalApi } from "../services";

export const useSalaryProposalList = (query = {}, options) => {
  const requestQuery = useMemo(() => ({ page: 1, limit: 50, ...query }), [query]);
  const request = useCallback(() => salaryProposalApi.listSalaryProposals(requestQuery), [requestQuery]);
  const state = useAsyncResource(["salaryProposals", "list", requestQuery], request, options);

  return {
    ...state,
    proposals: state.data?.proposals || [],
    pagination: state.data?.pagination || {},
  };
};

export const useSalaryProposalActions = ({ onSuccess } = {}) => ({
  createSalaryProposal: useAsyncMutation(salaryProposalApi.createSalaryProposal, { onSuccess }),
  reviewSalaryProposal: useAsyncMutation(salaryProposalApi.reviewSalaryProposal, { onSuccess }),
  approveSalaryProposal: useAsyncMutation(salaryProposalApi.approveSalaryProposal, { onSuccess }),
  rejectSalaryProposal: useAsyncMutation(salaryProposalApi.rejectSalaryProposal, { onSuccess }),
  finalizeSalaryProposal: useAsyncMutation(salaryProposalApi.finalizeSalaryProposal, { onSuccess }),
});
