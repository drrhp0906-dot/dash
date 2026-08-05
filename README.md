# MedRev Dashboard 🩺

> A comprehensive, gamified study hub for **Second MBBS** students preparing for **Pathology, Microbiology, and Pharmacology** university exams. Built as a single, dependency-free `index.html` — no build step, no server, no database. Just open and study.

---

## 📌 Project Description

MedRev Dashboard transforms a flat 423-question exam bank (sourced from five medical colleges — CUSMC, MORMED, MPSMC, PDUMC, SMCGH) plus the university's CBME syllabus circular into a fully interactive, gamified revision environment that runs entirely in the browser. The student can:

- Search across all 423 questions in real time
- Track the next exam with a live ticking countdown
- Tick off syllabus topics as "quests" completed
- Tag every question as **To-Do → In Progress → Revised**
- Read full, viva-ready answers (with Mermaid flowcharts and clinical pearls) for the first batch of questions
- Print or Save-as-PDF any answer card for offline revision

Everything persists in `localStorage` — your progress survives page reloads, browser restarts, and even laptop reboots, with zero backend infrastructure.

---

## ✨ Features

| Feature | Description |
|---|---|
| ⏰ **Exam Countdown Timer** | Live Days / Hours / Minutes / Seconds to the next exam. Detects exam-in-progress windows (9:30 AM → 12:30 PM) and displays the right status automatically. |
| 📚 **423-Question Bank** | Nested accordion sidebar: **Subject → Paper → Marks Section → Question**. Each question card shows marks weight, status pill, and one-click access to the answer. |
| 🔍 **Global Search** | Real-time fuzzy search across question text, subject, paper, section, and answer body. Hit-count badge updates live. |
| 📜 **Syllabus Quest Tracker** | Parsed from the official university CBME syllabus circular. Topics grouped by subject + paper, presented as a quest checklist with an overall completion progress bar. |
| 📊 **Stats & Revision Dashboard** | Default landing view: overall revision %, subject-wise breakdown (Pathology / Microbiology / Pharmacology), syllabus-quest coverage, and an "Upcoming Exam Focus" banner pointing to the next exam's subject. |
| 🏷️ **Per-Question Status Toggle** | Three-state pill on every question (To-Do / In Progress / Revised). Status pills reflect in both the question card and the sidebar tree dots. |
| 🌗 **Dark Mode** | Class-based dark theme, persisted across reloads. Respects system preference on first visit. Mermaid diagrams re-render with the appropriate theme. |
| 💾 **LocalStorage Persistence** | Question statuses, syllabus-quest checkmarks, theme, and last-viewed tab — all saved locally. No login, no sync, no telemetry. |
| 🖨️ **Print / Save-as-PDF** | One-click printing of any answer card. Print CSS hides chrome (sidebar, header) so only the medical content is on the page. |
| 🧬 **Mermaid Diagrams** | SmartArts & flowcharts embedded directly inside answers using Mermaid.js (loaded via CDN). |
| 📱 **Responsive Design** | Mobile-first layout — collapsible drawer sidebar on small screens, sticky header with mobile countdown row. |

---

## 🛠️ Tech Stack

- **HTML5** — semantic structure
- **Tailwind CSS** (via CDN) — utility-first styling, custom brand palette, class-based dark mode
- **Mermaid.js v10** (via CDN) — diagramming inside answers
- **Vanilla JavaScript** (ES2020+) — no framework, no virtual DOM
- **localStorage** — sole persistence layer
- **Google Fonts** (Inter, JetBrains Mono) — typography

> Zero build step. Zero `npm install`. Zero backend. Just open `index.html`.

---

## 📁 Repository Structure

```
medrev-dashboard/
├── index.html              ← the entire dashboard (single-file app)
├── README.md               ← you are here
├── CONTRIBUTING.md         ← how to add answers, improve UI, extend the bank
├── LICENSE.md              ← MIT License
├── CODE_OF_CONDUCT.md      ← Contributor Covenant 2.1
└── .gitignore              ← standard web-project ignores
```

---

## 🚀 How to Run

### Option A — Just open it

1. Download or clone this repository.
2. Double-click `index.html`.
3. Done. Study.

### Option B — Serve locally (recommended for development)

If you plan to contribute answers or tweak the UI, run a tiny local server so the browser doesn't complain about `file://` URLs:

```bash
# Python 3 (already installed on most systems)
python3 -m http.server 8000

# Or with Node.js
npx serve .
```

Then visit `http://localhost:8000` in your browser.

### Option C — Host it statically

Drop the folder onto any static host — GitHub Pages, Netlify, Vercel, Cloudflare Pages, or even a USB stick. There are no server requirements.

---

## 📊 Data Architecture

The dashboard embeds two JavaScript data structures at the top of the `<script>` block in `index.html`:

### `medicalQuestionsData` (423 questions)

