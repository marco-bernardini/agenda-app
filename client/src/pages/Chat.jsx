import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm"; // <-- Add this import
import abstractBg from "/Abstract.jpg";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add the new user message to the local state immediately
    setMessages([...messages, { from: "Utente", text: input }]);
    setInput("");

    // Prepare the last 3 exchanges (user+bot)
    const history = [];
    let count = 0;
    for (let i = messages.length - 1; i >= 0 && count < 6; i--) {
      history.unshift(messages[i]);
      count++;
    }
    // Add the new user message
    history.push({ from: "Utente", text: input });

    try {
      console.log("📤 Sending question to backend:", input);
      const res = await axios.post(`${API_BASE_URL}/chat`, {
        question: input,
        history, // send history to backend
      });
      console.log("📥 Received response:", res.data);

      setMessages((msgs) => [
        ...msgs,
        {
          from: "Bot",
          text:
            res.data.naturalResponse || JSON.stringify(res.data.rows, null, 2),
        },
      ]);
    } catch (err) {
      console.error("❌ Error:", err);
      const errorDetails = err.response
        ? `Status: ${err.response.status}, Message: ${
            err.response.data?.error || "Unknown error"
          }`
        : err.message || "Network error";

      console.error("Error details:", errorDetails);

      setMessages((msgs) => [
        ...msgs,
        {
          from: "Bot",
          text: "Errore: " + errorDetails,
        },
      ]);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 60px)",
        background: `url(${abstractBg}) center center / cover no-repeat fixed`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 20px 20px 20px",
        boxSizing: "border-box",
        marginTop: "60px",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          width: "100%",
          height: "calc(100vh - 220px)",
          background: "white",
          borderRadius: 12,
          boxShadow: "0 4px 24px rgba(42,102,221,0.08)",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          marginTop: "auto",
          marginBottom: "auto",
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            background: "#F7FAFF",
            borderRadius: 8,
            padding: "1.2rem",
            marginBottom: 18,
            border: "1px solid #e0e7ef",
          }}
        >
          {messages.length === 0 && (
            <div style={{ color: "#888", textAlign: "center" }}>
              Inizia una conversazione...
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                margin: "10px 0",
                textAlign: m.from === "Utente" ? "right" : "left",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  background: m.from === "Utente" ? "#2A66DD" : "#eaf1ff",
                  color: m.from === "Utente" ? "white" : "#2A66DD",
                  borderRadius: 16,
                  padding: "8px 16px",
                  maxWidth: m.from === "Utente" ? "80%" : "95%", // Wider for bot messages with tables
                  fontSize: "1rem",
                  wordBreak: "break-word",
                }}
              >
                {m.from === "Utente" ? (
                  m.text
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkBreaks, remarkGfm]}
                    components={{
                      table: ({ node, ...props }) => (
                        <table
                          style={{
                            borderCollapse: "collapse",
                            width: "100%",
                            margin: "12px 0",
                            background: "#fff",
                          }}
                          {...props}
                        />
                      ),
                      th: ({ node, ...props }) => (
                        <th
                          style={{
                            border: "1px solid #2A66DD",
                            background: "#2A66DD",
                            color: "#fff",
                            padding: "6px 8px",
                            fontWeight: "bold",
                          }}
                          {...props}
                        />
                      ),
                      td: ({ node, ...props }) => (
                        <td
                          style={{
                            border: "1px solid #e0e7ef",
                            padding: "6px 8px",
                            color: "#23272f",
                          }}
                          {...props}
                        />
                      ),
                      pre: ({ node, ...props }) => (
                        <pre
                          style={{
                            width: "100%",
                            fontFamily: "'Consolas', 'Courier New', monospace",
                            fontSize: "0.95rem",
                            background: "#eaf1ff",
                            color: "#2A66DD",
                            borderRadius: 16,
                            padding: "8px 16px",
                            margin: 0,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            overflowX: "auto",
                          }}
                          {...props}
                        />
                      ),
                    }}
                  >
                    {m.text}
                  </ReactMarkdown>
                )}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Scrivi la tua domanda..."
            style={{
              flex: 1,
              padding: "0.8rem 1rem",
              borderRadius: 8,
              border: "1px solid #2A66DD",
              fontSize: "1.1rem",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              background: "linear-gradient(90deg, #2A66DD 60%, #1DC8DF 100%)",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: "bold",
              fontSize: "1.1rem",
              padding: "0 1.5rem",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            Invia
          </button>
        </form>
      </div>
    </div>
  );
}
