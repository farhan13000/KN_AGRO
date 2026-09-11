import {
  AlarmClock,
  AlertOctagon,
  AlertTriangle,
  ArrowRightLeft,
  Award,
  Bell,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardEdit,
  ClipboardList,
  FileCheck,
  FileText,
  FileX,
  Info,
  LogIn,
  LogOut,
  MapPin,
  MapPinCheck,
  MessageCircle,
  PackageCheck,
  Send,
  ShoppingCart,
  TrendingUp,
  Truck,
  UserCheck,
  UserCog,
  UserPlus,
  UserX,
  Wallet,
  XCircle,
} from "lucide-react";

// Mirrors backend/src/modules/notifications/notification.constants.js's
// NOTIFICATION_TYPE enum exactly (byte-for-byte string values) — every
// type the backend can ever emit, not only the 6 new Phase 15 ones, so a
// pre-migration notification (a lead assignment, an overdue invoice)
// renders with a real icon/label too, never the generic fallback.
export const NOTIFICATION_TYPE = Object.freeze({
  EMPLOYEE_APPROVAL_PENDING: "EMPLOYEE_APPROVAL_PENDING",
  EMPLOYEE_APPROVED: "EMPLOYEE_APPROVED",
  EMPLOYEE_REJECTED: "EMPLOYEE_REJECTED",
  EMPLOYEE_PROMOTED: "EMPLOYEE_PROMOTED",

  LEAD_ASSIGNED: "LEAD_ASSIGNED",
  LEAD_REASSIGNED: "LEAD_REASSIGNED",
  FOLLOW_UP_DUE: "FOLLOW_UP_DUE",
  FOLLOW_UP_OVERDUE: "FOLLOW_UP_OVERDUE",

  QUOTATION_SENT: "QUOTATION_SENT",
  QUOTATION_ACCEPTED: "QUOTATION_ACCEPTED",
  QUOTATION_REJECTED: "QUOTATION_REJECTED",

  ORDER_CREATED: "ORDER_CREATED",
  ORDER_CONFIRMED: "ORDER_CONFIRMED",
  ORDER_CANCELLED: "ORDER_CANCELLED",
  ORDER_DISPATCHED: "ORDER_DISPATCHED",
  ORDER_DELIVERED: "ORDER_DELIVERED",

  LOW_STOCK: "LOW_STOCK",
  OUT_OF_STOCK: "OUT_OF_STOCK",

  INVOICE_ISSUED: "INVOICE_ISSUED",
  INVOICE_OVERDUE: "INVOICE_OVERDUE",
  PAYMENT_RECORDED: "PAYMENT_RECORDED",

  LEAVE_REQUESTED: "LEAVE_REQUESTED",
  LEAVE_APPROVED: "LEAVE_APPROVED",
  LEAVE_REJECTED: "LEAVE_REJECTED",

  ATTENDANCE_CHECKED_IN: "ATTENDANCE_CHECKED_IN",
  ATTENDANCE_CHECKED_OUT: "ATTENDANCE_CHECKED_OUT",
  ATTENDANCE_CORRECTED: "ATTENDANCE_CORRECTED",

  DSR_SUBMITTED: "DSR_SUBMITTED",
  DSR_REQUESTED: "DSR_REQUESTED",
  REPORT_SUBMITTED: "REPORT_SUBMITTED",
  REPORT_REVIEWED: "REPORT_REVIEWED",
  REPORT_REJECTED: "REPORT_REJECTED",

  PAYROLL_PROCESSED: "PAYROLL_PROCESSED",
  PAYROLL_PAID: "PAYROLL_PAID",

  MESSAGE_RECEIVED: "MESSAGE_RECEIVED",

  // Org-hierarchy migration (backend Phase 15) — the 6 new notification-
  // producing actions this frontend phase specifically targets.
  HIRING_REQUEST_CREATED: "HIRING_REQUEST_CREATED",
  HIRING_REQUEST_APPROVED: "HIRING_REQUEST_APPROVED",
  HIRING_REQUEST_REJECTED: "HIRING_REQUEST_REJECTED",

  PROMOTION_RECOMMENDED: "PROMOTION_RECOMMENDED",
  PROMOTION_APPROVED: "PROMOTION_APPROVED",
  PROMOTION_REJECTED: "PROMOTION_REJECTED",

  EMPLOYEE_TRANSFERRED: "EMPLOYEE_TRANSFERRED",

  DISTRICT_ASSIGNMENT_REQUESTED: "DISTRICT_ASSIGNMENT_REQUESTED",
  DISTRICT_ASSIGNMENT_APPROVED: "DISTRICT_ASSIGNMENT_APPROVED",

  SALARY_PROPOSAL_RECOMMENDED: "SALARY_PROPOSAL_RECOMMENDED",
  SALARY_PROPOSAL_APPROVED: "SALARY_PROPOSAL_APPROVED",
  SALARY_PROPOSAL_REJECTED: "SALARY_PROPOSAL_REJECTED",

  SYSTEM: "SYSTEM",
  OTHER: "OTHER",
});

