import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { InventoryAPI, errText } from "../api/client";
import {
  Button,
  Card,
  DangerButton,
  Dialog,
  EmptyState,
  Field,
  Input,
  Note,
  PageHeader,
  Pill,
  Spinner,
  Td,
  Th,
} from "../components/ui";
import { useApi } from "../lib/useApi";
import { daysUntil, fmtDate } from "../lib/utils";

const CATEGORIES = ["Produce", "Dairy", "Bakery", "Protein", "Dry goods", "Beverages", "Frozen", "Supplies", "General"];
const UNITS = ["lbs", "oz", "kg", "cases", "loaves", "bottles", "cans", "bunches", "units"];

const blank = { name: "", category: "", quantity: 0, unit: "", low_threshold: 5, expiration_date: "" };

function ItemDialog({ item, onClose, onSaved }) {
  const editing = item !== "new";
  const [form, setForm] = useState(
    editing ? { ...item, expiration_date: item.expiration_date ?? "" } : { ...blank }
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      name: form.name.trim(),
      category: form.category.trim() || "General",
      quantity: Number(form.quantity) || 0,
      unit: form.unit.trim() || "units",
      low_threshold: Number(form.low_threshold) || 0,
      expiration_date: form.expiration_date || null,
    };
    try {
      if (editing) await InventoryAPI.update(item.id, payload);
      else await InventoryAPI.create(payload);
      onSaved();
    } catch (err) {
      setError(errText(err));
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await InventoryAPI.remove(item.id);
      onSaved();
    } catch (err) {
      setError(errText(err));
      setBusy(false);
    }
  }

  return (
    <Dialog open onClose={onClose} title={editing ? form.name || "Edit item" : "Add item"}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Name">
          <Input
            autoFocus={!editing}
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Espresso beans"
          />
        </Field>
        <Field label="Category">
          <Input
            list="inv-categories"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Dry goods"
          />
          <datalist id="inv-categories">
            {CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantity">
            <Input
              type="number"
              min="0"
              required
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </Field>
          <Field label="Unit">
            <Input
              list="inv-units"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              placeholder="lbs"
            />
            <datalist id="inv-units">
              {UNITS.map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Low-stock alert at">
            <Input
              type="number"
              min="0"
              required
              value={form.low_threshold}
              onChange={(e) => setForm({ ...form, low_threshold: e.target.value })}
            />
          </Field>
          <Field label="Expires (optional)">
            <Input
              type="date"
              value={form.expiration_date}
              onChange={(e) => setForm({ ...form, expiration_date: e.target.value })}
            />
          </Field>
        </div>

        {error && <Note>{error}</Note>}

        <div className="flex items-center justify-between pt-2">
          {editing ? <DangerButton label="Delete item" onConfirm={remove} /> : <span />}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !form.name.trim()}>
              {busy ? <Spinner className="border-paper/40 border-t-paper" /> : editing ? "Save" : "Add item"}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}

function rowPill(item) {
  const d = daysUntil(item.expiration_date);
  if (item.quantity <= item.low_threshold) return <Pill tone="amber">Low</Pill>;
  if (d !== null && d < 0) return <Pill tone="clay">Expired</Pill>;
  if (d !== null && d <= 7) return <Pill tone="clay">Expiring</Pill>;
  return null;
}

export default function Inventory() {
  const { data: items, loading, error, refresh } = useApi(() => InventoryAPI.list());
  const [params] = useSearchParams();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(() => (params.get("new") ? "new" : null));

  const list = (items ?? [])
    .filter((i) =>
      `${i.name} ${i.category ?? ""}`.toLowerCase().includes(query.trim().toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  const lowCount = (items ?? []).filter((i) => i.quantity <= i.low_threshold).length;

  return (
    <div>
      <PageHeader
        title="Inventory"
        sub={
          items
            ? `${items.length} item${items.length === 1 ? "" : "s"}${lowCount ? ` · ${lowCount} low` : ""}`
            : undefined
        }
      >
        <Button onClick={() => setEditing("new")}>+ Add item</Button>
      </PageHeader>

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      ) : error ? (
        <Note>{errText(error)}</Note>
      ) : !items.length ? (
        <EmptyState title="Nothing on the shelves yet." hint="Add your first item — it takes ten seconds.">
          <Button onClick={() => setEditing("new")}>Add your first item</Button>
        </EmptyState>
      ) : (
        <>
          <div className="mb-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items…"
              className="h-10 rounded-full sm:w-72"
            />
          </div>

          <Card className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <Th>Item</Th>
                  <Th>Category</Th>
                  <Th className="text-right">On hand</Th>
                  <Th className="text-right">Low at</Th>
                  <Th>Expires</Th>
                  <Th className="w-8"> </Th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setEditing(item)}
                    className="cursor-pointer transition-colors hover:bg-paper/70"
                  >
                    <Td className="font-medium">
                      <span className="flex items-center gap-2.5">
                        {item.name}
                        {rowPill(item)}
                      </span>
                    </Td>
                    <Td className="text-ink-2">{item.category || "—"}</Td>
                    <Td className="text-right tabular-nums">
                      {item.quantity} <span className="text-ink-3">{item.unit}</span>
                    </Td>
                    <Td className="text-right text-ink-2 tabular-nums">{item.low_threshold}</Td>
                    <Td className="text-ink-2">{fmtDate(item.expiration_date)}</Td>
                    <Td className="text-ink-3">›</Td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!list.length && (
              <p className="px-5 py-10 text-center text-[15px] text-ink-2">
                Nothing matches “{query}”.
              </p>
            )}
          </Card>
        </>
      )}

      {editing && (
        <ItemDialog
          item={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}
