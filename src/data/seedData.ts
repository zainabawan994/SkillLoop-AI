import {
  ActivityItem,
  CohortTopicHeatmapRow,
  CohortWeekPoint,
  ConceptualFeedback,
  Course,
  EducatorDraftItem,
  LanguageCode,
  MicroSessionStep,
  NotificationItem,
  QuizQuestion,
  RecoveryLogEntry,
  SimulatedCohortLearner,
  TopicMastery,
  UserRecord,
} from "../types";

export const ASSETS = {
  heroIllustration:
    "/src/assets/images/hero_developer_illustration_1794897686428.jpg",
  pythonThumb: "/src/assets/images/course_python_thumb_1794897686081.jpg",
  dataScienceThumb:
    "/src/assets/images/course_datascience_thumb_1794897687488.jpg",
  webDevThumb: "/src/assets/images/course_webdev_thumb_1794897687700.jpg",
  fahadAvatar: "/src/assets/images/avatar_fahad_ali_1794897687597.jpg",
};

export const DEMO_USERS: UserRecord[] = [
  {
    id: "user-fahad",
    name: "Fahad Ali",
    email: "fahad@skillloop.ai",
    role: "learner",
    avatar: "",
    preferred_language: "en",
    accessibility_prefs: {
      fontSize: "normal",
      highContrast: false,
      ttsEnabled: true,
    },
    streak_days: 7,
    last_active_at: new Date().toISOString(),
  },
  {
    id: "user-sarah",
    name: "Dr. Sarah Khan",
    email: "sarah@skillloop.ai",
    role: "educator",
    avatar: "",
    preferred_language: "en",
    accessibility_prefs: {
      fontSize: "normal",
      highContrast: false,
      ttsEnabled: true,
    },
    streak_days: 14,
    last_active_at: new Date().toISOString(),
  },
  {
    id: "user-admin",
    name: "Admin Console",
    email: "admin@skillloop.ai",
    role: "admin",
    avatar: "",
    preferred_language: "en",
    accessibility_prefs: {
      fontSize: "normal",
      highContrast: false,
      ttsEnabled: false,
    },
    streak_days: 30,
    last_active_at: new Date().toISOString(),
  },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: "python-101",
    title: "Python Programming",
    titleUr: "پائتھون پروگرامنگ",
    titleRomanUr: "Python Programming",
    subtitle: "Beginner to Advanced · 6 micro-lessons",
    status: "Not Started",
    progress: 0,
    thumbnail: ASSETS.pythonThumb,
    totalLessons: 6,
    completedLessons: 0,
    estimatedWeeklyMin: 60,
    modules: [
      {
        id: "py-m1",
        title: "Variables & Memory Binding",
        durationMin: 8,
        completed: false,
        conceptNotes:
          "Variables in Python act as labeled references pointing to objects in memory. Assigning x = 5 binds the name x to the integer 5.",
        codeExample: `hours_studied = 2\nrate_per_day = 15\ntotal_minutes = hours_studied * rate_per_day\nprint(total_minutes)  # 30`,
        captions: [
          "[00:00] Welcome back! In this 8-minute micro-lesson we cover variable binding.",
          "[01:45] Python names point to objects in memory rather than fixed boxes.",
          "[04:10] Notice how two variables can reference the same list object.",
        ],
        offlineSummary:
          "Variables & Memory Binding Summary:\n- Use snake_case names (e.g. study_minutes = 15).\n- Assignment (=) binds a label to an object.\n- List aliasing shares the underlying object unless copied with .copy().",
      },
      {
        id: "py-m2",
        title: "Data Types & Arithmetic vs Strings",
        durationMin: 10,
        completed: false,
        conceptNotes:
          "Python treats numbers (int/float) differently from text (str). Using + on integers adds numerically (5 + 3 = 8), whereas + on strings concatenates ('5' + '3' = '53').",
        codeExample: `print(5 + 3)      # 8 (integer addition)\nprint("5" + "3")  # "53" (string concatenation)`,
        captions: [
          "[00:00] Why does print(5 + 3) give 8 while '5' + '3' gives '53'?",
          "[02:30] Quotes turn digits into text strings, changing what + does.",
          "[06:15] Use int() to convert user input text into numbers safely.",
        ],
        offlineSummary:
          "Data Types Quick Card:\n- int/float: unquoted numbers (5 + 3 = 8).\n- str: quoted text ('5' + '3' = '53').\n- Convert safely with int('5') + 3 = 8.",
      },
      {
        id: "py-m3",
        title: "For Loops & Range Iteration",
        durationMin: 12,
        completed: false,
        conceptNotes:
          "A for loop repeats a block of code for each item in a sequence. Remember range(n) starts at 0 and stops before n.",
        codeExample: `for day in range(1, 4):\n    print(f"Day {day}: 15-min review")`,
        captions: [
          "[00:00] Loops automate repetitive checks without copy-pasting code.",
          "[03:20] range(3) yields 0, 1, 2 — always stops right before the limit.",
          "[07:50] Always initialize accumulators like total = 0 outside the loop.",
        ],
        offlineSummary:
          "For Loops & Range Summary:\n- range(n) starts at 0 and ends at n-1.\n- range(start, stop, step) controls bounds and stride.\n- Initialize counters before the loop begins.",
      },
      {
        id: "py-m4",
        title: "Reusable Functions & Return Values",
        durationMin: 15,
        completed: false,
        conceptNotes:
          "Functions encapsulate logic with parameters and return values. Always distinguish between printing inside a function and returning a value for reuse.",
        codeExample: `def calc_mastery(correct, total):\n    return round((correct / total) * 100)\n\nscore = calc_mastery(8, 10)`,
        captions: [
          "[00:00] Functions package reusable steps so you can test them cleanly.",
          "[04:05] print() displays on screen; return hands the value back to callers.",
          "[09:30] Missing return produces None.",
        ],
        offlineSummary:
          "Functions & Return Values Summary:\n- Define with def name(params):\n- Use return to pass results back.\n- Without return, Python returns None.",
      },
      {
        id: "py-m5",
        title: "Lists, Tuples & Dictionaries",
        durationMin: 14,
        completed: false,
        conceptNotes:
          "Lists are ordered and mutable ([1, 2, 3]). Dictionaries store key-value associations ({'topic': 'loops'}). Tuples are immutable records.",
        codeExample: `topics = ['Loops', 'Functions']\ntopics.append('Classes')\nscores = {'Loops': 85, 'Functions': 92}\nprint(scores['Loops'])`,
        captions: [
          "[00:00] Storing collections of learning data in Python structures.",
          "[04:20] Fast lookups by key using Python dictionaries.",
        ],
        offlineSummary:
          "Data Collections Summary:\n- list.append(x) adds to end.\n- dict[key] retrieves values.\n- Use tuples for immutable coordinates.",
      },
      {
        id: "py-m6",
        title: "Error Handling & Defensive Coding",
        durationMin: 10,
        completed: false,
        conceptNotes:
          "Wrap vulnerable operations in try-except blocks to prevent crashes from invalid user inputs or missing files.",
        codeExample: `try:\n    val = int('abc')\nexcept ValueError:\n    val = 0\nprint(val)`,
        captions: [
          "[00:00] Handling exceptions gracefully without terminating user sessions.",
          "[03:45] Catch specific exception classes like ValueError or KeyError.",
        ],
        offlineSummary:
          "Error Handling Summary:\n- try runs monitored code.\n- except catches specific error types.\n- finally executes cleanup reliably.",
      },
    ],
  },
  {
    id: "web-dev-101",
    title: "Web Development",
    titleUr: "ویب ڈویلپمنٹ",
    titleRomanUr: "Web Development",
    subtitle: "HTML, CSS & JavaScript · 6 micro-lessons",
    status: "Not Started",
    progress: 0,
    thumbnail: ASSETS.webDevThumb,
    totalLessons: 6,
    completedLessons: 0,
    estimatedWeeklyMin: 50,
    modules: [
      {
        id: "wd-m1",
        title: "Semantic HTML & Accessible Landmarks",
        durationMin: 8,
        completed: false,
        conceptNotes:
          "Using <main>, <nav>, <button>, and aria-labels makes interfaces keyboard-friendly and screen-reader ready.",
        codeExample: `<button type="button" aria-label="Read lesson aloud">Listen</button>`,
        captions: [
          "[00:00] Semantic landmarks help screen readers jump cleanly between sections.",
          "[03:15] Native <button> gives keyboard Enter/Space support automatically.",
        ],
        offlineSummary:
          "Semantic HTML Summary:\n- Prefer <button> over clickable <div>.\n- Provide aria-label on icon buttons.",
      },
      {
        id: "wd-m2",
        title: "DOM Events & State Updates",
        durationMin: 12,
        completed: false,
        conceptNotes:
          "Event listeners respond to user clicks and keyboard shortcuts without reloading the page.",
        codeExample: `button.addEventListener("click", () => {\n  statusEl.textContent = "Session started";\n});`,
        captions: [
          "[00:00] Connecting UI actions to state without page reloads.",
          "[04:50] addEventListener allows multiple non-conflicting handlers.",
        ],
        offlineSummary:
          "DOM Events Summary:\n- Use addEventListener('click', fn).\n- Update DOM text safely via textContent.",
      },
      {
        id: "wd-m3",
        title: "CSS Modern Layouts: Flexbox & Grid",
        durationMin: 12,
        completed: false,
        conceptNotes:
          "Flexbox handles 1D layout rows and columns (display: flex). CSS Grid creates robust 2D dashboard grids without float hacks.",
        codeExample: `.container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}`,
        captions: [
          "[00:00] Flexible box layout alignment along main and cross axes.",
          "[05:10] CSS Grid templates for multi-card study dashboards.",
        ],
        offlineSummary:
          "CSS Layout Summary:\n- justify-content controls main axis.\n- align-items controls cross axis.\n- Use gap instead of manual margins.",
      },
      {
        id: "wd-m4",
        title: "Asynchronous JavaScript & Fetch APIs",
        durationMin: 14,
        completed: false,
        conceptNotes:
          "Use async/await with fetch() to retrieve data from REST endpoints cleanly and handle network errors gracefully.",
        codeExample: `async function loadLessons() {\n  const res = await fetch('/api/courses');\n  const data = await res.json();\n  return data;\n}`,
        captions: [
          "[00:00] Asynchronous promises and non-blocking browser I/O.",
          "[06:00] Error handling with try-catch on HTTP responses.",
        ],
        offlineSummary:
          "Async Fetch Summary:\n- await pauses only the async function.\n- Check res.ok before parsing JSON.",
      },
      {
        id: "wd-m5",
        title: "Modern React State & Component Architecture",
        durationMin: 15,
        completed: false,
        conceptNotes:
          "React components build modular user interfaces with useState and useEffect to synchronize state with UI renders.",
        codeExample: `function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>{count}</button>;\n}`,
        captions: [
          "[00:00] Declarative component state versus imperative DOM manipulation.",
          "[07:15] Props down, events up architectural pattern.",
        ],
        offlineSummary:
          "React Fundamentals:\n- Immutability: never mutate state directly.\n- Re-renders occur automatically on state updates.",
      },
      {
        id: "wd-m6",
        title: "Responsive Web Design & Mobile Breakpoints",
        durationMin: 10,
        completed: false,
        conceptNotes:
          "Use CSS media queries (@media (min-width: 768px)) and fluid rem units to deliver crisp layouts across phones and laptops.",
        codeExample: `@media (max-width: 640px) {\n  .sidebar { display: none; }\n  .main-content { width: 100%; }\n}`,
        captions: [
          "[00:00] Mobile-first design principles for adult learner schedules.",
          "[04:30] Testing responsive viewports cleanly.",
        ],
        offlineSummary:
          "Responsive Design:\n- Design mobile-first.\n- Use relative rem/percentage units.",
      },
    ],
  },
  {
    id: "data-science-101",
    title: "Data Science Basics",
    titleUr: "ڈیٹا سائنس کی بنیادی باتیں",
    titleRomanUr: "Data Science Basics",
    subtitle: "Data Analysis & ML · 5 micro-lessons",
    status: "Not Started",
    progress: 0,
    thumbnail: ASSETS.dataScienceThumb,
    totalLessons: 5,
    completedLessons: 0,
    estimatedWeeklyMin: 45,
    modules: [
      {
        id: "ds-m1",
        title: "Tabular Data & Pandas DataFrames",
        durationMin: 10,
        completed: false,
        conceptNotes:
          "DataFrames store rows and columns like a programmable spreadsheet. Use .head() and .describe() to inspect datasets quickly.",
        codeExample: `import pandas as pd\ndf = pd.DataFrame({"hours": [1, 2, 3], "score": [62, 74, 86]})\nprint(df["score"].mean())`,
        captions: [
          "[00:00] Pandas DataFrames bring spreadsheet power into Python scripts.",
          "[03:40] Inspect columns cleanly using df.head() and df.describe().",
        ],
        offlineSummary:
          "Pandas DataFrames Summary:\n- 2D labeled rows & columns.\n- df['col'].mean() computes column averages.",
      },
      {
        id: "ds-m2",
        title: "Data Cleaning & Missing Value Imputation",
        durationMin: 12,
        completed: false,
        conceptNotes:
          "Real-world data has missing values (NaN). Use .isna(), .fillna(), or .dropna() to handle gaps reliably.",
        codeExample: `df['score'] = df['score'].fillna(df['score'].median())\nclean_df = df.dropna(subset=['email'])`,
        captions: [
          "[00:00] Detecting missing data patterns in learning metrics.",
          "[05:30] Median imputation versus dropping sparse rows.",
        ],
        offlineSummary:
          "Data Cleaning Summary:\n- df.isna().sum() counts missing entries.\n- fillna() prevents pipeline crashes.",
      },
      {
        id: "ds-m3",
        title: "Exploratory Data Analysis & Visualizations",
        durationMin: 12,
        completed: false,
        conceptNotes:
          "Visual charts reveal distributions and outliers faster than raw numbers. Use scatter plots and histograms for pattern discovery.",
        codeExample: `import matplotlib.pyplot as plt\nplt.hist(df['study_minutes'], bins=10)\nplt.title('Daily Study Distribution')\nplt.show()`,
        captions: [
          "[00:00] Transforming summary tables into actionable visual insights.",
          "[04:45] Choosing the right chart for numerical versus categorical data.",
        ],
        offlineSummary:
          "EDA Quick Card:\n- Histograms show distribution shapes.\n- Scatter plots uncover correlation.",
      },
      {
        id: "ds-m4",
        title: "Train / Test Splits & Overfitting",
        durationMin: 12,
        completed: false,
        conceptNotes:
          "Holding out a test set verifies whether your model generalizes to unseen adult learner schedules rather than memorizing noise.",
        codeExample: `from sklearn.model_selection import train_test_split\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)`,
        captions: [
          "[00:00] Why you should never evaluate accuracy on training data alone.",
          "[05:10] An 80/20 split checks real-world generalization.",
        ],
        offlineSummary:
          "Train / Test Split Summary:\n- Keep 20% unseen test data.\n- Prevents overfitting.",
      },
      {
        id: "ds-m5",
        title: "Supervised Machine Learning with Scikit-Learn",
        durationMin: 15,
        completed: false,
        conceptNotes:
          "Fit predictive models (Linear Regression, Decision Trees) on labeled training datasets and evaluate with metrics like MAE or Accuracy.",
        codeExample: `from sklearn.linear_model import LinearRegression\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\npredictions = model.predict(X_test)`,
        captions: [
          "[00:00] Training your first predictive machine learning model.",
          "[06:30] Measuring prediction error against unseen test labels.",
        ],
        offlineSummary:
          "Supervised ML Summary:\n- model.fit(X, y) trains weights.\n- model.predict(X) generates forecasts.",
      },
    ],
  },
  {
    id: "sql-101",
    title: "Database & SQL Essentials",
    titleUr: "ڈیٹا بیس اور ایس کیو ایل (SQL)",
    titleRomanUr: "Database & SQL Essentials",
    subtitle: "Relational Queries & PostgreSQL · 5 micro-lessons",
    status: "Not Started",
    progress: 0,
    thumbnail: ASSETS.webDevThumb,
    totalLessons: 5,
    completedLessons: 0,
    estimatedWeeklyMin: 45,
    modules: [
      {
        id: "sql-m1",
        title: "Relational Schema & Primary Keys",
        durationMin: 8,
        completed: false,
        conceptNotes:
          "Relational databases organize information into structured tables with columns and types. Primary keys guarantee unique row identity.",
        codeExample: `CREATE TABLE learners (\n  id SERIAL PRIMARY KEY,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  created_at TIMESTAMP DEFAULT NOW()\n);`,
        captions: [
          "[00:00] Designing scalable database tables for user records.",
          "[03:40] Why every table needs an immutable primary key.",
        ],
        offlineSummary:
          "Schema Basics:\n- PRIMARY KEY guarantees uniqueness.\n- NOT NULL prevents undefined missing values.",
      },
      {
        id: "sql-m2",
        title: "SELECT Queries, Filtering & WHERE Clauses",
        durationMin: 10,
        completed: false,
        conceptNotes:
          "Query data with SELECT, filter with WHERE, and sort rows with ORDER BY and LIMIT.",
        codeExample: `SELECT name, email, streak_days\nFROM users\nWHERE streak_days >= 7\nORDER BY streak_days DESC\nLIMIT 10;`,
        captions: [
          "[00:00] Writing declarative queries to pull specific data slices.",
          "[04:15] Combining multiple conditions with AND, OR, and LIKE.",
        ],
        offlineSummary:
          "SELECT Summary:\n- WHERE filters rows before sorting.\n- LIMIT restricts result set size.",
      },
      {
        id: "sql-m3",
        title: "Table Joins: INNER & LEFT JOIN",
        durationMin: 12,
        completed: false,
        conceptNotes:
          "Foreign keys connect related tables. Use INNER JOIN to match both sides, or LEFT JOIN to preserve all parent records.",
        codeExample: `SELECT u.name, q.topic_name, q.score\nFROM users u\nLEFT JOIN quiz_attempts q ON u.id = q.user_id;`,
        captions: [
          "[00:00] Joining multiple normalized tables without duplication.",
          "[05:30] INNER JOIN vs LEFT JOIN with practical examples.",
        ],
        offlineSummary:
          "JOIN Summary:\n- INNER JOIN keeps matching rows only.\n- LEFT JOIN preserves all left-table rows.",
      },
      {
        id: "sql-m4",
        title: "Aggregations: GROUP BY, COUNT & AVG",
        durationMin: 12,
        completed: false,
        conceptNotes:
          "Aggregate functions compute summary statistics (COUNT, SUM, AVG) across grouped categories.",
        codeExample: `SELECT topic_name, COUNT(*) AS attempts, ROUND(AVG(score), 1) AS avg_score\nFROM quiz_attempts\nGROUP BY topic_name\nHAVING COUNT(*) >= 5;`,
        captions: [
          "[00:00] Summarizing millions of student answers into topic insights.",
          "[06:00] WHERE filters rows before grouping; HAVING filters groups after.",
        ],
        offlineSummary:
          "Aggregations Summary:\n- GROUP BY clusters identical column values.\n- HAVING filters aggregate results.",
      },
      {
        id: "sql-m5",
        title: "Indexes & Query Performance Optimization",
        durationMin: 10,
        completed: false,
        conceptNotes:
          "B-tree indexes dramatically speed up WHERE lookups from O(N) full-table scans to O(log N) tree navigations.",
        codeExample: `CREATE INDEX idx_users_email ON users (email);\nEXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';`,
        captions: [
          "[00:00] How database indexes work under the hood.",
          "[04:20] Reading EXPLAIN ANALYZE plans to eliminate bottlenecks.",
        ],
        offlineSummary:
          "Indexing Quick Card:\n- Index columns used heavily in WHERE or JOIN.\n- Avoid indexing low-cardinality boolean columns.",
      },
    ],
  },
  {
    id: "genai-101",
    title: "Generative AI & LLM Applications",
    titleUr: "جنریٹو اے آئی اور پرامپٹ انجینئرنگ",
    titleRomanUr: "Generative AI & LLM Applications",
    subtitle: "Prompt Engineering, Gemini APIs & RAG · 5 micro-lessons",
    status: "Not Started",
    progress: 0,
    thumbnail: ASSETS.heroIllustration,
    totalLessons: 5,
    completedLessons: 0,
    estimatedWeeklyMin: 50,
    modules: [
      {
        id: "genai-m1",
        title: "LLM Fundamentals, Tokens & Temperature",
        durationMin: 10,
        completed: false,
        conceptNotes:
          "LLMs predict the next token based on context probability. Temperature controls randomness (0.0 = deterministic, 0.9 = creative).",
        codeExample: `prompt = "Explain Python in 1 sentence."\n# Temperature 0.2 gives precise, reproducible educational hints`,
        captions: [
          "[00:00] Understanding tokens and context windows in modern AI models.",
          "[04:15] How temperature and top-p sampling affect output quality.",
        ],
        offlineSummary:
          "LLM Fundamentals:\n- 1 token ≈ 4 characters of English text.\n- Lower temperature ensures consistency in tutoring.",
      },
      {
        id: "genai-m2",
        title: "Prompt Engineering: Few-Shot & Socratic Framing",
        durationMin: 12,
        completed: false,
        conceptNotes:
          "Clear system instructions, role assignment, and few-shot examples guide LLMs to produce structured, non-punitive learning feedback.",
        codeExample: `system_prompt = \"\"\"\nYou are an adaptive tutor for working adults.\nRule: Always ask a guiding question before giving code solutions.\nFormat: Concise under 100 words.\n\"\"\"`,
        captions: [
          "[00:00] Crafting robust system prompts that prevent hallucination.",
          "[05:40] Few-shot exemplars for consistent JSON formatting.",
        ],
        offlineSummary:
          "Prompt Engineering:\n- Assign clear role and constraints.\n- Provide expected output schema.",
      },
      {
        id: "genai-m3",
        title: "Integrating Gemini APIs with Structured JSON",
        durationMin: 14,
        completed: false,
        conceptNotes:
          "Call Gemini generateContent with responseMimeType='application/json' and responseSchema to guarantee reliable UI data parsing.",
        codeExample: `response = await ai.models.generateContent({\n  model: 'gemini-2.0-flash',\n  contents: user_question,\n  config: { responseMimeType: 'application/json' }\n})`,
        captions: [
          "[00:00] Connecting AI backends to frontend interfaces safely.",
          "[06:20] Enforcing strict JSON schema responses.",
        ],
        offlineSummary:
          "API Integration:\n- Use structured JSON outputs.\n- Implement graceful offline fallbacks.",
      },
      {
        id: "genai-m4",
        title: "Embeddings, Vector Search & RAG Foundations",
        durationMin: 14,
        completed: false,
        conceptNotes:
          "Retrieval-Augmented Generation (RAG) converts course notes into vector embeddings to ground AI answers in validated syllabus facts.",
        codeExample: `vector = await ai.models.embedContent({ content: course_notes })\n# Find closest lesson chunks using cosine similarity`,
        captions: [
          "[00:00] Grounding AI responses in custom course curriculum.",
          "[07:10] Cosine similarity search in vector databases.",
        ],
        offlineSummary:
          "RAG Basics:\n- Embeddings map text to semantic coordinates.\n- Search syllabus chunks before asking LLM.",
      },
      {
        id: "genai-m5",
        title: "AI Safety, Guardrails & Evaluation",
        durationMin: 10,
        completed: false,
        conceptNotes:
          "Implement validation checks and guardrails so the tutor remains constructive, secure, and adheres strictly to learning objectives.",
        codeExample: `def validate_ai_reply(text):\n    assert len(text) > 10, 'Response too short'\n    assert not contains_pii(text), 'PII detected'`,
        captions: [
          "[00:00] Building safe, production-ready AI learning assistants.",
          "[05:00] Guardrails against prompt injection and toxic output.",
        ],
        offlineSummary:
          "AI Safety Summary:\n- Validate input and sanitize output.\n- Maintain user privacy and safety.",
      },
    ],
  },
];

