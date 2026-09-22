import { useState } from "react";
import {
  BadgeCheck,
  BellRing,
  CalendarCheck,
  ClipboardList,
  FileText,
  GitPullRequest,
  MessageSquarePlus,
  PackagePlus,
  Pencil,
  PhoneCall,
  ShieldX,
  SlidersHorizontal,
  UserPlus,
  XCircle,
} from "lucide-react";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import Modal from "../../../shared/components/Modal";
import Textarea from "../../../shared/forms/Textarea";
import { useAuth } from "../../../core/auth";
import { getApiErrorMessage } from "../../../core/api";
import { useAsyncMutation } from "../../../shared/hooks";
import { ManualActivityDialog } from "../../lead-activities";
import {
  AssignmentDialog,
  CloseLeadDialog,
  FollowUpCompleteDialog,
  FollowUpScheduleDialog,
  LeadEditDialog,
  MarkLostDialog,
  PriorityChangeDialog,
  QualifyLeadDialog,
  StatusChangeDialog,
} from "./LeadCommandDialogs";
import LeadMoreMenu from "./LeadMoreMenu";
import LeadPipelineStrip from "./LeadPipelineStrip";
import { useLeadActionRequests, useLeadActions, useRefreshLeadActionRequests } from "../hooks";
import { leadActionRequestApi } from "../services/leadActionRequestApi";
import { getLeadCapabilities } from "../utils";
import { getLeadNextStep } from "../utils/leadNextStep.js";

/**
 * THE TOP OF A LEAD: where it has got to, and the one thing to do next.
 *
 * This replaces a grid of ten equally-weighted buttons. The grid was an
 * honest list of what the API allows and a poor answer to the only
 * question anyone actually opens a lead with — what happens now. Four of
 * its buttons merely edited the lead and four merely moved its stage,
 * and several were offered when they could not be taken at all (a
 * "Complete Follow-Up" on a lead with no follow-up booked; "Create bill"
 * on a lead nobody had phoned).
 *
 * So: one sentence naming the next step, one button that does it, and
 * everything else behind More. What that next step IS lives in
 * leadNextStep.js — a pure function, because it depends on the stage,
 * on who is reading (a field officer asks for a quotation, a manager
 * prices one) and on what already exists against the lead, and that
 * ladder deserves to be readable in one place.
 *
 * NOTHING IS TAKEN AWAY. Every action the old panel offered is still
 * here; "Change stage" sits in More at every stage, including backwards,
 * because the backend allows movement in both directions on purpose and
 * a UI that locked the sequence would only generate requests to unlock
 * it. This changes what is offered FIRST, not what is permitted.
 */
const ignoreHandledError = () => {};

