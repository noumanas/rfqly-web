"use client";

import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { Logo } from "../../components/Logo";

const LINKS = [
  { href: "/live", label: "Live conversations" },
  { href: "/review", label: "Review queue" },
  { href: "/leads", label: "Assigned Leads" },
  { href: "/workload", label: "CSR Workload" },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={rootStyle}>
      <style>{`
        @media (max-width: 860px) {
          .rfq-staff-nav { flex-wrap: wrap; padding: 10px 14px !important; gap: 10px !important; }
          .rfq-staff-nav-links { gap: 4px !important; overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%; }
          .rfq-staff-nav-link { padding: 6px 10px !important; font-size: 12px !important; white-space: nowrap; }
        }
        @media (max-width: 700px) {
          .rfq-staff-split { flex-direction: column !important; }
          .rfq-staff-sidebar {
            width: 100% !important;
            height: 38vh !important;
            border-right: none !important;
            border-bottom: 1px solid #e2e8f0 !important;
          }
          .rfq-staff-detail { min-height: 0 !important; flex: 1 !important; }
        }
      `}</style>
      <nav style={navStyle} className="rfq-staff-nav">
        <div style={brandStyle}>
          <Logo size={22} />
          <span style={{ fontWeight: 700, fontSize: 13 }}>Rfqly Staff Console</span>
        </div>
        <div style={{ display: "flex", gap: 6 }} className="rfq-staff-nav-links">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} style={linkStyle(pathname === link.href)} className="rfq-staff-nav-link">
              {link.label}
            </a>
          ))}
        </div>
      </nav>
      <div style={bodyStyle}>{children}</div>
    </div>
  );
}

const rootStyle: CSSProperties = {
  fontFamily: "system-ui, -apple-system, sans-serif",
  background: "#f8fafc",
  color: "#0f172a",
  height: "100vh",
  display: "flex",
  flexDirection: "column",
};

const bodyStyle: CSSProperties = { flex: 1, minHeight: 0 };

const navStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "10px 20px",
  background: "linear-gradient(135deg, #0f172a, #164e63)",
};

const brandStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 8, color: "#fff" };

function linkStyle(active: boolean): CSSProperties {
  return {
    color: active ? "#0f172a" : "#cbd5e1",
    background: active ? "#fff" : "transparent",
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
    padding: "6px 14px",
    borderRadius: 8,
  };
}
