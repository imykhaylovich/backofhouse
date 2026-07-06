import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DonationsAPI, InventoryAPI, errText } from "../api/client";
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

function DonationDialog({ inventory, onClose, onSaved }) {
  const [form, setForm] = useState({ donor_name: "", inventory_id: "", quantity: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await DonationsAPI.create({
        donor_name: form.donor_name.trim() || null,
        inventory_id: form.inventory_id ? Number(form.inventory_id) : null,
        quantity: Number(form.quantity),
        notes: form.notes.trim() || null,
      });
      onSaved();
    } catch (err) {
      setError(errText(err));
      setBusy(false);
    }
  }

  return (
    <Dialog open onClose={onClose} title="Log a donation">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Donor (optional)">
          <Input
            autoFocus
            value={form.donor_name}
            onChange={(e) => setForm({ ...form, donor_name: e.target.value })}
            placeholder="Marigold Café"
          />
        </Field>
        <Field label="Item" hint="Choosing a tracked item adds the quantity to its stock.">
          <Select
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
        <Field label="Notes (optional)">
          <Textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Day-old pastries, still great."
          />
        </Field>

        {error && <Note>{error}</Note>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy || !form.quantity}>
            {busy ? <Spinner className="border-paper/40 border-t-paper" /> : "Log donation"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export default function Donations() {
  const { data, loading, error, refresh } = useApi(async () => {
    const [donations, inventory] = await Promise.all([DonationsAPI.list(), InventoryAPI.list()]);
    return { donations, inventory };
  });
  const [params] = useSearchParams();
  const [adding, setAdding] = useState(() => Boolean(params.get("new")));

  const itemName = (id) => data?.inventory.find((i) => i.id === id)?.name ?? `Item #${id}`;
  const list = [...(data?.donations ?? [])].sort(
    (a, b) => new Date(b.donated_at) - new Date(a.donated_at)
  );

  async function remove(id) {
    await DonationsAPI.remove(id);
    refresh();
  }

  return (
    <div>
      <PageHeader
        title="Donations"
        sub={data ? `${list.length} logged` : undefined}
      >
        <Button onClick={() => setAdding(true)}>+ Log donation</Button>
      </PageHeader>

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      ) : error ? (
        <Note>{errText(error)}</Note>
      ) : !list.length ? (
        <EmptyState
          title="No donations yet."
          hint="When food comes in, log it here — tracked items restock themselves."
        >
          <Button onClick={() => setAdding(true)}>Log your first donation</Button>
        </EmptyState>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <Th>Donor</Th>
                <Th>Item</Th>
                <Th className="text-right">Quantity</Th>
                <Th>Notes</Th>
                <Th>Date</Th>
                <Th className="text-right"> </Th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id} className="transition-colors hover:bg-paper/70">
                  <Td className="font-medium">{d.donor_name || "Anonymous"}</Td>
                  <Td className="text-ink-2">{d.inventory_id ? itemName(d.inventory_id) : "—"}</Td>
                  <Td className="text-right font-medium text-moss tabular-nums">+{d.quantity}</Td>
                  <Td className="max-w-56 truncate text-ink-2">{d.notes || "—"}</Td>
                  <Td className="text-ink-2">{fmtDate(d.donated_at)}</Td>
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
        <DonationDialog
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