export const NOTIFICATION_SEVERITY = Object.freeze({
  INFO: "INFO",
  SUCCESS: "SUCCESS",
  WARNING: "WARNING",
  CRITICAL: "CRITICAL",
});

// StatusBadge's own tone vocabulary (success/warning/danger/neutral) —
// CRITICAL maps to "danger", the closest existing tone; StatusBadge has
// no separate critical tone of its own.
export const SEVERITY_TONE = Object.freeze({
  [NOTIFICATION_SEVERITY.INFO]: "neutral",
  [NOTIFICATION_SEVERITY.SUCCESS]: "success",
  [NOTIFICATION_SEVERITY.WARNING]: "warning",
  [NOTIFICATION_SEVERITY.CRITICAL]: "danger",
});

// icon + a short, human label per type — the "map a notification type to
// an icon/label" lookup Prompt 13.2 asks for. Grouped in source to match
// the backend's own NOTIFICATION_TYPE comment grouping, purely for
// readability; the object itself is flat.
export const NOTIFICATION_TYPE_META = Object.freeze({
  [NOTIFICATION_TYPE.EMPLOYEE_APPROVAL_PENDING]: { icon: UserCog, label: "Employee approval pending" },
  [NOTIFICATION_TYPE.EMPLOYEE_APPROVED]: { icon: UserCheck, label: "Employee approved" },
  [NOTIFICATION_TYPE.EMPLOYEE_REJECTED]: { icon: UserX, label: "Employee application rejected" },
  [NOTIFICATION_TYPE.EMPLOYEE_PROMOTED]: { icon: Award, label: "Employee promoted" },

  [NOTIFICATION_TYPE.LEAD_ASSIGNED]: { icon: UserPlus, label: "Lead assigned" },
  [NOTIFICATION_TYPE.LEAD_REASSIGNED]: { icon: UserPlus, label: "Lead reassigned" },
  [NOTIFICATION_TYPE.FOLLOW_UP_DUE]: { icon: AlarmClock, label: "Follow-up due" },
  [NOTIFICATION_TYPE.FOLLOW_UP_OVERDUE]: { icon: AlarmClock, label: "Follow-up overdue" },

  [NOTIFICATION_TYPE.QUOTATION_SENT]: { icon: Send, label: "Quotation sent" },
  [NOTIFICATION_TYPE.QUOTATION_ACCEPTED]: { icon: CheckCircle2, label: "Quotation accepted" },
  [NOTIFICATION_TYPE.QUOTATION_REJECTED]: { icon: XCircle, label: "Quotation rejected" },

  [NOTIFICATION_TYPE.ORDER_CREATED]: { icon: ShoppingCart, label: "Order created" },
  [NOTIFICATION_TYPE.ORDER_CONFIRMED]: { icon: CheckCircle2, label: "Order confirmed" },
  [NOTIFICATION_TYPE.ORDER_CANCELLED]: { icon: XCircle, label: "Order cancelled" },
  [NOTIFICATION_TYPE.ORDER_DISPATCHED]: { icon: Truck, label: "Order dispatched" },
  [NOTIFICATION_TYPE.ORDER_DELIVERED]: { icon: PackageCheck, label: "Order delivered" },

  [NOTIFICATION_TYPE.LOW_STOCK]: { icon: AlertTriangle, label: "Low stock" },
  [NOTIFICATION_TYPE.OUT_OF_STOCK]: { icon: AlertOctagon, label: "Out of stock" },

  [NOTIFICATION_TYPE.INVOICE_ISSUED]: { icon: FileText, label: "Invoice issued" },
  [NOTIFICATION_TYPE.INVOICE_OVERDUE]: { icon: AlertTriangle, label: "Invoice overdue" },
  [NOTIFICATION_TYPE.PAYMENT_RECORDED]: { icon: CircleDollarSign, label: "Payment recorded" },

  [NOTIFICATION_TYPE.LEAVE_REQUESTED]: { icon: CalendarClock, label: "Leave requested" },
  [NOTIFICATION_TYPE.LEAVE_APPROVED]: { icon: CalendarCheck, label: "Leave approved" },
  [NOTIFICATION_TYPE.LEAVE_REJECTED]: { icon: CalendarX, label: "Leave rejected" },

  [NOTIFICATION_TYPE.ATTENDANCE_CHECKED_IN]: { icon: LogIn, label: "Checked in" },
  [NOTIFICATION_TYPE.ATTENDANCE_CHECKED_OUT]: { icon: LogOut, label: "Checked out" },
  [NOTIFICATION_TYPE.ATTENDANCE_CORRECTED]: { icon: ClipboardEdit, label: "Attendance corrected" },

  [NOTIFICATION_TYPE.DSR_SUBMITTED]: { icon: ClipboardCheck, label: "DSR submitted" },
  [NOTIFICATION_TYPE.DSR_REQUESTED]: { icon: ClipboardList, label: "Daily report requested" },
  [NOTIFICATION_TYPE.REPORT_SUBMITTED]: { icon: FileCheck, label: "Report submitted" },
  [NOTIFICATION_TYPE.REPORT_REVIEWED]: { icon: FileCheck, label: "Report reviewed" },
  [NOTIFICATION_TYPE.REPORT_REJECTED]: { icon: FileX, label: "Report rejected" },

  [NOTIFICATION_TYPE.PAYROLL_PROCESSED]: { icon: Wallet, label: "Payroll processed" },
  [NOTIFICATION_TYPE.PAYROLL_PAID]: { icon: CircleDollarSign, label: "Salary paid" },

  [NOTIFICATION_TYPE.MESSAGE_RECEIVED]: { icon: MessageCircle, label: "New message" },

  [NOTIFICATION_TYPE.HIRING_REQUEST_CREATED]: { icon: UserPlus, label: "Hiring request created" },
  [NOTIFICATION_TYPE.HIRING_REQUEST_APPROVED]: { icon: UserCheck, label: "Hiring request approved" },
  [NOTIFICATION_TYPE.HIRING_REQUEST_REJECTED]: { icon: UserX, label: "Hiring request rejected" },

  [NOTIFICATION_TYPE.PROMOTION_RECOMMENDED]: { icon: TrendingUp, label: "Promotion recommended" },
  [NOTIFICATION_TYPE.PROMOTION_APPROVED]: { icon: Award, label: "Promotion approved" },
  [NOTIFICATION_TYPE.PROMOTION_REJECTED]: { icon: XCircle, label: "Promotion rejected" },

  [NOTIFICATION_TYPE.EMPLOYEE_TRANSFERRED]: { icon: ArrowRightLeft, label: "Assignment transferred" },

  [NOTIFICATION_TYPE.DISTRICT_ASSIGNMENT_REQUESTED]: { icon: MapPin, label: "District assignment requested" },
  [NOTIFICATION_TYPE.DISTRICT_ASSIGNMENT_APPROVED]: { icon: MapPinCheck, label: "District assignment approved" },

  [NOTIFICATION_TYPE.SALARY_PROPOSAL_RECOMMENDED]: { icon: TrendingUp, label: "Salary proposal recommended" },
  [NOTIFICATION_TYPE.SALARY_PROPOSAL_APPROVED]: { icon: CircleDollarSign, label: "Salary proposal approved" },
  [NOTIFICATION_TYPE.SALARY_PROPOSAL_REJECTED]: { icon: XCircle, label: "Salary proposal rejected" },

  [NOTIFICATION_TYPE.SYSTEM]: { icon: Info, label: "System notice" },
  [NOTIFICATION_TYPE.OTHER]: { icon: Bell, label: "Notification" },
});

// Genuine fallback — only reached for a type this map doesn't know about
// (e.g. a future backend addition the frontend hasn't been updated for
// yet), never for any of the types enumerated above.
export const DEFAULT_NOTIFICATION_META = { icon: Bell, label: "Notification" };

export const getNotificationTypeMeta = (type) => NOTIFICATION_TYPE_META[type] || DEFAULT_NOTIFICATION_META;
