import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

// Content indexes
const BLOG_INDEX_URL = "/blog_index.json";
const PRODUCT_INDEX_URL = "/product_index.json";

const GROQ_API_KEY = "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";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const SYSTEM_PROMPT = `You are Neubofy Assistant. Be direct and concise in your responses. Only include company information when specifically asked about Neubofy or our services.

Guidelines:
- Give brief, focused answers that directly address the user's question
- Don't add promotional content unless specifically asked about Neubofy
- Use natural, conversational language
- Avoid unnecessary introductions or company mentions
- Keep responses short and to the point
- Only include links when they're directly relevant to the answer

// Important links (use with class='neubofy-link'):
- Home: /
- Creations (Solutions): /creations
- About Us: /about
- Blog: /blog
- Contact: /contact

Format responses professionally with paragraphs and bullet points when appropriate. Max length 200 words unless detailed explanation needed.`;

// Neubofy knowledge base for updates, onboarding, and services
const NEUBOFY_KB = [
  // Core Information
  {
    keywords: ["what is neubofy", "about neubofy", "company info", "tell me about"],
    answer: "Neubofy is a premier AI SaaS marketplace and ecosystem that connects developers, creators, and users. We help developers distribute their AI-based tools and enable users to access top-quality AI solutions at affordable prices. Think of us as the 'Play Store for AI Tools' where you can discover, request, or list innovative AI solutions. Visit our <a href='/creations' class='neubofy-link'>creations page</a> to explore our ecosystem."
  },
  // Vision and All Data
  {
    keywords: ["vision", "our vision", "company vision", "future", "goal", "mission statement"],
    answer: "Our vision at Neubofy is to democratize access to advanced AI and automation, empowering everyone to innovate and solve real-world problems. We believe in a future where AI is accessible, ethical, and beneficial for all. Neubofy is committed to supporting local talent, fostering global collaboration, and making AI solutions affordable and secure for businesses and individuals everywhere."
  },
  {
    keywords: ["all data", "company data", "neubofy data", "about all data", "company details", "company background"],
    answer: "Neubofy is an AI SaaS marketplace founded to bridge the gap between AI creators and users. We offer a platform for developers to list, distribute, and monetize their AI tools, while users can discover, request, and use innovative solutions. Our offerings include a verified developer network, custom AI development, privacy-first platform, and a growing ecosystem of automation tools. Neubofy is led by a young and passionate founder, Pawan Washudev."
  },
  // Founder Info
  {
    keywords: ["founder", "who is the founder", "about founder", "pawan washudev", "who started neubofy", "company founder"],
    answer: "Neubofy was founded by Pawan Washudev, a young entrepreneur passionate about AI, automation, and empowering others through technology. Pawan's vision is to make advanced AI accessible and useful for everyone, supporting both local and global innovation."
  },
  {
    keywords: ["who made you", "who created you", "your creator", "who built you", "who developed you"],
    answer: "I was created by the Neubofy team as your dedicated AI assistant. I'm here to help you with any questions about our services and solutions."
  },
  {
    keywords: ["what can you do", "your capabilities", "how can you help", "features", "abilities"],
    answer: "As Neubofy Assistant, I can help you with:<br>• Finding the right AI solutions for your needs<br>• Understanding our services and products<br>• Technical guidance and support<br>• Custom solution inquiries<br>• Latest AI trends and insights<br>• Account and service information"
  },

  // Products and Services
  {
    keywords: ["services", "solutions", "products", "offerings", "what do you offer"],
    answer: "Neubofy offers a dynamic AI SaaS ecosystem with:<br>• AI Tool Marketplace - Discover and use verified AI solutions<br>• Developer Platform - List and distribute your AI tools<br>• Custom Development - Request tailored AI solutions<br>• Verified Developer Network - Connect with trusted AI creators<br>• Distribution Support - Help reaching the right audience<br>• Privacy-First Platform - Ensuring data security<br><br>Visit our <a href='/orbit' class='neubofy-link'>Neubofy Orbit</a> to explore the marketplace."
  },
  {
    keywords: ["how to start", "get started", "begin", "first steps", "onboarding"],
    answer: "Getting started with Neubofy is easy:<br><br>For Users:<br>1. Browse AI tools in <a href='/orbit' class='neubofy-link'>Neubofy Orbit</a><br>2. Find tools that match your needs<br>3. Get affordable access to premium AI solutions<br>4. Request custom tools if needed<br><br>For Developers:<br>1. <a href='/contact' class='neubofy-link'>Contact us</a> to become a verified developer<br>2. List your AI tools on our marketplace<br>3. Reach a wider audience<br>4. Get distribution support"
  },
  {
    keywords: ["custom solution", "custom development", "tailored", "bespoke", "specific needs"],
    answer: "Need a custom AI solution? Our team specializes in developing tailored solutions for unique business requirements. <a href='/contact' class='neubofy-link'>Contact us</a> to discuss your specific needs and let us create the perfect solution for you."
  },

  // Company Information
  {
    keywords: ["company values", "mission", "vision", "principles"],
    answer: "Neubofy's mission is to create a thriving ecosystem where AI innovation meets accessibility. We aim to:<br>• Connect AI developers with users who need their solutions<br>• Make premium AI tools accessible at affordable prices<br>• Support local developers in reaching global markets<br>• Ensure privacy and security in AI solutions<br>• Foster innovation through our developer community<br>• Enable custom AI development for specific needs<br>Learn more on our <a href='/about' class='neubofy-link'>About page</a>."
  },
  {
    keywords: ["security", "privacy", "data protection", "safe", "secure"],
    answer: "Security is our top priority. Neubofy implements:<br>• Enterprise-grade encryption<br>• Secure data handling protocols<br>• Regular security audits<br>• Compliance with privacy regulations<br>• Transparent data practices"
  },
  {
    keywords: ["pricing", "cost", "packages", "plans", "subscription"],
    answer: "Neubofy offers flexible pricing tailored to your specific needs. Each solution is customized to provide maximum value. <a href='/contact' class='neubofy-link'>Contact us</a> for a personalized quote."
  },

  // Support and Resources
  {
    keywords: ["support", "help", "assistance", "contact", "reach"],
    answer: "We're here to help! You can:<br>• <a href='/contact' class='neubofy-link'>Contact our team</a><br>• Chat with me anytime<br>• Visit our <a href='/blog' class='neubofy-link'>Blog</a> for guides<br>• Request technical support<br>• Schedule a consultation"
  },
  // Content Navigation
  {
    keywords: ["content", "articles", "blogs", "products", "tell me about", "find", "search"],
    answer: "I can help you discover our content! Just ask me about:<br>• Blog posts and articles<br>• Product information<br>• Feature explanations<br>• Success stories<br>• Technical guides<br><br>Try asking: 'Tell me about [topic]' or 'Summarize [article name]'"
  },
  {
    keywords: ["documentation", "guides", "tutorials", "learn", "how to"],
    answer: "Access comprehensive resources on our <a href='/blog' class='neubofy-link'>Blog</a>, including:<br>• Implementation guides<br>• Best practices<br>• Case studies<br>• Technical documentation<br>• Video tutorials"
  },
  {
    keywords: ["news", "updates", "latest", "new features", "recent"],
    answer: "Stay updated with Neubofy's latest innovations and features on our <a href='/blog' class='neubofy-link'>Blog</a>. We regularly share new developments, success stories, and industry insights."
  },

  // Integration and Technical
  {
    keywords: ["integration", "implement", "setup", "install", "deploy"],
    answer: "Neubofy solutions are designed for seamless integration. Our team provides:<br>• Technical consultation<br>• Implementation support<br>• Custom integration options<br>• Ongoing maintenance<br><a href='/contact' class='neubofy-link'>Contact us</a> for integration details."
  },
  {
    keywords: ["api", "technical", "development", "developer", "code"],
    answer: "For developers, we provide a comprehensive platform:<br>• Developer verification program<br>• Marketplace listing tools<br>• Distribution support services<br>• Technical documentation<br>• Marketing assistance<br>• Customer feedback system<br>• Revenue sharing model<br><a href='/contact' class='neubofy-link'>Contact us</a> to join our developer community."
  },

  // Success Stories
  {
    keywords: ["case studies", "success stories", "examples", "portfolio"],
    answer: "Explore our success stories in <a href='/orbit' class='neubofy-link'>Neubofy Orbit</a>. See how businesses across industries have transformed their operations using our AI solutions."
  }
];

