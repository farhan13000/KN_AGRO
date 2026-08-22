import { EMPLOYEE_STATUS, EMPLOYMENT_TYPE } from "../../features/employees/constants";
import { cleanEmployeeQuery } from "../../features/employees/utils";

let employees = [
  {
    _id: "mock-manager-1",
    employeeCode: "EMP000001",
    user: {
      _id: "mock-user-manager-1",
      name: "Asha Patel",
      email: "asha.manager@example.com",
      status: "ACTIVE",
      role: { name: "sales_manager", permissions: ["employees.read", "managers.read"] },
    },
    phone: "9876543210",
    department: "Sales",
    designation: "Regional Sales Manager",
    manager: null,
    dateOfJoining: "2026-01-10T00:00:00.000Z",
    employmentType: EMPLOYMENT_TYPE.FULL_TIME,
    employeeStatus: EMPLOYEE_STATUS.ACTIVE,
    address: { city: "Pune", state: "Maharashtra", country: "India" },
    emergencyContact: { name: "Ravi Patel", relationship: "Spouse", phone: "9876500000" },
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: "2026-01-10T00:00:00.000Z",
  },
  {
    _id: "mock-employee-1",
    employeeCode: "EMP000002",
    user: {
      _id: "mock-user-employee-1",
      name: "Nikhil Sharma",
      email: "nikhil.employee@example.com",
      status: "ACTIVE",
      role: { name: "employee", permissions: ["employees.read_self", "employees.update_self"] },
    },
    phone: "9123456780",
    department: "Sales",
    designation: "Sales Executive",
    manager: {
      _id: "mock-manager-1",
      employeeCode: "EMP000001",
      designation: "Regional Sales Manager",
      user: { name: "Asha Patel" },
    },
    dateOfJoining: "2026-02-01T00:00:00.000Z",
    employmentType: EMPLOYMENT_TYPE.FULL_TIME,
    employeeStatus: EMPLOYEE_STATUS.ACTIVE,
    address: { city: "Nashik", state: "Maharashtra", country: "India" },
    emergencyContact: { name: "Mina Sharma", relationship: "Mother", phone: "9123400000" },
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
  },
  {
    _id: "mock-pending-1",
    employeeCode: "EMP000003",
    user: {
      _id: "mock-user-pending-1",
      name: "Priya Desai",
      email: "priya.applicant@example.com",
      status: "PENDING",
      role: { name: "employee", permissions: [] },
    },
    phone: "9000011111",
    requestedDepartment: "Sales",
    requestedDesignation: "Trainee",
    employeeStatus: EMPLOYEE_STATUS.PENDING_APPROVAL,
    createdAt: "2026-03-15T00:00:00.000Z",
    updatedAt: "2026-03-15T00:00:00.000Z",
  },
];

let actionRequests = [];

const wait = () => new Promise((resolve) => window.setTimeout(resolve, 250));

const clone = (value) => JSON.parse(JSON.stringify(value));

const paginate = (items, query = {}) => {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  const start = (page - 1) * limit;

  return {
    items: items.slice(start, start + limit),
    pagination: {
      page,
      limit,
      total: items.length,
      pages: Math.max(1, Math.ceil(items.length / limit)),
    },
  };
};

const searchEmployees = (records, query = {}) => {
  const cleaned = cleanEmployeeQuery(query);
  const search = String(cleaned.search || "").toLowerCase();

  return records.filter((employee) => {
    const matchesSearch =
      !search ||
      [
        employee.employeeCode,
        employee.user?.name,
        employee.user?.email,
        employee.department,
        employee.designation,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search));
    const matchesStatus = !cleaned.employeeStatus || employee.employeeStatus === cleaned.employeeStatus;
    const matchesEmploymentType =
      !cleaned.employmentType || employee.employmentType === cleaned.employmentType;
    const matchesDepartment = !cleaned.department || employee.department === cleaned.department;
    const matchesDesignation = !cleaned.designation || employee.designation === cleaned.designation;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesEmploymentType &&
      matchesDepartment &&
      matchesDesignation
    );
  });
};

const findEmployee = (employeeId) => {
  const employee = employees.find((item) => item._id === employeeId);
  if (!employee) {
    throw new Error("Employee not found");
  }
  return employee;
};

const employeeResponse = (employee) => ({ employee: clone(employee) });

const employeeListResponse = (records, query) => {
  const { items, pagination } = paginate(searchEmployees(records, query), query);
  return { employees: clone(items), pagination };
};

