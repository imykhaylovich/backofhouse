import { Link } from "react-router-dom";
import { daysUntil } from "../lib/utils";
import { Card, Pill } from "./ui";

/**
 * Surfaces anything that needs a human: at/under its low threshold,
 * expiring within a week, or already expired.
 */
export default function LowStockAlert({ inventory = [] }) {
  const low = inventory.filter((i) => i.quantity <= i.low_threshold);
  const expiring = inventory
    .filter((i) => {
      const d = daysUntil(i.expiration_date);
      return d !== null && d <= 7;
    })
    .sort((a, b) => daysUntil(a.expiration_date) - daysUntil(b.expiration_date));

  if (!low.length && !expiring.length) {
    return (
      <Card className="flex items-center gap-3 p-5">
        <span className="size-2 shrink-0 rounded-full bg-moss" />
        <p className="text-[15px] text-ink-2">Shelves look healthy — nothing low, nothing expiring.</p>
      </Card>
    );
  }

  const rows = [
    ...low.map((i) => ({
      key: `low-${i.id}`,
      name: i.name,
      detail: `${i.quantity} ${i.unit} left · low at ${i.low_threshold}`,
      pill: <Pill tone="amber">Low</Pill>,
    })),
    ...expiring
      .filter((i) => !low.some((l) => l.id === i.id))
      .map((i) => {
        const d = daysUntil(i.expiration_date);
        return {
          key: `exp-${i.id}`,
          name: i.name,
          detail:
            d < 0
              ? `expired ${Math.abs(d)} day${Math.abs(d) === 1 ? "" : "s"} ago`
              : d === 0
                ? "expires today"
                : `expires in ${d} day${d === 1 ? "" : "s"}`,
          pill: <Pill tone="clay">{d < 0 ? "Expired" : "Expiring"}</Pill>,
        };
      }),
  ];

  const shown = rows.slice(0, 5);

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="size-2 shrink-0 rounded-full bg-amber" />
          <h3 className="text-[15px] font-semibold">Needs attention</h3>
          <span className="text-sm text-ink-3">{rows.length}</span>
        </div>
        <Link to="/inventory" className="text-sm font-medium text-ink-2 transition-colors hover:text-ink">
          Open inventory →
        </Link>
      </div>
      <ul className="divide-y divide-line">
        {shown.map((row) => (
          <li key={row.key} className="flex items-center justify-between gap-4 py-2.5">
            <div className="min-w-0">
              <span className="text-[15px] font-medium">{row.name}</span>
              <span className="ml-2 text-sm text-ink-3">{row.detail}</span>
            </div>
            {row.pill}
          </li>
        ))}
      </ul>
      {rows.length > shown.length && (
        <p className="mt-3 text-sm text-ink-3">+ {rows.length - shown.length} more in inventory</p>
      )}
    </Card>
  );
}
