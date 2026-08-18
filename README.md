# MedRev Dashboard 🩺

> A comprehensive, gamified study hub for **Second MBBS** students preparing for **Pathology, Microbiology, and Pharmacology** university exams. Built as a thin `index.html` shell that lazily fetches its question bank as static JSON — no build step, no server, no database. Just open and study.

---

## 📌 Project Description

MedRev Dashboard transforms a flat 379-question exam bank (sourced from five medical colleges — CUSMC, MORMED, MPSMC, PDUMC, SMCGH) plus the university's CBME syllabus circular into a fully interactive, gamified revision environment that runs entirely in the browser. The student can:

- Search across all 379 questions in real time
- Track the next exam with a live ticking countdown
- Tick off syllabus topics as "quests" completed
- Tag every question as **To-Do → In Progress → Revised**
- Read full, viva-ready answers (with Mermaid flowcharts, real medical images, and clinical pearls) for all 379 questions
- Print or Save-as-PDF any answer card for offline revision

Everything persists in `localStorage` — your progress survives page reloads, browser restarts, and even laptop reboots, with zero backend infrastructure.

---

## ✨ Features

| Feature | Description |
|---|---|
| ⏰ **Exam Countdown Timer** | Live Days / Hours / Minutes / Seconds to the next exam. Detects exam-in-progress windows (9:30 AM → 12:30 PM) and displays the right status automatically. |
| 📚 **379-Question Bank** | Nested accordion sidebar: **Subject → Paper → Marks Section → Question**. Each question card shows marks weight, status pill, and one-click access to the answer. |
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
- **Mermaid.js v10** (via CDN) — diagramming inside answers (lazy-rendered via `IntersectionObserver`)
- **DOMPurify 3** (via CDN) — every answer HTML string is sanitised before mount, no raw `innerHTML` of untrusted content
- **FlexSearch 0.7** (via CDN, loaded inside a Web Worker) — inverted-index search off the main thread
- **Vanilla JavaScript** (ES2020+) — no framework, no virtual DOM
- **`fetch()` + static JSON** — question data is decoupled from the app shell, lazy-loaded on first paint, then HTTP-cached
- **Web Workers** — search runs off the main thread so 379-answer scans never block the UI
- **`IntersectionObserver`** — Mermaid diagrams and images render only when scrolled into view
- **`localStorage`** — sole persistence layer
- **Google Fonts** (Inter, JetBrains Mono) — typography

> Zero build step. Zero `npm install`. Zero backend. Serve the folder over HTTP (or even `file://`) and study.
>
> ⚠️ **Note on `file://`**: opening `index.html` directly off the filesystem works in Firefox but Chrome/Safari block `fetch()` and Web Workers under `file://`. Run a tiny local server (see Option B) for full functionality.

---

## 📁 Repository Structure

```
medrev-dashboard/
├── index.html              ← app shell (UI + logic, ~70 KB)
├── data/
│   └── questions.json      ← 379 questions + syllabus (~3 MB, fetched lazily)
├── search.worker.js        ← FlexSearch inverted-index search worker
├── images/                 ← 143 medical images bundled locally
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

The dashboard's question data lives in a **separate static JSON file** (`data/questions.json`) that is fetched on first paint and then HTTP-cached by the browser. The app shell (`index.html`) is a thin ~70 KB file containing only UI + logic — no embedded data. This keeps the initial HTML parse fast and lets you update the question bank without touching the app code.

### `medicalQuestionsData` (379 questions)

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

All **379 questions** now have **full, viva-ready answers** authored to match Indian MBBS viva standards (Robbins, Harsh Mohan, Ananthanarayan, Katzung citations). Each answer includes:

- Semantic HTML (`<h3>`, `<p>`, `<ul>`, `<ol>`, `<table>`)
- Mermaid.js flowcharts where they genuinely aid recall (34 answers)
- **Real medical images** — gross pathology specimens, histology slides, microscopy, clinical photos, and mechanism diagrams embedded directly inside the answer (144 answers)
- Classification tables with proper borders
- A "Clinical Pearl" closing section

Image depth by subject:
- **Pathology** — 37 answers with images (gross specimens, histology slides)
- **Microbiology** — 69 answers with images (Gram stains, culture plates, clinical photos, life-cycle diagrams)
- **Pharmacology** — 38 answers with images (mechanism diagrams, receptor sites, clinical photos)

Images are sourced from public medical education repositories (NUS Medicine, NIH/PMC, WebMD, Mayo Clinic, etc.) and bundled locally in the `images/` folder so the dashboard keeps working fully offline.

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
- **Diagrams** — Mermaid.js flowcharts (CDN) + 144 real medical images sourced from public medical education repositories and bundled locally in `images/`.
- **Built with** — Tailwind CSS, Mermaid.js, and a lot of coffee.

---

## ⚠️ Disclaimer

This dashboard is a **study aid**, not a substitute for textbooks, faculty teaching, or clinical judgement. Always cross-check answers against standard references — *Robbins & Cotran Pathologic Basis of Disease*, *Harsh Mohan Textbook of Pathology*, *Ananthanarayan & Paniker's Textbook of Microbiology*, *Katzung Basic & Clinical Pharmacology*, or *Goodman & Gilman's* — before relying on them in exams or clinical practice.
