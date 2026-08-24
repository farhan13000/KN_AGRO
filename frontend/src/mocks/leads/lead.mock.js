import { LEAD_PRIORITY, LEAD_SOURCE, LEAD_STATUS } from "../../features/leads/constants";
import { simulateNetwork } from "../../utils/mockApi";

const now = "2026-08-24T09:00:00.000Z";

const manager = {
  _id: "66f000000000000000000501",
  employeeCode: "EMP-MGR-001",
  designation: "Sales Manager",
  user: { name: "Asha Manager" },
};

const employee = {
  _id: "66f000000000000000000601",
  employeeCode: "EMP-SAL-001",
  designation: "Sales Executive",
  user: { name: "Ravi Executive" },
};

const product = {
  _id: "66f000000000000000000201",
  productCode: "PRD-0001",
  name: "KN Bio Growth",
  slug: "kn-bio-growth",
};

export const mockLeads = [
  {
    _id: "66f000000000000000000701",
    leadCode: "LED-0001",
    name: "Vikram Patel",
    companyName: "Patel Farms",
    phone: "9876543210",
    email: "vikram@example.com",
    location: "Indore",
    source: LEAD_SOURCE.WEBSITE,
    interestedProducts: [product],
    message: "Interested in seasonal bio fertilizer supply.",
    assignedManager: manager,
    assignedEmployee: employee,
    priority: LEAD_PRIORITY.HIGH,
    status: LEAD_STATUS.FOLLOW_UP,
    expectedValue: 125000,
    nextFollowUpAt: "2026-08-25T05:30:00.000Z",
    lastContactedAt: "2026-08-23T10:30:00.000Z",
    lostReason: "",
    convertedAt: null,
    closedAt: null,
    createdAt: "2026-08-22T07:30:00.000Z",
    updatedAt: now,
  },
  {
    _id: "66f000000000000000000702",
    leadCode: "LED-0002",
    name: "Neha Traders",
    companyName: "Neha Agro Traders",
    phone: "9123456789",
    email: "orders@example.com",
    location: "Nagpur",
    source: LEAD_SOURCE.PHONE,
    interestedProducts: [],
    message: "Dealer enquiry for bulk products.",
    assignedManager: null,
    assignedEmployee: null,
    priority: LEAD_PRIORITY.MEDIUM,
    status: LEAD_STATUS.NEW,
    expectedValue: 0,
    nextFollowUpAt: null,
    lastContactedAt: null,
    lostReason: "",
    convertedAt: null,
    closedAt: null,
    createdAt: "2026-08-24T06:00:00.000Z",
    updatedAt: now,
  },
];

const paginate = (items, query = {}) => {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    pagination: {
      page,
      limit,
      total: items.length,
      pages: Math.max(1, Math.ceil(items.length / limit)),
    },
  };
};

const applyFilters = (query = {}) =>
  mockLeads.filter((lead) => {
    const search = String(query.search || "").toLowerCase();
    const matchesSearch =
      !search ||
      [lead.leadCode, lead.name, lead.companyName, lead.phone, lead.email, lead.location]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search));
    return (
      matchesSearch &&
      (!query.status || lead.status === query.status) &&
      (!query.priority || lead.priority === query.priority) &&
      (!query.source || lead.source === query.source)
    );
  });

const toListItem = ({ message, lostReason, convertedAt, closedAt, updatedAt, ...lead }) => lead;

const responseWithLead = (lead) => ({ lead });

const addSystemActivity = () => undefined;

