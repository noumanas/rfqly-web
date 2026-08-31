"use client";

import { useEffect, useState, type CSSProperties } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4100";

type CsrWorkload = {
  csr: string;
  total: number;
  pendingReview: number;
  autoSent: number;
  approvedSent: number;
  rejected: number;
};

type WorkloadResponse = { csrs: CsrWorkload[]; unassignedCount: number };

const MAX_BAR = 1;

export default function CsrWorkloadPage() {
  const [data, setData] = useState<WorkloadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/csr-workload`)
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  const maxTotal = Math.max(MAX_BAR, ...(data?.csrs.map((c) => c.total) ?? []));

  return (
    <div style={rootStyle}>
      <style>{`
        @media (max-width: 640px) {
          .rfq-workload-header { padding: 12px 14px !important; }
          .rfq-workload-grid-wrap { padding: 14px !important; }
        }
      `}</style>
      <div style={headerStyle} className="rfq-workload-header">
        <div>
          <h2 style={{ margin: 0, fontSize: 16 }}>CSR Workload</h2>
          <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#64748b" }}>How many leads each CSR is currently carrying, by status.</p>
        </div>
        {data && (
          <a href="/leads?filter=unassigned" style={unassignedPillStyle}>
            {data.unassignedCount} unassigned lead{data.unassignedCount === 1 ? "" : "s"} &rarr;
          </a>
        )}
      </div>

      {error && <p style={{ color: "#b91c1c", padding: "0 20px", fontSize: 13 }}>{error}</p>}

      <div style={gridWrapStyle} className="rfq-workload-grid-wrap">
        {data && data.csrs.length === 0 && !error && <p style={{ color: "#94a3b8", fontSize: 13 }}>No leads have been assigned to a CSR yet.</p>}
        <div style={cardGridStyle}>
          {data?.csrs.map((c) => (
            <div key={c.csr} style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div style={avatarStyle}>{c.csr.slice(0, 2).toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{c.csr}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>
                    {c.total} lead{c.total === 1 ? "" : "s"}
                  </div>
                </div>
              </div>

              <div style={barTrackStyle}>
                <div style={{ ...barFillStyle, width: `${(c.total / maxTotal) * 100}%` }} />
              </div>

              <div style={breakdownRowStyle}>
                <Stat label="Pending" value={c.pendingReview} color="#92400e" />
                <Stat label="Auto-sent" value={c.autoSent} color="#047857" />
                <Stat label="Approved" value={c.approvedSent} color="#0e7490" />
                <Stat label="Rejected" value={c.rejected} color="#b91c1c" />
              </div>

              <a href={`/leads?filter=assigned&csr=${encodeURIComponent(c.csr)}`} style={viewLeadsLinkStyle}>
                View {c.csr}&apos;s leads &rarr;
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={statCellStyle}>
      <div style={{ fontSize: 15, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 10.5, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</div>
    </div>
  );
}

const rootStyle: CSSProperties = { height: "100%", overflowY: "auto", background: "#f8fafc" };

const headerStyle: CSSProperties = {
  padding: "14px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "#fff",
  borderBottom: "1px solid #f1f5f9",
  gap: 16,
  flexWrap: "wrap",
};

const unassignedPillStyle: CSSProperties = {
  background: "#fffbeb",
  color: "#92400e",
  border: "1px solid #fde68a",
  borderRadius: 999,
  padding: "6px 14px",
  fontSize: 12.5,
  fontWeight: 600,
  textDecoration: "none",
  whiteSpace: "nowrap",
};

const gridWrapStyle: CSSProperties = { padding: 20 };

const cardGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 };

const cardStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 18,
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const cardHeaderStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 10 };

const avatarStyle: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  background: "linear-gradient(135deg, #0891b2, #0f172a)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12.5,
  fontWeight: 700,
  flexShrink: 0,
};

const barTrackStyle: CSSProperties = { height: 6, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" };

const barFillStyle: CSSProperties = { height: "100%", background: "linear-gradient(90deg, #0891b2, #0e7490)", borderRadius: 4 };

const breakdownRowStyle: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, textAlign: "center" };

const statCellStyle: CSSProperties = { background: "#f8fafc", borderRadius: 8, padding: "6px 4px" };

const viewLeadsLinkStyle: CSSProperties = { fontSize: 12.5, color: "#0891b2", fontWeight: 600, textDecoration: "none" };
