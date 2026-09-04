import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";

const emptyValues = new Set(["", null, undefined]);
const cleanQuery = (query = {}) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => !emptyValues.has(value)));

const post = async (url, payload) => unwrapApiData(await apiClient.post(url, payload));

/**
 * BACKEND ASYMMETRY, disclosed: `POST /salary-proposals` accepts
 * `proposedSalary` in RUPEES at the API boundary (converted to paise once,
 * server-side, in the service layer — same convention as every other
 * money-bearing endpoint). But unlike SalaryStructure's own responses
 * (which run through salary.serializer.js and come back in rupees),
 * SalaryProposal has no serializer at all — create/list/get all return the
 * raw Mongoose document, so `currentSalary`/`proposedSalary` come back in
 * PAISE. Converted here, once, so every consumer of this API module
 * (cards, dialogs, history) always sees already-converted rupee values and
 * never has to know about this inconsistency.
 */
const fromPaise = (value) => Number(value || 0) / 100;

const withRupeeAmounts = (proposal) => {
  if (!proposal) return proposal;
  return {
    ...proposal,
    currentSalary: fromPaise(proposal.currentSalary),
    proposedSalary: fromPaise(proposal.proposedSalary),
  };
};

export const salaryProposalApi = {
  async createSalaryProposal(employeeId, { proposedSalary, effectiveDate, changeReason }) {
    const proposal = await post(API_ENDPOINTS.SALARY_PROPOSALS.BASE, {
      employeeId,
      proposedSalary,
      effectiveDate,
      changeReason,
    });
    return withRupeeAmounts(proposal);
  },

  async listSalaryProposals(query) {
    const response = await apiClient.get(API_ENDPOINTS.SALARY_PROPOSALS.BASE, { params: cleanQuery(query) });
    const data = unwrapApiData(response);
    return { ...data, proposals: (data?.proposals || []).map(withRupeeAmounts) };
  },

  async getSalaryProposal(proposalId) {
    const response = await apiClient.get(API_ENDPOINTS.SALARY_PROPOSALS.DETAIL(proposalId));
    return withRupeeAmounts(unwrapApiData(response));
  },

  // GM's management-review step (RECOMMENDED -> REVIEWED). Comment is
  // optional per the backend's reviewSalaryProposalSchema.
  async reviewSalaryProposal(proposalId, comment) {
    return withRupeeAmounts(await post(API_ENDPOINTS.SALARY_PROPOSALS.REVIEW(proposalId), { comment }));
  },

  // SA-only (REVIEWED -> APPROVED). Does not touch SalaryStructure yet —
  // that's finalize.
  async approveSalaryProposal(proposalId) {
    return withRupeeAmounts(await post(API_ENDPOINTS.SALARY_PROPOSALS.APPROVE(proposalId), {}));
  },

  // Callable at RECOMMENDED (by GM, who owns it) or REVIEWED (by SA) —
  // whoever currently holds the pending decision. `reason` is required by
  // the backend regardless of stage.
  async rejectSalaryProposal(proposalId, reason) {
    return withRupeeAmounts(await post(API_ENDPOINTS.SALARY_PROPOSALS.REJECT(proposalId), { reason }));
  },

  // SA-only (APPROVED -> FINALIZED). The backend's own design choice is
  // finalize-on-approve — not gated on effectiveDate having arrived — so
  // this is always callable the moment a proposal reaches APPROVED.
  async finalizeSalaryProposal(proposalId) {
    return withRupeeAmounts(await post(API_ENDPOINTS.SALARY_PROPOSALS.FINALIZE(proposalId), {}));
  },
};
