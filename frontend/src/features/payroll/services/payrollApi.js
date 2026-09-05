import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";

const emptyValues = new Set(["", null, undefined]);
const cleanQuery = (query = {}) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => !emptyValues.has(value)));

/**
 * MONEY UNITS — verified directly against payroll.serializer.js and
 * PayrollService.updatePayrollDraft, not assumed from a sibling module:
 * every money field is already run through `toRupees()` on the way OUT,
 * and `toPaise()` is applied to incoming values on the way IN. So this
 * layer passes rupees straight through in BOTH directions and performs
 * no conversion of its own. (SalaryProposal behaves differently — do not
 * copy this assumption across modules.)
 */
export const payrollApi = {
  async listMyPayroll(query) {
    return unwrapApiData(await apiClient.get(API_ENDPOINTS.PAYROLL.ME, { params: cleanQuery(query) }));
  },

  // Company-wide list — PAYROLL_READ (OA + SA only).
  async listAllPayroll(query) {
    return unwrapApiData(await apiClient.get(API_ENDPOINTS.PAYROLL.BASE, { params: cleanQuery(query) }));
  },

  // Gated in-service, not by middleware: full access via PAYROLL_READ, or
  // your own record via PAYROLL_READ_SELF.
  async getPayroll(payrollId) {
    return unwrapApiData(await apiClient.get(API_ENDPOINTS.PAYROLL.DETAIL(payrollId)));
  },

  async generatePayroll({ employeeId, month, year }) {
    return unwrapApiData(
      await apiClient.post(API_ENDPOINTS.PAYROLL.GENERATE, { employeeId, month, year }),
    );
  },

  // Omitting both `manager` and `department` targets every ACTIVE employee.
  async generateBulkPayroll({ month, year, manager, department }) {
    return unwrapApiData(
      await apiClient.post(
        API_ENDPOINTS.PAYROLL.GENERATE_BULK,
        cleanQuery({ month, year, manager, department }),
      ),
    );
  },

  async processPayroll(payrollId) {
    return unwrapApiData(await apiClient.post(API_ENDPOINTS.PAYROLL.PROCESS(payrollId), {}));
  },

  async markPayrollPaid(payrollId) {
    return unwrapApiData(await apiClient.post(API_ENDPOINTS.PAYROLL.MARK_PAID(payrollId), {}));
  },

  // DRAFT-only privileged edit; amounts are sent in rupees (see the note
  // above). Backend recalculates gross/deductions/net itself.
  async updatePayrollDraft(payrollId, payload) {
    return unwrapApiData(await apiClient.patch(API_ENDPOINTS.PAYROLL.DETAIL(payrollId), payload));
  },
};
