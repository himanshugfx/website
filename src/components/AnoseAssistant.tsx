"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import sanitizeHtml from "sanitize-html";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface QuickChip {
  label: string;
  icon: string;
  message: string;
}

const QUICK_CHIPS: QuickChip[] = [
  { label: "Skincare Routine", icon: "✨", message: "Help me build a skincare routine for my skin type" },
  { label: "Best Products", icon: "🌸", message: "What are your best selling products?" },
  { label: "Active Offers", icon: "🎁", message: "What promo codes or offers are available?" },
  { label: "Shipping Info", icon: "🚚", message: "Tell me about your shipping policy" },
  { label: "Indian Remedies", icon: "🌿", message: "Share some Indian home remedies for glowing skin" },
  { label: "Track Order", icon: "📦", message: "How can I track my order?" },
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3 animate-fadeIn">
      <div className="ana-avatar">
        <Image src="/assets/images/ana-character.png" alt="Ana" width={30} height={30} style={{ objectFit: 'cover', borderRadius: '50%' }} />
      </div>
      <div className="ana-bubble-bot">
        <div className="ana-typing-dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}

function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^## (.+)$/gm, "<p class='ana-heading2'>$1</p>")
    .replace(/^# (.+)$/gm, "<p class='ana-heading1'>$1</p>")
    .replace(/^- (.+)$/gm, "<span class='ana-li'>$1</span>")
    .replace(/^• (.+)$/gm, "<span class='ana-li'>$1</span>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="ana-buy-btn">$1</a>')
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br/>");
}

export default function AnoseAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [chipsUsed, setChipsUsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setShowGreeting(true), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "👋 Hi, I'm **Ana**, your personal beauty assistant from Anose Beauty!\n\nI'm powered by AI and can help you with skincare routines, product recommendations, Indian home remedies, order tracking, and more.\n\nWhat can I help you with today? ✨",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);
      setChipsUsed(true);

      // Build history for the API (exclude the welcome message)
      const historyForApi = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const res = await fetch("/api/ana/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, history: historyForApi }),
        });

        const data = await res.json();
        const reply = data.response || (data.debug ? `⚠️ **Debug:** ${data.debug}` : data.error) || "I'm sorry, something went wrong!";

        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: reply,
            timestamp: new Date(),
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content:
              "⚠️ I'm having trouble connecting right now. Please try again in a moment, or contact us at wecare@anosebeauty.com",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleChip = (chip: QuickChip) => {
    sendMessage(chip.message);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setShowGreeting(false);
  };

  return (
    <>
      <style>{`
        /* === Ana Assistant Styles === */
        .ana-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9998;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }

        .ana-greeting {
          background: white;
          border-radius: 16px 16px 4px 16px;
          padding: 10px 14px;
          font-size: 13px;
          color: #1a1a2e;
          font-weight: 500;
          box-shadow: 0 4px 24px rgba(0,0,0,0.12);
          max-width: 190px;
          white-space: normal;
          word-break: break-word;
          line-height: 1.4;
          animation: anaSlideIn 0.4s ease;
          border: 1px solid rgba(124, 58, 237, 0.1);
        }

        .ana-trigger-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4);
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
          overflow: visible;
        }
        .ana-trigger-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 28px rgba(124, 58, 237, 0.5);
        }
        .ana-trigger-btn .ana-trigger-icon {
          width: 36px;
          height: 36px;
          fill: white;
        }
        .ana-trigger-pulse {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid rgba(124, 58, 237, 0.4);
          animation: anaPulse 2s infinite;
        }
        .ana-unread-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 14px;
          height: 14px;
          background: #4ade80;
          border-radius: 50%;
          border: 2px solid white;
        }

        /* === Chat Window === */
        .ana-window {
          position: fixed;
          bottom: 100px;
          right: 24px;
          width: 380px;
          max-height: 560px;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(124,58,237,0.08);
          display: flex;
          flex-direction: column;
          z-index: 9999;
          overflow: hidden;
          animation: anaWindowIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @media (max-width: 420px) {
          .ana-window {
            width: calc(100vw - 24px);
            right: 12px;
            bottom: 90px;
            max-height: calc(100dvh - 110px);
          }
          .ana-fab {
            bottom: 16px;
            right: 16px;
          }
        }

        /* === Header === */
        .ana-header {
          background: linear-gradient(135deg, #5b21b6, #7c3aed, #a855f7);
          padding: 14px 18px 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .ana-header-avatar {
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.25);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 800;
          color: white;
          flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.4);
        }
        .ana-header-info { flex: 1; min-width: 0; }
        .ana-header-name {
          color: white;
          font-size: 15px;
          font-weight: 700;
          line-height: 1.2;
        }
        .ana-header-status {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: rgba(255,255,255,0.85);
          margin-top: 2px;
        }
        .ana-status-dot {
          width: 7px;
          height: 7px;
          background: #4ade80;
          border-radius: 50%;
          animation: anaStatusPulse 2s infinite;
        }
        .ana-close-btn {
          background: rgba(255,255,255,0.15);
          border: none;
          cursor: pointer;
          color: white;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .ana-close-btn:hover { background: rgba(255,255,255,0.3); }
        .ana-powered-by {
          font-size: 9.5px;
          color: rgba(255,255,255,0.7);
          margin-top: 1px;
          letter-spacing: 0.3px;
        }

        /* === Messages === */
        .ana-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px 14px 8px;
          display: flex;
          flex-direction: column;
          gap: 0;
          background: #f9f7fe;
          scrollbar-width: thin;
          scrollbar-color: rgba(124,58,237,0.2) transparent;
        }
        .ana-messages::-webkit-scrollbar { width: 4px; }
        .ana-messages::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.2); border-radius: 4px; }

        /* === Message rows === */
        .ana-row-user {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 8px;
          animation: anaFadeIn 0.25s ease;
        }
        .ana-row-bot {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          margin-bottom: 8px;
          animation: anaFadeIn 0.25s ease;
        }
        .ana-avatar {
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 800;
          color: white;
          flex-shrink: 0;
        }

        .ana-bubble-user {
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          color: white;
          padding: 10px 14px;
          border-radius: 16px 16px 4px 16px;
          max-width: 78%;
          font-size: 13.5px;
          line-height: 1.5;
          word-break: break-word;
          box-shadow: 0 2px 8px rgba(124,58,237,0.25);
        }

        .ana-bubble-bot {
          background: white;
          color: #1a1a2e;
          padding: 10px 14px;
          border-radius: 16px 16px 16px 4px;
          max-width: 84%;
          font-size: 13.5px;
          line-height: 1.55;
          word-break: break-word;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          border: 1px solid rgba(124,58,237,0.08);
        }
        .ana-bubble-bot strong { color: #6d28d9; }
        .ana-bubble-bot .ana-li {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          margin: 3px 0;
          color: #374151;
        }
        .ana-bubble-bot .ana-li::before {
          content: "•";
          color: #7c3aed;
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .ana-bubble-bot .ana-heading1 {
          font-size: 14px;
          font-weight: 700;
          color: #5b21b6;
          margin: 6px 0 2px;
        }
        .ana-bubble-bot .ana-heading2 {
          font-size: 13px;
          font-weight: 700;
          color: #6d28d9;
          margin: 4px 0 2px;
        }
        .ana-bubble-bot p + p { margin-top: 6px; }
        .ana-buy-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          color: white !important;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none !important;
          margin-top: 8px;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
          transition: all 0.2s;
        }
        .ana-buy-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(124, 58, 237, 0.3);
          background: linear-gradient(135deg, #6d28d9, #9333ea);
        }

        /* === Typing dots === */
        .ana-typing-dots {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 0;
        }
        .ana-typing-dots span {
          width: 7px;
          height: 7px;
          background: #a855f7;
          border-radius: 50%;
          animation: anaDot 1.2s infinite;
          opacity: 0.5;
        }
        .ana-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .ana-typing-dots span:nth-child(3) { animation-delay: 0.4s; }

        /* === Quick Chips === */
        .ana-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 10px 14px;
          background: #f9f7fe;
          border-top: 1px solid rgba(124,58,237,0.08);
        }
        .ana-chip {
          display: flex;
          align-items: center;
          gap: 4px;
          background: white;
          border: 1px solid rgba(124,58,237,0.25);
          border-radius: 20px;
          padding: 5px 11px;
          font-size: 11.5px;
          color: #6d28d9;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .ana-chip:hover {
          background: #f3e8ff;
          border-color: #7c3aed;
          transform: scale(1.02);
        }
        .ana-chip-icon { font-size: 13px; }

        /* === Input Area === */
        .ana-input-area {
          padding: 10px 12px 14px;
          background: white;
          border-top: 1px solid rgba(124,58,237,0.1);
          flex-shrink: 0;
        }
        .ana-input-form {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f5f3ff;
          border: 1.5px solid rgba(124,58,237,0.2);
          border-radius: 50px;
          padding: 6px 6px 6px 14px;
          transition: border-color 0.2s;
        }
        .ana-input-form:focus-within {
          border-color: #7c3aed;
          background: white;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.08);
        }
        .ana-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 13.5px;
          color: #1a1a2e;
          outline: none;
          font-family: inherit;
          min-width: 0;
        }
        .ana-input::placeholder { color: #9ca3af; }
        .ana-send-btn {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: opacity 0.2s, transform 0.15s;
          color: white;
        }
        .ana-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .ana-send-btn:not(:disabled):hover { transform: scale(1.08); }
        .ana-footer-text {
          text-align: center;
          font-size: 10px;
          color: #9ca3af;
          margin-top: 6px;
        }

        /* === Keyframes === */
        @keyframes anaWindowIn {
          from { opacity: 0; transform: scale(0.85) translateY(20px); transform-origin: bottom right; }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes anaSlideIn {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes anaFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes anaPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0; transform: scale(1.5); }
        }
        @keyframes anaStatusPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes anaDot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.9); }
          40% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>

      <div className="ana-fab">
        {/* Greeting bubble */}
        {showGreeting && !isOpen && (
          <div className="ana-greeting">
            💜 Hi! I&apos;m Ana, your beauty guide!
          </div>
        )}

        {/* FAB Button */}
        {!isOpen && (
          <button
            onClick={handleOpen}
            className="ana-trigger-btn"
            aria-label="Open Ana Assistant"
          >
            <div className="ana-trigger-pulse" />
            {!chipsUsed && <div className="ana-unread-badge" />}
            <Image
              src="/assets/images/ana-character.png"
              alt="Ana"
              width={48}
              height={48}
              style={{ objectFit: 'cover', borderRadius: '50%' }}
            />
          </button>
        )}

        {/* Close FAB when open */}
        {isOpen && (
          <button
            onClick={() => setIsOpen(false)}
            className="ana-trigger-btn"
            aria-label="Close Ana Assistant"
            style={{ background: "linear-gradient(135deg, #374151, #6b7280)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="ana-window" role="dialog" aria-label="Ana Beauty Assistant">
          {/* Header */}
          <div className="ana-header">
            <div className="ana-header-avatar" style={{ padding: 0, overflow: 'hidden' }}>
            <Image src="/assets/images/ana-character.png" alt="Ana" width={40} height={40} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
          </div>
            <div className="ana-header-info">
              <div className="ana-header-name">Ana — Beauty Assistant</div>
              <div className="ana-header-status">
                <div className="ana-status-dot" />
                <span>Online • Ready to help</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="ana-close-btn"
              aria-label="Close chat"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="ana-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={msg.role === "user" ? "ana-row-user" : "ana-row-bot"}
              >
                {msg.role === "assistant" && (
                  <div className="ana-avatar" style={{ padding: 0, overflow: 'hidden' }}>
                    <Image src="/assets/images/ana-character.png" alt="Ana" width={30} height={30} style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: '50%' }} />
                  </div>
                )}
                {msg.role === "user" ? (
                  <div className="ana-bubble-user">{msg.content}</div>
                ) : (
                  <div
                    className="ana-bubble-bot"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(
                        `<p>${formatMarkdown(msg.content)}</p>`,
                        {
                          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
                          allowedAttributes: {
                            a: ['href', 'name', 'target', 'class', 'rel'],
                            p: ['class'],
                            span: ['class']
                          }
                        }
                      ),
                    }}
                  />
                )}
              </div>
            ))}

            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Chips */}
          {!chipsUsed && (
            <div className="ana-chips">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  className="ana-chip"
                  onClick={() => handleChip(chip)}
                  disabled={isLoading}
                >
                  <span className="ana-chip-icon">{chip.icon}</span>
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="ana-input-area">
            <form className="ana-input-form" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                className="ana-input"
                type="text"
                placeholder="Ask me anything about skincare..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                maxLength={500}
                autoComplete="off"
              />
              <button
                type="submit"
                className="ana-send-btn"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
            <div className="ana-footer-text">
              Ana by{" "}
              <Link href="/" style={{ color: "#7c3aed", textDecoration: "none" }}>
                Anose Beauty
              </Link>{" "}
              • AI responses may vary
            </div>
          </div>
        </div>
      )}
    </>
  );
}
