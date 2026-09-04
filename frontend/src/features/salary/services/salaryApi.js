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
};
