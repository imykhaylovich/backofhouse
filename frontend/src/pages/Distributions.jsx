import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DistributionsAPI, InventoryAPI, errText } from "../api/client";
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
  Select,
  Spinner,
  Td,
  Textarea,
  Th,
} from "../components/ui";
import { useApi } from "../lib/useApi";
import { fmtDate } from "../lib/utils";

function DistributionDialog({ inventory, onClose, onSaved }) {
  const [form, setForm] = useState({ inventory_id: "", quantity: "", recipient_count: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await DistributionsAPI.create({
        inventory_id: form.inventory_id ? Number(form.inventory_id) : null,
        quantity: Number(form.quantity),
        recipient_count: form.recipient_count ? Number(form.recipient_count) : null,
        notes: form.notes.trim() || null,
      });
      onSaved();
    } catch (err) {
      setError(errText(err)); // surfaces the backend's "Not enough stock"
      setBusy(false);
    }
  }

  return (
    <Dialog open onClose={onClose} title="Log a distribution">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Item" hint="Tracked items are drawn down from stock.">
          <Select
            autoFocus
            value={form.inventory_id}
            onChange={(e) => setForm({ ...form, inventory_id: e.target.value })}
          >
            <option value="">Not a tracked item</option>
            {inventory.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} — {i.quantity} {i.unit} on hand
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantity">
            <Input
              type="number"
              min="1"
              required
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="24"
            />
          </Field>
          <Field label="People served">
            <Input
              type="number"
              min="0"
              value={form.recipient_count}
              onChange={(e) => setForm({ ...form, recipient_count: e.target.value })}
              placeholder="12"
            />
          </Field>
        </div>
        <Field label="Notes (optional)">
          <Textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Tuesday community dinner."
          />
        </Field>

        {error && <Note>{error}</Note>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy || !form.quantity}>
            {busy ? <Spinner className="border-paper/40 border-t-paper" /> : "Log distribution"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export default function Distributions() {
  const { data, loading, error, refresh } = useApi(async () => {
    const [distributions, inventory] = await Promise.all([
      DistributionsAPI.list(),
      InventoryAPI.list(),
    ]);
    return { distributions, inventory };
  });
  const [params] = useSearchParams();
  const [adding, setAdding] = useState(() => Boolean(params.get("new")));

  const itemName = (id) => data?.inventory.find((i) => i.id === id)?.name ?? `Item #${id}`;
  const list = [...(data?.distributions ?? [])].sort(
    (a, b) => new Date(b.distributed_at) - new Date(a.distributed_at)
  );
  const served = list.reduce((sum, d) => sum + (d.recipient_count ?? 0), 0);

  async function remove(id) {
    await DistributionsAPI.remove(id);
    refresh();
  }

  return (
    <div>
      <PageHeader
        title="Distributions"
        sub={data ? `${list.length} logged${served ? ` · ${served} people served` : ""}` : undefined}
      >
        <Button onClick={() => setAdding(true)}>+ Log distribution</Button>
      </PageHeader>

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      ) : error ? (
        <Note>{errText(error)}</Note>
      ) : !list.length ? (
        <EmptyState
          title="Nothing distributed yet."
          hint="Log what goes out the door — stock updates itself and impact adds up."
        >
          <Button onClick={() => setAdding(true)}>Log your first distribution</Button>
        </EmptyState>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <Th>Item</Th>
                <Th className="text-right">Quantity</Th>
                <Th className="text-right">People</Th>
                <Th>Notes</Th>
                <Th>Date</Th>
                <Th className="text-right"> </Th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id} className="transition-colors hover:bg-paper/70">
                  <Td className="font-medium">
                    {d.inventory_id ? itemName(d.inventory_id) : "Untracked"}
                  </Td>
                  <Td className="text-right font-medium text-clay-deep tabular-nums">−{d.quantity}</Td>
                  <Td className="text-right text-ink-2 tabular-nums">{d.recipient_count ?? "—"}</Td>
                  <Td className="max-w-56 truncate text-ink-2">{d.notes || "—"}</Td>
                  <Td className="text-ink-2">{fmtDate(d.distributed_at)}</Td>
                  <Td className="text-right">
                    <DangerButton label="Remove" confirmLabel="Sure?" onConfirm={() => remove(d.id)} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {adding && (
        <DistributionDialog
          inventory={data?.inventory ?? []}
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}
