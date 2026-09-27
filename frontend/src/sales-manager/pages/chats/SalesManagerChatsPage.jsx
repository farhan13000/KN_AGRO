import { ChatsWorkspace } from "../../../features/conversations";
import { ROUTES } from "../../../shared/constants";

/**
 * A manager's chats: the people reporting to them, their own seniors,
 * their fellow managers under the same boss, and head office.
 *
 * The screen itself is shared across all three portals — only the base
 * path differs, since each portal keeps its own URLs. Who appears in the
 * directory behind it is decided by the server, per viewer.
 */
export default function SalesManagerChatsPage() {
  return <ChatsWorkspace basePath={ROUTES.SALES_MANAGER.CHATS} />;
}