export const INITIAL_TOPIC_MASTERY: TopicMastery[] = [
  {
    id: "topic-variables",
    courseId: "python-101",
    name: "Variables",
    nameUr: "ویری ایبلز (Variables)",
    nameRomanUr: "Variables",
    mastery: 0,
    retention_health: "Needs Review",
    lastPracticedDaysAgo: 0,
    summary: "Assignment, naming rules, and dynamic types.",
  },
  {
    id: "topic-datatypes",
    courseId: "python-101",
    name: "Data Types",
    nameUr: "ڈیٹا ٹائپس (Data Types)",
    nameRomanUr: "Data Types",
    mastery: 0,
    retention_health: "Needs Review",
    lastPracticedDaysAgo: 0,
    summary: "Integers, floats, strings, and safe type conversion.",
  },
  {
    id: "topic-loops",
    courseId: "python-101",
    name: "Loops",
    nameUr: "لوپس (Loops)",
    nameRomanUr: "Loops",
    mastery: 0,
    retention_health: "Needs Review",
    lastPracticedDaysAgo: 0,
    summary: "For loops, while loops, and range() boundary iteration.",
  },
  {
    id: "topic-functions",
    courseId: "python-101",
    name: "Functions",
    nameUr: "فنکشنز (Functions)",
    nameRomanUr: "Functions",
    mastery: 0,
    retention_health: "Needs Review",
    lastPracticedDaysAgo: 0,
    summary: "Function definition, parameters, and explicit return values.",
  },
  {
    id: "topic-dom",
    courseId: "web-dev-101",
    name: "DOM & Events",
    nameUr: "DOM اور ایونٹس",
    nameRomanUr: "DOM & Events",
    mastery: 0,
    retention_health: "Needs Review",
    lastPracticedDaysAgo: 0,
    summary: "DOM tree, selectors, event listeners, and UI updates.",
  },
  {
    id: "topic-css",
    courseId: "web-dev-101",
    name: "CSS Flexbox & Layout",
    nameUr: "سی ایس ایس فلیکس باکس",
    nameRomanUr: "CSS Flexbox & Layout",
    mastery: 0,
    retention_health: "Needs Review",
    lastPracticedDaysAgo: 0,
    summary: "Flexbox axes, alignment, and responsive container layout.",
  },
  {
    id: "topic-pandas",
    courseId: "data-science-101",
    name: "Pandas DataFrames",
    nameUr: "پانڈاس ڈیٹا فریم",
    nameRomanUr: "Pandas DataFrames",
    mastery: 0,
    retention_health: "Needs Review",
    lastPracticedDaysAgo: 0,
    summary: "2D tabular operations, column averages, and EDA.",
  },
  {
    id: "topic-sql",
    courseId: "sql-101",
    name: "SQL Queries & Joins",
    nameUr: "ایس کیو ایل اور ٹیبل جوائنز",
    nameRomanUr: "SQL Queries & Joins",
    mastery: 0,
    retention_health: "Needs Review",
    lastPracticedDaysAgo: 0,
    summary: "SELECT, WHERE filtering, INNER JOIN, and GROUP BY.",
  },
  {
    id: "topic-genai",
    courseId: "genai-101",
    name: "Prompt Engineering & LLMs",
    nameUr: "پرامپٹ انجینئرنگ اور اے آئی",
    nameRomanUr: "Prompt Engineering & LLMs",
    mastery: 0,
    retention_health: "Needs Review",
    lastPracticedDaysAgo: 0,
    summary: "System prompts, zero/few-shot framing, and model parameters.",
  },
];

