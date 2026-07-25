import React, { useState, useRef, useEffect } from "react";
import "./AIAssistant.css";
import { API_URL, authHeaders, requestJson } from "../../config/api";

// Simple markdown-like renderer for bold, code, and bullet points
const renderMessage = (text) => {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Code block lines (basic handling)
    if (line.startsWith("```")) return null;

    // Bullet points
    if (line.startsWith("- ") || line.startsWith("• ")) {
      return (
        <div key={i} className="ai-bullet">
          <span className="ai-bullet-dot">•</span>
          <span>{formatInline(line.substring(2))}</span>
        </div>
      );
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      return (
        <div key={i} className="ai-bullet">
          <span className="ai-bullet-num">{line.match(/^\d+/)[0]}.</span>
          <span>{formatInline(line.replace(/^\d+\.\s/, ""))}</span>
        </div>
      );
    }

    // Headings (## or ###)
    if (line.startsWith("### ")) {
      return <div key={i} className="ai-heading-3">{line.substring(4)}</div>;
    }
    if (line.startsWith("## ")) {
      return <div key={i} className="ai-heading-2">{line.substring(3)}</div>;
    }

    // Empty lines → spacing
    if (line.trim() === "") return <div key={i} className="ai-spacer" />;

    return <div key={i}>{formatInline(line)}</div>;
  });
};

const formatInline = (text) => {
  // Handle **bold** and `code`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="ai-inline-code">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

const TypingIndicator = () => (
  <div className="ai-typing-indicator">
    <span></span><span></span><span></span>
  </div>
);

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "👋 Hi! I'm your AI Interview Assistant. Ask me anything about **DSA**, **OS**, **DBMS**, **CN**, **OOP**, or **System Design**!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage = { role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // The assistant is a protected, Gemini-backed endpoint. If the user isn't
    // logged in, prompt them to log in rather than firing a request that 401s
    // and surfaces a misleading "couldn't connect" error.
    if (!localStorage.getItem("token")) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "🔒 Please **log in** to use the AI Assistant — it's free once you're signed in!",
          isError: true,
        },
      ]);
      return;
    }

    setIsLoading(true);

    try {
      const data = await requestJson(`${API_URL}/api/ai-assistant`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ message: trimmed }),
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `⚠️ ${err.message || "Sorry, I couldn't connect to the server. Please make sure the backend is running."}`,
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Panel */}
      <div className={`ai-chat-panel ${isOpen ? "ai-open" : ""}`}>
        {/* Header */}
        <div className="ai-header">
          <div className="ai-header-info">
            <div className="ai-avatar">✨</div>
            <div>
              <div className="ai-header-title">AI Interview Assistant</div>
              <div className="ai-header-sub">Powered by Gemini</div>
            </div>
          </div>
          <button
            className="ai-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close AI assistant"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="ai-messages">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`ai-message-row ${msg.role === "user" ? "ai-user-row" : "ai-bot-row"}`}
            >
              {msg.role === "assistant" && (
                <div className="ai-bot-icon">✨</div>
              )}
              <div
                className={`ai-bubble ${
                  msg.role === "user" ? "ai-user-bubble" : "ai-bot-bubble"
                } ${msg.isError ? "ai-error-bubble" : ""}`}
              >
                {msg.role === "assistant"
                  ? renderMessage(msg.text)
                  : msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="ai-message-row ai-bot-row">
              <div className="ai-bot-icon">✨</div>
              <div className="ai-bot-bubble">
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="ai-input-area">
          <textarea
            ref={inputRef}
            className="ai-input"
            placeholder="Ask about DSA, OS, DBMS, CN, System Design..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
          <button
            className={`ai-send-btn ${isLoading || !input.trim() ? "ai-send-disabled" : ""}`}
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            {isLoading ? "..." : "➤"}
          </button>
        </div>
        <div className="ai-footer-hint">Press Enter to send · Shift+Enter for new line</div>
      </div>

      {/* Floating Toggle Button */}
      <button
        className={`ai-toggle-btn ${isOpen ? "ai-toggle-active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle AI assistant"
        title="AI Interview Assistant"
      >
        {isOpen ? (
          <span className="ai-toggle-close">✕</span>
        ) : (
          <>
            <span className="ai-toggle-icon">✨</span>
            <span className="ai-toggle-label">AI Help</span>
          </>
        )}
      </button>
    </>
  );
};

export default AIAssistant;
