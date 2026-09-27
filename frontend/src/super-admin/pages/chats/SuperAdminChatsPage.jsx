import { ChatsWorkspace } from "../../../features/conversations";
import { ROUTES } from "../../../shared/constants";

/**
 * Head office chats. The Super Admin and the Office Admin can reach
 * anyone in the company, and anyone can reach them.
 *
 * The screen itself is shared across all three portals — only the base
 * path differs, since each portal keeps its own URLs. Who appears in the
 * directory behind it is decided by the server, per viewer.
 */
export default function SuperAdminChatsPage() {
  return <ChatsWorkspace basePath={ROUTES.SUPER_ADMIN.CHATS} />;
}
