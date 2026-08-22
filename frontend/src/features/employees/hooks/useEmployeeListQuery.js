import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EMPLOYEE_SORT_FIELDS } from "../constants";

const defaultQuery = {
  page: 1,
  limit: 10,
  search: "",
  employeeStatus: "",
  employmentType: "",
  department: "",
  designation: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

const allowedSortFields = new Set(EMPLOYEE_SORT_FIELDS);
const allowedSortOrders = new Set(["asc", "desc"]);

const sanitizeQuery = (query = {}) => ({
  ...query,
  page: Math.max(1, Number(query.page || 1)),
  limit: Math.min(100, Math.max(1, Number(query.limit || 10))),
  sortBy: allowedSortFields.has(query.sortBy) ? query.sortBy : "createdAt",
  sortOrder: allowedSortOrders.has(query.sortOrder) ? query.sortOrder : "desc",
});

const readQuery = (searchParams, overrides = {}) =>
  sanitizeQuery({
    ...defaultQuery,
    ...overrides,
    page: searchParams.get("page") || overrides.page || defaultQuery.page,
    limit: searchParams.get("limit") || overrides.limit || defaultQuery.limit,
    search: searchParams.get("search") || overrides.search || defaultQuery.search,
    employeeStatus:
      searchParams.get("employeeStatus") || overrides.employeeStatus || defaultQuery.employeeStatus,
    employmentType:
      searchParams.get("employmentType") || overrides.employmentType || defaultQuery.employmentType,
    department: searchParams.get("department") || overrides.department || defaultQuery.department,
    designation: searchParams.get("designation") || overrides.designation || defaultQuery.designation,
    sortBy: searchParams.get("sortBy") || overrides.sortBy || defaultQuery.sortBy,
    sortOrder: searchParams.get("sortOrder") || overrides.sortOrder || defaultQuery.sortOrder,
  });

export const useEmployeeListQuery = (overrides = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(() => readQuery(searchParams, overrides), [overrides, searchParams]);

  const updateQuery = (updates) => {
    const next = sanitizeQuery({ ...query, ...updates });
    const cleaned = Object.fromEntries(
      Object.entries(next).filter(([, value]) => value !== "" && value !== null && value !== undefined),
    );
    setSearchParams(cleaned);
  };

  return { query, updateQuery };
};

export const useDebouncedValue = (value, delay = 350) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
};