export const QUIZ_BANK: QuizQuestion[] = [
  {
    id: "q-datatypes-add",
    courseId: "python-101",
    topicId: "topic-datatypes",
    topicName: "Data Types",
    difficulty: "Easy",
    question: "What will this Python statement print to the console?",
    questionUr: "یہ پائتھون کوڈ کنسول پر کیا پرنٹ کرے گا؟",
    questionRomanUr: "Yeh Python code console par kya print karega?",
    codeSnippet: "print(5 + 3)",
    options: ["8", "53", "5 + 3", "TypeError"],
    correctAnswer: "8",
    allowFreeInput: true,
    defaultMisconceptionInput: "53",
    conceptHint: "Look carefully: are 5 and 3 integers or quoted strings?",
    approved_by_educator: true,
  },
  {
    id: "q-datatypes-hard",
    courseId: "python-101",
    topicId: "topic-datatypes",
    topicName: "Data Types",
    difficulty: "Hard",
    question:
      "With Data Types at 80%+, solve this challenge: what does print(int('5') + len('abc')) output?",
    questionUr:
      "80%+ مہارت کے ساتھ یہ چیلنج حل کریں: print(int('5') + len('abc')) کیا پرنٹ کرے گا؟",
    questionRomanUr:
      "80%+ mastery ke saath yeh challenge solve karein: print(int('5') + len('abc')) kya output dega?",
    codeSnippet: "print(int('5') + len('abc'))",
    options: ["8", "53", "5abc", "TypeError"],
    correctAnswer: "8",
    allowFreeInput: true,
    conceptHint: "int('5') converts string '5' to integer 5; len('abc') returns 3.",
    approved_by_educator: true,
  },
  {
    id: "q-loops-easy",
    courseId: "python-101",
    topicId: "topic-loops",
    topicName: "Loops",
    difficulty: "Easy",
    question:
      "How many times does the print statement run in this scaffolded loop?",
    questionUr: "اس لوپ میں print کتنی بار چلے گا؟",
    questionRomanUr: "Is loop mein print kitni baar chalega?",
    codeSnippet: `for i in range(3):\n    print("Step", i)`,
    options: [
      "3 times (0, 1, 2)",
      "4 times (0, 1, 2, 3)",
      "2 times (1, 2)",
      "1 time",
    ],
    correctAnswer: "3 times (0, 1, 2)",
    conceptHint: "Python's range(3) starts at 0 and stops right before 3.",
    approved_by_educator: true,
  },
  {
    id: "q-functions-easy",
    courseId: "python-101",
    topicId: "topic-functions",
    topicName: "Functions",
    difficulty: "Easy",
    question: "What value is stored in total after calling add_bonus(10)?",
    questionUr:
      "add_bonus(10) کال کرنے کے بعد total میں کون سی ویلیو محفوظ ہوگی؟",
    questionRomanUr:
      "add_bonus(10) call karne ke baad total mein kya value store hogi?",
    codeSnippet: `def add_bonus(points):\n    return points + 5\n\ntotal = add_bonus(10)`,
    options: ["15", "10", "None", "points + 5"],
    correctAnswer: "15",
    allowFreeInput: true,
    conceptHint: "return sends the computed value back to the caller.",
    approved_by_educator: true,
  },
  {
    id: "q-functions-med",
    courseId: "python-101",
    topicId: "topic-functions",
    topicName: "Functions",
    difficulty: "Medium",
    question: "Why does result equal None in this snippet?",
    questionUr: "اس کوڈ میں result کی ویلیو None کیوں آتی ہے؟",
    questionRomanUr: "Is snippet mein result ki value None kyun aati hai?",
    codeSnippet: `def double(n):\n    print(n * 2)\n\nresult = double(4)`,
    options: [
      "The function prints instead of using return",
      "n * 2 is invalid syntax",
      "double(4) needs two arguments",
      "print() returns 8 only in Python 2",
    ],
    correctAnswer: "The function prints instead of using return",
    conceptHint: "Without an explicit return statement, Python functions return None.",
    approved_by_educator: true,
  },
  {
    id: "q-loops-med",
    courseId: "python-101",
    topicId: "topic-loops",
    topicName: "Loops",
    difficulty: "Medium",
    question: "What is the final value of total after the loop completes?",
    questionUr: "لوپ مکمل ہونے کے بعد total کی آخری ویلیو کیا ہوگی؟",
    questionRomanUr: "Loop mukammal hone ke baad total ki aakhri value kya hogi?",
    codeSnippet: `total = 0\nfor num in [2, 4, 6]:\n    total += num\nprint(total)`,
    options: ["12", "6", "246", "0"],
    correctAnswer: "12",
    allowFreeInput: true,
    conceptHint: "Trace total on each pass: 0+2 -> 2+4 -> 6+6.",
    approved_by_educator: true,
  },
  {
    id: "q-variables-hard",
    courseId: "python-101",
    topicId: "topic-variables",
    topicName: "Variables",
    difficulty: "Hard",
    question:
      "Since your Variables mastery is >=80%, solve this challenge: what does print(a, b) output?",
    questionUr:
      "چونکہ Variables میں آپ کی مہارت 80%+ ہے، یہ چیلنج حل کریں: print(a, b) کیا آؤٹ پٹ دے گا؟",
    questionRomanUr:
      "Variables mein aapki mastery 80%+ hai, yeh challenge solve karein: print(a, b) kya output dega?",
    codeSnippet: `a = [1, 2]\nb = a\nb.append(3)\nprint(a, b)`,
    options: [
      "[1, 2, 3] [1, 2, 3]",
      "[1, 2] [1, 2, 3]",
      "[1, 2] [3]",
      "Error: lists cannot be aliased",
    ],
    correctAnswer: "[1, 2, 3] [1, 2, 3]",
    conceptHint: "Both variables reference the exact same list object in memory.",
    approved_by_educator: true,
  },
  {
    id: "q-dom-med",
    courseId: "web-dev-101",
    topicId: "topic-dom",
    topicName: "DOM & Events",
    difficulty: "Medium",
    question:
      "Which DOM method attaches a click handler without overwriting existing listeners?",
    questionUr:
      "کون سا DOM میتھڈ پرانے لسنرز کو ہٹائے بغیر کلک ہینڈلر لگاتا ہے؟",
    questionRomanUr:
      "Kaunsa DOM method purane listeners ko hataye baghair click handler lagata hai?",
    codeSnippet: `const btn = document.querySelector("#start-btn");`,
    options: [
      "btn.addEventListener('click', handler)",
      "btn.onclick = handler",
      "btn.setAttribute('click', handler)",
      "btn.on('click', handler)",
    ],
    correctAnswer: "btn.addEventListener('click', handler)",
    conceptHint: "Assignment to .onclick replaces any prior handler.",
    approved_by_educator: true,
  },
  {
    id: "q-css-easy",
    courseId: "web-dev-101",
    topicId: "topic-css",
    topicName: "CSS Flexbox & Layout",
    difficulty: "Easy",
    question: "Which CSS property aligns items along the main axis in a flex container?",
    questionUr: "فلیکس کنٹینر میں آئٹمز کو مین ایکسز کے ساتھ الائن کرنے کے لیے کون سی پراپرٹی استعمال ہوتی ہے؟",
    questionRomanUr: "Flex container mein items ko main axis ke mutabiq align karne ke liye kaunsi property use hoti hai?",
    codeSnippet: `.row { display: flex; /* alignment */ }`,
    options: [
      "justify-content",
      "align-items",
      "flex-direction",
      "align-content",
    ],
    correctAnswer: "justify-content",
    conceptHint: "justify-content aligns along the main axis; align-items aligns along the cross axis.",
    approved_by_educator: true,
  },
  {
    id: "q-pandas-easy",
    courseId: "data-science-101",
    topicId: "topic-pandas",
    topicName: "Pandas DataFrames",
    difficulty: "Easy",
    question: "Which Pandas method returns the first 5 rows of a DataFrame?",
    questionUr: "ڈیٹا فریم کی پہلی 5 قطاریں دیکھنے کے لیے پانڈاس کا کون سا میتھڈ استعمال ہوتا ہے؟",
    questionRomanUr: "DataFrame ki pehli 5 rows dekhne ke liye Pandas ka kaunsa method use hota hai?",
    codeSnippet: `import pandas as pd\ndf = pd.read_csv('students.csv')`,
    options: ["df.head()", "df.top(5)", "df.first(5)", "df.preview()"],
    correctAnswer: "df.head()",
    conceptHint: "df.head() defaults to returning the first 5 rows of the DataFrame.",
    approved_by_educator: true,
  },
  {
    id: "q-sql-easy",
    courseId: "sql-101",
    topicId: "topic-sql",
    topicName: "SQL Queries & Joins",
    difficulty: "Easy",
    question: "Which SQL clause is used to filter rows based on a specific condition?",
    questionUr: "مخصوص شرط کی بنیاد پر قطاروں کو فلٹر کرنے کے لیے SQL کا کون سا کلاز استعمال ہوتا ہے؟",
    questionRomanUr: "Specific condition par rows filter karne ke liye SQL ka kaunsa clause use hota hai?",
    codeSnippet: `SELECT * FROM users /* filter condition */ score >= 80;`,
    options: ["WHERE", "HAVING", "FILTER", "ORDER BY"],
    correctAnswer: "WHERE",
    conceptHint: "WHERE filters individual rows before any grouping occurs.",
    approved_by_educator: true,
  },
  {
    id: "q-genai-easy",
    courseId: "genai-101",
    topicId: "topic-genai",
    topicName: "Prompt Engineering & LLMs",
    difficulty: "Easy",
    question: "What does setting temperature to 0.0 do in an LLM call?",
    questionUr: "اے آئی ماڈل میں ٹمپریچر کو 0.0 پر سیٹ کرنے سے کیا ہوتا ہے؟",
    questionRomanUr: "AI model mein temperature 0.0 set karne se kya hota hai?",
    codeSnippet: `response = ai.generate(prompt, temperature=0.0)`,
    options: [
      "Makes the output deterministic and consistent",
      "Makes the response completely random and creative",
      "Increases the speed by skipping safety filters",
      "Disables the context window",
    ],
    correctAnswer: "Makes the output deterministic and consistent",
    conceptHint: "Lower temperature values reduce randomness and pick the highest-probability tokens.",
    approved_by_educator: true,
  },
];

