import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { OrdersAPI, errText } from "../api/client";
import {
  Button,
  Card,
  DangerButton,
  Dialog,
  EmptyState,
  Field,
  Note,
  PageHeader,
  Pill,
  Select,
  Spinner,
  Td,
  Textarea,
  Th,
} from "../components/ui";
import { useApi } from "../lib/useApi";
import { fmtDate } from "../lib/utils";

// Backend enums — "fulfiled" spelling is what the DB column accepts.
const TYPES = [
  { value: "incoming", label: "Incoming", blurb: "From a supplier or donor" },
  { value: "outgoing", label: "Outgoing", blurb: "Leaving your kitchen" },
];
const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "fulfiled", label: "Fulfilled" },
  { value: "cancelled", label: "Cancelled" },
];

const statusLabel = (s) => STATUSES.find((x) => x.value === s)?.label ?? s;

function statusPill(status) {
  const s = (status ?? "pending").toLowerCase();
  const tone = s === "fulfiled" ? "moss" : s === "pending" ? "amber" : "neutral";
  return <Pill tone={tone}>{statusLabel(s)}</Pill>;
}

// pending → Confirm, confirmed → Mark fulfilled
const NEXT_STATUS = { pending: ["confirmed", "Confirm"], confirmed: ["fulfiled", "Mark fulfilled"] };

function OrderDialog({ order, onClose, onSaved }) {
  const editing = order !== "new";
  const [form, setForm] = useState(
    editing
      ? { type: order.type, status: order.status ?? "pending", notes: order.notes ?? "" }
      : { type: "incoming", status: "pending", notes: "" }
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const payload = { type: form.type, status: form.status, notes: form.notes.trim() || null };
    try {
      if (editing) await OrdersAPI.update(order.id, payload);
      else await OrdersAPI.create(payload);
      onSaved();
    } catch (err) {
      setError(errText(err));
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await OrdersAPI.remove(order.id);
      onSaved();
    } catch (err) {
      setError(errText(err));
      setBusy(false);
    }
  }

  return (
    <Dialog open onClose={onClose} title={editing ? "Edit order" : "New order"}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-ink-2">Direction</span>
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm({ ...form, type: t.value })}
                className={`rounded-xl border p-3.5 text-left transition-all duration-150 ${
                  form.type === t.value
                    ? "border-ink bg-surface ring-1 ring-ink"
                    : "border-line bg-surface/60 hover:border-ink-3"
                }`}
              >
                <span className="block text-[15px] font-medium">{t.label}</span>
                <span className="mt-0.5 block text-[13px] leading-snug text-ink-3">{t.blurb}</span>
              </button>
            ))}
          </div>
        </div>

        {editing && (
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <Field label="What's in it?">
          <Textarea
            autoFocus={!editing}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Beans & whole milk from Riverside Roasters — Thursday before open."
          />
        </Field>

        {error && <Note>{error}</Note>}

        <div className="flex items-center justify-between pt-2">
          {editing ? <DangerButton label="Delete order" onConfirm={remove} /> : <span />}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? <Spinner className="border-paper/40 border-t-paper" /> : editing ? "Save" : "Create order"}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}

export default function Orders() {
  const { data: orders, loading, error, refresh } = useApi(() => OrdersAPI.list());
  const [params] = useSearchParams();
  const [editing, setEditing] = useState(() => (params.get("new") ? "new" : null));
  const [advancing, setAdvancing] = useState(null);

  const list = [...(orders ?? [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const open = list.filter((o) => ["pending", "confirmed"].includes(o.status ?? "pending")).length;

  async function advance(order) {
    const next = NEXT_STATUS[order.status ?? "pending"];
    if (!next) return;
    setAdvancing(order.id);
    try {
      await OrdersAPI.update(order.id, { type: order.type, status: next[0], notes: order.notes });
      await refresh();
    } finally {
      setAdvancing(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Orders"
        sub={orders ? `${orders.length} total${open ? ` · ${open} open` : ""}` : undefined}
      >
        <Button onClick={() => setEditing("new")}>+ New order</Button>
      </PageHeader>

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      ) : error ? (
        <Note>{errText(error)}</Note>
      ) : !list.length ? (
        <EmptyState
          title="No orders yet."
          hint="Track incoming deliveries and outgoing orders so nothing slips between shifts."
        >
          <Button onClick={() => setEditing("new")}>Create your first order</Button>
        </EmptyState>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <Th>Direction</Th>
                <Th>Status</Th>
                <Th>Notes</Th>
                <Th>Created</Th>
                <Th className="text-right"> </Th>
              </tr>
            </thead>
            <tbody>
              {list.map((order) => {
                const next = NEXT_STATUS[order.status ?? "pending"];
                return (
                  <tr
                    key={order.id}
                    onClick={() => setEditing(order)}
                    className="cursor-pointer transition-colors hover:bg-paper/70"
                  >
                    <Td className="font-medium">
                      <span className="flex items-center gap-2">
                        <span className={order.type === "incoming" ? "text-moss" : "text-clay"}>
                          {order.type === "incoming" ? "↓" : "↑"}
                        </span>
                        {order.type === "incoming" ? "Incoming" : "Outgoing"}
                      </span>
                    </Td>
                    <Td>{statusPill(order.status)}</Td>
                    <Td className="max-w-72 truncate text-ink-2">{order.notes || "—"}</Td>
                    <Td className="text-ink-2">{fmtDate(order.created_at)}</Td>
                    <Td className="text-right">
                      {next && (
                        <button
                          type="button"
                          disabled={advancing === order.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            advance(order);
                          }}
                          className="rounded-full border border-line px-3 py-1 text-[13px] font-medium transition-colors hover:border-ink-3 disabled:opacity-40"
                        >
                          {advancing === order.id ? "…" : next[1]}
                        </button>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {editing && (
        <OrderDialog
          order={editing}
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
