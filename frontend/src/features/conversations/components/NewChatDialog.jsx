import { useMemo } from "react";
import Avatar from "../../../shared/components/Avatar";
import Modal from "../../../shared/components/Modal";
import { LoadingSpinner } from "../../../shared/components";
import { ROLE_LABELS } from "../../../shared/constants";
import { getRelationshipLabel, RELATIONSHIP_ORDER } from "../constants";

/**
 * WHO YOU MAY WRITE TO — the server's answer, not a filtered copy of the
 * employee list. Everyone here is someone the send endpoint will accept,
 * because the same policy decides both (see the backend's
 * conversationScope.listReachable).
 *
 * Grouped by relationship rather than shown as one long alphabetical
 * list: on a screen where most rows are names you half-know, "Your team"
 * above four of them is what makes the list navigable.
 */
/**
 * "Field Officer · CHATFO2" — not "Field Officer · Field Officer ·
 * CHATFO2". A designation and a role label are separate fields that in
 * practice hold the same words for most staff here (a Field Officer's
 * designation IS "Field Officer"), so saying both verbatim reads as a
 * glitch. Compared case- and space-insensitively, since the two are typed
 * by different people in different places.
 */
const describePerson = (person) => {
  const parts = [];
  const seen = new Set();
  for (const part of [person.designation, ROLE_LABELS[person.role] || person.role, person.employeeCode]) {
    if (!part) continue;
    const key = String(part).trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    parts.push(part);
  }
  return parts.join(" · ");
};

export default function NewChatDialog({
  errorMessage,
  isLoading,
  isOpen,
  isOpening,
  onClose,
  onSearchChange,
  onSelect,
  people,
  search,
}) {
  const groups = useMemo(() => {
    const byRelationship = new Map();
    for (const person of people) {
      const key = person.relationship || "STAFF";
      if (!byRelationship.has(key)) byRelationship.set(key, []);
      byRelationship.get(key).push(person);
    }

    return RELATIONSHIP_ORDER.filter((key) => byRelationship.has(key)).map((key) => ({
      key,
      label: getRelationshipLabel(key),
      people: byRelationship.get(key),
    }));
  }, [people]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start a chat">
      <div className="space-y-4">
        <input
          aria-label="Search people"
          className="min-h-11 w-full rounded-xl border border-forest/15 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-forest"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name, code or designation"
          type="search"
          value={search}
        />

        {errorMessage ? (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{errorMessage}</p>
        ) : null}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : null}

        {!isLoading && people.length === 0 ? (
          <p className="py-8 text-center text-sm font-semibold text-muted">
            {search
              ? "Nobody matches that."
              : "There is nobody you can chat with yet. Your manager and head office appear here once your account is linked to a team."}
          </p>
        ) : null}

        <div className="max-h-[50vh] space-y-4 overflow-y-auto" data-people-picker>
          {groups.map((group) => (
            <div key={group.key}>
              <p className="px-1 pb-1 text-[11px] font-black uppercase tracking-wide text-soft">{group.label}</p>
              <ul className="space-y-1">
                {group.people.map((person) => (
                  <li key={person._id}>
                    <button
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-mint disabled:opacity-60"
                      data-person-id={person._id}
                      disabled={isOpening}
                      onClick={() => onSelect(person)}
                      type="button"
                    >
                      <Avatar name={person.name} size="md" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black text-ink">{person.name}</span>
                        <span className="block truncate text-xs font-semibold text-muted">
                          {describePerson(person)}
                        </span>
                      </span>
                      {person.conversationId ? (
                        <span className="shrink-0 text-[11px] font-bold text-forest">Open</span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