export const DIAGNOSTIC_QUESTIONS: QuizQuestion[] = [
  QUIZ_BANK[2], // Loops easy
  QUIZ_BANK[3], // Functions easy
  QUIZ_BANK[0], // Data types print(5+3)
];

export const WEEKLY_PROGRESS_CHART = [
  { day: "Mon", thisWeek: 58, lastWeek: 48, minutes: 15 },
  { day: "Tue", thisWeek: 62, lastWeek: 51, minutes: 20 },
  { day: "Wed", thisWeek: 65, lastWeek: 54, minutes: 10 },
  { day: "Thu", thisWeek: 67, lastWeek: 56, minutes: 15 },
  { day: "Fri", thisWeek: 70, lastWeek: 58, minutes: 20 },
  { day: "Sat", thisWeek: 73, lastWeek: 60, minutes: 30 },
  { day: "Sun", thisWeek: 76, lastWeek: 64, minutes: 15 },
];

export const INITIAL_ACTIVITY: ActivityItem[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n-1",
    title: "15-min Evening Slot Ready",
    detail:
      "Your adaptive plan prioritizes Loops (45%) and Functions (30%) tonight.",
    time: "12m ago",
    unread: true,
  },
  {
    id: "n-2",
    title: "Mastery Milestone: Variables 90%",
    detail: "Harder challenge questions unlocked for Python Variables.",
    time: "3h ago",
    unread: true,
  },
  {
    id: "n-3",
    title: "Zero-Penalty Flex Mode Active",
    detail:
      "Busy workday? Switch anytime between 10, 15, 20, or 30 min sessions.",
    time: "1d ago",
    unread: false,
  },
];

export const SIMULATED_COHORT_WEEKLY: CohortWeekPoint[] = [
  { week: "Week 1", mastery: 35, accuracy: 42, activeLearners: 21, retentionScore: 38 },
  { week: "Week 2", mastery: 49, accuracy: 56, activeLearners: 23, retentionScore: 52 },
  { week: "Week 3", mastery: 62, accuracy: 68, activeLearners: 24, retentionScore: 64 },
  { week: "Week 4", mastery: 72, accuracy: 76, activeLearners: 25, retentionScore: 71 },
];

export const SIMULATED_COHORT_HEATMAP: CohortTopicHeatmapRow[] = [
  { topic: "Variables", week1: 54, week2: 71, week3: 83, week4: 91, retentionCheck: 88 },
  { topic: "Data Types", week1: 44, week2: 60, week3: 74, week4: 82, retentionCheck: 79 },
  { topic: "Loops", week1: 24, week2: 38, week3: 52, week4: 65, retentionCheck: 62 },
  { topic: "Functions", week1: 18, week2: 29, week3: 41, week4: 54, retentionCheck: 51 },
];

