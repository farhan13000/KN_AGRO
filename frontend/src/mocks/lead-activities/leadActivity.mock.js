import { LEAD_ACTIVITY_TYPE } from "../../features/lead-activities/constants";
import { simulateNetwork } from "../../utils/mockApi";

export const mockLeadActivities = [
  {
    _id: "66f000000000000000000801",
    lead: "66f000000000000000000701",
    type: LEAD_ACTIVITY_TYPE.LEAD_CREATED,
    title: "Lead created",
    description: "Website enquiry created this lead.",
    oldValue: null,
    newValue: null,
    followUpAt: null,
    completedAt: null,
    performedBy: null,
    performedByEmployee: null,
    createdAt: "2026-08-22T07:30:00.000Z",
  },
  {
    _id: "66f000000000000000000802",
    lead: "66f000000000000000000701",
    type: LEAD_ACTIVITY_TYPE.CALL,
    title: "Introductory call",
    description: "Discussed product quantity and delivery window.",
    oldValue: null,
    newValue: null,
    followUpAt: "2026-08-25T05:30:00.000Z",
    completedAt: null,
    performedBy: "66f000000000000000000901",
    performedByEmployee: "66f000000000000000000601",
    createdAt: "2026-08-23T10:30:00.000Z",
  },
];

const paginate = (items, query = {}) => {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  const start = (page - 1) * limit;
  return {
    activities: items.slice(start, start + limit),
    pagination: {
      page,
      limit,
      total: items.length,
      pages: Math.max(1, Math.ceil(items.length / limit)),
    },
  };
};

export const mockLeadActivityApi = {
  getLeadActivities: (leadId, query) => {
    const activities = mockLeadActivities
      .filter((activity) => activity.lead === leadId)
      .filter((activity) => !query?.type || activity.type === query.type)
      .sort((a, b) =>
        query?.sortOrder === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt),
      );
    return simulateNetwork(paginate(activities, query));
  },

  createManualActivity: (leadId, payload) =>
    simulateNetwork({
      activity: {
        ...payload,
        _id: `66f000000000000000${Date.now().toString().slice(-6)}`,
        lead: leadId,
        oldValue: null,
        newValue: null,
        completedAt: null,
        performedBy: "66f000000000000000000901",
        performedByEmployee: "66f000000000000000000601",
        createdAt: new Date().toISOString(),
      },
    }),
};
