import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export function Button({ variant = "primary", className = "", type = "button", ...props }) {
  const variants = {
    primary: "bg-ink text-paper hover:bg-black",
    accent: "bg-clay text-white hover:bg-clay-deep",
    ghost: "border border-line bg-transparent text-ink hover:border-ink-3",
    soft: "bg-line/50 text-ink hover:bg-line",
  };
  return (
    <button
      type={type}
      className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-ink ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = "", rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`w-full resize-none rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-ink ${className}`}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <select
      className={`h-11 w-full rounded-xl border border-line bg-surface px-3 text-[15px] text-ink outline-none transition-colors focus:border-ink ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink-2">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-3">{hint}</span>}
    </label>
  );
}

export function Dialog({ open, onClose, title, children, wide = false }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 animate-fade bg-ink/25 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={`relative w-full ${wide ? "max-w-lg" : "max-w-md"} animate-pop rounded-2xl border border-line bg-paper p-6 shadow-[0_32px_80px_-16px_rgba(20,20,19,0.25)]`}
      >
        <h2 className="font-display text-xl font-medium">{title}</h2>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

/** Two-step destructive action: first click arms it, second confirms. */
export function DangerButton({ onConfirm, label = "Delete", confirmLabel = "Confirm delete", className = "" }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 2500);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (armed) {
          setArmed(false);
          onConfirm();
        } else {
          setArmed(true);
        }
      }}
      className={`text-sm font-medium transition-colors ${armed ? "text-clay-deep" : "text-ink-3 hover:text-clay-deep"} ${className}`}
    >
      {armed ? confirmLabel : label}
    </button>
  );
}

export function Pill({ tone = "neutral", children }) {
  const tones = {
    neutral: "bg-line/60 text-ink-2",
    amber: "bg-amber-soft text-amber",
    clay: "bg-clay-soft text-clay-deep",
    moss: "bg-moss-soft text-moss",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function PageHeader({ title, sub, children }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[34px] font-medium leading-tight tracking-[-0.01em]">{title}</h1>
        {sub && <p className="mt-1 text-[15px] text-ink-2">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export function EmptyState({ title, hint, children }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line px-6 py-20 text-center">
      <h3 className="font-display text-2xl font-medium">{title}</h3>
      {hint && <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-ink-2">{hint}</p>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

export function Spinner({ className = "" }) {
  return (
    <span
      className={`inline-block size-4 animate-spin rounded-full border-2 border-line border-t-ink ${className}`}
    />
  );
}

export function Note({ tone = "error", children }) {
  const tones = { error: "bg-clay-soft text-clay-deep", info: "bg-line/50 text-ink-2" };
  return <p className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${tones[tone]}`}>{children}</p>;
}

export function Card({ className = "", children }) {
  return <div className={`rounded-2xl border border-line bg-surface ${className}`}>{children}</div>;
}

export function Th({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-3 text-left text-[11px] font-semibold tracking-[0.08em] text-ink-3 uppercase first:pl-5 last:pr-5 ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, className = "" }) {
  return (
    <td className={`border-t border-line px-4 py-3.5 text-[15px] first:pl-5 last:pr-5 ${className}`}>
      {children}
    </td>
  );
}

/** Anthropic-style eight-spoke asterisk. */
export function Asterisk({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Wordmark({ className = "" }) {
  return (
    <span className={`font-display text-[17px] font-semibold tracking-tight ${className}`}>
      backofhouse<span className="text-clay">.</span>
    </span>
  );
}

/** Shared frame for the auth + onboarding screens: wordmark up top, content centered. */
export function AuthFrame({ children, width = "max-w-md" }) {
  return (
    <div className="min-h-dvh">
      <div className="mx-auto flex max-w-6xl items-center px-6 py-5">
        <Link to="/">
          <Wordmark />
        </Link>
      </div>
      <div className={`mx-auto w-full ${width} animate-rise px-6 pt-[8vh] pb-24`}>{children}</div>
    </div>
  );
}

export function StepDots({ count, current }) {
  return (
    <div className="mb-8 flex gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current ? "w-6 bg-ink" : "w-1.5 bg-line"
          }`}
        />
      ))}
    </div>
  );
}
