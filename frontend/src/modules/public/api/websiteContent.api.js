import { simulateNetwork } from "../../../utils/mockApi";
import {
  businessAdvantages,
  companyValues,
  heroImages,
  heroStats,
  productBenefits,
  trustPoints,
} from "../data/company.data";
import { testimonials } from "../data/testimonials.data";

export const websiteContentApi = {
  getHomeContent: () =>
    simulateNetwork({
      heroStats,
      heroImages,
      businessAdvantages,
      productBenefits,
      trustPoints,
      testimonials,
    }),
  getAboutContent: () =>
    simulateNetwork({
      heroImages,
      businessAdvantages,
      companyValues,
      productBenefits,
    }),
};
