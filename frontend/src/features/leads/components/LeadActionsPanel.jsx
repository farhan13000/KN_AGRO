import {
  BadgeCheck,
  CalendarCheck,
  ClipboardList,
  GitPullRequest,
  MessageSquarePlus,
  PackagePlus,
  Pencil,
  ShieldX,
  SlidersHorizontal,
  UserPlus,
  Wallet,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import { useAuth } from "../../../core/auth";
import { ManualActivityDialog } from "../../lead-activities";
import {
  AssignmentDialog,
  CloseLeadDialog,
  ExpectedValueDialog,
  FollowUpCompleteDialog,
  FollowUpScheduleDialog,
  LeadEditDialog,
  MarkLostDialog,
  PriorityChangeDialog,
  ProductInterestDialog,
  QualifyLeadDialog,
  StatusChangeDialog,
} from "./LeadCommandDialogs";
import { getLeadCapabilities } from "../utils";

const actionButtonClass = "w-full justify-start rounded-lg";

export default function LeadActionsPanel({ lead, onSuccess }) {
  const { hasPermission, role } = useAuth();
  const [dialog, setDialog] = useState("");

  const {
    canAddActivity,
    canAssignEmployee,
    canAssignManager,
    canChangePriority,
    canChangeStatus,
    canCloseLead,
    canCompleteFollowUp,
    canEditLead,
    canMarkLost,
    canQualify,
    canScheduleFollowUp,
    canUpdateExpectedValue,
    canUpdateProductInterest,
  } = getLeadCapabilities({ hasPermission, lead, role });

  if (
    !canEditLead &&
    !canUpdateProductInterest &&
    !canChangePriority &&
    !canUpdateExpectedValue &&
    !canAssignManager &&
    !canAssignEmployee &&
    !canChangeStatus &&
    !canQualify &&
    !canMarkLost &&
    !canCloseLead &&
    !canScheduleFollowUp &&
    !canCompleteFollowUp &&
    !canAddActivity
  ) {
    return null;
  }

  return (
    <>
      <Card className="p-5">
        <h2 className="text-lg font-black text-ink">Actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {canEditLead ? (
            <Button className={actionButtonClass} onClick={() => setDialog("edit")} variant="secondary">
              <Pencil className="h-4 w-4" />
              Edit Details
            </Button>
          ) : null}
          {canUpdateProductInterest ? (
            <Button className={actionButtonClass} onClick={() => setDialog("products")} variant="secondary">
              <PackagePlus className="h-4 w-4" />
              Products
            </Button>
          ) : null}
          {canChangePriority ? (
            <Button className={actionButtonClass} onClick={() => setDialog("priority")} variant="secondary">
              <SlidersHorizontal className="h-4 w-4" />
              Priority
            </Button>
          ) : null}
          {canUpdateExpectedValue ? (
            <Button className={actionButtonClass} onClick={() => setDialog("expected-value")} variant="secondary">
              <Wallet className="h-4 w-4" />
              Expected Value
            </Button>
          ) : null}
          {canAssignManager ? (
            <Button className={actionButtonClass} onClick={() => setDialog("manager")} variant="secondary">
              <UserPlus className="h-4 w-4" />
              Manager
            </Button>
          ) : null}
          {canAssignEmployee ? (
            <Button className={actionButtonClass} onClick={() => setDialog("employee")} variant="secondary">
              <UserPlus className="h-4 w-4" />
              Employee
            </Button>
          ) : null}
          {canChangeStatus ? (
            <Button className={actionButtonClass} onClick={() => setDialog("status")} variant="secondary">
              <GitPullRequest className="h-4 w-4" />
              Status
            </Button>
          ) : null}
          {canQualify ? (
            <Button className={actionButtonClass} onClick={() => setDialog("qualified")} variant="secondary">
              <BadgeCheck className="h-4 w-4" />
              Qualified
            </Button>
          ) : null}
          {canMarkLost ? (
            <Button className={actionButtonClass} onClick={() => setDialog("lost")} variant="secondary">
              <ShieldX className="h-4 w-4" />
              Mark Lost
            </Button>
          ) : null}
          {canCloseLead ? (
            <Button className={actionButtonClass} onClick={() => setDialog("close")} variant="secondary">
              <XCircle className="h-4 w-4" />
              Close
            </Button>
          ) : null}
          {canScheduleFollowUp ? (
            <Button className={actionButtonClass} onClick={() => setDialog("follow-up")} variant="secondary">
              <ClipboardList className="h-4 w-4" />
              Follow-Up
            </Button>
          ) : null}
          {canCompleteFollowUp ? (
            <Button className={actionButtonClass} onClick={() => setDialog("complete-follow-up")} variant="secondary">
              <CalendarCheck className="h-4 w-4" />
              Complete Follow-Up
            </Button>
          ) : null}
          {canAddActivity ? (
            <Button className={actionButtonClass} onClick={() => setDialog("activity")} variant="secondary">
              <MessageSquarePlus className="h-4 w-4" />
              Activity
            </Button>
          ) : null}
        </div>
      </Card>

      <LeadEditDialog
        isOpen={dialog === "edit"}
        lead={lead}
        onClose={() => setDialog("")}
        onSuccess={onSuccess}
      />
      <ProductInterestDialog
        isOpen={dialog === "products"}
        lead={lead}
        onClose={() => setDialog("")}
        onSuccess={onSuccess}
      />
      <PriorityChangeDialog
        isOpen={dialog === "priority"}
        lead={lead}
        onClose={() => setDialog("")}
        onSuccess={onSuccess}
      />
      <ExpectedValueDialog
        isOpen={dialog === "expected-value"}
        lead={lead}
        onClose={() => setDialog("")}
        onSuccess={onSuccess}
      />
      <AssignmentDialog
        assignmentType="manager"
        isOpen={dialog === "manager"}
        lead={lead}
        onClose={() => setDialog("")}
        onSuccess={onSuccess}
      />
      <AssignmentDialog
        assignmentType="employee"
        isOpen={dialog === "employee"}
        lead={lead}
        onClose={() => setDialog("")}
        onSuccess={onSuccess}
      />
      <StatusChangeDialog
        isOpen={dialog === "status"}
        lead={lead}
        onClose={() => setDialog("")}
        onSuccess={onSuccess}
      />
      <QualifyLeadDialog
        isOpen={dialog === "qualified"}
        lead={lead}
        onClose={() => setDialog("")}
        onSuccess={onSuccess}
      />
      <MarkLostDialog
        isOpen={dialog === "lost"}
        lead={lead}
        onClose={() => setDialog("")}
        onSuccess={onSuccess}
      />
      <CloseLeadDialog
        isOpen={dialog === "close"}
        lead={lead}
        onClose={() => setDialog("")}
        onSuccess={onSuccess}
      />
      <FollowUpScheduleDialog
        isOpen={dialog === "follow-up"}
        lead={lead}
        onClose={() => setDialog("")}
        onSuccess={onSuccess}
      />
      <FollowUpCompleteDialog
        isOpen={dialog === "complete-follow-up"}
        lead={lead}
        onClose={() => setDialog("")}
        onSuccess={onSuccess}
      />
      <ManualActivityDialog
        isOpen={dialog === "activity"}
        lead={lead}
        onClose={() => setDialog("")}
        onSuccess={onSuccess}
      />
    </>
  );
}