export default function LeadNextStepPanel({
  lead,
  onSuccess,
  orderDetailPathFor,
  quotationCreatePath = "",
  quotationDetailPathFor,
  work = {},
}) {
  const { hasPermission, role } = useAuth();
  const [dialog, setDialog] = useState("");
  const [requestNote, setRequestNote] = useState("");
  const [requestError, setRequestError] = useState("");

  const capabilities = getLeadCapabilities({ hasPermission, lead, role });
  const { pendingTypes } = useLeadActionRequests(lead?._id);
  const refreshRequests = useRefreshLeadActionRequests(lead?._id);

  const nextStep = getLeadNextStep({ capabilities, lead, work: { ...work, pendingRequestTypes: pendingTypes } });

  const closeDialog = () => {
    setDialog("");
    setRequestNote("");
    setRequestError("");
  };

  const actions = useLeadActions({
    onSuccess: async () => {
      closeDialog();
      await onSuccess?.();
    },
  });

  const askForQuotation = useAsyncMutation(
    (payload) => leadActionRequestApi.create(payload),
    {
      onSuccess: async () => {
        closeDialog();
        await refreshRequests();
        await onSuccess?.();
      },
    }
  );

  const handleLogFirstContact = () =>
    actions.changeStatus.mutate(lead._id, "CONTACTED").catch(ignoreHandledError);

  const handleAskForQuotation = async (event) => {
    event.preventDefault();
    setRequestError("");
    try {
      await askForQuotation.mutate({
        leadId: lead._id,
        type: "CREATE_QUOTATION",
        note: requestNote.trim(),
      });
    } catch (error) {
      setRequestError(getApiErrorMessage(error));
    }
  };

  /**
   * An action id from leadNextStep.js, turned into something pressable.
   * Link-shaped steps become a real `<a>` (via Button's `to`), the rest
   * open the dialog that already exists for them — this panel adds no
   * new way to do anything, it only decides what is offered first.
   */
  const renderAction = (step, variant) => {
    if (!step) return null;
    const isPrimary = variant === "primary";
    const className = "w-full justify-center sm:w-auto";

    const asLink = (to, Icon) => (
      <Button className={className} key={step.id} to={to} variant={isPrimary ? "primary" : "secondary"}>
        <Icon className="h-4 w-4" />
        {step.label}
      </Button>
    );
    const asButton = (onClick, Icon) => (
      <Button
        className={className}
        key={step.id}
        onClick={onClick}
        variant={isPrimary ? "primary" : "secondary"}
      >
        <Icon className="h-4 w-4" />
        {step.label}
      </Button>
    );

    switch (step.id) {
      case "log-first-contact":
        return asButton(() => setDialog("first-contact"), PhoneCall);
      case "qualify":
        return asButton(() => setDialog("qualified"), BadgeCheck);
      case "schedule-follow-up":
        return asButton(() => setDialog("follow-up"), ClipboardList);
      case "complete-follow-up":
        return asButton(() => setDialog("complete-follow-up"), CalendarCheck);
      case "create-quotation":
        return quotationCreatePath
          ? asLink(`${quotationCreatePath}?leadId=${lead._id}`, FileText)
          : null;
      case "request-quotation":
        return asButton(() => setDialog("ask-quotation"), BellRing);
      case "open-quotation":
        return quotationDetailPathFor ? asLink(quotationDetailPathFor(step.quotationId), FileText) : null;
      case "open-order":
        return orderDetailPathFor ? asLink(orderDetailPathFor(step.orderId), PackagePlus) : null;
      default:
        return null;
    }
  };

  // Whatever is already on the bar must not also be in the menu.
  const onTheBar = new Set(
    [nextStep?.primary?.id, ...(nextStep?.secondary || []).map((item) => item.id)].filter(Boolean)
  );
  const menuItem = (id, label, icon, onSelect, allowed, tone) =>
    allowed && !onTheBar.has(id) ? { id, label, icon, onSelect, tone } : null;

  const menuGroups = [
    {
      label: "Change the lead",
      items: [
        menuItem("edit", "Edit lead", Pencil, () => setDialog("edit"), capabilities.canEditLead),
        menuItem("status", "Change stage", GitPullRequest, () => setDialog("status"), capabilities.canChangeStatus),
        menuItem(
          "priority",
          "Set priority",
          SlidersHorizontal,
          () => setDialog("priority"),
          capabilities.canChangePriority
        ),
        menuItem(
          "employee",
          "Hand to another officer",
          UserPlus,
          () => setDialog("employee"),
          capabilities.canAssignEmployee
        ),
        menuItem("manager", "Assign a manager", UserPlus, () => setDialog("manager"), capabilities.canAssignManager),
      ],
    },
    {
      label: "Record something",
      items: [
        menuItem(
          "schedule-follow-up",
          "Schedule a follow-up",
          ClipboardList,
          () => setDialog("follow-up"),
          capabilities.canScheduleFollowUp
        ),
        menuItem(
          "complete-follow-up",
          "Complete the follow-up",
          CalendarCheck,
          () => setDialog("complete-follow-up"),
          capabilities.canCompleteFollowUp
        ),
        menuItem("activity", "Add a note", MessageSquarePlus, () => setDialog("activity"), capabilities.canAddActivity),
      ],
    },
    {
      items: [
        menuItem("lost", "Mark lost", ShieldX, () => setDialog("lost"), capabilities.canMarkLost, "danger"),
        menuItem("close", "Close this lead", XCircle, () => setDialog("close"), capabilities.canCloseLead, "danger"),
      ],
    },
  ];

  const hasMenu = menuGroups.some((group) => group.items.some(Boolean));
  if (!nextStep && !hasMenu) return null;

  const primary = renderAction(nextStep?.primary, "primary");
  const secondaries = (nextStep?.secondary || []).map((item) => renderAction(item, "secondary"));
  const hasBarActions = Boolean(primary) || secondaries.some(Boolean) || hasMenu;

  return (
    <>
      <Card className="p-5">
        <LeadPipelineStrip status={lead.status} />

        {nextStep ? (
          <div className="mt-5">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted">Next step</p>
            <h2 className="mt-1.5 text-xl font-black leading-tight text-ink">{nextStep.headline}</h2>
            <p className="mt-1 text-sm leading-6 text-muted">{nextStep.description}</p>
          </div>
        ) : null}

        {hasBarActions ? (
          // On a phone this bar is pinned to the bottom of the screen,
          // where the thumb already is — the lead's own details then get
          // the whole page instead of sharing the fold with a button
          // nobody needs until they have read them. `pb-28` on the page
          // (LeadDetailView) keeps the last card clear of it.
          <div className="mt-5 flex flex-col gap-3 max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-30 max-md:mt-0 max-md:border-t max-md:border-forest/10 max-md:bg-white max-md:p-4 max-md:shadow-[0_-10px_30px_rgba(24,34,26,0.10)] sm:flex-row sm:flex-wrap sm:items-center">
            {primary}
            {secondaries}
            <div className="sm:ml-auto">
              <LeadMoreMenu groups={menuGroups} />
            </div>
          </div>
        ) : null}

        {actions.changeStatus.errorMessage ? (
          <p
            className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800"
            role="alert"
          >
            {actions.changeStatus.errorMessage}
          </p>
        ) : null}
      </Card>

      <ConfirmDialog
        cancelLabel="Back"
        confirmLabel={actions.changeStatus.isLoading ? "Saving..." : "Yes, we spoke"}
        description={`Record that someone has now spoken to ${lead.name || "this lead"}? It moves to Contacted, and the next step becomes deciding whether to quote for them.`}
        isOpen={dialog === "first-contact"}
        onCancel={closeDialog}
        onConfirm={handleLogFirstContact}
        title="Log first contact"
      />
      <Modal isOpen={dialog === "ask-quotation"} onClose={closeDialog} title="Ask for a quotation">
        <form className="space-y-4" onSubmit={handleAskForQuotation}>
          <p className="text-sm leading-6 text-muted">
            Your manager is notified and prices it from the products recorded on this lead. The request closes by
            itself the moment they create the quotation.
          </p>
          <Textarea
            id="lead-ask-quotation-note"
            label="Anything they should know? (optional)"
            maxLength={500}
            onChange={(event) => setRequestNote(event.target.value)}
            value={requestNote}
          />
          {requestError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800" role="alert">
              {requestError}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button onClick={closeDialog} type="button" variant="secondary">
              Back
            </Button>
            <Button disabled={askForQuotation.isLoading} type="submit">
              {askForQuotation.isLoading ? "Sending..." : "Send request"}
            </Button>
          </div>
        </form>
      </Modal>

      <LeadEditDialog isOpen={dialog === "edit"} lead={lead} onClose={closeDialog} onSuccess={onSuccess} />
      <PriorityChangeDialog isOpen={dialog === "priority"} lead={lead} onClose={closeDialog} onSuccess={onSuccess} />
      <AssignmentDialog
        assignmentType="manager"
        isOpen={dialog === "manager"}
        lead={lead}
        onClose={closeDialog}
        onSuccess={onSuccess}
      />
      <AssignmentDialog
        assignmentType="employee"
        isOpen={dialog === "employee"}
        lead={lead}
        onClose={closeDialog}
        onSuccess={onSuccess}
      />
      <StatusChangeDialog isOpen={dialog === "status"} lead={lead} onClose={closeDialog} onSuccess={onSuccess} />
      <QualifyLeadDialog isOpen={dialog === "qualified"} lead={lead} onClose={closeDialog} onSuccess={onSuccess} />
      <MarkLostDialog isOpen={dialog === "lost"} lead={lead} onClose={closeDialog} onSuccess={onSuccess} />
      <CloseLeadDialog isOpen={dialog === "close"} lead={lead} onClose={closeDialog} onSuccess={onSuccess} />
      <FollowUpScheduleDialog
        isOpen={dialog === "follow-up"}
        lead={lead}
        onClose={closeDialog}
        onSuccess={onSuccess}
      />
      <FollowUpCompleteDialog
        isOpen={dialog === "complete-follow-up"}
        lead={lead}
        onClose={closeDialog}
        onSuccess={onSuccess}
      />
      <ManualActivityDialog isOpen={dialog === "activity"} lead={lead} onClose={closeDialog} onSuccess={onSuccess} />
    </>
  );
}
