import { useCallback, useMemo } from "react";
import { useAsyncResource } from "../../../shared/hooks";
import { employeeApi } from "../services/employeeApi";

/**
 * One employee's transfer history, newest first.
 *
 * Unlike the employee list, this endpoint populates everything it
 * references (roles, managers, regions, districts, and who performed the
 * transfer), so entries render straight from the response with no
 * client-side id resolution.
 */
export const useEmployeeTransfers = (employeeId, query = {}, options) => {
  const requestQuery = useMemo(() => ({ page: 1, limit: 20, ...query }), [query]);
  const request = useCallback(
    () => employeeApi.listTransfers(employeeId, requestQuery),
    [employeeId, requestQuery],
  );

  return useAsyncResource(["employees", "transfers", employeeId, requestQuery], request, {
    enabled: Boolean(employeeId) && options?.enabled !== false,
  });
};
