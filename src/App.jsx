import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import MessageContent from "./components/MessageContent";
import {
  CHAT_SUGGESTIONS,
  COMMON_MISTAKES,
  IMPROVER_FOCUSES,
  LEARNING_TECHNIQUES,
  PROMPT_ELEMENTS,
  PROMPT_TEMPLATES,
  TEMPLATE_CATEGORIES,
} from "./data/learningContent";
import { copyToClipboard } from "./utils/clipboard";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [activePage, setActivePage] = useState("chat");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [lastFailedPrompt, setLastFailedPrompt] = useState("");

  const [originalPrompt, setOriginalPrompt] = useState("");
  const [improverFocus, setImproverFocus] = useState("general");
  const [improvedPrompt, setImprovedPrompt] = useState("");
  const [improvements, setImprovements] = useState([]);
  const [isImproving, setIsImproving] = useState(false);
  const [improveError, setImproveError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [copiedId, setCopiedId] = useState("");

  const [backendStatus, setBackendStatus] = useState({
    checked: false,
    reachable: false,
    geminiConfigured: false,
    model: "gemini-2.5-flash",
  });

  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch("/api/health");
      if (!response.ok) {
        throw new Error("Health check failed");
      }
      const data = await response.json();
      setBackendStatus({
        checked: true,
        reachable: true,
        geminiConfigured: Boolean(data.geminiConfigured),
        model: data.model || "gemini-2.5-flash",
      });
    } catch {
      setBackendStatus((prev) => ({
        ...prev,
        checked: true,
        reachable: false,
        geminiConfigured: false,
      }));
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/health")
      .then((res) => {
        if (!res.ok) throw new Error("Health check failed");
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        setBackendStatus({
          checked: true,
          reachable: true,
          geminiConfigured: Boolean(data.geminiConfigured),
          model: data.model || "gemini-2.5-flash",
        });
      })
      .catch(() => {
        if (!active) return;
        setBackendStatus((prev) => ({
          ...prev,
          checked: true,
          reachable: false,
          geminiConfigured: false,
        }));
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (activePage === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatLoading, chatError, activePage]);

  useEffect(() => {
    const textarea = chatInputRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  }, [input, activePage]);

  function markCopied(id) {
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((current) => (current === id ? "" : current));
    }, 2000);
  }

  async function handleCopy(text, id) {
    const ok = await copyToClipboard(text);
    if (ok) {
      markCopied(id);
    }
  }

  async function sendMessage(text = input, options = {}) {
    const message = String(text).trim();
    if (!message || isChatLoading) return;

    const { isRetry = false } = options;
    const nextMessages = isRetry
      ? messages
      : [...messages, { role: "user", text: message }];

    if (!isRetry) {
      setMessages(nextMessages);
      setInput("");
    }

    setChatError("");
    setLastFailedPrompt("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Request failed (${response.status}). Please try again.`
        );
      }

      setMessages((previous) => [
        ...previous,
        { role: "bot", text: data.reply },
      ]);

      setBackendStatus((prev) => ({
        ...prev,
        checked: true,
        reachable: true,
        geminiConfigured: true,
        model: data.model || prev.model,
      }));
    } catch (error) {
      const isNetworkError =
        error instanceof TypeError &&
        error.message.toLowerCase().includes("fetch");

      setChatError(
        isNetworkError
          ? "Cannot reach the PromptPal backend server. Start the app with `npm run dev` and try again."
          : error.message || "Something went wrong while contacting Gemini."
      );
      setLastFailedPrompt(message);
      checkHealth();
    } finally {
      setIsChatLoading(false);
    }
  }

  async function improvePrompt() {
    const promptText = originalPrompt.trim();
    if (!promptText || isImproving) return;

    setImproveError("");
    setIsImproving(true);

    try {
      const response = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          focus: improverFocus,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Could not improve prompt (${response.status}). Please try again.`
        );
      }

      setImprovedPrompt(data.improvedPrompt || "");
      setImprovements(Array.isArray(data.improvements) ? data.improvements : []);

      setBackendStatus((prev) => ({
        ...prev,
        checked: true,
        reachable: true,
        geminiConfigured: true,
        model: data.model || prev.model,
      }));
    } catch (error) {
      const isNetworkError =
        error instanceof TypeError &&
        error.message.toLowerCase().includes("fetch");

      setImproveError(
        isNetworkError
          ? "Cannot reach the PromptPal backend server. Start the app with `npm run dev` and try again."
          : error.message || "Failed to improve prompt. Please try again."
      );
      checkHealth();
    } finally {
      setIsImproving(false);
    }
  }

  function newChat() {
    setMessages([]);
    setInput("");
    setChatError("");
    setLastFailedPrompt("");
    setActivePage("chat");
  }

  function openPage(page) {
    setActivePage(page);
  }

  function openPromptInChat(promptText, autoSend = false) {
    setActivePage("chat");
    const hasPlaceholders = /\[[^\]]+\]/.test(promptText);
    if (autoSend && !hasPlaceholders && !isChatLoading) {
      sendMessage(promptText);
      return;
    }
    setInput(promptText);
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 50);
  }

  function loadIntoImprover(promptText) {
    setOriginalPrompt(promptText);
    setImprovedPrompt("");
    setImprovements([]);
    setImproveError("");
    setActivePage("improver");
  }

  const filteredTemplates =
    selectedCategory === "All"
      ? PROMPT_TEMPLATES
      : PROMPT_TEMPLATES.filter((item) => item.category === selectedCategory);

  const statusBadge = !backendStatus.checked
    ? { dotClass: "dot-warn", label: "Connecting..." }
    : !backendStatus.reachable
      ? { dotClass: "dot-error", label: "Backend Offline" }
      : backendStatus.geminiConfigured
        ? { dotClass: "dot-ready", label: "Gemini Connected" }
        : { dotClass: "dot-warn", label: "API Key Needed" };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✦</div>
          <div>
            <h2>PromptPal</h2>
            <span>AI Prompt Assistant</span>
          </div>
        </div>

        <button className="new-chat" onClick={newChat}>
          ＋ New Chat
        </button>

        <div className="side-heading">WORKSPACE</div>

        <button
          className={`side-item ${activePage === "chat" ? "active" : ""}`}
          onClick={() => openPage("chat")}
        >
          ◈ AI Chat
        </button>

        <button
          className={`side-item ${activePage === "learn" ? "active" : ""}`}
          onClick={() => openPage("learn")}
        >
          ✧ Learn Prompting
        </button>

        <button
          className={`side-item ${activePage === "improver" ? "active" : ""}`}
          onClick={() => openPage("improver")}
        >
          ⚡ Prompt Improver
        </button>

        <button
          className={`side-item ${activePage === "templates" ? "active" : ""}`}
          onClick={() => openPage("templates")}
        >
          ⌘ Prompt Templates
        </button>

        <div className="sidebar-bottom">
          <div className="profile">
            <div className="avatar">P</div>
            <div>
              <strong>PromptPal</strong>
              <span>Powered by Gemini AI</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="mobile-brand">✦ PromptPal</div>
          <div className="top-label">Prompt Engineering Assistant</div>
          <div
            className="online"
            title={`Model: ${backendStatus.model}`}
            onClick={checkHealth}
          >
            <span className={`dot ${statusBadge.dotClass}`}></span>
            {statusBadge.label}
          </div>
        </header>

        <nav className="mobile-nav" aria-label="Mobile navigation">
          <button
            className={activePage === "chat" ? "active" : ""}
            onClick={() => openPage("chat")}
          >
            ◈ Chat
          </button>
          <button
            className={activePage === "learn" ? "active" : ""}
            onClick={() => openPage("learn")}
          >
            ✧ Learn
          </button>
          <button
            className={activePage === "improver" ? "active" : ""}
            onClick={() => openPage("improver")}
          >
            ⚡ Improver
          </button>
          <button
            className={activePage === "templates" ? "active" : ""}
            onClick={() => openPage("templates")}
          >
            ⌘ Templates
          </button>
          <button onClick={newChat}>＋ New</button>
        </nav>

        {activePage === "chat" && (
          <>
            <div className="chat-area">
              {messages.length === 0 ? (
                <div className="welcome">
                  <div className="welcome-icon">✦</div>
                  <div className="welcome-tag">
                    YOUR AI PROMPT COMPANION
                  </div>

                  <h1>
                    Let's make your
                    <br />
                    <span>prompts smarter.</span>
                  </h1>

                  <p>
                    I'm PromptPal, powered by Google Gemini. Ask me general
                    questions, programming help, or how to craft better prompts.
                  </p>

                  {backendStatus.checked && !backendStatus.geminiConfigured && (
                    <div className="error-banner setup-banner">
                      <span>
                        {!backendStatus.reachable
                          ? "Backend server is offline. Start both frontend and backend with `npm run dev`."
                          : "Gemini API key is not configured yet. Add GEMINI_API_KEY to your `.env` file and restart the server."}
                      </span>
                    </div>
                  )}

                  <div className="suggestions">
                    {CHAT_SUGGESTIONS.map((suggestion, index) => (
                      <button
                        className="suggestion"
                        key={index}
                        disabled={isChatLoading}
                        onClick={() => sendMessage(suggestion)}
                      >
                        <span className="suggestion-icon">
                          {["✦", "✧", "⌘", "⚡"][index]}
                        </span>
                        {suggestion}
                        <span className="arrow">↗</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="messages">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`message-row ${message.role}`}
                    >
                      {message.role === "bot" && (
                        <div className="bot-avatar">✦</div>
                      )}

                      <div className="message-bubble">
                        {message.role === "bot" ? (
                          <MessageContent text={message.text} />
                        ) : (
                          <p className="user-text">{message.text}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {isChatLoading && (
                    <div className="message-row bot" aria-live="polite">
                      <div className="bot-avatar">✦</div>
                      <div className="message-bubble loading-bubble">
                        <div className="typing-dots" aria-hidden="true">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <span className="loading-label">
                          Gemini is thinking...
                        </span>
                      </div>
                    </div>
                  )}

                  {chatError && (
                    <div className="error-banner" role="alert">
                      <div>
                        <strong>Could not get response:</strong> {chatError}
                      </div>
                      {lastFailedPrompt && (
                        <button
                          type="button"
                          className="retry-btn"
                          onClick={() =>
                            sendMessage(lastFailedPrompt, { isRetry: true })
                          }
                          disabled={isChatLoading}
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="input-section">
              <div className="input-box">
                <textarea
                  ref={chatInputRef}
                  placeholder="Ask PromptPal anything (Enter to send, Shift + Enter for new line)..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  rows={1}
                />

                <button
                  className="send-button"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isChatLoading}
                  title={isChatLoading ? "Generating answer..." : "Send message"}
                >
                  {isChatLoading ? <span className="send-spinner" /> : "↑"}
                </button>
              </div>

              <div className="disclaimer">
                Powered by Google Gemini ({backendStatus.model}) · Enter to
                send, Shift + Enter for new line
              </div>
            </div>
          </>
        )}

        {activePage === "improver" && (
          <div className="chat-area">
            <div className="feature-page">
              <div className="welcome-icon">⚡</div>
              <div className="welcome-tag">SMART PROMPT OPTIMIZER</div>
              <h1>
                Make your prompts
                <br />
                <span>more powerful.</span>
              </h1>
              <p>
                Enter an ordinary prompt and Gemini will analyze and rewrite it
                into a clearer, more detailed, effective instruction.
              </p>

              <div className="prompt-form">
                <label>OPTIMIZATION FOCUS</label>
                <div className="pill-group">
                  {IMPROVER_FOCUSES.map((focusItem) => (
                    <button
                      type="button"
                      key={focusItem.id}
                      className={`pill-btn ${
                        improverFocus === focusItem.id ? "active" : ""
                      }`}
                      onClick={() => setImproverFocus(focusItem.id)}
                    >
                      {focusItem.label}
                    </button>
                  ))}
                </div>

                <label htmlFor="original-prompt-input">
                  YOUR ORIGINAL PROMPT
                </label>
                <textarea
                  id="original-prompt-input"
                  className="prompt-textarea"
                  placeholder="Example: Explain machine learning to me..."
                  value={originalPrompt}
                  onChange={(e) => setOriginalPrompt(e.target.value)}
                />

                <button
                  className="improve-button"
                  onClick={improvePrompt}
                  disabled={!originalPrompt.trim() || isImproving}
                >
                  {isImproving
                    ? "✦ Gemini is optimizing your prompt..."
                    : "✨ Improve My Prompt"}
                </button>

                {improveError && (
                  <div className="error-banner" role="alert">
                    <span>{improveError}</span>
                  </div>
                )}

                {improvedPrompt && (
                  <div className="result-box">
                    <div className="result-heading">
                      <h3>✨ Improved Prompt</h3>
                      <div className="button-row">
                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={() => openPromptInChat(improvedPrompt, true)}
                        >
                          Try in Chat ↗
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(improvedPrompt, "improved-prompt")
                          }
                        >
                          {copiedId === "improved-prompt"
                            ? "✓ Copied!"
                            : "Copy Prompt"}
                        </button>
                      </div>
                    </div>

                    <pre>{improvedPrompt}</pre>

                    {improvements.length > 0 && (
                      <div className="improvements-section">
                        <h4>Why this works better</h4>
                        <ul className="improvements-list">
                          {improvements.map((point, idx) => (
                            <li key={idx}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activePage === "learn" && (
          <div className="chat-area">
            <div className="feature-page">
              <div className="welcome-icon">🎓</div>
              <div className="welcome-tag">PROMPT ENGINEERING ACADEMY</div>
              <h1>
                Learn Prompt <span>Engineering.</span>
              </h1>
              <p>
                A beginner-friendly guide to writing clear, effective
                instructions for AI models—with practical examples you can test
                right away.
              </p>

              <div className="result-box">
                <div className="result-heading">
                  <h3>What is Prompt Engineering?</h3>
                </div>
                <p className="learn-intro">
                  A <strong>prompt</strong> is the instruction or question you
                  give an AI model. <strong>Prompt engineering</strong> is the
                  skill of phrasing that instruction clearly—by giving context,
                  role, constraints, and examples—so the AI gives accurate,
                  useful answers on the first try.
                </p>
              </div>

              <div className="result-box">
                <div className="result-heading">
                  <h3>Five Elements of a Good Prompt</h3>
                </div>
                <div className="elements-list">
                  {PROMPT_ELEMENTS.map((el) => (
                    <div className="element-item" key={el.name}>
                      <strong>{el.name}</strong>
                      <span>{el.description}</span>
                    </div>
                  ))}
                </div>

                <div className="comparison-grid">
                  <div className="comparison-card weak">
                    <span className="comp-label">Weak Prompt</span>
                    <p>"Explain DBMS normalization."</p>
                  </div>
                  <div className="comparison-card strong">
                    <span className="comp-label">Strong Prompt</span>
                    <p>
                      "Act as a computer science tutor. Explain 1NF, 2NF, and 3NF
                      in DBMS to a college beginner using a student-courses
                      table example and concise bullet points."
                    </p>
                  </div>
                </div>
              </div>

              <div className="section-subtitle">
                Practical Prompting Techniques
              </div>

              {LEARNING_TECHNIQUES.map((tech) => (
                <div className="result-box" key={tech.id}>
                  <div className="result-heading">
                    <div className="technique-title-wrap">
                      <h3>{tech.title}</h3>
                      <span className="category-badge">{tech.badge}</span>
                    </div>
                    <div className="button-row">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => openPromptInChat(tech.example, true)}
                      >
                        Try in Chat ↗
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(tech.example, tech.id)}
                      >
                        {copiedId === tech.id ? "✓ Copied!" : "Copy Example"}
                      </button>
                    </div>
                  </div>
                  <p className="learn-intro">{tech.summary}</p>
                  <p className="learn-meta">
                    <strong>Best for:</strong> {tech.whenToUse}
                  </p>
                  <pre className="example-pre">{tech.example}</pre>
                </div>
              ))}

              <div className="result-box">
                <div className="result-heading">
                  <h3>Common Mistakes & Quick Fixes</h3>
                </div>
                <div className="elements-list">
                  {COMMON_MISTAKES.map((item, idx) => (
                    <div className="element-item" key={idx}>
                      <strong>Avoid: {item.mistake}</strong>
                      <span>Fix: {item.fix}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activePage === "templates" && (
          <div className="chat-area">
            <div className="feature-page">
              <div className="welcome-icon">📚</div>
              <div className="welcome-tag">PROMPT COLLECTION</div>
              <h1>
                Ready-made <span>Templates.</span>
              </h1>
              <p>
                Copy proven prompt templates for coding, education, content
                writing, research, and productivity—or customize them in chat.
              </p>

              <div className="pill-group centered-pills">
                {TEMPLATE_CATEGORIES.map((category) => (
                  <button
                    type="button"
                    key={category}
                    className={`pill-btn ${
                      selectedCategory === category ? "active" : ""
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {filteredTemplates.map((tpl) => (
                <div className="result-box" key={tpl.id}>
                  <div className="result-heading">
                    <div className="technique-title-wrap">
                      <h3>{tpl.title}</h3>
                      <span className="category-badge">{tpl.category}</span>
                    </div>
                    <div className="button-row">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => loadIntoImprover(tpl.prompt)}
                      >
                        Improve
                      </button>
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => openPromptInChat(tpl.prompt, false)}
                      >
                        Use in Chat
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(tpl.prompt, tpl.id)}
                      >
                        {copiedId === tpl.id ? "✓ Copied!" : "Copy Template"}
                      </button>
                    </div>
                  </div>
                  <p className="learn-meta">{tpl.description}</p>
                  <pre className="example-pre">{tpl.prompt}</pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
