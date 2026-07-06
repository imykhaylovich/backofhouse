import { useEffect } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { isNonprofit } from "../lib/utils";
import { Asterisk, Wordmark } from "./ui";

export default function Shell() {
  const { profile, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const np = isNonprofit(profile?.orgType);

  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/inventory", label: "Inventory" },
    ...(np
      ? [
          { to: "/donations", label: "Donations" },
          { to: "/distributions", label: "Distributions" },
        ]
      : [{ to: "/orders", label: "Orders" }]),
    { to: "/reports", label: "Reports" },
    { to: "/ask", label: "Ask Claude", spark: true },
  ];

  useEffect(() => {
    const current = links.find((l) => l.to === location.pathname);
    document.title = current ? `${current.label} — Back of House` : "Back of House";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
          <Link to="/dashboard" className="shrink-0">
            <Wordmark />
          </Link>

          <nav className="no-scrollbar flex items-center gap-1 overflow-x-auto">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                    isActive ? "bg-ink text-paper" : "text-ink-2 hover:bg-line/60 hover:text-ink"
                  }`
                }
              >
                {link.spark && <Asterisk className="size-3 text-clay" />}
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            {profile?.orgName && (
              <span className="hidden text-sm text-ink-3 md:block">{profile.orgName}</span>
            )}
            <button
              type="button"
              onClick={() => {
                logout();
                nav("/");
              }}
              className="text-sm text-ink-3 transition-colors hover:text-ink"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main key={location.pathname} className="mx-auto max-w-6xl animate-rise px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
