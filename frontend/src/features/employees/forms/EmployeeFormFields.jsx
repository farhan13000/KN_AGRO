import Select from "../../../shared/forms/Select";
import Textarea from "../../../shared/forms/Textarea";
import TextInput from "../../../shared/forms/TextInput";
import { EMPLOYMENT_TYPE_LABELS } from "../constants";

const employmentTypeOptions = [
  { value: "", label: "Select employment type" },
  ...Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

const getValue = (values, name) => values?.[name] ?? "";
const getError = (errors, name) => errors?.[name];

export function UserAccountFields({ errors = {}, onChange, values = {}, includePassword = false }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TextInput
        id="employee-name"
        label="Name"
        name="name"
        onChange={onChange}
        required
        type="text"
        value={getValue(values, "name")}
        error={getError(errors, "name")}
      />
      <TextInput
        id="employee-email"
        label="Email"
        name="email"
        onChange={onChange}
        required
        type="email"
        value={getValue(values, "email")}
        error={getError(errors, "email")}
      />
      {includePassword ? (
        <TextInput
          id="employee-temporary-password"
          label="Temporary Password"
          name="temporaryPassword"
          onChange={onChange}
          required
          type="password"
          value={getValue(values, "temporaryPassword")}
          error={getError(errors, "temporaryPassword")}
        />
      ) : null}
    </div>
  );
}

export function EmployeeProfileFields({
  errors = {},
  includeEmploymentDetails = true,
  onChange,
  values = {},
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TextInput
        id="employee-phone"
        label="Phone"
        name="phone"
        onChange={onChange}
        required
        type="tel"
        value={getValue(values, "phone")}
        error={getError(errors, "phone")}
      />
      {includeEmploymentDetails ? (
        <>
          <TextInput
            id="employee-department"
            label="Department"
            name="department"
            onChange={onChange}
            required
            type="text"
            value={getValue(values, "department")}
            error={getError(errors, "department")}
          />
          <TextInput
            id="employee-designation"
            label="Designation"
            name="designation"
            onChange={onChange}
            required
            type="text"
            value={getValue(values, "designation")}
            error={getError(errors, "designation")}
          />
          <TextInput
            id="employee-date-of-joining"
            label="Date of Joining"
            name="dateOfJoining"
            onChange={onChange}
            required
            type="date"
            value={getValue(values, "dateOfJoining")}
            error={getError(errors, "dateOfJoining")}
          />
          <Select
            id="employee-employment-type"
            label="Employment Type"
            name="employmentType"
            onChange={onChange}
            options={employmentTypeOptions}
            value={getValue(values, "employmentType")}
            error={getError(errors, "employmentType")}
          />
        </>
      ) : null}
    </div>
  );
}

export function EmployeeAddressFields({ errors = {}, onChange, values = {} }) {
  const address = values.address || {};

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TextInput
        id="employee-address-line1"
        label="Address Line 1"
        name="address.line1"
        onChange={onChange}
        type="text"
        value={address.line1 || ""}
        error={getError(errors, "address.line1")}
      />
      <TextInput
        id="employee-address-line2"
        label="Address Line 2"
        name="address.line2"
        onChange={onChange}
        type="text"
        value={address.line2 || ""}
        error={getError(errors, "address.line2")}
      />
      <TextInput
        id="employee-address-city"
        label="City"
        name="address.city"
        onChange={onChange}
        type="text"
        value={address.city || ""}
        error={getError(errors, "address.city")}
      />
      <TextInput
        id="employee-address-state"
        label="State"
        name="address.state"
        onChange={onChange}
        type="text"
        value={address.state || ""}
        error={getError(errors, "address.state")}
      />
      <TextInput
        id="employee-address-postal-code"
        label="Postal Code"
        name="address.postalCode"
        onChange={onChange}
        type="text"
        value={address.postalCode || ""}
        error={getError(errors, "address.postalCode")}
      />
      <TextInput
        id="employee-address-country"
        label="Country"
        name="address.country"
        onChange={onChange}
        type="text"
        value={address.country || ""}
        error={getError(errors, "address.country")}
      />
    </div>
  );
}

export function EmergencyContactFields({ errors = {}, onChange, values = {} }) {
  const emergencyContact = values.emergencyContact || {};

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <TextInput
        id="employee-emergency-name"
        label="Emergency Contact Name"
        name="emergencyContact.name"
        onChange={onChange}
        type="text"
        value={emergencyContact.name || ""}
        error={getError(errors, "emergencyContact.name")}
      />
      <TextInput
        id="employee-emergency-relationship"
        label="Relationship"
        name="emergencyContact.relationship"
        onChange={onChange}
        type="text"
        value={emergencyContact.relationship || ""}
        error={getError(errors, "emergencyContact.relationship")}
      />
      <TextInput
        id="employee-emergency-phone"
        label="Emergency Contact Phone"
        name="emergencyContact.phone"
        onChange={onChange}
        type="tel"
        value={emergencyContact.phone || ""}
        error={getError(errors, "emergencyContact.phone")}
      />
    </div>
  );
}

export function RegistrationPreferenceFields({ errors = {}, onChange, values = {} }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TextInput
        id="registration-requested-department"
        label="Requested Department"
        name="requestedDepartment"
        onChange={onChange}
        type="text"
        value={getValue(values, "requestedDepartment")}
        error={getError(errors, "requestedDepartment")}
      />
      <TextInput
        id="registration-requested-designation"
        label="Requested Designation"
        name="requestedDesignation"
        onChange={onChange}
        type="text"
        value={getValue(values, "requestedDesignation")}
        error={getError(errors, "requestedDesignation")}
      />
    </div>
  );
}

export function RejectionReasonField({ error, onChange, value = "" }) {
  return (
    <Textarea
      id="employee-rejection-reason"
      label="Rejection Reason"
      name="rejectionReason"
      onChange={onChange}
      required
      value={value}
      error={error}
    />
  );
}
