import { useMemo, useState } from "react";
import Card from "../../../shared/components/Card";
import ErrorState from "../../../shared/components/ErrorState";
import { PERMISSIONS } from "../../../shared/constants";
import { useAuth } from "../../../core/auth";
import { LEAVE_STATUS } from "../constants";
import { useAllLeaveList, useTeamLeaveList } from "../hooks";
import LeaveCard from "./LeaveCard";
import LeaveDecisionDialog from "./LeaveDecisionDialog";

/**
 * One person's leave requests, with the decision on the same screen as
 * their attendance — which is where the question "should I approve this?"
 * is actually asked.
 *
 * Same endpoint split as the attendance calendar: `leaves.read_all` reads
 * anyone, `leaves.read_team` only the caller's downline, and exactly one
 * of the two runs. Approve/Reject render on `leaves.approve` alone; the
 * backend still decides whether this caller may decide THIS request, and
 * its 403 is the authority — the same posture TeamLeavesListView takes.
 */
export default function EmployeeLeaveApprovalsSection({ employeeId }) {
  const { hasPermission } = useAuth();
  const [deciding, setDeciding] = useState(null);

  const canReadAll = hasPermission(PERMISSIONS.LEAVES_READ_ALL);
  const canReadTeam = hasPermission(PERMISSIONS.LEAVES_READ_TEAM);
  const canApprove = hasPermission(PERMISSIONS.LEAVES_APPROVE);

  const query = useMemo(() => ({ employee: employeeId, limit: 20, page: 1 }), [employeeId]);
  const allState = useAllLeaveList(query, { enabled: Boolean(employeeId) && canReadAll });
  const teamState = useTeamLeaveList(query, {
    enabled: Boolean(employeeId) && !canReadAll && canReadTeam,
  });
  const state = canReadAll ? allState : teamState;

  if (!canReadAll && !canReadTeam) return null;

  const leaves = state.leaves || [];
  const pending = leaves.filter((leave) => leave.status === LEAVE_STATUS.PENDING).length;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-black text-ink">Leave</h2>
        <span className="text-sm font-bold text-muted">
          {pending ? `${pending} awaiting a decision` : "Nothing pending"}
        </span>
      </div>

      {state.isError ? (
        <div className="mt-4">
          <ErrorState message={state.errorMessage} title="Unable to load leave requests" />
        </div>
      ) : null}

      {!state.isError && !leaves.length ? (
        <p className="mt-3 text-sm text-muted">This person has not requested leave.</p>
      ) : null}

      {leaves.length ? (
        <ul className="mt-4 space-y-3">
          {leaves.map((leave) => (
            <LeaveCard
              actions={
                canApprove && leave.status === LEAVE_STATUS.PENDING ? (
                  <>
                    <button
                      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
                      onClick={() => setDeciding({ leave, decision: "approve" })}
                      type="button"
                    >
                      Approve
                    </button>
                    <button
                      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-50"
                      onClick={() => setDeciding({ leave, decision: "reject" })}
                      type="button"
                    >
                      Reject
                    </button>
                  </>
                ) : null
              }
              key={leave._id}
              leave={leave}
            />
          ))}
        </ul>
      ) : null}

      <LeaveDecisionDialog
        decision={deciding?.decision}
        isOpen={Boolean(deciding)}
        leave={deciding?.leave}
        onClose={() => setDeciding(null)}
        onSuccess={() => {
          setDeciding(null);
          state.refetch?.();
        }}
      />
    </Card>
  );
}
