import { useEffect, useRef, useState } from "react";
import { ClaudeAPI, isMissingEndpoint } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Asterisk } from "../components/ui";

const SUGGESTIONS = ["What's running low?", "Plan tomorrow's prep list", "Summarize this week"];

const OFFLINE_NOTE =
  "I can't reach my brain yet — the /claude endpoint is part of the backend's week 3 and hasn't shipped. " +
  "Inventory, orders, and everything else works; chat lights up the moment it's deployed.";

const NETWORK_NOTE = "Can't reach the server — is the backend running on http://localhost:8000?";

export default function AskClaude() {
  const { claims } = useAuth();
  const storageKey = `boh.chat.${claims?.org_id ?? "anon"}`;

  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) ?? [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages.slice(-100)));
  }, [messages, storageKey]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending]);

  async function send(text) {
    const content = text.trim();
    if (!content || pending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content }]);
    setPending(true);
    try {
      const reply = await ClaudeAPI.send(content);
      setMessages((m) => [...m, { role: "assistant", content: reply.content }]);
    } catch (err) {
      const note = !err.response ? NETWORK_NOTE : isMissingEndpoint(err) ? OFFLINE_NOTE : null;
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: note ?? "Something went wrong on my end — try that again.",
          system: true,
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-8.5rem)] max-w-2xl flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto pb-6">
        {!messages.length ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Asterisk className="size-7 text-clay" />
            <h1 className="mt-6 font-display text-3xl font-medium tracking-[-0.01em]">
              Ask anything about your kitchen.
            </h1>
            <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-ink-2">
              Claude can see your inventory and activity, and answers in plain language.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-line px-4 py-2 text-sm text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div
                  key={i}
                  className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-[15px] leading-relaxed text-paper"
                >
                  {m.content}
                </div>
              ) : (
                <div key={i} className="flex max-w-[95%] gap-3">
                  <Asterisk className="mt-1 size-4 shrink-0 text-clay" />
                  <p
                    className={`text-[15px] leading-relaxed whitespace-pre-wrap ${
                      m.system ? "text-ink-3 italic" : ""
                    }`}
                  >
                    {m.content}
                  </p>
                </div>
              )
            )}
            {pending && (
              <div className="flex items-center gap-3">
                <Asterisk className="size-4 animate-pulse text-clay" />
                <span className="text-[15px] text-ink-3">Thinking…</span>
              </div>
            )}
            <div ref={endRef} />
          </>
        )}
      </div>

      <div className="border-t border-line pt-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Claude…"
            className="h-11 flex-1 rounded-full border border-line bg-surface px-4 text-[15px] outline-none transition-colors placeholder:text-ink-3 focus:border-ink"
          />
          <button
            type="submit"
            disabled={!input.trim() || pending}
            className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-paper transition-all duration-200 hover:bg-black active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
          >
            Send
          </button>
        </form>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => setMessages([])}
            className="mt-2 text-xs text-ink-3 transition-colors hover:text-ink"
          >
            Clear conversation
          </button>
        )}
      </div>
    </div>
  );
}