const toHierarchyEmployee = (employee) => ({
  _id: employee._id,
  employeeCode: employee.employeeCode,
  user: employee.user,
  phone: employee.phone,
  department: employee.department,
  designation: employee.designation,
  employeeStatus: employee.employeeStatus,
});

const updateEmployeeStatus = (employeeId, employeeStatus, userStatus) => {
  const employee = findEmployee(employeeId);
  employee.employeeStatus = employeeStatus;
  if (employee.user && userStatus) {
    employee.user.status = userStatus;
  }
  employee.updatedAt = new Date().toISOString();
  return employeeResponse(employee);
};

export const mockEmployeeApi = {
  async getEmployees(query) {
    await wait();
    return employeeListResponse(employees, query);
  },

  async getEmployeeById(employeeId) {
    await wait();
    return employeeResponse(findEmployee(employeeId));
  },

  async createEmployee(payload) {
    await wait();
    const employee = {
      _id: `mock-employee-${Date.now()}`,
      employeeCode: `EMP${String(employees.length + 1).padStart(6, "0")}`,
      user: {
        _id: `mock-user-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        status: "ACTIVE",
        role: { name: "employee", permissions: [] },
      },
      phone: payload.phone,
      department: payload.department,
      designation: payload.designation,
      manager: null,
      dateOfJoining: payload.dateOfJoining,
      employmentType: payload.employmentType || EMPLOYMENT_TYPE.FULL_TIME,
      employeeStatus: EMPLOYEE_STATUS.ACTIVE,
      address: payload.address,
      emergencyContact: payload.emergencyContact,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    employees = [employee, ...employees];
    return employeeResponse(employee);
  },

  async updateEmployee(employeeId, payload) {
    await wait();
    const employee = findEmployee(employeeId);
    Object.assign(employee, payload, { updatedAt: new Date().toISOString() });
    return employeeResponse(employee);
  },

  async getMyProfile() {
    await wait();
    return employeeResponse(employees[1]);
  },

  async updateMyProfile(payload) {
    await wait();
    Object.assign(employees[1], payload, { updatedAt: new Date().toISOString() });
    return employeeResponse(employees[1]);
  },

  async getPendingEmployees(query) {
    await wait();
    const pending = employees.filter(
      (employee) => employee.employeeStatus === EMPLOYEE_STATUS.PENDING_APPROVAL,
    );
    const { items, pagination } = paginate(pending, query);
    return {
      applications: clone(
        items.map((employee) => ({
          _id: employee._id,
          employeeCode: employee.employeeCode,
          applicant: { name: employee.user?.name, email: employee.user?.email },
          phone: employee.phone,
          requestedDepartment: employee.requestedDepartment,
          requestedDesignation: employee.requestedDesignation,
          createdAt: employee.createdAt,
        })),
      ),
      pagination,
    };
  },

  async approveEmployee(employeeId, payload = {}) {
    await wait();
    const employee = findEmployee(employeeId);
    employee.department = payload.department || employee.requestedDepartment || "Sales";
    employee.designation = payload.designation || employee.requestedDesignation || "Employee";
    employee.dateOfJoining = payload.dateOfJoining || new Date().toISOString();
    employee.employeeStatus = EMPLOYEE_STATUS.ACTIVE;
    employee.user.status = "ACTIVE";
    employee.approvedAt = new Date().toISOString();
    return employeeResponse(employee);
  },

  async rejectEmployee(employeeId, payload = {}) {
    await wait();
    const employee = findEmployee(employeeId);
    employee.rejectionReason = payload.rejectionReason;
    employee.rejectedAt = new Date().toISOString();
    return updateEmployeeStatus(employeeId, EMPLOYEE_STATUS.REJECTED, "DISABLED");
  },

  async assignManager(employeeId, managerId) {
    await wait();
    const employee = findEmployee(employeeId);
    const manager = managerId ? findEmployee(managerId) : null;
    employee.manager = manager
      ? {
          _id: manager._id,
          employeeCode: manager.employeeCode,
          designation: manager.designation,
          user: { name: manager.user?.name },
        }
      : null;
    return employeeResponse(employee);
  },

  async getDirectReports(employeeId, query) {
    await wait();
    const reports = employees.filter((employee) => employee.manager?._id === employeeId);
    return employeeListResponse(reports, query);
  },

  async getMyTeam(query) {
    await wait();
    return this.getDirectReports("mock-manager-1", query);
  },

  async deactivateEmployee(employeeId) {
    await wait();
    return updateEmployeeStatus(employeeId, EMPLOYEE_STATUS.INACTIVE, "DISABLED");
  },

  async reactivateEmployee(employeeId) {
    await wait();
    return updateEmployeeStatus(employeeId, EMPLOYEE_STATUS.ACTIVE, "ACTIVE");
  },

  async resignEmployee(employeeId) {
    await wait();
    return updateEmployeeStatus(employeeId, EMPLOYEE_STATUS.RESIGNED, "DISABLED");
  },

  async terminateEmployee(employeeId) {
    await wait();
    return updateEmployeeStatus(employeeId, EMPLOYEE_STATUS.TERMINATED, "DISABLED");
  },

  async promoteToManager(employeeId) {
    await wait();
    const employee = findEmployee(employeeId);
    employee.user.role = { name: "sales_manager", permissions: ["employees.read", "managers.read"] };
    return employeeResponse(employee);
  },

  async requestPromotion(employeeId, reason) {
    await wait();
    const request = {
      _id: `mock-request-${Date.now()}`,
      type: "MANAGER_PROMOTION",
      employee: clone(findEmployee(employeeId)),
      requestedBy: { _id: "mock-user-manager-1", name: "Asha Patel", email: "asha.manager@example.com" },
      reason,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    actionRequests = [request, ...actionRequests];
    return { request: clone(request) };
  },

  async getEmployeeHierarchy() {
    await wait();
    const managers = employees.filter((employee) => employee.user?.role?.name === "sales_manager");
    return clone({
      managers: managers.map((manager) => ({
        manager: toHierarchyEmployee(manager),
        employees: employees
          .filter((employee) => employee.manager?._id === manager._id)
          .map(toHierarchyEmployee),
      })),
      unassignedEmployees: employees
        .filter(
          (employee) =>
            employee.employeeStatus === EMPLOYEE_STATUS.ACTIVE &&
            employee.user?.role?.name !== "sales_manager" &&
            !employee.manager,
        )
        .map(toHierarchyEmployee),
    });
  },

  async getEmployeeSummary() {
    await wait();
    return {
      totalEmployees: employees.length,
      activeEmployees: employees.filter(
        (employee) => employee.employeeStatus === EMPLOYEE_STATUS.ACTIVE,
      ).length,
      inactiveEmployees: employees.filter(
        (employee) => employee.employeeStatus === EMPLOYEE_STATUS.INACTIVE,
      ).length,
      salesManagers: employees.filter(
        (employee) =>
          employee.employeeStatus === EMPLOYEE_STATUS.ACTIVE &&
          employee.user?.role?.name === "sales_manager",
      ).length,
      pendingApprovals: employees.filter(
        (employee) => employee.employeeStatus === EMPLOYEE_STATUS.PENDING_APPROVAL,
      ).length,
      unassignedEmployees: employees.filter(
        (employee) =>
          employee.employeeStatus === EMPLOYEE_STATUS.ACTIVE &&
          employee.user?.role?.name !== "sales_manager" &&
          !employee.manager,
      ).length,
    };
  },

  async registerEmployee(payload) {
    await wait();
    const employee = {
      _id: `mock-pending-${Date.now()}`,
      employeeCode: `EMP${String(employees.length + 1).padStart(6, "0")}`,
      user: {
        _id: `mock-user-pending-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        status: "PENDING",
        role: { name: "employee", permissions: [] },
      },
      phone: payload.phone,
      requestedDepartment: payload.requestedDepartment,
      requestedDesignation: payload.requestedDesignation,
      employeeStatus: EMPLOYEE_STATUS.PENDING_APPROVAL,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    employees = [employee, ...employees];
    return { employeeCode: employee.employeeCode, status: employee.employeeStatus };
  },

  async getActionRequests(query) {
    await wait();
    const { items, pagination } = paginate(actionRequests, query);
    return { requests: clone(items), pagination };
  },

  async approveActionRequest(requestId, reviewComment) {
    await wait();
    const request = actionRequests.find((item) => item._id === requestId);
    if (!request) throw new Error("Request not found");
    request.status = "APPROVED";
    request.reviewComment = reviewComment;
    request.reviewedAt = new Date().toISOString();
    return { request: clone(request) };
  },

  async rejectActionRequest(requestId, reviewComment) {
    await wait();
    const request = actionRequests.find((item) => item._id === requestId);
    if (!request) throw new Error("Request not found");
    request.status = "REJECTED";
    request.reviewComment = reviewComment;
    request.reviewedAt = new Date().toISOString();
    return { request: clone(request) };
  },
};