```javascript
const medicalQuestionsData = [
  {
    subject: "Pathology",
    papers: [
      {
        paper: "Paper-1",
        category: "Theory",
        sections: [
          {
            section: "15 Markers (Long Essays / LAQs)",
            questions: [
              {
                id: "q0_0_0_0",
                subject: "Pathology",
                paper: "Paper-1",
                section: "15 Markers (Long Essays / LAQs)",
                marks: 15,
                question: "Define neoplasia. Write contrasting features…",
                answer: "<h3>Definition</h3><p>…</p>…"
              },
              // …
            ]
          }
        ]
      }
    ]
  },
  // Microbiology, Pharmacology
];
```

### `syllabusQuestData` (parsed from university circular)

```javascript
const syllabusQuestData = [
  {
    subject: "Pathology",
    papers: [
      {
        paper: "Paper-1",
        topics: [
          "General Pathology — Cell Injury, Inflammation & Repair",
          "Clinical Pathology — Laboratory Methods in Haematology",
          // …
        ]
      }
    ]
  },
  // Microbiology, Pharmacology
];
```

### localStorage Keys

| Key | Purpose |
|---|---|
| `medrev:theme` | `"light"` or `"dark"` |
| `medrev:qStatus` | Object mapping `questionId` → `"To-Do" / "In Progress" / "Revised"` |
| `medrev:quests` | Object mapping `quest_<subject>_<paper>_<topicIndex>` → `true` |
| `medrev:lastView` | Last-active tab so reload returns you to the right screen |

---

## ⏰ Exam Countdown Logic

The exam schedule is defined in `EXAM_SCHEDULE` (in the embedded `<script>`):

```javascript
const EXAM_SCHEDULE = [
  { date: "2026-09-07T09:30:00", subject: "Pharmacology", paper: "Paper-1" },
  { date: "2026-09-09T09:30:00", subject: "Pharmacology", paper: "Paper-2" },
  { date: "2026-09-11T09:30:00", subject: "Pathology",    paper: "Paper-1" },
  { date: "2026-09-14T09:30:00", subject: "Pathology",    paper: "Paper-2" },
  { date: "2026-09-16T09:30:00", subject: "Microbiology", paper: "Paper-1" },
  { date: "2026-09-18T09:30:00", subject: "Microbiology", paper: "Paper-2" },
];
```

The `pickNextExam(now)` function walks the array in order:

1. If `now < examStart` → **upcoming**, compute Days / Hours / Mins / Secs to `examStart`.
2. If `examStart ≤ now < examStart + 3h` → **in progress**, display a green "Exam in Progress" badge.
3. If `now ≥ examStart + 3h` → move to the next exam.

The countdown refreshes every 1 second via `setInterval`.

---

## 📜 Syllabus Parsing Notes

The syllabus topics were extracted from the official university circular (`circular-SY MBBS Carriculam.pdf`), which is a scanned document. We OCR-extracted it using Tesseract, then manually curated the topic list into 80+ quests organised by subject and paper. AETCOM modules and Pandemic modules listed in the circular are preserved as separate quests.

---

## 🩺 Answer Content

The first **10 questions** (Pathology Paper-1: all 7 long essays + first 3 short notes) have **full, viva-ready answers** authored by a senior medical writer. Each answer includes:

- Semantic HTML (`<h3>`, `<p>`, `<ul>`, `<ol>`, `<table>`)
- Mermaid.js flowcharts where they genuinely aid recall
- Placeholder diagram images (`https://placehold.co/600x400?text=…`)
- Classification tables with proper borders
- A "Clinical Pearl" closing section

The remaining 413 questions have their `answer` field set to `"Answer pending generation. Click here to generate."` — see [`CONTRIBUTING.md`](CONTRIBUTING.md) for how to add more answers.

---

## 🤝 Contributing

We welcome contributions from **medical professionals** (more answers, clinical accuracy review) and **developers** (UI improvements, accessibility, performance). See [`CONTRIBUTING.md`](CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

MIT — see [`LICENSE.md`](LICENSE.md).

---

## 🙏 Acknowledgements

- **Question bank** — sourced from past papers of CUSMC, MORMED, MPSMC, PDUMC, SMCGH.
- **Syllabus** — official university CBME Second MBBS curriculum circular.
- **Diagrams** — currently placeholder images from `placehold.co`; contributors are encouraged to swap in CC-licensed medical illustrations (see CONTRIBUTING.md).
- **Built with** — Tailwind CSS, Mermaid.js, and a lot of coffee.

---

## ⚠️ Disclaimer

This dashboard is a **study aid**, not a substitute for textbooks, faculty teaching, or clinical judgement. Always cross-check answers against standard references — *Robbins & Cotran Pathologic Basis of Disease*, *Harsh Mohan Textbook of Pathology*, *Ananthanarayan & Paniker's Textbook of Microbiology*, *Katzung Basic & Clinical Pharmacology*, or *Goodman & Gilman's* — before relying on them in exams or clinical practice.