// Function to fetch and process website content
async function fetchWebsiteContent(type: 'blog' | 'product', query: string) {
  try {
    const indexUrl = type === 'blog' ? BLOG_INDEX_URL : PRODUCT_INDEX_URL;
    const indexResponse = await axios.get(indexUrl);
    const index = indexResponse.data;

    // Search through the index for relevant content
    const relevantItems = index.filter((item: any) => {
      const searchText = `${item.name} ${item.shortDescription} ${item.category}`.toLowerCase();
      return query.toLowerCase().split(' ').some(word => searchText.includes(word));
    });

    if (relevantItems.length === 0) {
      return null;
    }

    // Fetch full content for relevant items
    const contents = await Promise.all(
      relevantItems.map(async (item: any) => {
        const contentResponse = await axios.get(`/${type}/${item.slug}.json`);
        return contentResponse.data;
      })
    );

    return { items: relevantItems, fullContents: contents };
  } catch (error) {
    console.error('Error fetching website content:', error);
    return null;
  }
}

// Function to summarize content
function summarizeContent(content: any) {
  if (!content) return null;

  const { items, fullContents } = content;
  let summary = '';

  items.forEach((item: any, index: number) => {
    const fullContent = fullContents[index];
    summary += `\n\n${item.name}\n`;
    summary += `${item.shortDescription}\n`;
    
    if (fullContent.content) {
      // Extract main points from content
      const textContent = fullContent.content
        .filter((c: any) => c.type === 'paragraph')
        .map((c: any) => c.text)
        .slice(0, 2) // First two paragraphs
        .join('\n');
      summary += `\nKey points:\n${textContent}`;
    }
  });

  return summary;
}

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s]/gi, "");
}

