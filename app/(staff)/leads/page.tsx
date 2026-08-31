"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { StatusBadge } from "../../../components/StatusBadge";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4100";

type Lead = {
  id: string;
  status: string;
  confidence: string;
  assignedTo: string | null;
  createdAt: string;
  priceBreakdown: { total?: number };
  rfq: {
    sender: string;
    source: string;
    parsedSpec: { itemRaw: string; quantity: number | null; unit: string | null } | null;
    rawText: string;
  };
};

type FilterMode = "all" | "assigned" | "unassigned";

function fmtMoney(n?: number) {
  if (typeof n !== "number") return "-";
  return "PKR " + n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function AssignedLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [csrFilter, setCsrFilter] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("filter");
    if (initial === "assigned" || initial === "unassigned") setFilter(initial);
    const csr = params.get("csr");
    if (csr) setCsrFilter(csr);
  }, []);

  async function load() {
    try {
      const url =
        filter === "unassigned"
          ? `${API_URL}/leads?unassigned=true`
          : filter === "assigned"
            ? `${API_URL}/leads/assigned${csrFilter ? `?csr=${encodeURIComponent(csrFilter)}` : ""}`
            : `${API_URL}/leads`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data: Lead[] = await res.json();
      setLeads(data);
      setDrafts(Object.fromEntries(data.map((l) => [l.id, l.assignedTo ?? ""])));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, csrFilter]);

  async function assign(id: string) {
    const value = (drafts[id] ?? "").trim();
    const res = await fetch(`${API_URL}/leads/${id}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedTo: value.length > 0 ? value : null }),
    });
    if (!res.ok) return;
    const updated: Lead = await res.json();
    setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
  }

  const knownCsrs = useMemo(() => Array.from(new Set(leads.map((l) => l.assignedTo).filter((v): v is string => !!v))).sort(), [leads]);

  return (
    <div style={rootStyle}>
      <style>{`
        @media (max-width: 640px) {
          .rfq-leads-header { padding: 12px 14px !important; }
          .rfq-leads-filterbar { padding: 10px 14px !important; }
          .rfq-leads-csr-filter { margin-left: 0 !important; width: 100% !important; }
          .rfq-leads-table-wrap { padding: 0 14px 14px !important; }
        }
      `}</style>
      <div style={headerStyle} className="rfq-leads-header">
        <div>
          <h2 style={{ margin: 0, fontSize: 16 }}>Assigned Leads</h2>
          <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#64748b" }}>Every quote is a lead - assign it to a CSR to track ownership.</p>
        </div>
        <span style={countPillStyle}>{leads.length}</span>
      </div>

      <div style={filterBarStyle} className="rfq-leads-filterbar">
        {(["all", "assigned", "unassigned"] as FilterMode[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={filterChipStyle(filter === f)}>
            {f === "all" ? "All" : f === "assigned" ? "Assigned" : "Unassigned"}
          </button>
        ))}
        <input
          value={csrFilter}
          onChange={(e) => setCsrFilter(e.target.value)}
          placeholder="Filter by CSR name..."
          style={csrFilterInputStyle}
          className="rfq-leads-csr-filter"
          list="known-csrs"
        />
        <datalist id="known-csrs">
          {knownCsrs.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      {error && <p style={{ color: "#b91c1c", padding: "0 20px", fontSize: 13 }}>{error}</p>}

      <div style={tableWrapStyle} className="rfq-leads-table-wrap">
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Item</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Total</th>
              <th style={thStyle}>Assigned to</th>
              <th style={thStyle}>Created</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && !error && (
              <tr>
                <td colSpan={6} style={emptyCellStyle}>
                  No leads here.
                </td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td style={tdStyle}>{lead.rfq.parsedSpec?.itemRaw ?? lead.rfq.rawText.slice(0, 40)}</td>
                <td style={tdStyle}>
                  {lead.rfq.sender} <span style={{ color: "#94a3b8" }}>via {lead.rfq.source}</span>
                </td>
                <td style={tdStyle}>
                  <StatusBadge status={lead.status} />
                </td>
                <td style={tdStyle}>{fmtMoney(lead.priceBreakdown?.total)}</td>
                <td style={tdStyle}>
                  <div style={assignRowStyle}>
                    <input
                      value={drafts[lead.id] ?? ""}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [lead.id]: e.target.value }))}
                      placeholder="Unassigned"
                      style={assignInputStyle}
                      list="known-csrs"
                    />
                    <button onClick={() => assign(lead.id)} style={assignBtnStyle}>
                      {lead.assignedTo ? "Reassign" : "Assign"}
                    </button>
                  </div>
                </td>
                <td style={tdStyle}>{fmtTime(lead.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const rootStyle: CSSProperties = { height: "100%", display: "flex", flexDirection: "column", background: "#f8fafc" };

const headerStyle: CSSProperties = {
  padding: "14px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "#fff",
  borderBottom: "1px solid #f1f5f9",
};

const countPillStyle: CSSProperties = {
  background: "#f1f5f9",
  color: "#475569",
  borderRadius: 999,
  padding: "1px 10px",
  fontSize: 12,
  fontWeight: 700,
};

const filterBarStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  padding: "12px 20px",
  background: "#fff",
  borderBottom: "1px solid #e2e8f0",
  flexWrap: "wrap",
};

function filterChipStyle(active: boolean): CSSProperties {
  return {
    border: active ? "1px solid transparent" : "1px solid #e2e8f0",
    background: active ? "linear-gradient(135deg, #0891b2, #0e7490)" : "#fff",
    color: active ? "#fff" : "#475569",
    borderRadius: 999,
    padding: "6px 14px",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
  };
}

const csrFilterInputStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: "6px 12px",
  fontSize: 12.5,
  outline: "none",
  marginLeft: "auto",
  minWidth: 200,
};

const tableWrapStyle: CSSProperties = { flex: 1, overflow: "auto", padding: "0 20px 20px" };

const tableStyle: CSSProperties = { width: "100%", borderCollapse: "collapse", background: "#fff", marginTop: 12, borderRadius: 12, overflow: "hidden" };

const thStyle: CSSProperties = {
  textAlign: "left",
  fontSize: 10.5,
  letterSpacing: ".05em",
  textTransform: "uppercase",
  color: "#94a3b8",
  fontWeight: 700,
  padding: "10px 14px",
  borderBottom: "1px solid #e2e8f0",
  position: "sticky",
  top: 0,
  background: "#fff",
};

const tdStyle: CSSProperties = { padding: "12px 14px", fontSize: 13, color: "#0f172a", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" };

const emptyCellStyle: CSSProperties = { padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 13 };

const assignRowStyle: CSSProperties = { display: "flex", gap: 6, alignItems: "center" };

const assignInputStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: "5px 10px",
  fontSize: 12.5,
  outline: "none",
  width: 130,
};

const assignBtnStyle: CSSProperties = {
  border: "none",
  background: "linear-gradient(135deg, #0891b2, #0f172a)",
  color: "#fff",
  borderRadius: 8,
  padding: "6px 12px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};
