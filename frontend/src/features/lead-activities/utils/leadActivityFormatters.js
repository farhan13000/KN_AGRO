import { LEAD_ACTIVITY_TYPE_LABELS } from "../constants";

export const formatLeadActivityType = (type) => LEAD_ACTIVITY_TYPE_LABELS[type] || type || "Activity";
