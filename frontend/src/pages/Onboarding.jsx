import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { errText, InventoryAPI } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { AuthFrame, Button, Field, Input, Note, Spinner, StepDots } from "../components/ui";
import { ORG_TYPES } from "../lib/utils";

const EMPTY_ROW = { name: "", quantity: "", unit: "" };

/**
 * First-run questionnaire. The backend has no /auth/me, so a sign-in on a
 * fresh browser doesn't know the org — this fills the gaps, then offers to
 * stock the first few shelves. Registration already knows the org, so those
 * users skip straight to stocking.
 */
export default function Onboarding() {
  const { profile, updateProfile, completeOnboarding } = useAuth();
  const nav = useNavigate();

  const needsProfile = !profile?.orgType || !profile?.orgName || !profile?.name;
  const [step, setStep] = useState(needsProfile ? 0 : 1);
  const [form, setForm] = useState({
    orgName: profile?.orgName ?? "",
    orgType: profile?.orgType ?? "",
    name: profile?.name ?? "",
  });
  const [rows, setRows] = useState([{ ...EMPTY_ROW }, { ...EMPTY_ROW }, { ...EMPTY_ROW }]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const stepCount = needsProfile ? 2 : 1;
  const currentDot = needsProfile ? step : 0;

  function saveProfile(e) {
    e.preventDefault();
    updateProfile({
      orgName: form.orgName.trim(),
      orgType: form.orgType,
      name: form.name.trim(),
    });
    setStep(1);
  }

  function setRow(i, patch) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function finish() {
    completeOnboarding();
    nav("/dashboard");
  }

  async function stockShelves(e) {
    e.preventDefault();
    const filled = rows.filter((r) => r.name.trim());
    if (!filled.length) return finish();
    setBusy(true);
    setError(null);
    try {
      await Promise.all(
        filled.map((r) =>
          InventoryAPI.create({
            name: r.name.trim(),
            category: "General",
            quantity: Number(r.quantity) || 0,
            unit: r.unit.trim() || "units",
            low_threshold: 5,
            expiration_date: null,
          })
        )
      );
      finish();
    } catch (err) {
      setError(errText(err));
      setBusy(false);
    }
  }

  return (
    <AuthFrame>
      <StepDots count={stepCount} current={currentDot} />

      {step === 0 ? (
        <form onSubmit={saveProfile} className="animate-rise space-y-6">
          <div>
            <h1 className="font-display text-4xl font-medium tracking-[-0.01em]">
              Tell us about your kitchen.
            </h1>
            <p className="mt-2 text-[15px] text-ink-2">
              A new browser doesn't know you yet — this stays on this device.
            </p>
          </div>

          <Field label="Organization name">
            <Input
              autoFocus
              required
              value={form.orgName}
              onChange={(e) => setForm({ ...form, orgName: e.target.value })}
              placeholder="Marigold Café"
            />
          </Field>
          <Field label="Your name">
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Dima Ivanov"
            />
          </Field>

          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-ink-2">
              What kind of kitchen?
            </span>
            <div className="grid grid-cols-2 gap-2">
              {ORG_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm({ ...form, orgType: t.value })}
                  className={`rounded-xl border p-3.5 text-left transition-all duration-150 ${
                    form.orgType === t.value
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

          <Button
            type="submit"
            disabled={!form.orgName.trim() || !form.name.trim() || !form.orgType}
            className="w-full"
          >
            Continue
          </Button>
        </form>
      ) : (
        <form onSubmit={stockShelves} className="animate-rise space-y-6">
          <div>
            <h1 className="font-display text-4xl font-medium tracking-[-0.01em]">
              Stock your shelves.
            </h1>
            <p className="mt-2 text-[15px] text-ink-2">
              Add a few things you keep on hand. You can fine-tune quantities and thresholds later.
            </p>
          </div>

          <div className="space-y-2">
            {rows.map((row, i) => (
              <div key={i} className="grid grid-cols-[1fr_5rem_6rem] gap-2">
                <Input
                  value={row.name}
                  onChange={(e) => setRow(i, { name: e.target.value })}
                  placeholder={["Espresso beans", "Whole milk", "Croissants"][i] ?? "Item"}
                  autoFocus={i === 0}
                />
                <Input
                  type="number"
                  min="0"
                  value={row.quantity}
                  onChange={(e) => setRow(i, { quantity: e.target.value })}
                  placeholder="Qty"
                />
                <Input
                  value={row.unit}
                  onChange={(e) => setRow(i, { unit: e.target.value })}
                  placeholder="lbs"
                  list="onboarding-units"
                />
              </div>
            ))}
            <datalist id="onboarding-units">
              {["lbs", "oz", "kg", "cases", "loaves", "bottles", "cans", "units"].map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
            <button
              type="button"
              onClick={() => setRows((rs) => [...rs, { ...EMPTY_ROW }])}
              className="text-sm font-medium text-ink-2 transition-colors hover:text-ink"
            >
              + Add another
            </button>
          </div>

          {error && <Note>{error}</Note>}

          <div className="space-y-3">
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? <Spinner className="border-paper/40 border-t-paper" /> : "Finish setup"}
            </Button>
            <button
              type="button"
              onClick={finish}
              className="block w-full text-center text-sm text-ink-3 transition-colors hover:text-ink"
            >
              I'll do this later
            </button>
          </div>
        </form>
      )}
    </AuthFrame>
  );
}
