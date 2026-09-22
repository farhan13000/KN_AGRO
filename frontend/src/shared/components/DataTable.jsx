/**
 * One list, rendered two ways: a table on a desktop screen, and a stack
 * of cards on a phone.
 *
 * Every list in this app used to be a wide table inside
 * `overflow-x-auto` — a 1,100px grid squeezed into a 390px phone. It did
 * not break, but reading one row meant dragging sideways through nine
 * columns, and the action button was always the column you could not
 * see. A column that is off-screen is not really there.
 *
 * So below the `md` breakpoint each row becomes a card: its identifying
 * value as the heading, its status beside it, the rest as labelled
 * fields, and its actions along the bottom where a thumb can reach them.
 * Above `md` nothing changes — the table is genuinely the better shape
 * once the width exists, because a table lets you compare rows down a
 * column, which a stack of cards cannot.
 *
 * Both views are rendered and one is hidden with `display:none`, which
 * also takes it out of the accessibility tree, so a screen reader hears
 * whichever view is actually on screen rather than both.
 *
 * A column is described once and both views use it:
 *
 *   {
 *     key,                 // unique; also the fallback label
 *     header,              // column heading, and the card's field label
 *     cell: (row) => node, // the value
 *     align,               // "left" (default) | "right" | "center"
 *     role,                // "title" | "badge" | "actions" — card only
 *     hideOnCard,          // drop from the card when the heading covers it
 *     headerClassName, cellClassName,
 *     cardClassName,       // extra classes on the card field, e.g. "col-span-2"
 *   }
 *
 * `role` only moves a column within the card; in the table every column
 * stays exactly where it was declared.
 */
/**
 * The look of a row's action control. On a phone it is a full-height,
 * labelled button, because a 36px icon-only square in a card footer is
 * both hard to hit and hard to guess; from `md` up it shrinks back to
 * the icon square the table columns were built around.
 */
export const rowActionClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint md:h-9 md:min-h-0 md:w-9 md:px-0";

/**
 * A row action that stays icon-only even on a phone — for the rows that
 * carry three or four of them, where full labels would wrap into a
 * paragraph. It is 44px on touch, the smallest square a finger can hit
 * reliably, and drops back to the table's 36px from `md` up.
 */
export const rowIconActionClass =
  "inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint md:h-9 md:w-9";

const alignClass = (align) =>
  align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

const valueOf = (column, row) => (column.cell ? column.cell(row) : row[column.key]);

function TableView({ caption, columns, minWidth, rowKey, rows, theadClassName }) {
  return (
    <div className="hidden overflow-hidden rounded-lg border border-forest/10 bg-white shadow-sm md:block">
      <div className="overflow-x-auto">
        <table
          className="w-full divide-y divide-forest/10 text-left text-sm"
          style={minWidth ? { minWidth } : undefined}
        >
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead className={theadClassName}>
            <tr>
              {columns.map((column) => (
                <th className={`px-4 py-3 ${alignClass(column.align)} ${column.headerClassName || ""}`} key={column.key}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {rows.map((row) => (
              <tr className="align-top transition hover:bg-mint/35" key={rowKey(row)}>
                {columns.map((column) => (
                  <td
                    className={`px-4 py-3 ${alignClass(column.align)} ${column.cellClassName || ""}`}
                    key={column.key}
                  >
                    {valueOf(column, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CardView({ caption, columns, rowKey, rows }) {
  const titles = columns.filter((column) => column.role === "title");
  const badges = columns.filter((column) => column.role === "badge");
  const actions = columns.filter((column) => column.role === "actions");
  // Everything with no card role becomes a labelled field. A column the
  // heading already says is dropped rather than repeated.
  const fields = columns.filter((column) => !column.role && !column.hideOnCard);

  return (
    <ul aria-label={caption || undefined} className="space-y-3 md:hidden" data-card-list>
      {rows.map((row) => (
        <li className="rounded-xl border border-forest/10 bg-white p-4 shadow-sm" key={rowKey(row)}>
          {titles.length || badges.length ? (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-0.5">
                {titles.map((column) => (
                  <div className="break-words text-base font-black text-forest" key={column.key}>
                    {valueOf(column, row)}
                  </div>
                ))}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {badges.map((column) => (
                  <div key={column.key}>{valueOf(column, row)}</div>
                ))}
              </div>
            </div>
          ) : null}

          {fields.length ? (
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {fields.map((column) => (
                <div className={`min-w-0 ${column.cardClassName || ""}`} key={column.key}>
                  <dt className="text-[11px] font-black uppercase tracking-wide text-soft">{column.header}</dt>
                  <dd className="mt-0.5 break-words font-semibold text-ink">{valueOf(column, row)}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {actions.length ? (
            <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-forest/10 pt-3">
              {actions.map((column) => (
                <div key={column.key}>{valueOf(column, row)}</div>
              ))}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export default function DataTable({
  caption,
  columns = [],
  // Shown in place of both views when there is nothing to list. Without
  // it the component renders nothing, which suits a screen that already
  // has its own empty state above the table.
  emptyMessage,
  minWidth,
  rowKey = (row) => row._id,
  rows = [],
  // A couple of screens sit the table inside a panel that already has a
  // heading, and used a plain header strip rather than the tinted one.
  theadClassName = "bg-mint/70 text-xs font-black uppercase text-forest",
}) {
  if (!rows.length) {
    return emptyMessage ? (
      <div className="rounded-lg border border-forest/10 bg-white px-4 py-6 text-center text-sm text-muted shadow-sm">
        {emptyMessage}
      </div>
    ) : null;
  }

  return (
    <>
      <TableView
        caption={caption}
        columns={columns}
        minWidth={minWidth}
        rowKey={rowKey}
        rows={rows}
        theadClassName={theadClassName}
      />
      <CardView caption={caption} columns={columns} rowKey={rowKey} rows={rows} />
    </>
  );
}
