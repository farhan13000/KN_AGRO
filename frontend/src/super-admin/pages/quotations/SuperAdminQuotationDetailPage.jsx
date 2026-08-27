import { ROUTES } from "../../../shared/constants";
import { QuotationDetailRouteView } from "../../../features/quotations";

export default function SuperAdminQuotationDetailPage() {
  return (
    <QuotationDetailRouteView
      backTo={ROUTES.SUPER_ADMIN.QUOTATIONS}
      detailPathFor={(quotation) => `${ROUTES.SUPER_ADMIN.QUOTATIONS}/${quotation._id}`}
      editPathFor={(quotation) => `${ROUTES.SUPER_ADMIN.QUOTATIONS}/${quotation._id}/edit`}
      leadDetailPathFor={(lead) => `${ROUTES.SUPER_ADMIN.LEADS}/${lead._id}`}
      orderDetailPathFor={(order) => `${ROUTES.SUPER_ADMIN.ORDERS}/${order._id}`}
      printPathFor={(quotation) => `${ROUTES.SUPER_ADMIN.QUOTATIONS}/${quotation._id}/print`}
      roleLabel="CRM"
    />
  );
}