// Full 30 simulated adult learners across 3 courses over 4 weeks
const NAMES_30 = [
  "Fahad Ali", "Ayesha Tariq", "Bilal Ahmed", "Zainab Malik", "Usman Raza",
  "Hira Siddiqui", "Hamza Sheikh", "Mariam Qureshi", "Saad Farooq", "Nida Javed",
  "Omar Farooq", "Sanaullah Khan", "Fatima Noor", "Kamran Iqbal", "Anum Zahra",
  "Taimoor Hasan", "Mehwish Nawaz", "Danish Butt", "Rabia Mansoor", "Salman Haider",
  "Kiran Aslam", "Waqas Mahmood", "Sadia Akram", "Junaid Nasir", "Iqra Yousuf",
  "Zeeshan Altaf", "Maham Sohail", "Asad Ullah", "Hina Pervez", "Naveed Akhtar",
];
const SCHEDULES = ["Evening Shift", "Commute 15m", "Weekend Flex", "Night Owl 10m"];
const COURSES_3 = ["Python Programming", "Data Science Basics", "Web Development"];

export const SIMULATED_30_LEARNERS: SimulatedCohortLearner[] = NAMES_30.map(
  (name, i) => ({
    id: `cohort-l-${i + 1}`,
    name,
    scheduleType: SCHEDULES[i % SCHEDULES.length],
    course: COURSES_3[i % COURSES_3.length],
    week1Mastery: 28 + ((i * 3) % 15),
    week4Mastery: 64 + ((i * 5) % 21),
    quizAccuracy: 68 + ((i * 4) % 20),
    delayedRetention: 63 + ((i * 3) % 19),
    activeThisWeek: i < 25,
  })
);

export const INITIAL_EDUCATOR_DRAFTS: EducatorDraftItem[] = [
  {
    id: "draft-1",
    courseTitle: "Python Programming",
    topicName: "Loops",
    question:
      "Which keyword exits a Python for-loop immediately when a target item is found?",
    codeSnippet: `for item in tasks:\n    if item == "urgent":\n        # stop here`,
    options: ["break", "continue", "pass", "return"],
    correctAnswer: "break",
    difficulty: "Easy",
    explanation:
      "break terminates the nearest enclosing loop immediately, whereas continue skips only the current iteration.",
    status: "Pending Review",
    createdAt: "Today, 09:40 AM",
  },
  {
    id: "draft-2",
    courseTitle: "Python Programming",
    topicName: "Loops",
    question:
      "What does range(2, 10, 3) generate when converted to a list?",
    codeSnippet: "list(range(2, 10, 3))",
    options: ["[2, 5, 8]", "[2, 5, 8, 11]", "[3, 6, 9]", "[2, 4, 6, 8]"],
    correctAnswer: "[2, 5, 8]",
    difficulty: "Medium",
    explanation:
      "Starting at 2 and stepping by 3 gives 2, 5, 8. The next value (11) exceeds the stop boundary 10.",
    status: "Pending Review",
    createdAt: "Today, 09:40 AM",
  },
  {
    id: "draft-3",
    courseTitle: "Python Programming",
    topicName: "Functions",
    question:
      "Why should default mutable arguments like def add_item(lst=[]): be avoided in Python?",
    codeSnippet: `def add_item(val, lst=[]):\n    lst.append(val)\n    return lst`,
    options: [
      "The default list is created once and shared across function calls",
      "Python forbids lists inside function signatures",
      "append() creates a syntax error inside functions",
      "It always returns None",
    ],
    correctAnswer:
      "The default list is created once and shared across function calls",
    difficulty: "Hard",
    explanation:
      "Default parameter objects are evaluated once at function definition time. Use lst=None and initialize inside the function.",
    status: "Approved",
    createdAt: "Yesterday",
  },
];

export const ADMIN_LANGUAGE_USAGE = [
  { name: "English", learners: 412, share: 54 },
  { name: "Roman Urdu", learners: 229, share: 30 },
  { name: "Urdu (اردو)", learners: 122, share: 16 },
];

export const ADMIN_RECOVERY_LOGS: RecoveryLogEntry[] = [
  {
    id: "log-1",
    timestamp: "10:14 AM",
    event: "5-Day Inactivity Recovery Triggered",
    component: "Adaptive Recovery Engine",
    severity: "Resolved",
    detail:
      "Preserved 68% mastery; issued 3-question diagnostic + 10-min catch-up plan.",
  },
  {
    id: "log-2",
    timestamp: "09:52 AM",
    event: "AI Offline Rule-Based Fallback Verified",
    component: "Conceptual Feedback Router",
    severity: "Fallback Active",
    detail:
      "Switched seamlessly to deterministic Python AST/pattern explainer during simulated offline test.",
  },
  {
    id: "log-3",
    timestamp: "09:05 AM",
    event: "Educator Human-in-the-Loop Gate",
    component: "Content Approval Queue",
    severity: "Info",
    detail:
      "2 AI-generated Loops drafts held in Pending Review prior to learner release.",
  },
  {
    id: "log-4",
    timestamp: "Yesterday",
    event: "Urdu RTL Layout & Web Speech Sync",
    component: "Accessibility Controller",
    severity: "Resolved",
    detail:
      "Dynamic RTL switch and ur-PK voice synthesis verified without state reset.",
  },
];

export function buildMicroSession(
  totalMinutes: number,
  topics: TopicMastery[],
  isRecoveryMode = false
): MicroSessionStep[] {
  const sortedWeak = [...topics].sort((a, b) => a.mastery - b.mastery);
  const weakest = sortedWeak[0]?.name || "Functions";
  const secondWeak = sortedWeak[1]?.name || "Loops";

  if (totalMinutes === 10) {
    return [
      {
        id: "step-1",
        title: isRecoveryMode
          ? `Gentle Warmup: ${secondWeak}`
          : `Quick Revision: ${secondWeak}`,
        type: "revision",
        minutes: 2,
        topicName: secondWeak,
        description: "Zero-pressure recall card of key syntax & patterns.",
      },
      {
        id: "step-2",
        title: "Adaptive Practice Quiz",
        type: "quiz",
        minutes: 4,
        topicName: weakest,
        description: "2 scaffolded questions targeting your highest-leverage gap.",
      },
      {
        id: "step-3",
        title: "AI Conceptual Explanation",
        type: "explanation",
        minutes: 2,
        topicName: weakest,
        description: "Instant mental-model breakdown of any tricky step.",
      },
      {
        id: "step-4",
        title: "Guided Mini-Exercise",
        type: "guided",
        minutes: 2,
        topicName: secondWeak,
        description: "One confidence-building code trace to lock in retention.",
      },
    ];
  }

  if (totalMinutes === 15) {
    return [
      {
        id: "step-1",
        title: `Quick Revision: ${secondWeak}`,
        type: "revision",
        minutes: 3,
        topicName: secondWeak,
        description: "Review range() boundaries and loop iteration patterns.",
      },
      {
        id: "step-2",
        title: "Practice Quiz",
        type: "quiz",
        minutes: 5,
        topicName: weakest,
        description: "3 adaptive questions weighted toward Loops & Functions.",
      },
      {
        id: "step-3",
        title: "AI Explanation",
        type: "explanation",
        minutes: 4,
        topicName: weakest,
        description: "Deep dive on return vs print and type coercion.",
      },
      {
        id: "step-4",
        title: "Guided Practice",
        type: "guided",
        minutes: 3,
        topicName: secondWeak,
        description: "Apply the concept on a practical real-world snippet.",
      },
    ];
  }

  if (totalMinutes === 20) {
    return [
      {
        id: "step-1",
        title: `Quick Revision: ${secondWeak} & ${weakest}`,
        type: "revision",
        minutes: 4,
        topicName: secondWeak,
        description: "Spaced repetition flash summary of core rules.",
      },
      {
        id: "step-2",
        title: "Adaptive Practice Quiz",
        type: "quiz",
        minutes: 7,
        topicName: weakest,
        description: "4 adaptive questions scaling from Easy to Medium.",
      },
      {
        id: "step-3",
        title: "AI Explanation & Misconception Check",
        type: "explanation",
        minutes: 5,
        topicName: weakest,
        description: "Interactive conceptual comparison with follow-up prompt.",
      },
      {
        id: "step-4",
        title: "Guided Practice Challenge",
        type: "guided",
        minutes: 4,
        topicName: secondWeak,
        description: "Solve a realistic workplace automation loop.",
      },
    ];
  }

  return [
    {
      id: "step-1",
      title: `Concept Refresher: ${secondWeak}`,
      type: "revision",
      minutes: 6,
      topicName: secondWeak,
      description: "Annotated walkthrough of loop accumulators and control flow.",
    },
    {
      id: "step-2",
      title: "Extended Adaptive Quiz",
      type: "quiz",
      minutes: 10,
      topicName: weakest,
      description: "5 progressive questions adapting to live accuracy.",
    },
    {
      id: "step-3",
      title: "AI Deep-Dive Explanation",
      type: "explanation",
      minutes: 7,
      topicName: weakest,
      description:
        "Personalized conceptual feedback & Urdu/English mental model notes.",
    },
    {
      id: "step-4",
      title: "Guided Capstone Mini-Lab",
      type: "guided",
      minutes: 7,
      topicName: weakest,
      description: "Combine Loops + Functions in a clean 6-line script.",
    },
  ];
}

export function selectAdaptiveDifficultyForMastery(
  mastery: number
): "Easy" | "Medium" | "Hard" {
  if (mastery < 50) return "Easy";
  if (mastery < 80) return "Medium";
  return "Hard";
}

