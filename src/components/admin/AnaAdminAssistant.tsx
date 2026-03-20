"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minimize2, Maximize2, LayoutDashboard, AlertTriangle, Receipt, TrendingUp, X } from "lucide-react";
import sanitizeHtml from "sanitize-html";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface QuickChip {
  label: string;
  icon: React.ReactNode;
  message: string;
}

const ADMIN_QUICK_CHIPS: QuickChip[] = [
  { label: "Sales Summary", icon: <TrendingUp className="w-3.5 h-3.5" />, message: "Give me a summary of our total revenue and recent orders." },
  { label: "Low Stock Alert", icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />, message: "Which products are low on stock right now?" },
  { label: "Pending Invoices", icon: <Receipt className="w-3.5 h-3.5" />, message: "What is the status of our pending and overdue invoices?" },
  { label: "Business Overview", icon: <LayoutDashboard className="w-3.5 h-3.5" />, message: "How is the business performing overall this month?" },
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3 animate-fadeIn">
      <div className="ana-avatar-admin">
        <Image src="/assets/images/ana-character.webp" alt="Ana" width={30} height={30} style={{ objectFit: 'cover', borderRadius: '50%' }} />
      </div>
      <div className="ana-bubble-bot-admin">
        <div className="ana-typing-dots-admin">
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
    .replace(/^## (.+)$/gm, "<p class='ana-heading2-admin'>$1</p>")
    .replace(/^# (.+)$/gm, "<p class='ana-heading1-admin'>$1</p>")
    .replace(/^- (.+)$/gm, "<span class='ana-li-admin'>$1</span>")
    .replace(/^• (.+)$/gm, "<span class='ana-li-admin'>$1</span>")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br/>");
}

export default function AnaAdminAssistant({ inline = false }: { inline?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [chipsUsed, setChipsUsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setShowGreeting(true), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "💼 Hello Admin! I'm **Ana Admin**, your business intelligence assistant.\n\nI have access to live data from Anose Beauty. I can help you analyze revenue, track pending invoices, audit inventory levels, and check on leads.\n\nWhat business insights can I provide today? 📊",
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

      const historyForApi = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const res = await fetch("/api/admin/ana/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, history: historyForApi }),
        });

        const data = await res.json();
        const reply = data.response || data.debug || data.error || "I encountered an error fetching data. Please check your connection.";

        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: reply,
            timestamp: new Date(),
          },
        ]);
      } catch (error: any) {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: "⚠️ Connection error. Please verify you are logged in as admin.",
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

  if (isMinimized && !isOpen) {
     return (
        <button 
           onClick={() => {setIsMinimized(false); setIsOpen(true);}}
           className="fixed bottom-6 right-6 w-12 h-12 bg-purple-900 rounded-full flex items-center justify-center text-white shadow-2xl z-[9999] hover:scale-110 transition-transform"
        >
            <Image src="/assets/images/ana-character.webp" alt="Ana" width={32} height={32} style={{ objectFit: 'cover', borderRadius: '50%' }} />
        </button>
     )
  }

  return (
    <>
      <style>{`
        .ana-admin-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9998;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
        }

        .ana-greeting-admin {
          background: #1e1b4b;
          color: white;
          border-radius: 16px 16px 4px 16px;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          max-width: 200px;
          animation: anaSlideIn 0.4s ease;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .ana-trigger-btn-admin {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          background: #581c87;
          border: 2px solid rgba(255,255,255,0.1);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 30px rgba(88, 28, 135, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .ana-trigger-btn-admin:hover {
          transform: translateY(-4px) scale(1.05);
          background: #6b21a8;
          box-shadow: 0 12px 40px rgba(88, 28, 135, 0.5);
        }

        .ana-window-admin {
          position: fixed;
          bottom: ${inline ? '24px' : '104px'};
          top: ${inline ? 'auto' : 'auto'};
          right: ${inline ? 'auto' : '24px'};
          left: ${inline ? '112px' : 'auto'};
          width: 400px;
          max-width: calc(100vw - ${inline ? '136px' : '48px'});
          max-height: calc(100vh - 48px);
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(88, 28, 135, 0.25);
          display: flex;
          flex-direction: column;
          z-index: 9999;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          animation: anaWindowIn 0.3s ease-out;
        }

        @media (max-width: 640px) {
          .ana-window-admin {
            left: 12px;
            right: 12px;
            top: 12px;
            bottom: 12px;
            width: auto;
            max-width: none;
            max-height: none;
          }
        }

        .ana-header-admin {
          background: #1e1b4b;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: white;
        }

        .ana-messages-admin {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ana-bubble-bot-admin {
          background: white;
          padding: 12px 16px;
          border-radius: 4px 18px 18px 18px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          font-size: 14px;
          line-height: 1.6;
          max-width: 85%;
        }

        .ana-bubble-user-admin {
          background: #581c87;
          color: white;
          padding: 12px 16px;
          border-radius: 18px 18px 4px 18px;
          align-self: flex-end;
          font-size: 14px;
          max-width: 85%;
        }

        .ana-input-area-admin {
          padding: 16px;
          background: white;
          border-top: 1px solid #e2e8f0;
        }

        .ana-input-form-admin {
          display: flex;
          gap: 8px;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .ana-input-admin {
          flex: 1;
          background: transparent;
          border: none;
          padding: 8px 12px;
          font-size: 14px;
          outline: none;
        }

        .ana-chips-admin {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 0 16px 16px;
          background: #f8fafc;
        }

        .ana-chip-admin {
          display: flex;
          align-items: center;
          gap: 6px;
          background: white;
          border: 1px solid #e2e8f0;
          padding: 6px 12px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          transition: all 0.2s;
        }
        .ana-chip-admin:hover {
          border-color: #581c87;
          color: #581c87;
          background: #faf5ff;
        }

        @keyframes anaWindowIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div className={`${inline ? 'mt-3' : 'ana-admin-fab'} print:hidden`} suppressHydrationWarning>
        {!isOpen && (
          <div className={`flex flex-col items-end gap-3 group ${inline ? 'items-center' : ''}`}>
            {showGreeting && !inline && (
              <div className="ana-greeting-admin">
                📈 Ready for some business insights?
              </div>
            )}
            <button 
              onClick={() => setIsOpen(true)} 
              className={inline ? "w-12 h-12 rounded-2xl bg-purple-900 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg shadow-purple-900/20" : "ana-trigger-btn-admin"}
              suppressHydrationWarning
              title="Ana AI Assistant"
            >
              <Image src="/assets/images/ana-character.webp" alt="Ana" width={inline ? 32 : 48} height={inline ? 32 : 48} style={{ objectFit: 'cover', borderRadius: inline ? '10px' : '14px' }} />
            </button>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="ana-window-admin print:hidden">
          <div className="ana-header-admin">
            <div className="w-10 h-10 rounded-xl bg-purple-800 flex items-center justify-center border border-white/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm">Ana Admin</h3>
              <p className="text-[10px] text-purple-300 font-medium">Business Intelligence Mode</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="ana-messages-admin">
            {messages.map((msg) => (
              <div key={msg.id} className={`${msg.role === 'user' ? 'self-end ana-bubble-user-admin' : 'self-start ana-bubble-bot-admin'}`}>
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: sanitizeHtml(formatMarkdown(msg.content), {
                      allowedTags: ['strong', 'em', 'p', 'span', 'br'],
                      allowedAttributes: { 'span': ['class'], 'p': ['class'] }
                    }) 
                  }} 
                />
              </div>
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {!chipsUsed && (
            <div className="ana-chips-admin">
              {ADMIN_QUICK_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  className="ana-chip-admin"
                  onClick={() => sendMessage(chip.message)}
                  disabled={isLoading}
                >
                  {chip.icon}
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          <div className="ana-input-area-admin">
            <form className="ana-input-form-admin" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                className="ana-input-admin"
                type="text"
                placeholder="Ask about sales, stock, or invoices..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-purple-900 text-white p-2 rounded-xl disabled:opacity-50"
                disabled={isLoading || !input.trim()}
              >
                <TrendingUp className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
