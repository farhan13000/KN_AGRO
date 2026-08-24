import { leadApi } from "../../../../features/leads/services";

export const publicEnquiriesApi = {
  submitEnquiry: (payload) => leadApi.submitPublicEnquiry(payload),
};
