import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { errText } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { AuthFrame, Button, Field, Input, Note, Spinner, StepDots } from "../components/ui";
import { ORG_TYPES } from "../lib/utils";

/**
 * Three quiet steps: the organization, you, the details.
 * One decision per screen — no forms that scroll.
 */
export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [org, setOrg] = useState({ name: "", type: "", email: "", city: "", state: "" });
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register(
        {
          name: org.name.trim(),
          type: org.type,
          email: org.email.trim(),
          city: org.city.trim() || null,
          state: org.state.trim() || null,
        },
        { name: user.name.trim(), email: user.email.trim(), password: user.password }
      );
      nav("/onboarding");
    } catch (err) {
      setError(errText(err));
      setBusy(false);
    }
  }

  const steps = [
    // Step 1 — the organization
    <form
      key="org"
      onSubmit={(e) => {
        e.preventDefault();
        setStep(1);
      }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-display text-4xl font-medium tracking-[-0.01em]">
          First, your organization.
        </h1>
        <p className="mt-2 text-[15px] text-ink-2">What should we call the place?</p>
      </div>

      <Field label="Organization name">
        <Input
          autoFocus
          required
          value={org.name}
          onChange={(e) => setOrg({ ...org, name: e.target.value })}
          placeholder="Marigold Café"
        />
      </Field>

      <div>
        <span className="mb-1.5 block text-[13px] font-medium text-ink-2">What kind of kitchen?</span>
        <div className="grid grid-cols-2 gap-2">
          {ORG_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setOrg({ ...org, type: t.value })}
              className={`rounded-xl border p-3.5 text-left transition-all duration-150 ${
                org.type === t.value
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

      <Button type="submit" disabled={!org.name.trim() || !org.type} className="w-full">
        Continue
      </Button>
    </form>,

    // Step 2 — the admin user
    <form
      key="user"
      onSubmit={(e) => {
        e.preventDefault();
        setOrg((o) => ({ ...o, email: o.email || user.email }));
        setStep(2);
      }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-display text-4xl font-medium tracking-[-0.01em]">Now, about you.</h1>
        <p className="mt-2 text-[15px] text-ink-2">You'll be the admin for {org.name || "your team"}.</p>
      </div>

      <Field label="Your name">
        <Input
          autoFocus
          required
          autoComplete="name"
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
          placeholder="Dima Ivanov"
        />
      </Field>
      <Field label="Email">
        <Input
          type="email"
          required
          autoComplete="email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          placeholder="you@example.com"
        />
      </Field>
      <Field label="Password" hint="At least 8 characters.">
        <Input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          placeholder="••••••••"
        />
      </Field>

      <Button
        type="submit"
        disabled={!user.name.trim() || !user.email.includes("@") || user.password.length < 8}
        className="w-full"
      >
        Continue
      </Button>
    </form>,

    // Step 3 — org details + create
    <form key="details" onSubmit={submit} className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-medium tracking-[-0.01em]">Last step.</h1>
        <p className="mt-2 text-[15px] text-ink-2">A few details, then you're in.</p>
      </div>

      <Field label="Organization email" hint="Weekly reports land here.">
        <Input
          type="email"
          required
          value={org.email}
          onChange={(e) => setOrg({ ...org, email: e.target.value })}
          placeholder="hello@marigold.cafe"
        />
      </Field>
      <div className="grid grid-cols-[1fr_7rem] gap-3">
        <Field label="City (optional)">
          <Input
            value={org.city}
            onChange={(e) => setOrg({ ...org, city: e.target.value })}
            placeholder="Boston"
          />
        </Field>
        <Field label="State">
          <Input
            value={org.state}
            onChange={(e) => setOrg({ ...org, state: e.target.value })}
            placeholder="MA"
          />
        </Field>
      </div>

      {error && <Note>{error}</Note>}

      <Button type="submit" disabled={busy || !org.email.includes("@")} className="w-full">
        {busy ? <Spinner className="border-paper/40 border-t-paper" /> : "Create organization"}
      </Button>
    </form>,
  ];

  return (
    <AuthFrame>
      <StepDots count={steps.length} current={step} />
      <div key={step} className="animate-rise">
        {steps[step]}
      </div>

      <div className="mt-8 flex items-center justify-between text-sm">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="text-ink-3 transition-colors hover:text-ink"
          >
            ← Back
          </button>
        ) : (
          <span />
        )}
        <p className="text-ink-2">
          Have an account?{" "}
          <Link to="/login" className="font-medium text-ink underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthFrame>
  );
}
