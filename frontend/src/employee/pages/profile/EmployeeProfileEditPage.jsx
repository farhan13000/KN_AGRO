import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPortalLabelForRole, useAuth } from "../../../core/auth";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { ROUTES } from "../../../shared/constants";
import {
  EmergencyContactFields,
  EmployeeAddressFields,
  EmployeeProfileFields,
  pickSelfUpdatePayload,
  updateNestedValue,
  useEmployeeActions,
  useMyEmployeeProfile,
  validateSelfUpdateEmployeeForm,
} from "../../../features/employees";
import { PhotoUploadField } from "../../../features/media";

const toFormValues = (employee) => ({
  phone: employee?.phone || "",
  photo: employee?.photo || null,
  address: employee?.address || {},
  emergencyContact: employee?.emergencyContact || {},
});

export default function EmployeeProfileEditPage() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const profileState = useMyEmployeeProfile();
  const employee = profileState.data?.employee;
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
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validateSelfUpdateEmployeeForm(values);
    setErrors(validation.errors);

    if (!validation.isValid) return;

    await actions.updateMyProfile.mutate(pickSelfUpdatePayload(values));
    await profileState.refetch();
    navigate(ROUTES.EMPLOYEE.PROFILE);
  };

  if (profileState.isLoading) {
    return <PageLoader message="Loading your employee profile..." />;
  }

  if (profileState.isError) {
    return <ErrorState message={profileState.errorMessage} title="Unable to load your profile" />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{getPortalLabelForRole(role)}</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Edit My Profile</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          You can update only the self-editable fields allowed by the backend: your photo, phone,
          address, and emergency contact.
        </p>
      </div>

      <Card className="p-5">
        <form className="space-y-7" onSubmit={handleSubmit}>
          <section>
            <h2 className="text-lg font-black text-ink">Read Only Profile</h2>
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
              <div>
                <dt className="font-black text-forest">Department</dt>
                <dd className="mt-1 font-semibold text-ink">{employee?.department || "Not Set"}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2 className="text-lg font-black text-ink">Contact</h2>
            <div className="mt-4">
              <EmployeeProfileFields
                errors={errors}
                includeEmploymentDetails={false}
                onChange={handleChange}
                values={values}
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

          {actions.updateMyProfile.isError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
              {actions.updateMyProfile.errorMessage}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button to={ROUTES.EMPLOYEE.PROFILE} variant="secondary">
              Cancel
            </Button>
            <Button disabled={actions.updateMyProfile.isLoading} type="submit">
              {actions.updateMyProfile.isLoading ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
