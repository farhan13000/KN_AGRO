export const leadActivityQueryKeys = Object.freeze({
  all: ["lead-activities"],
  timeline: (leadId, query) => ["lead-activities", "timeline", leadId, query],
});
