import { MANUAL_ACTIVITY_TYPES } from "../constants/leadActivity.constants.js";

const trimOrUndefined = (value) => {
  const trimmed = String(value || "").trim();
  return trimmed || undefined;
};

const cleanPayload = (payload) =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));

export const pickManualActivityPayload = (values) =>
  cleanPayload({
    type: MANUAL_ACTIVITY_TYPES.includes(values.type) ? values.type : undefined,
    title: trimOrUndefined(values.title),
    description: trimOrUndefined(values.description),
    followUpAt: trimOrUndefined(values.followUpAt),
  });