export const mockLeadApi = {
  submitPublicEnquiry: (payload) =>
    simulateNetwork({
      leadCode: `LED-${Date.now()}`,
      submitted: true,
      ...payload,
    }),

  getLeads: (query) => {
    const { items, pagination } = paginate(applyFilters(query), query);
    return simulateNetwork({ leads: items.map(toListItem), pagination });
  },

  getLeadById: (leadId) =>
    simulateNetwork({
      lead: mockLeads.find((lead) => lead._id === leadId) || null,
      recentActivities: [],
    }),

  createLead: (payload) =>
    simulateNetwork(
      responseWithLead({
        ...payload,
        _id: "66f000000000000000000799",
        leadCode: "LED-0003",
        source: payload.source || LEAD_SOURCE.MANUAL,
        priority: payload.priority || LEAD_PRIORITY.MEDIUM,
        status: LEAD_STATUS.NEW,
        expectedValue: payload.expectedValue || 0,
        assignedManager: payload.assignedManager || null,
        assignedEmployee: payload.assignedEmployee || null,
        createdAt: now,
        updatedAt: now,
      }),
    ),

  updateLead: (leadId, payload) =>
    simulateNetwork(responseWithLead({ ...(mockLeads.find((lead) => lead._id === leadId) || mockLeads[0]), ...payload })),

  assignManager: (leadId, managerId) => {
    addSystemActivity();
    return simulateNetwork(
      responseWithLead({
        ...(mockLeads.find((lead) => lead._id === leadId) || mockLeads[0]),
        assignedManager: managerId ? manager : null,
      }),
    );
  },

  assignEmployee: (leadId, employeeId) => {
    addSystemActivity();
    return simulateNetwork(
      responseWithLead({
        ...(mockLeads.find((lead) => lead._id === leadId) || mockLeads[0]),
        assignedEmployee: employeeId ? employee : null,
      }),
    );
  },

  changeStatus: (leadId, payload) =>
    simulateNetwork(responseWithLead({ ...(mockLeads.find((lead) => lead._id === leadId) || mockLeads[0]), status: payload.status })),

  changePriority: (leadId, payload) =>
    simulateNetwork(responseWithLead({ ...(mockLeads.find((lead) => lead._id === leadId) || mockLeads[0]), priority: payload.priority })),

  scheduleFollowUp: (leadId, payload) =>
    simulateNetwork({
      nextFollowUpAt: payload.followUpAt,
      lead: { ...(mockLeads.find((lead) => lead._id === leadId) || mockLeads[0]), nextFollowUpAt: payload.followUpAt },
      activity: null,
    }),

  completeFollowUp: (leadId, payload) =>
    simulateNetwork({
      nextFollowUpAt: payload.nextFollowUpAt || null,
      lead: { ...(mockLeads.find((lead) => lead._id === leadId) || mockLeads[0]), nextFollowUpAt: payload.nextFollowUpAt || null },
      activities: [],
    }),

  reopenLead: (leadId) =>
    simulateNetwork(responseWithLead({ ...(mockLeads.find((lead) => lead._id === leadId) || mockLeads[0]), status: LEAD_STATUS.FOLLOW_UP })),

  getFollowUps: (kind, query) => {
    const followUps = mockLeads.filter((lead) => lead.nextFollowUpAt);
    const { items, pagination } = paginate(followUps, query);
    return simulateNetwork({ leads: items.map(toListItem), pagination, kind });
  },

  getUnassignedLeads: (query) => {
    const { items, pagination } = paginate(mockLeads.filter((lead) => !lead.assignedManager), query);
    return simulateNetwork({ leads: items.map(toListItem), pagination });
  },

  getLeadSummary: () =>
    simulateNetwork({
      totalLeads: mockLeads.length,
      newLeads: mockLeads.filter((lead) => lead.status === LEAD_STATUS.NEW).length,
      followUpsDue: mockLeads.filter((lead) => lead.nextFollowUpAt).length,
      qualifiedLeads: mockLeads.filter((lead) => lead.status === LEAD_STATUS.QUALIFIED).length,
      lostLeads: mockLeads.filter((lead) => lead.status === LEAD_STATUS.LOST).length,
      expectedPipelineValue: mockLeads.reduce((sum, lead) => sum + Number(lead.expectedValue || 0), 0),
    }),
};
