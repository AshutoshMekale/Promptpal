export const CHAT_SUGGESTIONS = [
  "What is Artificial Intelligence?",
  "Teach me prompt engineering",
  "Write a Python function to check prime numbers",
  "How do I write better prompts for studying?",
];

export const IMPROVER_FOCUSES = [
  { id: "general", label: "General" },
  { id: "coding", label: "Coding" },
  { id: "education", label: "Education" },
  { id: "writing", label: "Writing" },
  { id: "research", label: "Research" },
  { id: "productivity", label: "Productivity" },
];

export const PROMPT_ELEMENTS = [
  {
    name: "1. Role",
    description: "Tell the AI who it should act as (e.g., computer science tutor, senior developer, editor).",
  },
  {
    name: "2. Context",
    description: "Share your background, audience level, or goal so the answer matches your situation.",
  },
  {
    name: "3. Task",
    description: "State clearly what action you want performed using specific verbs like explain, compare, debug, or summarize.",
  },
  {
    name: "4. Constraints",
    description: "Set boundaries such as word count, beginner-friendly language, or what to avoid.",
  },
  {
    name: "5. Output Format",
    description: "Specify how the reply should look: bullet points, a table, numbered steps, or code with comments.",
  },
];

export const LEARNING_TECHNIQUES = [
  {
    id: "zero-shot",
    title: "Zero-Shot Prompting",
    badge: "Beginner",
    summary:
      "Asking the AI to complete a task directly without giving examples first. Works best when your instruction is crisp and unambiguous.",
    whenToUse: "Quick definitions, summaries, translations, or straightforward explanations.",
    example:
      "Explain how HTTPS keeps data safe on the internet to a first-year college student using a simple everyday analogy and 4 bullet points.",
  },
  {
    id: "few-shot",
    title: "Few-Shot Prompting",
    badge: "Pattern Control",
    summary:
      "Providing 2 or 3 input-output examples inside your prompt so the AI learns your exact tone, format, or classification style.",
    whenToUse: "Formatting notes consistently, classifying items, or matching a specific writing style.",
    example: `Convert each study topic into a 1-line flashcard question and answer.

Topic: Photosynthesis
Flashcard: Q: What do plants convert sunlight into? A: Chemical energy (glucose).

Topic: Binary Search
Flashcard: Q: How fast does binary search find an item in a sorted list? A: O(log n) time by halving the search range each step.

Topic: Neural Networks
Flashcard:`,
  },
  {
    id: "chain-of-thought",
    title: "Chain-of-Thought (Step-by-Step)",
    badge: "Reasoning",
    summary:
      "Asking the AI to reason step by step before giving a final answer. This reduces silly mistakes in math, logic, and debugging.",
    whenToUse: "Solving algorithms, debugging code, math problems, or comparing trade-offs.",
    example:
      "Walk through this problem step by step before stating the final answer: A store offers a 20% discount on a $50 jacket, and then applies 10% sales tax on the discounted price. What is the final cost?",
  },
  {
    id: "role-prompting",
    title: "Role / Persona Prompting",
    badge: "Depth & Tone",
    summary:
      "Assigning an expert persona shapes the vocabulary, perspective, and level of detail the AI uses in its response.",
    whenToUse: "Code reviews, mock interviews, tutoring, or domain-specific feedback.",
    example:
      "Act as a patient Java programming mentor. Explain the difference between an abstract class and an interface with a small real-world example.",
  },
  {
    id: "delimiters",
    title: "Delimiters & Structured Output",
    badge: "Clarity",
    summary:
      "Using markers like triple quotes (\"\"\") or tags separates your instructions from the text you want the AI to process.",
    whenToUse: "Summarizing articles, rewriting paragraphs, or analyzing code snippets without confusing the AI.",
    example: `Summarize the text inside triple quotes into 3 key takeaways and 2 exam-style questions.

"""
Artificial Intelligence enables computers to perform tasks that normally require human intelligence, such as recognizing speech, analyzing patterns in data, and making decisions.
"""`,
  },
  {
    id: "iterative",
    title: "Iterative Refinement",
    badge: "Workflow",
    summary:
      "Great prompting is a conversation. Start with a solid first prompt, inspect the output, and ask targeted follow-ups to adjust depth, length, or examples.",
    whenToUse: "Essays, project planning, or complex learning topics where you refine step by step.",
    example:
      "Good overview! Now make the explanation 40% shorter, replace technical jargon with everyday words, and add a real-life example from healthcare.",
  },
];

