import { simulateNetwork } from "../../../../utils/mockApi";

export const publicEnquiriesApi = {
  submitEnquiry: (payload) =>
    simulateNetwork({
      id: `ENQ-${Date.now()}`,
      ...payload,
      status: "RECORDED",
    }),
};