export function generateRuleBasedFeedback(params: {
  question: string;
  codeSnippet?: string;
  userAnswer: string;
  correctAnswer: string;
  topic: string;
  language: LanguageCode;
}): Omit<ConceptualFeedback, "id" | "timestamp" | "masteryDelta"> {
  const { question, codeSnippet, userAnswer, correctAnswer, topic, language } =
    params;
  const trimmedUser = userAnswer.trim();
  const isCorrect =
    trimmedUser.toLowerCase() === correctAnswer.trim().toLowerCase();

  const isAddMisconception =
    (codeSnippet?.includes("5 + 3") || question.includes("5 + 3")) &&
    trimmedUser === "53";

  if (isAddMisconception) {
    if (language === "ur") {
      return {
        topicName: topic,
        question,
        userAnswer,
        correctAnswer,
        isCorrect: false,
        source: "rule-based",
        whyOutcome:
          "آپ کا جواب 53 اس لیے آیا کہ آپ نے 5 اور 3 کو ٹیکسٹ (Strings) سمجھ کر آپس میں جوڑ دیا، جبکہ پائتھون میں بغیر کوٹس (' ') کے 5 اور 3 اعداد (Integers) ہیں۔",
        coreConcept:
          "پائتھون میں + کی علامت اعداد کو جمع کرتی ہے (5 + 3 = 8)، لیکن اگر کوٹس ہوں ('5' + '3') تو وہ ٹیکسٹ کو جوڑ کر '53' بناتی ہے۔",
        stepByStep:
          "1) Python نے دیکھا کہ 5 اور 3 بغیر quotes کے ہیں، اس لیے دونوں integers ہیں۔ 2) + نے عددی جمع کیا اور نتیجہ 8 پرنٹ ہوا۔",
        followUpQuestion: 'اب بتائیں: print("5" + "3") کیا پرنٹ کرے گا؟',
        followUpOptions: ['"53"', "8", "Error"],
        followUpAnswer: '"53"',
      };
    }
    if (language === "roman_ur") {
      return {
        topicName: topic,
        question,
        userAnswer,
        correctAnswer,
        isCorrect: false,
        source: "rule-based",
        whyOutcome:
          "Aapne 53 is liye likha kyunke aapne 5 aur 3 ko text (strings) samajh kar mila diya. Python mein quotes (' ') ke baghair 5 aur 3 numbers (integers) hain.",
        coreConcept:
          "Numbers par + arithmetic addition karta hai (5 + 3 = 8), jabke quoted strings par + concatenation karta hai ('5' + '3' = '53').",
        stepByStep:
          "1) Python 5 aur 3 ko integers pehchanta hai. 2) + dono ko jama karke 8 banata hai aur print(8) console par 8 dikhata hai.",
        followUpQuestion: 'Ab check karein: print("5" + "3") kya output dega?',
        followUpOptions: ['"53"', "8", "TypeError"],
        followUpAnswer: '"53"',
      };
    }
    return {
      topicName: topic,
      question,
      userAnswer,
      correctAnswer,
      isCorrect: false,
      source: "rule-based",
      whyOutcome:
        "You answered 53 because you treated 5 and 3 as text strings being glued together (concatenation) instead of numeric integers.",
      coreConcept:
        "In Python, unquoted numbers (5 and 3) are integers, so + performs arithmetic addition (8). Quotes ('5' + '3') are required for string concatenation ('53').",
      stepByStep:
        "1) Python evaluates 5 and 3 as int values. 2) The + operator adds 5 + 3 to produce 8, which print() displays.",
      followUpQuestion: 'Quick check: what does print("5" + "3") output?',
      followUpOptions: ['"53"', "8", "TypeError"],
      followUpAnswer: '"53"',
    };
  }

  if (isCorrect) {
    if (language === "ur") {
      return {
        topicName: topic,
        question,
        userAnswer,
        correctAnswer,
        isCorrect: true,
        source: "rule-based",
        whyOutcome: `شاباش! آپ کا جواب "${userAnswer}" بالکل درست ہے اور ${topic} کا بنیادی تصور واضح ہے۔`,
        coreConcept: `آپ نے ${topic} کے قواعد کو درست طریقے سے لاگو کیا، جس سے آپ کی مہارت میں اضافہ ہوا۔`,
        stepByStep:
          "1) کوڈ کے ہر حصے کو ترتیب وار پڑھا گیا۔ 2) متوقع آؤٹ پٹ درست طور پر نکالا گیا۔",
        followUpQuestion:
          "اگلا قدم: جب آپ کسی کوڈ کو دوبارہ استعمال کرنا چاہیں تو کون سا keyword ویلیو واپس بھیجتا ہے؟",
        followUpOptions: ["return", "print", "break"],
        followUpAnswer: "return",
      };
    }
    if (language === "roman_ur") {
      return {
        topicName: topic,
        question,
        userAnswer,
        correctAnswer,
        isCorrect: true,
        source: "rule-based",
        whyOutcome: `Shabash! Aapka jawab "${userAnswer}" bilkul sahi hai aur ${topic} par aapki samajh mazboot ho rahi hai.`,
        coreConcept: `Aapne ${topic} ka rule sahi trace kiya, is liye aapki topic mastery barh gayi hai.`,
        stepByStep:
          "1) Input aur data types sahi pehchane gaye. 2) Execution order ke mutabiq exact output nikala gaya.",
        followUpQuestion:
          "Agla check: function se value wapas bhejne ke liye kya use hota hai?",
        followUpOptions: ["return", "print", "stop"],
        followUpAnswer: "return",
      };
    }
    return {
      topicName: topic,
      question,
      userAnswer,
      correctAnswer,
      isCorrect: true,
      source: "rule-based",
      whyOutcome: `Spot on! "${userAnswer}" is correct — your mental model for ${topic} is locked in.`,
      coreConcept: `You accurately traced how Python evaluates ${topic} without falling for common syntax traps.`,
      stepByStep:
        "1) Identified the exact data/control flow rule. 2) Evaluated the expression cleanly to match runtime output.",
      followUpQuestion:
        "Quick retention check: if you need to reuse a computed result outside a function, what should you use?",
      followUpOptions: ["return", "print", "break"],
      followUpAnswer: "return",
    };
  }

  if (language === "ur") {
    return {
      topicName: topic,
      question,
      userAnswer,
      correctAnswer,
      isCorrect: false,
      source: "rule-based",
      whyOutcome: `آپ کا جواب "${userAnswer}" درست جواب "${correctAnswer}" سے مختلف ہے۔ ${topic} میں ترتیب اور اقسام پر توجہ دیں۔`,
      coreConcept: `${topic} کو سمجھنے کے لیے ہر لائن کو اس کے اصل ڈیٹا ٹائپ اور رینج کے ساتھ مرحلہ وار ٹریس کریں۔`,
      stepByStep: `1) ان پٹ یا شروعاتی ویلیو چیک کریں۔ 2) درست منطق کے مطابق نتیجہ "${correctAnswer}" بنتا ہے۔`,
      followUpQuestion: `کیا آپ "${correctAnswer}" کے اصول کو ایک اور مختصر مثال میں آزمانا چاہیں گے؟`,
      followUpOptions: [correctAnswer, userAnswer || "None", "SyntaxError"],
      followUpAnswer: correctAnswer,
    };
  }

  if (language === "roman_ur") {
    return {
      topicName: topic,
      question,
      userAnswer,
      correctAnswer,
      isCorrect: false,
      source: "rule-based",
      whyOutcome: `Aapka jawab "${userAnswer}" sahi jawab "${correctAnswer}" se mukhtalif hai. ${topic} mein execution order aur type check karein.`,
      coreConcept: `${topic} mein har step ko line-by-line trace karne se aisi ghaltiyan foran pakri jaati hain.`,
      stepByStep: `1) Shuruati values aur boundaries dekhein. 2) Step-by-step chalane par sahi nateeja "${correctAnswer}" aata hai.`,
      followUpQuestion: `Confirm karein ke is snippet ka sahi output kya hai:`,
      followUpOptions: [correctAnswer, userAnswer || "None", "SyntaxError"],
      followUpAnswer: correctAnswer,
    };
  }

  return {
    topicName: topic,
    question,
    userAnswer,
    correctAnswer,
    isCorrect: false,
    source: "rule-based",
    whyOutcome: `You selected "${userAnswer}", whereas Python evaluates this to "${correctAnswer}". This usually happens when boundary conditions or return behavior are overlooked.`,
    coreConcept: `In ${topic}, trace each line's exact state and data type rather than guessing the surface pattern.`,
    stepByStep: `1) Check the starting value or range boundary. 2) Walk through each execution step to reach "${correctAnswer}".`,
    followUpQuestion: `Verify your updated mental model — which output is accurate for this ${topic} pattern?`,
    followUpOptions: [correctAnswer, userAnswer || "None", "SyntaxError"],
    followUpAnswer: correctAnswer,
  };
}

