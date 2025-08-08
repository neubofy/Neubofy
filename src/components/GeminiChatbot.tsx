import React, { useState, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const GROQ_API_KEY = "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";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const SYSTEM_PROMPT = "You are Neubofy AI, an assistant for Neubofy. Reply with concise, direct, and user-specific answers. Do not repeat that you are Neubofy AI in every response. Only mention Neubofy if contextually needed. Never mention any other brand. Always keep answers short, clear, and to the point.";

// Neubofy knowledge base for updates, onboarding, and services
const NEUBOFY_KB = [
  {
    keywords: ["onboard", "get started", "register", "sign up"],
    answer: "To onboard with Neubofy, simply visit our Contact page and request access. Our team will guide you through every step. <a href='/contact'>Contact Us</a>"
  },
  {
    keywords: ["make tool", "custom tool", "build tool", "create tool"],
    answer: "To request your own AI tool, go to the Our Creations page and fill out the request form. Neubofy specializes in custom AI solutions. <a href='/creations'>Our Creations</a>"
  },
  {
    keywords: ["services", "solutions", "business", "automation"],
    answer: "Neubofy offers AI automation, workflow integration, and secure business solutions. Learn more on our About page. <a href='/about'>About Neubofy</a>"
  },
  // Add more updates or FAQs here
  {
    keywords: ["update", "news", "latest", "new feature"],
    answer: "Latest Neubofy Update: We have launched a new AI-powered dashboard for business analytics! <a href='/creations'>Learn More</a>"
  }
];

function getKbAnswer(query) {
  const lower = query.toLowerCase();
  for (const item of NEUBOFY_KB) {
    if (item.keywords.some(k => lower.includes(k))) {
      return item.answer;
    }
  }
  return null;
}

const GeminiChatbot = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "system", content: SYSTEM_PROMPT }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    // Add context about current page and Neubofy info
    const pageContext = `Current page route: ${location.pathname}\nAbout Neubofy: Neubofy is an AI automation platform for productivity, innovation, and secure business solutions. Always answer as Neubofy AI, referencing Neubofy features and values.`;
    const kbAnswer = getKbAnswer(input);
    const userMessage = `${pageContext}${kbAnswer ? `\nNeubofy info: ${kbAnswer}` : ""}\nUser: ${input}`;
    // Place new question at the top, keep previous Q&A
    const newMessages = [messages[0], { role: "user", content: input }, ...messages.slice(1)];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await axios.post(
        GROQ_API_URL,
        {
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage }
          ],
          stream: false,
          max_tokens: 80,
          temperature: 0.2
        },
        {
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );
      // Short, user-specific, formatted answer, highlight links
      let reply = res.data.choices?.[0]?.message?.content || "Sorry, I couldn't understand that.";
      reply = reply.replace(/\n{2,}/g, "\n").split("\n").map(p => `<p>${p.trim().replace(/<a /g, "<a class='neubofy-link' ")}</p>`).join("");
      setMessages([messages[0], { role: "user", content: input }, { role: "assistant", content: reply }, ...messages.slice(1)]);
    } catch (e) {
      let errorMsg = "Error: Unable to reach Groq API.";
      if (e.response) {
        errorMsg += `\nStatus: ${e.response.status} - ${e.response.statusText}`;
        if (e.response.data && e.response.data.error && e.response.data.error.message) {
          errorMsg += `\n${e.response.data.error.message}`;
        }
      } else if (e.message) {
        errorMsg += `\n${e.message}`;
      }
      setMessages([messages[0], { role: "user", content: input }, { role: "assistant", content: errorMsg }, ...messages.slice(1)]);
    }
    setLoading(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-white text-3xl hover:scale-110 transition-all"
        onClick={() => setOpen(!open)}
        aria-label="Open AI Chatbot"
      >
        💬
      </button>

      {/* Chat Window */}
      {open && (
        <div
          className="fixed bottom-24 right-8 z-50 w-80 max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-cyan-200 flex flex-col"
          style={{ minHeight: 400, maxHeight: 500 }}
          onWheel={e => { e.stopPropagation(); e.currentTarget.scrollTop += e.deltaY; }}
        >
          <div className="p-4 bg-gradient-to-r from-cyan-400 to-purple-400 text-white rounded-t-2xl font-bold flex justify-between items-center">
            Neubofy AI Chatbot
            <button onClick={() => setOpen(false)} className="text-white text-xl font-bold">&times;</button>
          </div>
          <div
            className="flex-1 overflow-y-auto p-3 bg-gray-50 flex flex-col"
            style={{ fontSize: 15 }}
            ref={chatEndRef}
            onWheel={e => { e.stopPropagation(); e.currentTarget.scrollTop += e.deltaY; }}
          >
            {messages.filter(m => m.role !== "system").reduce((acc, msg, i, arr) => {
              if (msg.role === "user") {
                const answer = arr[i + 1]?.role === "assistant" ? arr[i + 1] : null;
                acc.push(
                  <div key={i} className="mb-4">
                    <div className="text-right mb-1">
                      <span className="inline-block px-3 py-2 rounded-lg bg-cyan-200 text-gray-900 font-semibold">
                        {msg.content}
                      </span>
                    </div>
                    {answer ? (
                      <div className="text-left">
                        <span
                          className="inline-block px-3 py-2 rounded-lg bg-purple-100 text-purple-900"
                          dangerouslySetInnerHTML={{ __html: answer.content }}
                        />
                      </div>
                    ) : loading && i === 0 ? (
                      <div className="text-left">
                        <span className="inline-block px-3 py-2 rounded-lg bg-purple-100 text-purple-900 italic">Thinking...</span>
                      </div>
                    ) : null}
                  </div>
                );
              }
              return acc;
            }, [])}
            {loading && <div className="text-gray-400 italic">Thinking...</div>}
          </div>
          <form
            className="flex border-t border-gray-200 bg-gradient-to-r from-cyan-50 to-purple-50 animate-fade-in"
            onSubmit={e => { e.preventDefault(); sendMessage(); }}
          >
            <input
              className="flex-1 p-3 border-none outline-none rounded-bl-2xl text-gray-900 placeholder:text-gray-400 bg-white focus:bg-cyan-50 transition-colors duration-300 shadow-inner animate-pulse"
              placeholder="Ask anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              style={{ fontWeight: 500, fontSize: 16 }}
            />
            <button
              type="submit"
              className="px-4 text-cyan-600 font-bold hover:text-purple-600 transition transform hover:scale-125 animate-bounce"
              disabled={loading}
            >
              ➤
            </button>
          </form>
        </div>
      )}
      <style>
        {`
          .neubofy-link {
            color: #0ea5e9;
            font-weight: 600;
            text-decoration: underline;
            transition: color 0.2s;
          }
          .neubofy-link:hover {
            color: #a21caf;
          }
        `}
      </style>
    </>
  );
};

export default GeminiChatbot;
