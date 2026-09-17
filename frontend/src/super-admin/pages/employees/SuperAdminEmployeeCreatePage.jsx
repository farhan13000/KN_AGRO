import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import { ROUTES } from "../../../shared/constants";
import {
  EmergencyContactFields,
  EmployeeAddressFields,
  EmployeeCoverageFields,
  EmployeeProfileFields,
  UserAccountFields,
  pickCreateEmployeePayload,
  updateNestedValue,
  useEmployeeActions,
  validateCreateEmployeeForm,
} from "../../../features/employees";
import { PhotoUploadField } from "../../../features/media";
import SearchableSelect from "../../../shared/forms/SearchableSelect";
import Select from "../../../shared/forms/Select";
import { useEligibleManagerCandidates } from "../../../features/employees";
import { employeeSelectOption } from "../../../features/employees";
import { useRoleOptions } from "../../../features/promotions";

const initialValues = {
  name: "",
  email: "",
  temporaryPassword: "",
  phone: "",
  department: "",
  designation: "",
  dateOfJoining: "",
  employmentType: "",
  roleId: "",
  manager: "",
  photo: null,
  address: {},
  emergencyContact: {},
  coverage: { states: [], districts: [], posts: [] },
};

/**
 * The Super Admin's direct-add path: the account exists the moment this
 * form is submitted, with no approval step. Everyone else raises a hiring
 * request instead (see the Employees list page's own note).
 *
 * Role, coverage and manager are chosen here — without them this form
 * could only ever produce a Field Officer, which is what it did before
 * and made "add any employee" untrue.
 */
export default function SuperAdminEmployeeCreatePage() {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const actions = useEmployeeActions();

  const roleState = useRoleOptions();
  const selectedRole = roleState.roles.find((role) => role._id === values.roleId);
  // Offer only the tier this role must structurally report to; the
  // backend re-checks it either way.
  const managerState = useEligibleManagerCandidates({ forRoleName: selectedRole?.name });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => {
      const next = updateNestedValue(current, name, value);
      // A manager eligible for one role is usually not eligible for
      // another, so clear it rather than submitting a stale pairing.
      if (name === "roleId") next.manager = "";
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validateCreateEmployeeForm(values);
    setErrors(validation.errors);

    if (!validation.isValid) return;

    const payload = await actions.createEmployee.mutate(pickCreateEmployeePayload(values));
    const employeeId = payload?.employee?._id;
    navigate(employeeId ? `${ROUTES.SUPER_ADMIN.EMPLOYEES}/${employeeId}` : ROUTES.SUPER_ADMIN.EMPLOYEES);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Employee Management</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Create Employee</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Create the user account and employee profile through the backend employee endpoint.
        </p>
      </div>

      <Card className="p-5">
        <form className="space-y-7" onSubmit={handleSubmit}>
          <section>
            <h2 className="text-lg font-black text-ink">User Account</h2>
            <div className="mt-4">
              <UserAccountFields errors={errors} includePassword onChange={handleChange} values={values} />
            </div>
          </section>
          <section>
            <h2 className="text-lg font-black text-ink">Employee Profile</h2>
            <div className="mt-4">
              <EmployeeProfileFields errors={errors} onChange={handleChange} values={values} />
            </div>
          </section>
          <EmployeeCoverageFields errors={errors} onChange={handleChange} value={values.coverage} />
          <section>
            <h2 className="text-lg font-black text-ink">Placement</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <Select
                id="employee-role"
                label="Role"
                name="roleId"
                onChange={handleChange}
                options={[
                  { value: "", label: roleState.isLoading ? "Loading roles..." : "Field Officer (default)" },
                  ...roleState.roles.map((role) => ({ value: role._id, label: role.name.toUpperCase() })),
                ]}
                value={values.roleId}
              />
              <SearchableSelect
                id="employee-manager"
                label="Reporting Manager (optional)"
                name="manager"
                onChange={handleChange}
                options={[
                  { value: "", label: managerState.isLoading ? "Loading managers..." : "Not specified" },
                  ...managerState.candidates.map(employeeSelectOption),
                ]}
                value={values.manager}
              />
            </div>
          </section>
          <section>
            <h2 className="text-lg font-black text-ink">Profile Photo</h2>
            <div className="mt-4">
              <PhotoUploadField
                label=""
                onChange={(asset) => setValues((current) => ({ ...current, photo: asset }))}
                value={values.photo}
              />
            </div>
          </section>
          <section>
            <h2 className="text-lg font-black text-ink">Address</h2>
            <div className="mt-4">
              <EmployeeAddressFields errors={errors} onChange={handleChange} values={values} />
            </div>
          </section>
          <section>
            <h2 className="text-lg font-black text-ink">Emergency Contact</h2>
            <div className="mt-4">
              <EmergencyContactFields errors={errors} onChange={handleChange} values={values} />
            </div>
          </section>

          {actions.createEmployee.isError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
              {actions.createEmployee.errorMessage}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button to={ROUTES.SUPER_ADMIN.EMPLOYEES} variant="secondary">
              Cancel
            </Button>
            <Button disabled={actions.createEmployee.isLoading} type="submit">
              {actions.createEmployee.isLoading ? "Creating..." : "Create Employee"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