export const COMMON_MISTAKES = [
  {
    mistake: "Being too vague",
    fix: "Instead of \"Tell me about AI\", specify the angle, audience, and format (e.g., 5 applications of AI in education for beginners).",
  },
  {
    mistake: "Forgetting the audience level",
    fix: "Mention whether you want an explanation for a beginner, a college exam, or a software engineer.",
  },
  {
    mistake: "Cramming unrelated tasks in one message",
    fix: "Break large projects into steps: outline first, then draft each section, then review.",
  },
  {
    mistake: "Skipping verification",
    fix: "Always double-check facts, citations, and generated code before submitting academic or production work.",
  },
];

export const TEMPLATE_CATEGORIES = [
  "All",
  "Coding",
  "Education",
  "Content Writing",
  "Research",
  "Productivity",
];

export const PROMPT_TEMPLATES = [
  {
    id: "coding-mentor",
    category: "Coding",
    title: "Code Explainer & Mentor",
    description: "Understand unfamiliar code line by line in beginner-friendly language.",
    prompt: `Act as an experienced software developer and patient coding mentor.
Explain the following code step by step in simple, beginner-friendly language.
1. Summarize what the code does overall.
2. Explain each important line or block.
3. Point out any edge cases or improvements.

Code:
"""
[Paste your code here]
"""`,
  },
  {
    id: "coding-debugger",
    category: "Coding",
    title: "Bug Finder & Fixer",
    description: "Diagnose errors cleanly and learn why the bug happened.",
    prompt: `Act as a senior debugging assistant.
Language/Framework: [e.g., JavaScript / React / Python]
Expected behavior: [What should happen]
Actual error or behavior: [Paste error message or describe bug]

Code:
"""
[Paste buggy code here]
"""

Provide:
1. The root cause of the bug in plain English.
2. The corrected code.
3. One tip to avoid this bug in the future.`,
  },
  {
    id: "coding-practice",
    category: "Coding",
    title: "Algorithm & DSA Practice Coach",
    description: "Learn data structures and algorithms with hints before full solutions.",
    prompt: `Act as a computer science DSA tutor.
Topic: [e.g., Recursion / Binary Search / Hash Maps]
Skill level: [Beginner / Intermediate]

Explain the core idea using a visual or real-world analogy, show one clean code example in [Python/Java/C++], and analyze its time and space complexity.`,
  },
  {
    id: "edu-simplifier",
    category: "Education",
    title: "Concept Simplifier (Feynman Style)",
    description: "Break down tough college concepts with analogies and examples.",
    prompt: `Act as an engaging college professor.
Explain the concept of [topic name] to a beginner student.
Include:
- A 2-sentence plain-English definition
- A relatable real-world analogy
- 3 key points to remember for exams
- 1 quick self-check question with the answer hidden at the end`,
  },
  {
    id: "edu-quiz",
    category: "Education",
    title: "Exam Study Guide & Quiz",
    description: "Turn any chapter or topic into revision notes and practice questions.",
    prompt: `Create a structured study guide for [subject / topic].
Target level: [College undergraduate / High school]

Include:
1. Key terms and short definitions
2. Core concepts explained in bullet points
3. 5 multiple-choice or short-answer practice questions
4. An answer key with brief explanations`,
  },
  {
    id: "edu-assignment",
    category: "Education",
    title: "Assignment & Project Planner",
    description: "Structure an academic assignment or presentation clearly.",
    prompt: `Act as an academic writing coach.
Help me plan an assignment on: [topic]
Target length/format: [e.g., 1000-word report / 8-slide presentation]

Create a clear section-by-section outline with key points to cover in each section and 3 strong questions my work should answer.`,
  },
  {
    id: "writing-presentation",
    category: "Content Writing",
    title: "Presentation Slide Deck Outline",
    description: "Generate slide titles, talking points, and visual ideas quickly.",
    prompt: `Act as a presentation designer.
Topic: [Your topic]
Audience: [e.g., College classmates and professor]
Length: [e.g., 8 slides]

Create a slide-by-slide outline. For each slide, provide:
- Slide Title
- 3 concise bullet points (max 10 words each)
- A suggestion for a helpful visual or diagram`,
  },
  {
    id: "writing-polish",
    category: "Content Writing",
    title: "Article & Essay Clarity Editor",
    description: "Improve grammar, flow, and clarity while keeping your voice.",
    prompt: `Act as a skilled editor.
Review and improve the following draft for clarity, grammar, and flow while keeping my original meaning and natural tone.

Tone: [Academic / Conversational / Professional]
Draft:
"""
[Paste your text here]
"""

Provide:
1. The polished version.
2. A short bulleted list of the main improvements made.`,
  },
  {
    id: "writing-email",
    category: "Content Writing",
    title: "Clear Professional Email",
    description: "Write polite, concise emails to professors, mentors, or teams.",
    prompt: `Write a polite, clear, and concise email.
Recipient: [e.g., Professor / Internship Coordinator / Teammate]
Purpose: [e.g., Requesting clarification on assignment / Asking for project feedback]
Key details to include: [List 2-3 facts]
Tone: Respectful and professional. Include a clear subject line.`,
  },
  {
    id: "research-summary",
    category: "Research",
    title: "Paper & Article Summarizer",
    description: "Extract main findings, methodology, and limitations fast.",
    prompt: `Act as a research assistant.
Summarize the text below clearly and objectively without adding unsupported claims.

Text:
"""
[Paste abstract or article excerpt here]
"""

Format the output as:
- Core Problem / Research Question
- Methodology or Approach
- Key Findings (bullet points)
- Limitations or Open Questions`,
  },
  {
    id: "research-compare",
    category: "Research",
    title: "Topic Comparison Matrix",
    description: "Compare technologies, theories, or approaches side by side.",
    prompt: `Compare [Option A] and [Option B] for [specific use case or subject].
Present a clear comparison table covering:
- Core concept / how it works
- Strengths
- Limitations
- Best use cases
Follow the table with a short 3-sentence recommendation.`,
  },
  {
    id: "research-questions",
    category: "Research",
    title: "Research Topic & Question Brainstorm",
    description: "Narrow down a broad subject into focused research questions.",
    prompt: `Act as an academic research advisor.
Broad area of interest: [e.g., Generative AI in Education]
Constraints: [e.g., Undergraduate seminar paper / 4-week project]

Suggest 5 focused, feasible research questions. For each question, briefly explain why it matters and what type of sources or data would help answer it.`,
  },
  {
    id: "prod-notes",
    category: "Productivity",
    title: "Lecture & Meeting Actionizer",
    description: "Convert messy notes into clean summaries and action items.",
    prompt: `Turn these rough notes into an organized summary.

Notes:
"""
[Paste raw notes here]
"""

Output:
1. 3-sentence executive summary
2. Key decisions or takeaways
3. Action items checklist with suggested priority (High / Medium / Low)`,
  },
  {
    id: "prod-planner",
    category: "Productivity",
    title: "Weekly Study & Task Planner",
    description: "Build a realistic weekly schedule around your classes and deadlines.",
    prompt: `Act as a practical productivity coach.
Help me build a realistic 7-day study and task plan.
Goals/Deadlines this week: [List exams, assignments, or projects]
Available hours per day: [e.g., 3 hours on weekdays, 5 hours on weekends]

Create a balanced day-by-day schedule with focused blocks, short breaks, and buffer time.`,
  },
  {
    id: "prod-decision",
    category: "Productivity",
    title: "Decision Pros & Cons Analyzer",
    description: "Evaluate tough choices objectively with trade-offs and risks.",
    prompt: `Help me evaluate this decision objectively: [Describe your decision or options].
Context & priorities: [e.g., time, budget, learning value]

Provide:
1. Pros and cons for each option
2. Hidden risks or assumptions to check
3. A clear framework to make the final call.`,
  },
];
