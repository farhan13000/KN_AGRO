import { companyConfig } from "../config/company.config";

export const buildWhatsAppUrl = (message) => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${companyConfig.whatsapp}?text=${encodedMessage}`;
};
