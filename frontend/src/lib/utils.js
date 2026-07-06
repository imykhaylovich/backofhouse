export const ORG_TYPES = [
  { value: "cafe", label: "Café", blurb: "Espresso bars & coffee shops" },
  { value: "restaurant", label: "Restaurant", blurb: "Full service & fast casual" },
  { value: "bakery", label: "Bakery", blurb: "Bread, pastry & sweets" },
  { value: "bar", label: "Bar", blurb: "Bars & taprooms" },
  { value: "nonprofit", label: "Nonprofit", blurb: "Food banks & community kitchens" },
  { value: "other", label: "Other", blurb: "Anything else with a kitchen" },
];

export const orgLabel = (value) =>
  ORG_TYPES.find((t) => t.value === value)?.label ?? "Organization";

export const isNonprofit = (type) => type === "nonprofit";

export function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const opts = { month: "short", day: "numeric" };
  if (d.getFullYear() !== new Date().getFullYear()) opts.year = "numeric";
  return d.toLocaleDateString(undefined, opts);
}

/** Whole days from today until a YYYY-MM-DD date. Negative = past, null = no date. */
export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const target = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Working late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export const firstName = (name) => (name ?? "").trim().split(/\s+/)[0] || "there";
