import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Select from "../../../shared/forms/Select";
import { PERMISSIONS, ROUTES } from "../../../shared/constants";
import { useAuth } from "../../../core/auth";
import {
  EmergencyContactFields,
  EmployeeAddressFields,
  EmployeeCoverageFields,
  EmployeeProfileFields,
  pickUpdateEmployeePayload,
  toDateInputValue,
  updateNestedValue,
  useEmployeeActions,
  useEmployeeDetail,
  validateUpdateEmployeeForm,
} from "../../../features/employees";
import { PhotoUploadField } from "../../../features/media";
import { useRoleOptions } from "../../../features/promotions";

/**
 * `originalRoleId` is carried in the form's own values rather than read
 * back from the employee on submit: the payload builder needs to know
 * whether the role actually moved, and a value that is part of the
 * comparison belongs beside the one it is compared against.
 */
const toFormValues = (employee) => ({
  roleId: employee?.user?.role?._id || "",
  originalRoleId: employee?.user?.role?._id || "",
  phone: employee?.phone || "",
  department: employee?.department || "",
  designation: employee?.designation || "",
  dateOfJoining: toDateInputValue(employee?.dateOfJoining),
  employmentType: employee?.employmentType || "",
  photo: employee?.photo || null,
  address: employee?.address || {},
  emergencyContact: employee?.emergencyContact || {},
  coverage: employee?.coverage || { states: [], districts: [], posts: [] },
});

export default function SuperAdminEmployeeEditPage() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const employeeState = useEmployeeDetail(employeeId);
  const employee = employeeState.data?.employee;
  const [values, setValues] = useState(toFormValues(null));
  const [errors, setErrors] = useState({});
  const [sentForApproval, setSentForApproval] = useState(false);
  const actions = useEmployeeActions();
  const roleState = useRoleOptions();

  // Whoever may approve an employee edit makes it outright; everyone
  // else — in practice the Office Admin — is proposing one. Both press
  // the same Save, so the difference is said before they press it, not
  // discovered afterwards.
  const changesNeedApproval = !hasPermission(PERMISSIONS.EMPLOYEES_EDIT_APPROVE);

  useEffect(() => {
    if (employee) {
      setValues(toFormValues(employee));
      setErrors({});
      setSentForApproval(false);
    }
  }, [employee]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => updateNestedValue(current, name, value));
    setSentForApproval(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validateUpdateEmployeeForm(values);
    setErrors(validation.errors);

    if (!validation.isValid) return;

    const result = await actions.updateEmployee.mutate(employeeId, pickUpdateEmployeePayload(values));

    // A proposal comes back as a request, not an employee. Staying on the
    // page and saying so beats bouncing to a detail page that still shows
    // the old values and looks like the save was lost.
    if (result?.request) {
      setSentForApproval(true);
      return;
    }
    navigate(`${ROUTES.SUPER_ADMIN.EMPLOYEES}/${employeeId}`);
  };

  if (employeeState.isLoading) {
    return <PageLoader message="Loading employee..." />;
  }

  if (employeeState.isError) {
    return <ErrorState message={employeeState.errorMessage} title="Unable to load employee" />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Employee Management</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Edit Employee</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          {changesNeedApproval
            ? "Change anything here — role, locations, contact details. The Super Admin sees what you changed and applies it."
            : "Change the employee's work profile here. Activating, deactivating or marking them resigned is done from their detail page."}
        </p>
      </div>

      {sentForApproval ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <p className="text-sm font-black text-amber-900">Sent to the Super Admin for approval</p>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            Nothing on {employee?.user?.name || "this employee"} has changed yet. It takes effect the moment they
            say yes, and you will be told either way.
          </p>
        </div>
      ) : null}

      <Card className="p-5">
        <form className="space-y-7" onSubmit={handleSubmit}>
          <section>
            <h2 className="text-lg font-black text-ink">Read Only Account</h2>
            <dl className="mt-4 grid gap-4 rounded-lg bg-mint/60 p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-black text-forest">Name</dt>
                <dd className="mt-1 font-semibold text-ink">{employee?.user?.name || "Not Available"}</dd>
              </div>
              <div>
                <dt className="font-black text-forest">Email</dt>
                <dd className="mt-1 font-semibold text-ink">{employee?.user?.email || "Not Available"}</dd>
              </div>
              <div>
                <dt className="font-black text-forest">Employee Code</dt>
                <dd className="mt-1 font-semibold text-ink">{employee?.employeeCode || "Not Assigned"}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2 className="text-lg font-black text-ink">Role</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              What this person can see and do. Changing it moves them through the same checks a promotion does —
              an employee who still has people reporting to them cannot be moved into a role that holds none.
            </p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <Select
                id="employee-edit-role"
                label="Role"
                name="roleId"
                onChange={handleChange}
                options={[
                  { value: "", label: roleState.isLoading ? "Loading roles..." : "Not set" },
                  ...roleState.roles.map((role) => ({ value: role._id, label: role.name.toUpperCase() })),
                ]}
                value={values.roleId}
              />
            </div>
            {values.roleId && values.roleId !== values.originalRoleId ? (
              <p className="mt-3 rounded-lg border border-forest/15 bg-mint/60 px-3 py-2 text-sm font-semibold text-forest">
                Role change included in this save.
              </p>
            ) : null}
          </section>

          <section>
            <h2 className="text-lg font-black text-ink">Editable Employee Profile</h2>
            <div className="mt-4">
              <EmployeeProfileFields errors={errors} onChange={handleChange} values={values} />
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
          <section>
            <div className="mt-4">
              <EmployeeCoverageFields errors={errors} onChange={handleChange} value={values.coverage} />
            </div>
          </section>

          {actions.updateEmployee.isError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
              {actions.updateEmployee.errorMessage}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button to={`${ROUTES.SUPER_ADMIN.EMPLOYEES}/${employeeId}`} variant="secondary">
              Cancel
            </Button>
            <Button disabled={actions.updateEmployee.isLoading} type="submit">
              {actions.updateEmployee.isLoading
                ? "Saving..."
                : changesNeedApproval
                  ? "Send for approval"
                  : "Save Employee"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
