import React, { useState, useEffect, useRef } from "react"

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000"

const SUGGESTIONS = [
  "Do you offer a no questions asked refund?",
  "What documents are required?",
  "How does Rentelo work?",
  "What happens if I drop the vehicle late?",
  "Can I travel outside Karnataka?",
  "What are the hub timings?",
  "How to upload KYC?"
]

export default function App() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "👋 Hi! I’m the Rentelo AI assistant. Ask me anything about refunds, documents, timings, delivery, damages, KYC, etc."
    }
  ])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)

  const chatEndRef = useRef(null)

  // Scroll to bottom when new messages come in
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const ask = async (q) => {
    const question = (q ?? input).trim()
    if (!question) return
    setMessages((m) => [...m, { role: "user", text: question }])
    setInput("")
    setLoading(true)
    setShowSuggestions(false) // 🔴 collapse suggestions when clicked/asked
    try {
      const r = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      })
      const j = await r.json()
      const answer = j?.answer || "❌ Sorry, I couldn't find an answer."
      setMessages((m) => [...m, { role: "assistant", text: answer }])
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "⚠️ Error connecting to server." }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-red-50 via-white to-red-100">
      <div className="w-full max-w-3xl flex flex-col h-screen">
        {/* Header */}
        <header className="p-6 text-center">
          <h1 className="text-3xl font-extrabold text-red-600">RENTELO AI..!</h1>
          <p className="text-red-500 mt-1">
            Get instant answers to your rental queries
          </p>
        </header>

        {/* Toggle Button */}
        <div className="flex justify-end mb-2 mr-3">
          <button
            onClick={() => setShowSuggestions((s) => !s)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 transition"
          >
            {showSuggestions ? "▲" : "▼"}
          </button>
        </div>

        {/* Suggestions */}
        {showSuggestions && (
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 px-4 mb-4">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => ask(s)}
                className="text-left p-2 sm:p-3 rounded-xl bg-white shadow hover:shadow-md border border-red-200 transition hover:scale-[1.02] text-red-700 text-xs sm:text-sm md:text-base"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Chat Window */}
        <div className="flex-1 bg-white rounded-2xl shadow mx-4 p-4 overflow-y-auto">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`my-2 flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-3 rounded-2xl shadow-sm max-w-[75%] whitespace-pre-line text-sm sm:text-base ${
                  m.role === "user"
                    ? "bg-red-600 text-white rounded-br-none"
                    : "bg-red-100 text-red-800 rounded-bl-none"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && <div className="text-red-400 italic">💭 Thinking…</div>}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="sticky bottom-0 p-4 bg-gradient-to-t from-white to-transparent">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") ask()
              }}
              className="flex-1 border border-red-300 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-red-400 text-sm sm:text-base"
              placeholder="💬 Type your question…"
            />
            <button
              onClick={() => ask()}
              disabled={loading}
              className="px-6 py-3 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 transition"
            >
              Ask
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