export function generateRuleBasedTutorReply(
  userMessage: string,
  language: LanguageCode,
  topics: TopicMastery[],
  learnerName?: string
): string {
  const lower = userMessage.toLowerCase().trim();
  const name = learnerName ? learnerName.split(" ")[0] : "Learner";
  const weakest = [...topics].sort((a, b) => a.mastery - b.mastery)[0];
  const weakestName = weakest?.name || "Python Basics";
  const weakestNameUr = weakest?.nameUr || "پائتھون کی بنیادیں";

  // 1. Greetings & General Help
  if (
    lower === "hi" ||
    lower === "hello" ||
    lower === "hey" ||
    lower.includes("salam") ||
    lower.includes("kaise ho") ||
    lower.includes("help") ||
    lower.includes("madad")
  ) {
    if (language === "ur") {
      return `السلام علیکم ${name}! میں آپ کا SkillLoop اسٹڈی اسسٹنٹ ہوں۔ میں پروگرامنگ، پائتھون کے کانسیپٹس، ویری ایبلز، لوپس، فنکشنز، یا ویب ڈویلپمنٹ سمجھانے کے لیے حاضر ہوں۔ آپ مجھ سے کسی بھی موضوع کے بارے میں پوچھ سکتے ہیں!`;
    }
    if (language === "roman_ur") {
      return `Salam ${name}! Main aapka SkillLoop study assistant hoon. Main Python, loops, variables, functions, ya kisi bhi programming concept ko asaan alfaz mein samjha sakta hoon. Aap mujhse koi bhi sawal pooch sakte hain!`;
    }
    return `Hello ${name}! I am your SkillLoop adaptive study assistant. I can help explain programming concepts, debug errors, break down Python loops, functions, variables, or guide your 15-minute study sessions. What topic would you like to explore today?`;
  }

  // 2. Loops & Range Iteration
  if (lower.includes("loop") || lower.includes("range") || lower.includes("while") || lower.includes("for loop")) {
    if (language === "ur") {
      return `**لوپس (Loops) کا بنیادی تصور:**\n\nلوپ کسی کام کو بار بار دہرانے کے لیے استعمال ہوتا ہے۔\n- پائتھون میں \`for i in range(1, 4):\` ایک ایک کر کے 1، 2، 3 پر چلتا ہے (آخری نمبر یعنی 4 شامل نہیں ہوتا)۔\n- **اشارہ:** اگر آپ کو \`range(5)\` ملے تو یہ 0 سے 4 تک 5 بار چلے گا۔\n\nکیا آپ کسی خاص لوپ کے مسئلے کو حل کرنا چاہتے ہیں؟`;
    }
    if (language === "roman_ur") {
      return `**Loops ka Basic Concept:**\n\nLoop kisi code ko bar bar chalane ke liye use hota hai.\n- Python mein \`for i in range(1, 4):\` 1, 2, 3 tak chalega (4 include nahi hoga).\n- **Key Rule:** \`range(start, stop)\` hamesha stop se pehle rukta hai.\n- \`range(5)\` ka matlab 0 se 4 tak total 5 iterations.\n\nAap kisi specific loop code ko trace karna chahte hain?`;
    }
    return `**Understanding Loops & \`range()\` in Python:**\n\nA loop repeats a block of code efficiently.\n- \`range(start, stop, step)\` always stops *before* the \`stop\` integer.\n- \`for i in range(3):\` yields \`0, 1, 2\` (3 iterations).\n- **Accumulator Pattern:** Always initialize your counter or total variable *outside* the loop (e.g., \`total = 0\`) before adding to it inside.\n\nWould you like a quick 1-line puzzle to test your loop tracing?`;
  }

  // 3. Variables & Memory Binding
  if (lower.includes("variable") || lower.includes("memory") || lower.includes("assign") || lower.includes("binding")) {
    if (language === "ur") {
      return `**ویری ایبلز (Variables) کیا ہیں؟**\n\nپائتھون میں ویری ایبل میموری میں موجود کسی آبجیکٹ کا نام یا لیبل ہوتا ہے۔\n- مثال: \`score = 100\` میں \`score\` لیبل ہے جو نمبر 100 کی طرف اشارہ کر رہا ہے۔\n- پائتھون میں ویری ایبل کی قسم (Data Type) خود بخود طے ہو جاتی ہے، الگ سے بتانے کی ضرورت نہیں ہوتی۔`;
    }
    if (language === "roman_ur") {
      return `**Variables aur Memory Binding:**\n\nPython mein variable kisi box ki tarah nahi balki memory mein maujood object ka 'name tag' ya label hota hai.\n- Example: \`x = 10\` likhne se label \`x\` integer 10 par bind ho jata hai.\n- Variable names ke liye snake_case use karein (e.g. \`student_score = 95\`).`;
    }
    return `**Variables & Memory Binding in Python:**\n\nIn Python, variables act as labeled references pointing to objects in memory rather than fixed storage boxes.\n- \`x = [1, 2, 3]\` binds the name \`x\` to the list.\n- If you write \`y = x\`, both names point to the *exact same* list in memory (aliasing).\n- Always use descriptive snake_case names (e.g., \`study_minutes = 15\`).`;
  }

  // 4. Functions & Return vs Print
  if (lower.includes("function") || lower.includes("return") || lower.includes("def ") || lower.includes("parameter") || (lower.includes("print") && lower.includes("return"))) {
    const isComparePrintReturn = lower.includes("difference") || (lower.includes("print") && lower.includes("return"));

    if (isComparePrintReturn) {
      if (language === "ur") {
        return `**\`print()\` اور \`return\` میں بنیادی فرق:**\n\n- **\`print()\` کا کام:** یہ صرف اسکرین پر ٹیکسٹ دکھاتا ہے تاکہ انسان دیکھ سکے، لیکن وہ ویلیو میموری میں محفوظ نہیں ہوتی۔\n- **\`return\` کا کام:** یہ فنکشن سے ویلیو واپس بھیجتا ہے تاکہ اسے کسی ویری ایبل میں محفوظ کر کے آگے حساب کتاب میں استعمال کیا جا سکے۔\n\n\`\`\`python\n# 1. print() سے جواب ضائع ہو جاتا ہے:\ndef add_show(a, b):\n    print(a + b)\n\nx = add_show(2, 3)  # اسکرین پر 5 دکھے گا\nprint(x)              # None (ویلیو سیو نہیں ہوئی!)\n\n# 2. return سے ویلیو محفوظ رہتی ہے:\ndef add_calc(a, b):\n    return a + b\n\ny = add_calc(2, 3)\nprint(y * 2)          # 10 (ویلیو آگے استعمال ہو گئی!)\n\`\`\`\n\nاگر فنکشن میں \`return\` نہ لکھا جائے تو پائتھون خود بخود \`None\` واپس کرتا ہے۔`;
      }
      if (language === "roman_ur") {
        return `**\`print()\` vs \`return\` ka Farq:**\n\n- **\`print()\`: ** Sirf console/screen par output dikhata hai. Program ke liye value lost ho jati hai.\n- **\`return\`: ** Value ko wapas bhejta hai taake doosre variables use kar sakein.\n\n\`\`\`python\n# 1. print() sirf dikhata hai:\ndef add_show(a, b):\n    print(a + b)\n\nx = add_show(2, 3) # Console par 5 aayega\nprint(x)             # None! (Kuch save nahi hua)\n\n# 2. return value wapas deta hai:\ndef add_calc(a, b):\n    return a + b\n\ny = add_calc(2, 3)\nprint(y * 2)         # 10! (Value multiply ho gayi)\n\`\`\`\n\n**Rule:** Agar result aage use karna hai to hamesha \`return\` use karein!`;
      }
      return `**Difference Between \`print()\` and \`return\`:**\n\n- **\`print()\`:** Displays text on the terminal screen for human eyes. It does **not** give any value back to your program.\n- **\`return\`:** Hands the calculated result back to the caller so you can store it in a variable and reuse it.\n\n\`\`\`python\n# Example 1: print() loses the value\ndef add_show(a, b):\n    print(a + b)\n\nx = add_show(2, 3)  # Prints: 5 to screen\nprint(x)              # Prints: None (x has no saved data!)\n\n# Example 2: return saves the value for reuse\ndef add_calc(a, b):\n    return a + b\n\ny = add_calc(2, 3)\nprint(y * 2)          # Prints: 10 (Saved and multiplied!)\n\`\`\`\n\n**Golden Rule:** Think of \`print()\` as a television display, and \`return\` as handing money into your wallet.`;
    }

    if (language === "ur") {
      return `**فنکشنز (Functions) کا بنیادی تصور:**\n\nفنکشن ایک ایسا کوڈ بلاک ہے جسے بار بار استعمال کیا جا سکتا ہے (\`def my_func():\`)۔\n\`\`\`python\ndef square(n):\n    return n * n\n\nresult = square(5)  # 25\n\`\`\`\n- **اہم نکتہ:** \`return\` وہ نتیجہ واپس بھیجتا ہے جسے آپ ویری ایبل میں محفوظ کر سکتے ہیں۔ اگر \`return\` نہ ہو تو فنکشن \`None\` دیتا ہے۔`;
    }
    if (language === "roman_ur") {
      return `**Functions ka Basic Concept:**\n\nFunction reusable code block hota hai jo \`def\` keyword se banta hai:\n\`\`\`python\ndef square(n):\n    return n * n\n\nresult = square(5)  # result mein 25 aayega\n\`\`\`\n- **Crucial Rule:** \`return\` statement value wapas caller ko deti hai. Bina return ke Python function \`None\` deta hai.`;
    }
    return `**Functions & Return Values:**\n\nFunctions bundle reusable code logic with inputs (parameters) and an output (\`return\`):\n\`\`\`python\ndef square(n):\n    return n * n\n\nresult = square(5)  # result holds 25\n\`\`\`\n- **Key Takeaway:** Use \`return\` whenever another part of your code needs to use the function's output. Without an explicit \`return\`, Python functions evaluate to \`None\`.`;
  }

  // 5. Data Types & Type Conversion / Casting
  if (lower.includes("data type") || lower.includes("datatype") || lower.includes("string") || lower.includes("int") || lower.includes("float") || lower.includes("str")) {
    if (language === "ur") {
      return `**ڈیٹا ٹائپس (Data Types):**\n\n- \`int\`: پورے نمبر (جیسے 5, 20)\n- \`float\`: اعشاریہ والے نمبر (جیسے 3.14)\n- \`str\`: ٹیکسٹ یا تحریر کوٹیشنز میں (جیسے "Python")\n- **دھیان رہے:** \`5 + 3\` کا جواب \`8\` ہوگا، جبکہ \`"5" + "3"\` کا جواب \`"53"\` (سٹرنگ کنکیٹینیشن) ہوگا۔`;
    }
    if (language === "roman_ur") {
      return `**Data Types & Type Conversion:**\n\n- **int:** Pure numbers (e.g. 10, -5)\n- **float:** Decimal numbers (e.g. 15.5)\n- **str:** Quotes ke andar text (e.g. "SkillLoop")\n- **Important:** \`5 + 3 = 8\` (addition), jabke \`"5" + "3" = "53"\` (concatenation). User input ko number banane ke liye \`int(input)\` use karein.`;
    }
    return `**Data Types & Arithmetic vs Strings:**\n\nPython distinguishes numbers from text strictly:\n- Numerical: \`int\` (e.g., 5) and \`float\` (e.g., 5.0).\n- Text: \`str\` (quoted text like \`"5"\`).\n- Adding numbers (\`5 + 3\`) yields \`8\` (arithmetic).\n- Adding strings (\`"5" + "3"\`) yields \`"53"\` (string concatenation).\n- Use \`int("5")\` or \`float("3.14")\` to parse text safely before doing math.`;
  }

  // 6. Conditionals (if, elif, else)
  if (lower.includes("if") || lower.includes("else") || lower.includes("elif") || lower.includes("conditional")) {
    if (language === "ur") {
      return `**شرائط (Conditionals):**\n\nپائتھون میں فیصلے کرنے کے لیے \`if\`, \`elif\`, اور \`else\` استعمال ہوتے ہیں۔\n\`\`\`python\nif score >= 90:\n    print("بہترین")\nelif score >= 50:\n    print("پاس")\nelse:\n    print("دوبارہ کوشش کریں")\n\`\`\`\nانڈینٹیشن (چار خالی جگہیں) دینا لازمی ہے!`;
    }
    if (language === "roman_ur") {
      return `**Conditionals (if-elif-else):**\n\nDecisions lene ke liye \`if\`, \`elif\`, \`else\` use hota hai:\n\`\`\`python\nif score >= 80:\n    print("Pass")\nelse:\n    print("Needs practice")\n\`\`\`\nHar condition ke baad colon (\`:\`) aur 4 spaces ki indentation zaroori hai.`;
    }
    return `**Conditional Logic (\`if\`, \`elif\`, \`else\`):**\n\nControl flow lets your code branch based on conditions:\n\`\`\`python\nif mastery >= 80:\n    status = "Proficient"\nelif mastery >= 50:\n    status = "Reviewing"\nelse:\n    status = "Needs Practice"\n\`\`\`\nAlways remember the colon \`:\` after each test, and indent the block by 4 spaces.`;
  }

  // 7. Lists, Dictionaries & Collections
  if (lower.includes("list") || lower.includes("dict") || lower.includes("dictionary") || lower.includes("array") || lower.includes("tuple")) {
    if (language === "ur") {
      return `**لسٹس اور ڈکشنریز (Lists & Dictionaries):**\n\n- **List:** ترتیب وار ڈیٹا کے لیے مربع بریکٹ \`items = ["Python", "JS", "HTML"]\`۔ انڈیکس صفر سے شروع ہوتا ہے (\`items[0]\` پہلا آئٹم ہے)۔\n- **Dictionary:** کلید اور قیمت (Key-Value) کے لیے \`user = {"name": "${name}", "score": 90}\`۔`;
    }
    if (language === "roman_ur") {
      return `**Lists aur Dictionaries:**\n\n- **List:** Ordered collection \`courses = ["Python", "WebDev", "DataScience"]\` (0-indexed: \`courses[0]\` pehla course hai).\n- **Dictionary:** Key-value pairs \`learner = {"name": "${name}", "streak": 1}\`.\n- Nayi item add karne ke liye \`courses.append("AI")\` use hota hai.`;
    }
    return `**Lists & Dictionaries in Python:**\n\n- **Lists (\`[]\`):** Ordered, mutable collections. Python is 0-indexed: \`items[0]\` accesses the first element. Use \`.append(x)\` to add items to the end.\n- **Dictionaries (\`{}\`):** Key-value lookups. Access values via \`data["key"]\`. Great for structured records like learner profiles.`;
  }

  // 8. Web Development / DOM / HTML / CSS / JS
  if (lower.includes("html") || lower.includes("css") || lower.includes("dom") || lower.includes("web") || lower.includes("javascript") || lower.includes("js")) {
    if (language === "ur") {
      return `**ویب ڈویلپمنٹ (Web Development):**\n\n- **HTML:** صفحے کا ڈھانچہ بناتا ہے (مثلاً \`<button>\`, \`<main>\`)۔\n- **CSS:** ڈیزائن اور رنگ و روپ سنبھالتا ہے۔\n- **JavaScript & DOM:** صفحے کو متحرک بناتا ہے۔ \`addEventListener("click", ...)\` کے ذریعے یوزر کے کلک پر ردعمل ظاہر کیا جاتا ہے۔`;
    }
    if (language === "roman_ur") {
      return `**Web Development & DOM:**\n\n- **HTML:** Webpage ka structure (tags like \`<header>\`, \`<button>\`).\n- **CSS:** Styling aur responsive layout.\n- **DOM Events:** JavaScript se button click par reaction: \`button.addEventListener("click", () => { ... })\`. Page refresh ke baghair state update hoti hai.`;
    }
    return `**Web Development & DOM Manipulation:**\n\n- **Semantic HTML:** Use landmarks like \`<main>\`, \`<nav>\`, and accessible \`<button>\` tags for screen-reader compatibility.\n- **CSS:** Flexbox and Grid deliver clean responsive layouts without hardcoded pixels.\n- **DOM Events:** \`element.addEventListener("click", handler)\` updates the user interface dynamically without full-page reloads.`;
  }

  // 9. Data Science / Pandas
  if (lower.includes("data science") || lower.includes("pandas") || lower.includes("dataframe") || lower.includes("dataset") || lower.includes("machine learning")) {
    if (language === "ur") {
      return `**ڈیٹا سائنس اور پانڈاس (Pandas):**\n\n- پانڈاس ڈیٹا فریم (DataFrame) ایک سپرڈشیٹ یا ایکسل ٹیبل کی طرح ہوتا ہے جس میں قطاریں اور کالم ہوتے ہیں۔\n- \`df.head()\` شروع کی 5 قطاریں دکھاتا ہے اور \`df["column"].mean()\` اوسط نکالتا ہے۔\n- ٹرین اور ٹیسٹ اسپلٹ (80/20) اس بات کو یقینی بناتا ہے کہ ماڈل صرف یاد نہ کرے بلکہ نئی معلومات پر بھی صحیح کام کرے۔`;
    }
    if (language === "roman_ur") {
      return `**Data Science & Pandas DataFrames:**\n\n- **DataFrame:** Programmable spreadsheet ki tarah 2D table hota hai.\n- **Common Methods:** \`df.head()\` pehli 5 rows dikhata hai, \`df.describe()\` statistical summary deta hai.\n- **Train/Test Split:** 80% data training ke liye aur 20% unseen test evaluation ke liye rakha jata hai taake overfitting na ho.`;
    }
    return `**Data Science & Pandas DataFrames:**\n\n- **DataFrames:** 2D labeled tabular data structures in Pandas (like an automated spreadsheet in code).\n- Use \`df.head()\` to preview top records, and \`df["score"].mean()\` to compute statistics.\n- **Generalization:** An 80/20 train/test split verifies whether machine learning models generalize to unseen data rather than memorizing training noise.`;
  }

  // 10. Errors, Debugging & Syntax
  if (lower.includes("error") || lower.includes("bug") || lower.includes("indent") || lower.includes("syntax") || lower.includes("problem")) {
    if (language === "ur") {
      return `**عام پائتھون غلطیاں اور ان کا حل:**\n\n1. **IndentationError:** اگر کوڈ کی اسپیسنگ برابر نہ ہو (ہمیشہ 4 اسپیس استعمال کریں)۔\n2. **NameError:** اگر ویری ایبل کو پہلے ڈیفائن نہ کیا گیا ہو۔\n3. **TypeError:** جب مختلف اقسام کو غلط ملایا جائے، جیسے \`"5" + 3\`۔\n\nاپنا کوڈ یا ایرر میسج یہاں پیسٹ کریں، میں فوراً نشاندہی کر دوں گا!`;
    }
    if (language === "roman_ur") {
      return `**Common Python Errors & Debugging:**\n\n1. **IndentationError:** Spaces ya tabs ka imbalance (hamesha 4 spaces rakhein).\n2. **NameError:** Variable define kiye baghair use karne par aata hai.\n3. **TypeError:** Numbers aur strings ko direct add karne par aata hai.\n\nAap apna error snippet yahan share karein, main step-by-step samjha doonga!`;
    }
    return `**Python Debugging & Common Errors:**\n\n1. **IndentationError:** Python requires consistent indentation (4 spaces per level) to define blocks.\n2. **NameError:** Occurs when referencing a variable or function before it has been defined or assigned.\n3. **TypeError:** Caused by illegal operations between mismatched types (e.g. \`"score: " + 100\` instead of \`f"score: {100}"\`).\n\nPaste your exact error message or code snippet here and I will walk you through the fix!`;
  }

  // 11. Personalized Contextual Fallback
  if (language === "ur") {
    return `${name}، آپ کے سوال پر غور کریں تو آپ کا موجودہ ہدف "${weakestNameUr}" ہے۔ پائتھون میں کسی بھی مسئلے کو چھوٹے چھوٹے حصوں میں تقسیم کریں۔ آپ مجھ سے ویری ایبلز، لوپس، فنکشنز، ایررز، یا روزانہ کے 15 منٹ اسٹڈی پلان کے متعلق تفصیل سے پوچھ سکتے ہیں!`;
  }
  if (language === "roman_ur") {
    return `${name}, aapka current focus topic "${weakestName}" hai. Coding seekhne ka behtareen tareeqa hai chote chote code snippets likhna aur execute karna. Aap mujhse loops, functions, variables, ya debugging ke bare mein mazeed poochein!`;
  }
  return `${name}, your current learning focus is **${weakestName}**. A great way to master it is breaking complex logic into 1-line mental checks. Feel free to ask me to explain any concept, write code examples, or trace through tricky Python syntax!`;
}

