import { Link } from "react-router-dom";
import { DistributionsAPI, DonationsAPI, InventoryAPI, OrdersAPI, errText } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import LowStockAlert from "../components/LowStockAlert";
import { Asterisk, Card, Note, Spinner } from "../components/ui";
import { useApi } from "../lib/useApi";
import { firstName, greeting, isNonprofit, orgLabel } from "../lib/utils";

function Stat({ label, value, accent = false, to }) {
  const body = (
    <Card className={`p-5 transition-colors ${to ? "hover:border-ink-3" : ""}`}>
      <p className="text-[13px] text-ink-3">{label}</p>
      <p className={`mt-1.5 font-display text-3xl font-medium ${accent ? "text-amber" : ""}`}>
        {value}
      </p>
    </Card>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

function QuickAction({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-medium transition-colors hover:border-ink-3"
    >
      {children}
    </Link>
  );
}

export default function Dashboard() {
  const { profile } = useAuth();
  const np = isNonprofit(profile?.orgType);

  const { data, loading, error } = useApi(async () => {
    const inventoryReq = InventoryAPI.list();
    if (np) {
      const [inventory, donations, distributions] = await Promise.all([
        inventoryReq,
        DonationsAPI.list(),
        DistributionsAPI.list(),
      ]);
      return { inventory, donations, distributions };
    }
    const [inventory, orders] = await Promise.all([inventoryReq, OrdersAPI.list()]);
    return { inventory, orders };
  }, [np]);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-medium tracking-[-0.01em]">
          {greeting()}, {firstName(profile?.name)}.
        </h1>
        <p className="mt-1.5 text-[15px] text-ink-2">
          {orgLabel(profile?.orgType)} · {today}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      ) : error ? (
        <Note>{errText(error)}</Note>
      ) : (
        <>
          <div className={`grid gap-4 sm:grid-cols-2 ${np ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
            <Stat label="Items on hand" value={data.inventory.length} to="/inventory" />
            <Stat
              label="Low stock"
              value={data.inventory.filter((i) => i.quantity <= i.low_threshold).length}
              accent={data.inventory.some((i) => i.quantity <= i.low_threshold)}
              to="/inventory"
            />
            {np ? (
              <>
                <Stat label="Donations logged" value={data.donations.length} to="/donations" />
                <Stat
                  label="People served"
                  value={data.distributions.reduce((sum, d) => sum + (d.recipient_count ?? 0), 0)}
                  to="/distributions"
                />
              </>
            ) : (
              <Stat
                label="Open orders"
                value={
                  data.orders.filter((o) => ["pending", "confirmed"].includes(o.status ?? "pending"))
                    .length
                }
                to="/orders"
              />
            )}
          </div>

          <LowStockAlert inventory={data.inventory} />

          <div className="flex flex-wrap gap-2">
            <QuickAction to="/inventory?new=1">+ Add inventory</QuickAction>
            {np ? (
              <>
                <QuickAction to="/donations?new=1">+ Log donation</QuickAction>
                <QuickAction to="/distributions?new=1">+ Log distribution</QuickAction>
              </>
            ) : (
              <QuickAction to="/orders?new=1">+ New order</QuickAction>
            )}
            <QuickAction to="/ask">
              <Asterisk className="size-3 text-clay" />
              Ask Claude
            </QuickAction>
          </div>
        </>
      )}
    </div>
  );
}
