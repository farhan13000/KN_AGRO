import { useCallback } from "react";
import { useAsyncResource } from "../../../shared/hooks";
import { employeeApi } from "../services/employeeApi";

const PAGE_SIZE = 100; // the employees endpoint's own maximum
const MAX_PAGES = 20; // hard stop so a bad `pages` value can't spin forever

/**
 * Every employee the current actor is allowed to see, across all pages.
 *
 * The list endpoint is capped at 100 rows per request, so anything that
 * needs the WHOLE set — building an org tree, resolving ids to names,
 * populating a candidate picker — has to page through it or silently work
 * off a truncated list (this database already holds >100 active
 * employees). Scope is still the backend's job: the Scope Engine filters
 * each page to the actor's own downline, so paging here never widens
 * what someone can see.
 */
export const useAllEmployees = ({
  district = "",
  employeeStatus = "ACTIVE",
  enabled = true,
  post = "",
  state = "",
} = {}) => {
  const request = useCallback(async () => {
    const collected = [];
    let page = 1;
    let totalPages = 1;

    do {
      const data = await employeeApi.getEmployees({
        page,
        limit: PAGE_SIZE,
        employeeStatus,
        // Search by location — narrows to whoever's own coverage names
        // this state/district/post office.
        state: state || undefined,
        district: district || undefined,
        post: post || undefined,
        sortBy: "employeeCode",
        sortOrder: "asc",
      });
      collected.push(...(data?.employees || []));
      totalPages = data?.pagination?.pages || 1;
      page += 1;
    } while (page <= totalPages && page <= MAX_PAGES);

    return collected;
  }, [district, employeeStatus, post, state]);

  const asyncState = useAsyncResource(["employees", "all", employeeStatus, state, district, post], request, { enabled });

  return { ...asyncState, employees: asyncState.data || [] };
};
