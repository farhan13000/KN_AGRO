import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";

export const salaryApi = {
  // The backend serializer already converts basicSalary/allowances/
  // deductions to rupees for this endpoint (unlike SalaryProposal's own
  // responses — see salaryProposalApi.js's note on that asymmetry), so no
  // paise conversion is needed here.
  async getCurrentSalaryStructure(employeeId) {
    const response = await apiClient.get(API_ENDPOINTS.SALARY.CURRENT(employeeId));
    return unwrapApiData(response);
  },

  // Self-service equivalent of the above — same shape, same rupees
  // handling, just scoped to the caller instead of a named employee.
  async getMySalaryStructure() {
    const response = await apiClient.get(API_ENDPOINTS.SALARY.ME);
    return unwrapApiData(response);
  },

  // Past structures, newest effective date first.
  async getSalaryHistory(employeeId, query) {
    const response = await apiClient.get(API_ENDPOINTS.SALARY.HISTORY(employeeId), { params: query });
    return unwrapApiData(response);
  },
};
