import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import { ROUTES } from "../../../shared/constants";
import {
  EmergencyContactFields,
  EmployeeAddressFields,
  EmployeeProfileFields,
  UserAccountFields,
  pickCreateEmployeePayload,
  updateNestedValue,
  useEmployeeActions,
  validateCreateEmployeeForm,
} from "../../../features/employees";

const initialValues = {
  name: "",
  email: "",
  temporaryPassword: "",
  phone: "",
  department: "",
  designation: "",
  dateOfJoining: "",
  employmentType: "",
  address: {},
  emergencyContact: {},
};

export default function SuperAdminEmployeeCreatePage() {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const actions = useEmployeeActions();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => updateNestedValue(current, name, value));
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
