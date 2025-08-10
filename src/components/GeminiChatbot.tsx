import React, { useState, useRef } from "react";
import { useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const GROQ_API_KEY = "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";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const SYSTEM_PROMPT = `You are Neubofy AI, an assistant for Neubofy. Reply concisely and directly to user queries, but if a question requires a detailed answer, you may use up to 200 words. Only mention Neubofy if contextually needed. Never mention any other brand. Always provide direct links to Neubofy pages using <a> tags with class 'neubofy-link'. Pages: Home(/), About(/about), Creations(/creations), Blog(/blog), Contact(/contact).`;

// Neubofy knowledge base for updates, onboarding, and services
const NEUBOFY_KB = [
  {
    keywords: ["Our services", "How we can help", "register", "sign up"],
    answer: "To onboard with Neubofy, visit our <a href='/creation' class='neubofy-link'>Our Creations</a> page. here you can deeply analyse how we can help you."
  },
  {
    keywords: ["make tool", "custom tool", "build tool", "create tool"],
    answer: "To request your own AI tool, go to <a href='/contact' class='neubofy-link'>Contact</a> and fill out the request form. Neubofy specializes in custom AI solutions."
  },
  {
    keywords: ["services", "solutions", "business", "automation"],
    answer: "Neubofy offers AI automation, workflow integration, and secure business solutions. Learn more on our <a href='/about' class='neubofy-link'>About</a> page."
  },
  {
    keywords: ["blog", "news", "article", "insight"],
    answer: "Explore the latest insights and articles on our <a href='/blog' class='neubofy-link'>Blog</a> page."
  },
  {
    keywords: ["update", "latest", "new feature"],
    answer: "Latest Neubofy Update: We have launched a new AI-powered dashboard for business analytics! <a href='/creations' class='neubofy-link'>Learn More</a>"
  },
  {
    keywords: ["home", "main page", "landing"],
    answer: "Return to the <a href='/' class='neubofy-link'>Neubofy Home</a> page for an overview of our platform."
  },
  {
    keywords: ["contact", "support", "help"],
    answer: "Need help? Reach out via our <a href='/contact' class='neubofy-link'>Contact</a> page. You can also use provided button to connect to our team."
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

// Extracts facts like name, company, email, etc. (expand as needed)
function extractContext(text: string, prevContext: any) {
  let context = { ...prevContext };
  const nameMatch = text.match(/(?:my name is|i am|i'm)\s+([a-zA-Z ]{2,30})/i);
  if (nameMatch) context.name = nameMatch[1].trim();
  const companyMatch = text.match(/(?:my company is|we are|our company is)\s+([a-zA-Z0-9 ]{2,50})/i);
  if (companyMatch) context.company = companyMatch[1].trim();
  // Add more extraction rules as needed
  return context;
}

const GeminiChatbot = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "system", content: SYSTEM_PROMPT }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionContext, setSessionContext] = useState<{ name?: string; company?: string }>({});
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [greeted, setGreeted] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Extract and update session context
    setSessionContext(ctx => extractContext(input, ctx));
    const contextString =
      `Current page route: ${location.pathname}\nAbout Neubofy: Neubofy is an AI automation platform for productivity, innovation, and secure business solutions.` +
      (sessionContext.name ? ` The user's name is ${sessionContext.name}.` : "") +
      (sessionContext.company ? ` The user's company is ${sessionContext.company}.` : "");

    const kbAnswer = getKbAnswer(input);
    const userMessage = `${contextString}${kbAnswer ? `\nNeubofy info: ${kbAnswer}` : ""}\nUser: ${input}`;
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
          max_tokens: 300, // Increased token limit for longer answers
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


  // On hover, toggle notification: if closed, show latest reply; if open, close. When opened, scroll chat to latest.
  const handleChatButtonHover = async () => {
    if (notification) {
      setNotification(null);
      return;
    }
    // Find the latest assistant reply
    const latestReply = messages.find(m => m.role === "assistant");
    if (latestReply) {
      setNotification(latestReply.content);
      setTimeout(() => setNotification(null), 4000);
    } else if (!greeted) {
      setGreeted(true);
      // Add 'Hi' as user message
      setMessages(msgs => [msgs[0], { role: "user", content: "Hi" }, ...msgs.slice(1)]);
      // Prepare context for AI
      const contextString =
        `Current page route: ${location.pathname}\nAbout Neubofy: Neubofy is an AI automation platform for productivity, innovation, and secure business solutions.` +
        (sessionContext.name ? ` The user's name is ${sessionContext.name}.` : "") +
        (sessionContext.company ? ` The user's company is ${sessionContext.company}.` : "");
      const userMessage = `${contextString}\nUser: Hi`;
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
            max_tokens: 100,
            temperature: 0.2
          },
          {
            headers: {
              "Authorization": `Bearer ${GROQ_API_KEY}`,
              "Content-Type": "application/json"
            }
          }
        );
        let reply = res.data.choices?.[0]?.message?.content || "Hello! How can I help you today?";
        reply = reply.replace(/\n{2,}/g, "\n").split("\n").map(p => `<p>${p.trim().replace(/<a /g, "<a class='neubofy-link' ")}</p>`).join("");
        setMessages(msgs => [msgs[0], { role: "user", content: "Hi" }, { role: "assistant", content: reply }, ...msgs.slice(1)]);
        setNotification(reply);
        setTimeout(() => setNotification(null), 4000);
      } catch {
        setNotification("Hello! How can I help you today?");
        setTimeout(() => setNotification(null), 4000);
      }
    }
  };

  // When chat opens, scroll to latest message
  useEffect(() => {
    if (open) {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [open, messages]);

  return (
    <>
      {/* Floating Button */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-white text-3xl hover:scale-110 transition-all"
        onClick={() => setOpen(!open)}
        onMouseEnter={handleChatButtonHover}
        aria-label="Open AI Chatbot"
      >
        💬
      </button>
      {/* Notification (like WhatsApp) */}
      {notification && (
        <div className="fixed bottom-28 right-8 z-[60] bg-white border border-cyan-200 shadow-xl rounded-xl px-5 py-4 max-w-xs animate-fade-in-up" style={{ minWidth: 220 }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 text-white flex items-center justify-center text-lg">🤖</span>
            <span className="font-semibold text-cyan-700">Neubofy AI</span>
          </div>
          <div className="text-gray-800 text-sm" dangerouslySetInnerHTML={{ __html: notification }} />
        </div>
      )}

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
            style={{ fontSize: 15, scrollBehavior: 'smooth' }}
            ref={chatEndRef}
            onWheel={e => { e.stopPropagation(); e.currentTarget.scrollTop += e.deltaY; }}
            onClick={e => {
              // Intercept clicks on .neubofy-link and use React Router navigation
              const target = e.target as HTMLElement;
              if (target && target.classList && target.classList.contains('neubofy-link')) {
                e.preventDefault();
                const href = target.getAttribute('href');
                if (href) {
                  window.history.pushState({}, '', href);
                  const navEvent = new PopStateEvent('popstate');
                  window.dispatchEvent(navEvent);
                }
              }
            }}
          >
            {messages.filter(m => m.role !== "system").reduce((acc, msg, i, arr) => {
              if (msg.role === "user") {
                const answer = arr[i + 1]?.role === "assistant" ? arr[i + 1] : null;
                acc.push(
                  <div key={i} className="mb-5 flex flex-col gap-1 animate-fade-in-up">
                    {/* User message */}
                    <div className="flex justify-end items-end gap-2">
                      <span className="inline-block px-4 py-2 rounded-2xl bg-cyan-200 text-gray-900 font-semibold max-w-[70%] text-right shadow-md">
                        {msg.content}
                      </span>
                    </div>
                    {/* AI answer */}
                    {answer ? (
                      <div className="flex justify-start items-end gap-2 mt-2">
                        <span className="inline-block px-4 py-2 rounded-2xl bg-purple-100 text-purple-900 max-w-[70%] shadow-md animate-fade-in-up" dangerouslySetInnerHTML={{ __html: answer.content }} />
                      </div>
                    ) : loading && i === 0 ? (
                      <div className="flex justify-start items-end gap-2 mt-2">
                        <span className="inline-block px-4 py-2 rounded-2xl bg-purple-100 text-purple-900 italic shadow-md animate-pulse">Thinking...</span>
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
