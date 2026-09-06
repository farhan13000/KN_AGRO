import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { ROUTES } from "../../../shared/constants";
import {
  EmergencyContactFields,
  EmployeeAddressFields,
  EmployeeProfileFields,
  pickUpdateEmployeePayload,
  toDateInputValue,
  updateNestedValue,
  useEmployeeActions,
  useEmployeeDetail,
  validateUpdateEmployeeForm,
} from "../../../features/employees";
import { PhotoUploadField } from "../../../features/media";

const toFormValues = (employee) => ({
  phone: employee?.phone || "",
  department: employee?.department || "",
  designation: employee?.designation || "",
  dateOfJoining: toDateInputValue(employee?.dateOfJoining),
  employmentType: employee?.employmentType || "",
  photo: employee?.photo || null,
  address: employee?.address || {},
  emergencyContact: employee?.emergencyContact || {},
});

export default function SuperAdminEmployeeEditPage() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const employeeState = useEmployeeDetail(employeeId);
  const employee = employeeState.data?.employee;
  const [values, setValues] = useState(toFormValues(null));
  const [errors, setErrors] = useState({});
  const actions = useEmployeeActions();

  useEffect(() => {
    if (employee) {
      setValues(toFormValues(employee));
      setErrors({});
    }
  }, [employee]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => updateNestedValue(current, name, value));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validateUpdateEmployeeForm(values);
    setErrors(validation.errors);

    if (!validation.isValid) return;

    await actions.updateEmployee.mutate(employeeId, pickUpdateEmployeePayload(values));
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
          Update only backend-approved business profile fields. Lifecycle actions stay on dedicated endpoints.
        </p>
      </div>

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
              {actions.updateEmployee.isLoading ? "Saving..." : "Save Employee"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
