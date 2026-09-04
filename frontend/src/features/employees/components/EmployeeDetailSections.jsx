import { useEmployeeLocations } from "../hooks/useEmployeeLocations";
import { formatEmploymentType, toDateInputValue } from "../utils";
import EmployeeDualStatus from "./EmployeeDualStatus";
import EmployeeStatusBadge from "./EmployeeStatusBadge";
import UserAccountStatusBadge from "./UserAccountStatusBadge";

function DetailItem({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-black uppercase text-forest">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{value || "Not Available"}</dd>
    </div>
  );
}

function Section({ children, title }) {
  return (
    <section className="rounded-lg border border-forest/10 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-ink">{title}</h2>
      <dl className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{children}</dl>
    </section>
  );
}

export default function EmployeeDetailSections({
  employee,
  showAccountStatus = true,
  showLifecycle = true,
  showStatusOverview = true,
}) {
  // region/district come back as raw ids on the employee payload.
  const { districtName, regionName } = useEmployeeLocations();
  const address = employee?.address || {};
  const emergencyContact = employee?.emergencyContact || {};

  return (
    <div className="space-y-5">
      <Section title="Identity">
        <DetailItem label="Employee Code" value={employee?.employeeCode} />
        <DetailItem label="Name" value={employee?.user?.name} />
        <DetailItem label="Email" value={employee?.user?.email} />
        {showAccountStatus ? (
          <div>
            <dt className="text-xs font-black uppercase text-forest">Account Status</dt>
            <dd className="mt-1">
              <UserAccountStatusBadge status={employee?.user?.status} />
            </dd>
          </div>
        ) : null}
      </Section>

      <Section title="Employment">
        <DetailItem label="Department" value={employee?.department || employee?.requestedDepartment} />
        <DetailItem label="Designation" value={employee?.designation || employee?.requestedDesignation} />
        <DetailItem label="Employment Type" value={formatEmploymentType(employee?.employmentType)} />
        <DetailItem label="Date of Joining" value={toDateInputValue(employee?.dateOfJoining) || "Not Set"} />
        <div>
          <dt className="text-xs font-black uppercase text-forest">Employee Status</dt>
          <dd className="mt-1">
            <EmployeeStatusBadge status={employee?.employeeStatus} />
          </dd>
        </div>
      </Section>

      {showStatusOverview ? (
        <section className="rounded-lg border border-forest/10 bg-mint/50 p-5 shadow-sm">
          <h2 className="text-lg font-black text-ink">Status Overview</h2>
          <div className="mt-4">
            <EmployeeDualStatus employee={employee} />
          </div>
        </section>
      ) : null}

      <Section title="Contact">
        <DetailItem label="Phone" value={employee?.phone} />
        <DetailItem label="Address Line 1" value={address.line1} />
        <DetailItem label="Address Line 2" value={address.line2} />
        <DetailItem label="City" value={address.city} />
        <DetailItem label="State" value={address.state} />
        <DetailItem label="Postal Code" value={address.postalCode} />
        <DetailItem label="Country" value={address.country} />
      </Section>

      <Section title="Manager / Hierarchy">
        <DetailItem label="Manager" value={employee?.manager?.user?.name} />
        <DetailItem label="Manager Code" value={employee?.manager?.employeeCode} />
        <DetailItem label="Manager Designation" value={employee?.manager?.designation} />
        <DetailItem label="Region" value={regionName(employee?.region)} />
        <DetailItem label="District" value={districtName(employee?.district)} />
      </Section>

      <Section title="Emergency Contact">
        <DetailItem label="Name" value={emergencyContact.name} />
        <DetailItem label="Relationship" value={emergencyContact.relationship} />
        <DetailItem label="Phone" value={emergencyContact.phone} />
      </Section>

      {showLifecycle ? (
        <Section title="Lifecycle Information">
          <DetailItem label="Approved At" value={toDateInputValue(employee?.approvedAt)} />
          <DetailItem label="Rejected At" value={toDateInputValue(employee?.rejectedAt)} />
          <DetailItem label="Rejection Reason" value={employee?.rejectionReason} />
          <DetailItem label="Created At" value={toDateInputValue(employee?.createdAt)} />
          <DetailItem label="Updated At" value={toDateInputValue(employee?.updatedAt)} />
        </Section>
      ) : null}
    </div>
  );
}
