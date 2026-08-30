"use client";

import { useState, type CSSProperties } from "react";
import type { Message } from "../lib/types";
import { Logo } from "./Logo";
import { MessageThread } from "./MessageThread";
import { AttachIcon, ChatIcon, CloseIcon, SendIcon } from "./icons";

const DEFAULT_SUGGESTIONS = [
  "Need 10 Inverex Jollywood 620W solar panels, price & stock?",
  "2000 pcs 3mm acrylic sheet, size 12x18 - best rate?",
  "5 Dahua outdoor CCTV cameras - please quote",
  "50 pcs LED bulb 9W - rate per piece?",
];

const DEFAULT_QUOTE_FOLLOWUPS = [
  "Yes, please proceed with the order",
  "Can you offer a better price?",
  "I need a different quantity",
  "I have another item to quote",
];

export function ChatWidget({
  title,
  open,
  onToggle,
  messages,
  onSend,
  isThinking,
  variant = "corner",
  suggestions = DEFAULT_SUGGESTIONS,
  quoteFollowups = DEFAULT_QUOTE_FOLLOWUPS,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  messages: Message[];
  onSend: (text: string) => void;
  isThinking?: boolean;
  /** "corner" previews the real embeddable widget; "modal" centers it as a focused dialog (e.g. the try-it demo). */
  variant?: "corner" | "modal";
  /** Quick-reply chips shown before the buyer's first message. Pass [] to disable. */
  suggestions?: string[];
  /** Quick-reply chips shown right after a quote card, so the buyer can keep going without typing. Pass [] to disable. */
  quoteFollowups?: string[];
}) {
  const [draft, setDraft] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  }

  const lastMessage = messages[messages.length - 1];
  const showInitialSuggestions = messages.length === 0 && !isThinking && suggestions.length > 0;
  const showQuoteFollowups =
    !isThinking && !showInitialSuggestions && lastMessage?.sender !== "buyer" && lastMessage?.meta?.type === "quote" && quoteFollowups.length > 0;
  const activeSuggestions = showInitialSuggestions ? suggestions : showQuoteFollowups ? quoteFollowups : null;

  const panelContent = (
    <>
      <div style={headerStyle}>
        <Logo size={26} />
        <div style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{title}</div>
        <button onClick={onToggle} style={closeBtnStyle} aria-label="Close chat">
          <CloseIcon size={16} />
        </button>
      </div>

      <MessageThread messages={messages} isThinking={isThinking} style={{ padding: 14 }} />

      {activeSuggestions && (
        <div style={suggestionsWrapStyle}>
          <div style={suggestionsLabelStyle}>{showInitialSuggestions ? "Try asking" : "Quick replies"}</div>
          <div style={suggestionsRowStyle}>
            {activeSuggestions.map((s) => (
              <button key={s} type="button" onClick={() => onSend(s)} style={suggestionChipStyle}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={submit} style={formStyle}>
        <button type="button" title="Attach a spec sheet or photo (coming soon)" style={attachBtnStyle}>
          <AttachIcon size={16} />
        </button>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message..." style={inputStyle} />
        <button type="submit" style={sendBtnStyle} aria-label="Send">
          <SendIcon size={16} />
        </button>
      </form>
      <div style={disclaimerStyle}>AI-generated responses may contain mistakes. Please verify important information.</div>
    </>
  );

  return (
    <>
      <style>{`
        @keyframes rfq-modal-in { from { opacity: 0; transform: scale(.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @media (max-width: 520px) {
          .rfq-chat-bubble { bottom: 14px !important; right: 14px !important; }
          .rfq-corner-panel {
            left: 10px !important;
            right: 10px !important;
            bottom: 78px !important;
            width: auto !important;
            height: min(72vh, 560px) !important;
          }
          .rfq-modal-backdrop { padding: 0 !important; align-items: flex-end !important; }
          .rfq-modal-panel {
            width: 100% !important;
            height: min(88vh, 640px) !important;
            border-radius: 16px 16px 0 0 !important;
          }
        }
      `}</style>
      <button onClick={onToggle} style={bubbleStyle} className="rfq-chat-bubble" aria-label="Toggle chat">
        <ChatIcon size={18} />
      </button>

      {open && variant === "modal" && (
        <div style={backdropStyle} className="rfq-modal-backdrop" onClick={onToggle}>
          <div style={modalPanelStyle} className="rfq-modal-panel" onClick={(e) => e.stopPropagation()}>
            {panelContent}
          </div>
        </div>
      )}

      {open && variant === "corner" && (
        <div style={cornerPanelStyle} className="rfq-corner-panel">
          {panelContent}
        </div>
      )}
    </>
  );
}

const bubbleStyle: CSSProperties = {
  position: "fixed",
  bottom: 20,
  right: 20,
  width: 56,
  height: 56,
  borderRadius: "50%",
  background: "linear-gradient(135deg, #0891b2, #0f172a)",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  boxShadow: "0 8px 24px rgba(15, 23, 42, .35)",
  zIndex: 999999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const panelBase: CSSProperties = {
  width: 360,
  height: 520,
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 12px 40px rgba(15, 23, 42, .25)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  fontFamily: "system-ui, -apple-system, sans-serif",
  border: "1px solid #e2e8f0",
};

const cornerPanelStyle: CSSProperties = {
  ...panelBase,
  position: "fixed",
  bottom: 88,
  right: 20,
  zIndex: 999999,
};

const backdropStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, .5)",
  backdropFilter: "blur(2px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999999,
  padding: 20,
};

const modalPanelStyle: CSSProperties = {
  ...panelBase,
  width: 420,
  height: "min(640px, 90vh)",
  boxShadow: "0 24px 70px rgba(15, 23, 42, .4)",
  animation: "rfq-modal-in .2s ease-out",
};

const headerStyle: CSSProperties = {
  background: "linear-gradient(135deg, #0f172a, #164e63)",
  color: "#fff",
  padding: "14px 16px",
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const closeBtnStyle: CSSProperties = { background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", padding: 4 };

const formStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  borderTop: "1px solid #e2e8f0",
  padding: 8,
  background: "#fff",
};

const attachBtnStyle: CSSProperties = { background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 6, display: "flex" };

const inputStyle: CSSProperties = {
  flex: 1,
  border: "1px solid #e2e8f0",
  borderRadius: 20,
  padding: "9px 14px",
  fontSize: 13,
  outline: "none",
};

const sendBtnStyle: CSSProperties = {
  border: "none",
  background: "linear-gradient(135deg, #0891b2, #0f172a)",
  color: "#fff",
  width: 34,
  height: 34,
  borderRadius: "50%",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const suggestionsWrapStyle: CSSProperties = {
  padding: "0 12px 10px",
  background: "#fff",
  borderTop: "1px solid #f1f5f9",
};

const suggestionsLabelStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: ".05em",
  textTransform: "uppercase",
  color: "#94a3b8",
  margin: "10px 2px 8px",
};

const suggestionsRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
};

const suggestionChipStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
  color: "#0f172a",
  borderRadius: 999,
  padding: "6px 12px",
  fontSize: 12,
  cursor: "pointer",
  textAlign: "left",
};

const disclaimerStyle: CSSProperties = {
  textAlign: "center",
  fontSize: 10,
  color: "#94a3b8",
  padding: "0 12px 10px",
  background: "#fff",
};
