import { ChatsWorkspace } from "../../../features/conversations";
import { ROUTES } from "../../../shared/constants";

/**
 * A Field Officer's chats: their own team, everyone above them in
 * their chain, and head office.
 *
 * The screen itself is shared across all three portals — only the base
 * path differs, since each portal keeps its own URLs. Who appears in the
 * directory behind it is decided by the server, per viewer.
 */
export default function EmployeeChatsPage() {
  return <ChatsWorkspace basePath={ROUTES.EMPLOYEE.CHATS} />;
}