export function generateRuleBasedDrafts(
  notes: string,
  courseTitle: string,
  topicName: string
): {
  extractedConcepts: string[];
  drafts: Omit<EducatorDraftItem, "id" | "status" | "createdAt">[];
} {
  const sentences = notes
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12);

  const concepts =
    sentences
      .slice(0, 3)
      .map((s) => (s.length > 52 ? s.slice(0, 52) + "..." : s)) || [
      `Core ${topicName} syntax`,
      "Execution trace",
      "Edge cases",
    ];

  return {
    extractedConcepts:
      concepts.length > 0
        ? concepts
        : [`${topicName} fundamentals`, "Control flow", "Common pitfalls"],
    drafts: [
      {
        courseTitle,
        topicName,
        question: `Based on the ${topicName} notes, which statement best describes the primary rule?`,
        codeSnippet: `for idx in range(4):\n    print(idx)`,
        options: [
          "Executes cleanly for indices 0, 1, 2, 3",
          "Executes for indices 1, 2, 3, 4",
          "Runs infinitely without break",
          "Raises an index error",
        ],
        correctAnswer: "Executes cleanly for indices 0, 1, 2, 3",
        difficulty: "Easy",
        explanation:
          "Scaffolded check extracted from uploaded course notes for initial recall.",
      },
      {
        courseTitle,
        topicName,
        question: `How can you safely accumulate values across iterations in ${topicName}?`,
        codeSnippet: `total = 0\nfor x in [3, 5, 2]:\n    total += x`,
        options: [
          "Initialize total = 0 before the loop and update with +=",
          "Reset total = 0 inside the loop body",
          "Use print(x) instead of assignment",
          "Remove the colon after the loop header",
        ],
        correctAnswer:
          "Initialize total = 0 before the loop and update with +=",
        difficulty: "Medium",
        explanation:
          "Initializing outside the loop preserves accumulated state across passes.",
      },
      {
        courseTitle,
        topicName,
        question: `When refactoring repeated ${topicName} logic into a helper, what prevents silent None bugs?`,
        codeSnippet: `def sum_items(items):\n    total = sum(items)\n    return total`,
        options: [
          "Explicitly returning the computed value with return",
          "Using global variables for every counter",
          "Printing inside the loop without returning",
          "Omitting parameters",
        ],
        correctAnswer: "Explicitly returning the computed value with return",
        difficulty: "Hard",
        explanation:
          "Explicit returns ensure downstream functions receive structured values rather than None.",
      },
    ],
  };
}