// Enhanced getKbAnswer to include website content
async function getKbAnswer(query) {
  const lower = normalize(query);
  for (const item of NEUBOFY_KB) {
    if (item.keywords.some(k => lower.includes(normalize(k)))) {
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
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('neubofyChatHistory');
    return savedMessages ? JSON.parse(savedMessages) : [
      { role: "system", content: SYSTEM_PROMPT }
    ];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionContext, setSessionContext] = useState<{ name?: string; company?: string }>({});
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [greeted, setGreeted] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Save messages to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('neubofyChatHistory', JSON.stringify(messages));
  }, [messages]);

  // Dismiss notification on any document click when visible
  useEffect(() => {
    if (!notification) return;
    const handleDocumentClick = () => setNotification(null);
    document.addEventListener("click", handleDocumentClick, { capture: true });
    return () => document.removeEventListener("click", handleDocumentClick, { capture: true } as any);
  }, [notification]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Extract and update session context
    setSessionContext(ctx => extractContext(input, ctx));

    // First check our knowledge base for direct answers
    const kbAnswer = await getKbAnswer(input);

    // Only fetch website content if no direct answer found
    let websiteContent = null;
    if (!kbAnswer) {
      const isContentQuery = input.toLowerCase().includes('tell me about') ||
        input.toLowerCase().includes('what is') ||
        input.toLowerCase().includes('explain') ||
        input.toLowerCase().includes('describe') ||
        input.toLowerCase().includes('summarize');

      if (isContentQuery) {
        // Fetch both blog and product content
        const [blogContent, productContent] = await Promise.all([
          fetchWebsiteContent('blog', input),
          fetchWebsiteContent('product', input)
        ]);

        // Combine and summarize content
        if (blogContent || productContent) {
          websiteContent = {
            blog: summarizeContent(blogContent),
            product: summarizeContent(productContent)
          };
        }
      }
    }

    // Prioritize knowledge base answers
    let contextString = kbAnswer ? `Knowledge base answer: ${kbAnswer}` : "";

    // Add website content only if no KB answer or if specifically asking about content
    if (!kbAnswer || input.toLowerCase().includes('blog') || input.toLowerCase().includes('article')) {
      contextString += `${websiteContent?.blog ? `\nRelevant blog content: ${websiteContent.blog}` : ""}` +
        (websiteContent?.product ? `\nRelevant product information: ${websiteContent.product}` : "");
    }

    // Add user context only when relevant
    if (input.toLowerCase().includes('my') || input.toLowerCase().includes('me')) {
      contextString += (sessionContext.name ? `\nUser name: ${sessionContext.name}` : "") +
        (sessionContext.company ? `\nCompany: ${sessionContext.company}` : "");
    }

    // Add the new user message to the message history
    const newMessages = [messages[0], { role: "user", content: input }, ...messages.slice(1)];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      // Prepare the last 5 messages (excluding system prompt) for memory
      const history = newMessages
        .filter((m, i) => i !== 0) // skip system prompt
        .slice(0, 5) // last 5 exchanges
        .reverse() // keep order oldest to newest
        .map(m => ({ role: m.role, content: m.content }));

      // Always include system prompt at the start
      const apiMessages = [
        { role: "system", content: SYSTEM_PROMPT + "\nIMPORTANT: Keep responses under 50 words unless detailed explanation is requested. Be direct and natural. No markdown formatting or emphasis." },
        ...history
      ];

      // Add context string as a user message if present
      if (contextString) {
        apiMessages.push({ role: "user", content: contextString });
      }

      const res = await axios.post(
        GROQ_API_URL,
        {
          model: "openai/gpt-oss-120b",
          messages: apiMessages,
          stream: false,
          max_tokens: 150, // Further reduced for more concise answers
          temperature: 0.1 // Keep low temperature for focused responses
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
      let errorMsg = "Error: Unable to connect to Neubofy AI.";
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

  // Add these icons at the top
  const USER_AVATAR = "👤";
  const BOT_AVATAR = "🤖";

  // Add clear chat function
  const handleClearChat = () => {
    setMessages([{ role: "system", content: SYSTEM_PROMPT }]);
    setInput("");
  };

  return (
    <div className="relative">
      {/* Chat UI */}
      <div className={`fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex flex-col transform transition-all duration-500 ease-in-out ${open ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <div className="fixed inset-0 z-50 flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-700/80 glass-effect-dark">
            <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                  <span className="text-2xl transform hover:scale-110 transition-transform">{BOT_AVATAR}</span>
                </div>
                <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Neubofy Assistant</h1>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClearChat}
                  className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition"
                >
                  Clear chat
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {/* Chat messages */}
          <div
            className="flex-1 overflow-y-auto bg-gray-900"
            ref={chatEndRef}
            onWheel={e => { e.stopPropagation(); e.currentTarget.scrollTop += e.deltaY; }}
          >
            <div className="max-w-3xl mx-auto">
              {messages.filter(m => m.role !== "system").map((msg, i, arr) => {
                if (msg.role === "user") {
                  const answer = arr[i + 1]?.role === "assistant" ? arr[i + 1] : null;
                  return (
                    <div key={i}>
                      {/* User message */}
                      <div className="flex justify-end mb-4">
                        <div className="bg-gradient-to-l from-blue-600 to-purple-600 text-white rounded-xl p-3 max-w-[70%] shadow-md">
                          <p className="font-medium leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                      {/* AI answer */}
                      {answer && (
                        <div className="flex justify-start mb-4">
                          <div className="bg-gray-700 text-white rounded-xl p-3 max-w-[70%] shadow-md">
                            <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: answer.content }} />
                            <button
                              className="mt-2 p-1 text-gray-400 hover:text-gray-200 transition"
                              title="Copy reply"
                              onClick={() => navigator.clipboard.writeText(answer.content.replace(/<[^>]+>/g, ''))}
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" />
                                <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                      {loading && i === 0 && !answer && (
                        <div className="flex justify-start mb-4">
                          <div className="bg-gray-700 rounded-xl p-3 max-w-[70%] shadow-md">
                            <div className="h-4 w-20 bg-gray-600 rounded animate-pulse"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
          {/* Input form */}
          <div className="border-t border-gray-700/80 glass-effect-dark">
            <div className="max-w-3xl mx-auto px-4 py-4">
              <form
                className="relative"
                onSubmit={e => { e.preventDefault(); sendMessage(); }}
              >
                <div className="relative">
                  <input
                    className="w-full p-4 pr-24 rounded-xl border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-gray-800/80 shadow-md text-white placeholder:text-gray-400 text-base transition-all duration-200"
                    placeholder="Message Neubofy Assistant..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={loading}
                    autoFocus
                  />
                  <div className="absolute inset-1 -z-10 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl blur-xl transition-opacity duration-200" 
                       style={{ opacity: input.length ? 1 : 0 }} />
                </div>
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110"
                  aria-label="Send message"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                  </svg>
                </button>
              </form>
              <p className="mt-2 text-xs text-center text-gray-500/80">
                Neubofy Assistant uses our knowledge base to provide accurate information
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg transition-all transform hover:scale-110 ${open ? 'scale-0' : 'scale-100'}`}
        aria-label="Open AI Chatbot"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
      
      <style>{`
        .neubofy-link {
          color: #93c5fd;
          font-weight: 500;
          text-decoration: underline;
          transition: all 0.2s;
        }
        .neubofy-link:hover {
          color: #60a5fa;
          text-decoration-thickness: 2px;
        }
        .prose {
          font-size: 16px;
          line-height: 1.6;
        }
        .prose p {
          margin-bottom: 1em;
          opacity: 0;
          animation: fadeIn 0.5s ease forwards;
        }
        .prose p:nth-child(1) { animation-delay: 0s; }
        .prose p:nth-child(2) { animation-delay: 0.1s; }
        .prose p:nth-child(3) { animation-delay: 0.2s; }
        .prose p:nth-child(4) { animation-delay: 0.3s; }
        .prose p:nth-child(5) { animation-delay: 0.4s; }
        
        .chat-message {
          opacity: 0;
          transform: translateY(10px);
          animation: messageSlideIn 0.3s ease forwards;
        }
        
        .typing-animation::after {
          content: '▋';
          animation: typing 1s infinite;
          margin-left: 4px;
        }
        
        @keyframes typing {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        
        @keyframes messageSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .chat-transition {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .glass-effect-dark {
          background: rgba(17, 24, 39, 0.8);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(55, 65, 81, 0.3);
        }

        .prose-invert {
          color: #e5e7eb;
        }
        .prose-invert a {
          color: #93c5fd;
        }
        .prose-invert a:hover {
          color: #60a5fa;
        }
      `}</style>
    </div>
  );
};

export default GeminiChatbot;
