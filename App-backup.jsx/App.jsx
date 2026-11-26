
import { useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [activePage, setActivePage] = useState("chat");
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [improvedPrompt, setImprovedPrompt] = useState("");

  const suggestions = [
    "Improve my prompt",
    "Teach me prompt engineering",
    "Create a prompt for coding",
    "Explain prompt techniques",
  ];

  function getReply(message) {
    const lower = message.toLowerCase();

    if (lower.includes("improve") || lower.includes("prompt")) {
      return `✨ Let's improve your prompt!

An effective prompt should include:
• A clear role
• Relevant context
• A specific task
• Output requirements

Try the Prompt Improver feature in the sidebar to improve your own prompt!`;
    }

    if (lower.includes("teach") || lower.includes("engineering")) {
      return `🎓 Prompt Engineering is the art of designing effective instructions for AI.

5 important elements:

1. Role – Tell AI who it should act as.
2. Context – Provide background information.
3. Task – Clearly describe what you want.
4. Constraints – Set rules or limitations.
5. Output Format – Explain how you want the answer.

Example:

Weak: "Explain Java."

Better: "Act as a Java teacher. Explain OOP concepts in simple language with examples."`;
    }

    if (lower.includes("coding") || lower.includes("code")) {
      return `💻 Here's a useful coding prompt:

"Act as an experienced software developer and coding mentor. Explain the solution step by step using beginner-friendly language. Provide clean code and explain each important line."

You can customize it for Java, Python, C++ or JavaScript.`;
    }

    return `🤖 Welcome to PromptPal!

I can help you:
• Improve weak prompts
• Learn prompting techniques
• Create coding prompts
• Generate presentation prompts
• Understand AI tools

This is currently demo mode. We will connect a real AI model later.`;
  }

  function sendMessage(text = input) {
    const message = text.trim();

    if (!message) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", text: message },
      { role: "bot", text: getReply(message) },
    ]);

    setInput("");
  }

  function improvePrompt() {
    if (!originalPrompt.trim()) return;

    const improved = `Act as an expert AI assistant.

Context:
I need help with the following task.

Task:
${originalPrompt.trim()}

Instructions:
1. Understand the task carefully.
2. Provide accurate and relevant information.
3. Explain the answer in clear, simple language.
4. Include examples wherever useful.
5. Organize the response using headings and bullet points.
6. If important information is missing, ask clarifying questions.

Output Format:
Provide a structured, detailed and easy-to-understand response.`;

    setImprovedPrompt(improved);
  }

  function newChat() {
    setMessages([]);
    setInput("");
    setActivePage("chat");
  }

  function openPage(page) {
    setActivePage(page);
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(improvedPrompt);
      alert("Improved prompt copied successfully!");
    } catch {
      alert("Copy was not successful. Please select and copy the text manually.");
    }
  }

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
              <span>Your AI companion</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="mobile-brand">✦ PromptPal</div>
          <div className="top-label">Prompt Engineering Assistant</div>
          <div className="online">
            <span className="dot"></span> Demo Mode
          </div>
        </header>

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
                    I'm PromptPal. I can help you write better prompts,
                    explore AI techniques and get more useful results.
                  </p>

                  <div className="suggestions">
                    {suggestions.map((suggestion, index) => (
                      <button
                        className="suggestion"
                        key={index}
                        onClick={() => sendMessage(suggestion)}
                      >
                        <span className="suggestion-icon">
                          {["⚡", "✧", "⌘", "◈"][index]}
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
                        {message.text.split("\n").map((line, i) => (
                          <p key={i}>{line || "\u00A0"}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="input-section">
              <div className="input-box">
                <textarea
                  placeholder="Ask PromptPal anything about prompts..."
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
                  disabled={!input.trim()}
                  title="Send message"
                >
                  ↑
                </button>
              </div>

              <div className="disclaimer">
                PromptPal Demo · AI responses will be connected later
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
                Enter a basic prompt and PromptPal will turn it into a
                clearer, more structured instruction.
              </p>

              <div className="prompt-form">
                <label>YOUR ORIGINAL PROMPT</label>
                <textarea
                  className="prompt-textarea"
                  placeholder="Example: Explain machine learning..."
                  value={originalPrompt}
                  onChange={(e) => setOriginalPrompt(e.target.value)}
                />

                <button
                  className="improve-button"
                  onClick={improvePrompt}
                  disabled={!originalPrompt.trim()}
                >
                  ✨ Improve My Prompt
                </button>

                {improvedPrompt && (
                  <div className="result-box">
                    <div className="result-heading">
                      <h3>✨ Improved Prompt</h3>
                      <button onClick={copyPrompt}>Copy Prompt</button>
                    </div>

                    <pre>{improvedPrompt}</pre>
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
              <h1>Learn Prompt <span>Engineering.</span></h1>
              <p>Understand the fundamentals of writing effective AI instructions.</p>
              <div className="result-box">
                <h3>Five elements of a good prompt</h3>
                <pre>{`1. Role – Define who the AI should act as.
2. Context – Give background information.
3. Task – Explain what you need.
4. Constraints – Set rules and limitations.
5. Output – Specify the desired format.`}</pre>
              </div>
            </div>
          </div>
        )}

        {activePage === "templates" && (
          <div className="chat-area">
            <div className="feature-page">
              <div className="welcome-icon">📚</div>
              <div className="welcome-tag">PROMPT COLLECTION</div>
              <h1>Ready-made <span>Templates.</span></h1>
              <p>Explore useful prompts for everyday tasks.</p>

              {[
                ["Coding", "Act as a programming mentor. Explain this code step by step with examples."],
                ["Study", "Act as a teacher. Explain this topic in simple language with examples."],
                ["Presentation", "Create a professional presentation outline with slide titles and key points."],
              ].map(([title, prompt]) => (
                <div className="result-box" key={title}>
                  <h3>{title}</h3>
                  <pre>{prompt}</pre>
                  <button onClick={() => navigator.clipboard.writeText(prompt)}>
                    Copy Template
                  </button>
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
