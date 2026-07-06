import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { errText, isMissingEndpoint } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { AuthFrame, Button, Field, Input, Note, Spinner } from "../components/ui";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(form.email.trim(), form.password);
      nav("/dashboard");
    } catch (err) {
      setError(
        isMissingEndpoint(err)
          ? "Sign-in isn't live on the server yet — /auth/login is still being built. Create an account instead, or nudge Ivan."
          : errText(err, "That email and password don't match.")
      );
      setBusy(false);
    }
  }

  return (
    <AuthFrame width="max-w-sm">
      <h1 className="font-display text-4xl font-medium tracking-[-0.01em]">Welcome back.</h1>
      <p className="mt-2 text-[15px] text-ink-2">Sign in to your kitchen.</p>

      <form onSubmit={submit} className="mt-10 space-y-4">
        <Field label="Email">
          <Input
            type="email"
            autoComplete="email"
            autoFocus
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />
        </Field>

        {error && <Note>{error}</Note>}

        <Button type="submit" disabled={busy || !form.email || !form.password} className="w-full">
          {busy ? <Spinner className="border-paper/40 border-t-paper" /> : "Continue"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-2">
        New here?{" "}
        <Link to="/register" className="font-medium text-ink underline-offset-4 hover:underline">
          Create your organization
        </Link>
      </p>
    </AuthFrame>
  );
}
