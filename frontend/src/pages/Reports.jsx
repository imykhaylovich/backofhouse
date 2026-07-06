import { useState } from "react";
import { ReportsAPI, errText, isMissingEndpoint } from "../api/client";
import { Card, EmptyState, Note, PageHeader, Pill, Spinner } from "../components/ui";
import { useApi } from "../lib/useApi";
import { fmtDate } from "../lib/utils";

function ReportCard({ report, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const text = report.report_text ?? "";
  const long = text.length > 400;

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-xl font-medium">
          {fmtDate(report.week_start)} – {fmtDate(report.week_end)}
        </h3>
        <div className="flex items-center gap-2">
          {report.emailed_at ? <Pill tone="moss">Emailed</Pill> : <Pill>Draft</Pill>}
          <span className="text-sm text-ink-3">{fmtDate(report.created_at)}</span>
        </div>
      </div>
      <p
        className={`mt-4 text-[15px] leading-relaxed whitespace-pre-line text-ink-2 ${
          !open && long ? "line-clamp-4" : ""
        }`}
      >
        {text || "No text in this report."}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="mt-3 text-sm font-medium text-ink transition-colors hover:text-clay-deep"
        >
          {open ? "Show less" : "Read the full report"}
        </button>
      )}
    </Card>
  );
}

export default function Reports() {
  const { data: reports, loading, error } = useApi(() => ReportsAPI.list());

  const list = [...(reports ?? [])].sort(
    (a, b) => new Date(b.week_start) - new Date(a.week_start)
  );

  return (
    <div>
      <PageHeader
        title="Weekly reports"
        sub="Claude reads your week — inventory, movement, what's running low — and writes it up."
      />

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      ) : error ? (
        isMissingEndpoint(error) ? (
          <EmptyState
            title="Reports aren't wired up yet."
            hint="The weekly report service is part of the backend's week 3. This page lights up on its own the moment GET /reports/ ships — nothing to change here."
          />
        ) : (
          <Note>{errText(error)}</Note>
        )
      ) : !list.length ? (
        <EmptyState
          title="No reports yet."
          hint="Your first weekly digest lands after a full week of activity — written by Claude, delivered to your inbox."
        />
      ) : (
        <div className="space-y-4">
          {list.map((report, i) => (
            <ReportCard key={report.id} report={report} defaultOpen={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}
