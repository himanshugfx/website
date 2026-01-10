"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { detectIntent } from "@/lib/skincare-kb";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  products?: any[];
  isIngredientSearch?: boolean;
}

interface QuickReply {
  id: string;
  label: string;
  icon: string;
  response: string;
}

const defaultQuickReplies: QuickReply[] = [
  {
    id: "promo",
    label: "Active Promo Codes",
    icon: "🎁",
    response: "LOADING",
  },
  {
    id: "shipping",
    label: "Shipping Policy",
    icon: "🚚",
    response: "LOADING",
  },
  {
    id: "refund",
    label: "Refund Policy",
    icon: "💰",
    response: "LOADING",
  },
  {
    id: "contact",
    label: "Contact Us",
    icon: "📞",
    response: "LOADING",
  },
  {
    id: "expert",
    label: "Skincare Advice",
    icon: "✨",
    response: "EXPERT_ADVICE_MODE",
  },
  {
    id: "remedies",
    label: "Home Remedies",
    icon: "🌿",
    response: "HOME_REMEDIES_MODE",
  },
  {
    id: "products",
    label: "Search Products",
    icon: "🔍",
    response: "PRODUCT_SEARCH_MODE",
  },
];

export default function AnoseAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content: "👋 Hi there! I'm **Ana**! How can I help you today? Click on any option below!",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [productSearchMode, setProductSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dynamicInfo, setDynamicInfo] = useState<any>(null);
  const [currentQuickReplies, setCurrentQuickReplies] = useState<QuickReply[]>(defaultQuickReplies);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Show greeting bubble after 2 seconds
    const timer = setTimeout(() => {
      setShowGreeting(true);
    }, 2000);

    // Fetch dynamic info
    const fetchInfo = async () => {
      try {
        const res = await fetch('/api/ana/info');
        const data = await res.json();
        setDynamicInfo(data);

        // Update quick replies with real data
        setCurrentQuickReplies(prev => prev.map(reply => {
          if (data[reply.id]) {
            return { ...reply, response: data[reply.id].content };
          }
          return reply;
        }));
      } catch (err) {
        console.error("Failed to fetch Ana info", err);
      }
    };
    fetchInfo();

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleQuickReply = (reply: QuickReply) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: `${reply.icon} ${reply.label}`,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Check if data is still loading
    if (reply.response === "LOADING") {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          type: "assistant",
          content: "⌛ Just a second, I'm fetching the latest information for you...",
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }, 500);
      return;
    }

    // Check if this is expert advice mode
    if (reply.response === "EXPERT_ADVICE_MODE") {
      setProductSearchMode(true); // Re-use search UI
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          type: "assistant",
          content: `✨ **Ana Skincare Expert**
          
Ask me anything about your skin concerns! For example:
• "How to treat active acne?"
• "Best ingredients for dry skin?"
• "How to fade dark spots?"`,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }, 800);
      return;
    }

    // Check if this is home remedies mode
    if (reply.response === "HOME_REMEDIES_MODE") {
      setProductSearchMode(true); // Re-use search UI
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          type: "assistant",
          content: `🌿 **Indian Home Remedies**
          
Ask me for natural secrets for your skin! For example:
• "Home remedy for glow?"
• "How to remove tan naturally?"
• "Multani mitti for oily skin?"`,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }, 800);
      return;
    }

    // Check if this is product search mode
    if (reply.response === "PRODUCT_SEARCH_MODE") {
      setProductSearchMode(true);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          type: "assistant",
          content: `🔍 **Product Search**
          
Type the name of a product you want to know about, and I'll show you details including **ingredients**!
          
Example: "face wash", "hair oil", "serum"`,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }, 800);
      return;
    }

    // Simulate typing for regular replies
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content: reply.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000 + Math.random() * 500);
  };

  const handleProductSearch = async () => {
    if (!searchQuery.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: `🔍 ${searchQuery}`,
    };
    setMessages((prev) => [...prev, userMessage]);
    setSearchQuery("");
    setIsTyping(true);

    try {
      // Check for skincare advice first
      const intent = detectIntent(searchQuery);

      if (intent) {
        setTimeout(async () => {
          setIsTyping(false);
          // Show advice message
          const adviceMessage: Message = {
            id: `assistant-advice-${Date.now()}`,
            type: "assistant",
            content: `💡 **${intent.title}**\n\n${intent.advice}`,
          };
          setMessages((prev) => [...prev, adviceMessage]);

          // Now fetch products based on searchTerms
          setIsTyping(true);
          const res = await fetch(`/api/ana/products?q=${encodeURIComponent(intent.searchTerms)}`);
          const data = await res.json();

          setTimeout(() => {
            setIsTyping(false);
            const assistantMessage: Message = {
              id: `assistant-prod-${Date.now()}`,
              type: "assistant",
              content: `✨ Based on your concern, I recommend these products:`,
              products: data.products || [],
            };
            setMessages((prev) => [...prev, assistantMessage]);
          }, 1000);
        }, 800);
        return;
      }

      // Default product search if no specific advice intent matches
      const res = await fetch(`/api/ana/products?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();

      setTimeout(() => {
        setIsTyping(false);
        let response = "";
        let isIngredientSearch = false;
        const lowerSearch = searchQuery.toLowerCase();

        if (data.products && data.products.length > 0) {
          // Check if searched for an ingredient
          const matchedByIngredient = data.products.some((p: any) =>
            p.ingredients?.toLowerCase().includes(lowerSearch)
          );

          if (matchedByIngredient) {
            isIngredientSearch = true;
            response = `🌿 **${searchQuery}** found in these products:`;
          } else {
            response = `✨ Found ${data.products.length} product(s) matching your search:`;
          }
        } else {
          response = `😔 Sorry, I couldn't find any specific skincare advice or products for "${searchQuery}".\n\nTry asking about:\n• Acne\n• Dry Skin\n• Oily Skin\n• Pigmentation`;
        }

        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          type: "assistant",
          content: response,
          products: data.products || [],
          isIngredientSearch
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }, 1000);
    } catch (error) {
      setTimeout(() => {
        setIsTyping(false);
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          type: "assistant",
          content: "😔 Sorry, I had trouble searching for products. Please try again!",
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }, 500);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowGreeting(false);
  };

  return (
    <div className="anose-assistant-container">
      {/* Chat Window */}
      <div className={`anose-chat-window ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="anose-chat-header">
          <div className="anose-header-avatar">
            <Image
              src="/assets/images/ana-character.png"
              alt="Ana"
              width={45}
              height={45}
              className="anose-avatar-img"
            />
            <span className="anose-status-dot"></span>
          </div>
          <div className="anose-header-info">
            <h3>Ana</h3>
            <p>Online • Ready to help!</p>
          </div>
          <button className="anose-close-btn" onClick={toggleChat}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="anose-chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`anose-message ${msg.type}`}>
              {msg.type === "assistant" && (
                <div className="anose-message-avatar">
                  <Image
                    src="/assets/images/ana-character.png"
                    alt="Ana"
                    width={32}
                    height={32}
                  />
                </div>
              )}
              <div className="anose-message-bubble">
                <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />

                {/* Product Cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className="anose-product-cards mt-3">
                    {msg.products.map((product) => (
                      <a
                        key={product.id}
                        href={`/product/${product.slug}`}
                        className="anose-product-card"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="anose-card-img">
                          <Image
                            src={product.thumbImage || '/assets/images/placeholder.png'}
                            alt={product.name}
                            width={50}
                            height={50}
                          />
                        </div>
                        <div className="anose-card-details">
                          <div className="anose-card-name">{product.name}</div>
                          <div className="anose-card-price">₹{product.price}</div>
                        </div>
                        <div className="anose-card-arrow">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="anose-message assistant">
              <div className="anose-message-avatar">
                <Image
                  src="/assets/images/ana-character.png"
                  alt="Ana"
                  width={32}
                  height={32}
                />
              </div>
              <div className="anose-message-bubble typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        <div className="anose-quick-replies">
          {productSearchMode ? (
            <div className="anose-search-container">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleProductSearch()}
                placeholder="Type product name..."
                className="anose-search-input"
              />
              <button onClick={handleProductSearch} className="anose-search-btn">
                Search
              </button>
              <button onClick={() => setProductSearchMode(false)} className="anose-back-btn">
                ← Back
              </button>
            </div>
          ) : (
            currentQuickReplies.map((reply) => (
              <button
                key={reply.id}
                onClick={() => handleQuickReply(reply)}
                className="anose-quick-btn"
              >
                <span className="anose-quick-icon">{reply.icon}</span>
                <span>{reply.label}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Floating Button with Greeting */}
      <div className="anose-floating-container">
        {showGreeting && !isOpen && (
          <div className="anose-greeting-bubble" onClick={toggleChat}>
            <span>👋 Hi, I am Ana!</span>
            <button
              className="anose-greeting-close"
              onClick={(e) => {
                e.stopPropagation();
                setShowGreeting(false);
              }}
            >
              ×
            </button>
          </div>
        )}
        <button className="anose-floating-btn" onClick={toggleChat}>
          <Image
            src="/assets/images/ana-character.png"
            alt="Chat with Ana"
            width={60}
            height={60}
            className="anose-btn-avatar"
          />
          <span className="anose-pulse-ring"></span>
        </button>
      </div>

      <style jsx>{`
        .anose-assistant-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          font-family: var(--font-poppins), system-ui, sans-serif;
        }

        /* Chat Window */
        .anose-chat-window {
          position: absolute;
          bottom: 90px;
          right: 0;
          width: 380px;
          max-width: calc(100vw - 40px);
          height: 550px;
          max-height: calc(100vh - 150px);
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(250, 245, 255, 0.98));
          backdrop-filter: blur(20px);
          border-radius: 24px;
          box-shadow: 0 25px 80px rgba(147, 51, 234, 0.25),
                      0 10px 30px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          opacity: 0;
          transform: translateY(20px) scale(0.95);
          pointer-events: none;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(147, 51, 234, 0.1);
        }

        .anose-chat-window.open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: all;
        }

        /* Header */
        .anose-chat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #6366f1 100%);
          color: white;
        }

        .anose-header-avatar {
          position: relative;
        }

        .anose-avatar-img {
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.3);
          object-fit: cover;
        }

        .anose-status-dot {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          background: #22c55e;
          border-radius: 50%;
          border: 2px solid white;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }

        .anose-header-info h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
        }

        .anose-header-info p {
          margin: 2px 0 0;
          font-size: 12px;
          opacity: 0.9;
        }

        .anose-close-btn {
          margin-left: auto;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .anose-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }

        /* Messages */
        .anose-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .anose-message {
          display: flex;
          gap: 10px;
          max-width: 85%;
          animation: messageIn 0.3s ease-out;
        }

        @keyframes messageIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .anose-message.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .anose-message-avatar {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
        }

        .anose-message-bubble {
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.5;
        }

        .anose-message.assistant .anose-message-bubble {
          background: white;
          color: #1f2937;
          border: 1px solid rgba(147, 51, 234, 0.1);
          border-radius: 18px 18px 18px 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .anose-message.user .anose-message-bubble {
          background: linear-gradient(135deg, #9333ea, #7c3aed);
          color: white;
          border-radius: 18px 18px 4px 18px;
        }

        /* Product Cards in Chat */
        .anose-product-cards {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 10px;
        }

        .anose-product-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          background: #fdfaff;
          border: 1px solid rgba(147, 51, 234, 0.15);
          border-radius: 12px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
        }

        .anose-product-card:hover {
          background: white;
          border-color: #9333ea;
          box-shadow: 0 4px 12px rgba(147, 51, 234, 0.1);
          transform: translateX(4px);
        }

        .anose-card-img {
          flex-shrink: 0;
          width: 50px;
          height: 50px;
          border-radius: 8px;
          overflow: hidden;
          background: #f3f4f6;
        }

        .anose-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .anose-card-details {
          flex: 1;
          min-width: 0;
        }

        .anose-card-name {
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .anose-card-price {
          font-size: 12px;
          font-weight: 700;
          color: #9333ea;
          margin-top: 2px;
        }

        .anose-card-arrow {
          color: #9333ea;
          opacity: 0.5;
        }

        .anose-product-card:hover .anose-card-arrow {
          opacity: 1;
        }

        .anose-message-bubble.typing {
          display: flex;
          gap: 5px;
          padding: 16px 20px;
        }

        .anose-message-bubble.typing span {
          width: 8px;
          height: 8px;
          background: #9333ea;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .anose-message-bubble.typing span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .anose-message-bubble.typing span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-8px); opacity: 1; }
        }

        /* Quick Replies */
        .anose-quick-replies {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 16px;
          background: rgba(147, 51, 234, 0.03);
          border-top: 1px solid rgba(147, 51, 234, 0.1);
        }

        .anose-quick-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: white;
          border: 1px solid rgba(147, 51, 234, 0.2);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          color: #6b21a8;
          cursor: pointer;
          transition: all 0.2s;
        }

        .anose-quick-btn:hover {
          background: linear-gradient(135deg, #9333ea, #7c3aed);
          color: white;
          border-color: transparent;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
        }

        .anose-quick-icon {
          font-size: 14px;
        }

        /* Search Container */
        .anose-search-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          width: 100%;
        }

        .anose-search-input {
          flex: 1;
          min-width: 150px;
          padding: 10px 14px;
          border: 1px solid rgba(147, 51, 234, 0.3);
          border-radius: 12px;
          font-size: 13px;
          outline: none;
          transition: all 0.2s;
        }

        .anose-search-input:focus {
          border-color: #9333ea;
          box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
        }

        .anose-search-btn {
          padding: 10px 18px;
          background: linear-gradient(135deg, #9333ea, #7c3aed);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .anose-search-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
        }

        .anose-back-btn {
          padding: 10px 14px;
          background: #f3f4f6;
          color: #6b7280;
          border: none;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .anose-back-btn:hover {
          background: #e5e7eb;
          color: #374151;
        }

        /* Floating Container */
        .anose-floating-container {
          display: flex;
          align-items: flex-end;
          gap: 12px;
        }

        /* Greeting Bubble */
        .anose-greeting-bubble {
          position: absolute;
          bottom: 80px;
          right: 0;
          background: white;
          padding: 12px 40px 12px 16px;
          border-radius: 20px 20px 4px 20px;
          box-shadow: 0 8px 30px rgba(147, 51, 234, 0.2);
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
          white-space: nowrap;
          cursor: pointer;
          animation: bounceIn 0.5s ease-out;
          border: 1px solid rgba(147, 51, 234, 0.1);
        }

        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.8) translateY(10px); }
          50% { transform: scale(1.05) translateY(-3px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        .anose-greeting-close {
          position: absolute;
          top: 50%;
          right: 10px;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 18px;
          color: #9ca3af;
          cursor: pointer;
          line-height: 1;
        }

        .anose-greeting-close:hover {
          color: #6b7280;
        }

        /* Floating Button */
        .anose-floating-btn {
          position: relative;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(145deg, #9333ea, #7c3aed);
          cursor: pointer;
          overflow: visible;
          transition: all 0.3s;
          box-shadow: 0 8px 25px rgba(147, 51, 234, 0.4);
          padding: 5px;
        }

        .anose-floating-btn:hover {
          transform: scale(1.1) translateY(-3px);
          box-shadow: 0 12px 35px rgba(147, 51, 234, 0.5);
        }

        .anose-btn-avatar {
          border-radius: 50%;
          object-fit: cover;
        }

        .anose-pulse-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 3px solid rgba(147, 51, 234, 0.4);
          animation: ringPulse 2s infinite;
        }

        @keyframes ringPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0; }
        }

        /* Mobile Responsive */
        @media (max-width: 440px) {
          .anose-chat-window {
            width: calc(100vw - 40px);
            bottom: 80px;
            right: -10px;
            height: 70vh;
          }

          .anose-floating-btn {
            width: 60px;
            height: 60px;
          }

          .anose-greeting-bubble {
            font-size: 13px;
            max-width: 200px;
            white-space: normal;
          }
        }
      `}</style>
    </div>
  );
}

// Helper function to format message content with basic markdown
function formatMessage(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br />");
}
