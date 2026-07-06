import { Link } from "react-router-dom";
import { Asterisk, Button, Wordmark } from "../components/ui";

const FEATURES = [
  {
    title: "Know your shelves",
    body: "Every item, quantity, and expiration date in one live list. Low stock surfaces itself before service does.",
  },
  {
    title: "Log it in seconds",
    body: "Orders for the café, donations and distributions for the pantry. Two fields and you're back to work.",
  },
  {
    title: "Reports that write themselves",
    body: "Claude reads your week and sends a plain-English report every Sunday. No spreadsheets harmed.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Wordmark />
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-full px-3.5 py-1.5 text-sm text-ink-2 transition-colors hover:text-ink"
            >
              Sign in
            </Link>
            <Link to="/register">
              <Button className="h-9 px-4">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-4xl animate-rise px-6 pt-28 pb-24 text-center">
          <Asterisk className="mx-auto size-6 text-clay" />
          <h1 className="mt-8 font-display text-5xl leading-[1.05] font-medium tracking-[-0.02em] sm:text-[64px]">
            The back of house,
            <br />
            finally in order.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
            Inventory, orders, and donations in one quiet place — with a weekly report written for
            you. Built for cafés, restaurants, and food nonprofits.
          </p>
          <div className="mt-10 flex justify-center gap-3">
            <Link to="/register">
              <Button className="h-11 px-6 text-[15px]">Get started</Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" className="h-11 px-6 text-[15px]">
                Sign in
              </Button>
            </Link>
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title}>
                <Asterisk className="size-4 text-clay" />
                <h3 className="mt-4 font-display text-xl font-medium">{f.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{f.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-ink-3">
          <Wordmark className="text-[15px]" />
          <p>Built by Ivan &amp; Dima · {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
