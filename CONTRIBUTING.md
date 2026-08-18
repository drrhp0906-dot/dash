# Contributing to MedRev Dashboard

First off — **thank you** for taking the time to contribute. Whether you are a medical professional improving answer accuracy, a senior student adding missing questions, or a developer polishing the UI, your help makes the dashboard more useful for thousands of Second MBBS students.

This document covers the three most common ways to contribute:

1. Adding answers to the remaining 413 questions
2. Improving / correcting Mermaid diagrams
3. UI & UX improvements

---

## 🚀 Quick Start for Contributors

```bash
# 1. Fork & clone the repo
git clone https://github.com/<your-username>/medrev-dashboard.git
cd medrev-dashboard

# 2. Serve locally so the browser doesn't complain about file:// URLs
python3 -m http.server 8000
# → open http://localhost:8000

# 3. Create a feature branch
git checkout -b add-answers-pathology-paper2

# 4. Make your changes (most edits happen inside index.html)

# 5. Test thoroughly, then commit & push
git add index.html
git commit -m "Add answers for Pathology Paper-2 15-markers (Q1-Q9)"
git push origin add-answers-pathology-paper2

# 6. Open a Pull Request on GitHub
```

---

## 📚 1. Adding an Answer to a Question

This is the **highest-impact** contribution. All 379 questions currently have full viva-ready answers, but contributions to improve answer quality, add new questions, or extend coverage to new topics are very welcome. Here's how to add or improve content.

### Step-by-step

1. **Open `index.html`** in your editor. The data lives inside a `<script>` block near the top, in a JavaScript array called `medicalQuestionsData`. Each question is an object like:

   ```javascript
   {
     id: "q0_0_0_3",
     subject: "Pathology",
     paper: "Paper-1",
     section: "15 Markers (Long Essays / LAQs)",
     marks: 15,
     question: "Define amyloidosis. Classify amyloidosis…",
     answer: "Answer pending generation. Click here to generate."
   }
   ```

2. **Find the question** you want to answer. Use `Ctrl+F` and search by the `id` (e.g. `q0_0_0_3`) or by a unique phrase from the question text.

3. **Author your answer** as a single-line string of HTML. You may use:
   - `<h3>` / `<h4>` for subheadings
   - `<p>` for paragraphs
   - `<ul>` / `<ol>` for bullets / numbered lists
   - `<table>` with `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` for classification tables
   - `<strong>`, `<em>` for emphasis
   - `<img src="https://placehold.co/600x400?text=Your+Diagram+Caption" alt="...">` for diagram placeholders (replace the URL with a real CC-licensed image if you have one)
   - `<div class="mermaid">flowchart TD … </div>` for flowcharts (see section 2 below)

4. **Escape quotes and backslashes.** Because the answer is a JavaScript string, you must:
   - Use **double quotes** (`"`) inside HTML attributes, then escape them as `\"` inside the JS string. For example:

     ```javascript
     answer: "<h3>Definition</h3>\n<p>The term <strong class=\"text-rose-600\">amyloid</strong> refers to…</p>"
     ```

   - Use `\n` for newlines (optional but improves readability of the source).
   - Avoid template literals (backticks) — they conflict with the existing string style.

5. **Keep answers viva-ready.** Aim for:
   - 600–1200 words for 15-markers
   - 300–500 words for 6-markers
   - 150–250 words for 4- and 3-markers
   - End every answer with a short **"Clinical Pearl"** section — examiners love these.

6. **Verify rendering.** Save the file, reload `http://localhost:8000`, click the question in the sidebar, and confirm the answer renders correctly with proper formatting, table borders, and Mermaid diagrams.

### Reference: a complete example

```javascript
{
  id: "q0_0_0_4",
  subject: "Pathology",
  paper: "Paper-1",
  section: "15 Markers (Long Essays / LAQs)",
  marks: 15,
  question: "A patient with systemic lupus erythematosus: …",
  answer: "<h3>Probable Diagnosis</h3>\n<p><strong>Systemic Lupus Erythematosus (SLE)</strong> — …</p>\n\n<h3>Etiology</h3>\n<ul>\n  <li><strong>Genetic</strong> — HLA-DR2, HLA-DR3…</li>\n  <li><strong>Hormonal</strong> — …</li>\n</ul>\n\n<div class=\"mermaid\">\nflowchart TD\n  A[Trigger] --> B[Autoantibodies]\n  B --> C[Immune Complexes]\n  C --> D[Tissue Damage]\n</div>\n\n<h3>Clinical Pearl</h3>\n<p>Always check ANA first; anti-dsDNA tracks disease activity.</p>"
}
```

---

## 🧬 2. Improving Mermaid Diagrams

Mermaid is a text-based diagramming language. Inside an answer, wrap your diagram in `<div class="mermaid">…</div>` and the dashboard will render it automatically (and re-render when you toggle dark mode).

### Style guide

- **Use Mermaid only when it aids recall** — pathways, cascades, decision trees. Don't decorate bullet lists as diagrams.
- **Keep boxes short** — 3–6 words each. Long text breaks the layout.
- **Use `flowchart TD`** (top-down) by default. Switch to `flowchart LR` (left-right) only for linear cascades.
- **Avoid HTML inside Mermaid labels** — use plain text. Mermaid's `<br/>` is fine for line breaks inside a label.
- **Test in both light and dark mode** — high-contrast colours (e.g. `A[Primary Tumour]:::primary`) usually survive both; pale fills can disappear in dark mode.

### Example: a clean cascade

```
<div class="mermaid">
flowchart TD
    A[Microbial LPS] --> B[TLR4 Activation]
    B --> C[Cytokine Release<br/>TNF-α, IL-1, IL-6]
    C --> D[Vasodilation & Capillary Leak]
    D --> E[Refractory Hypotension]
    E --> F[Multi-Organ Dysfunction]
</div>
```

Full Mermaid syntax reference: <https://mermaid.js.org/intro/>

---

## 🎨 3. UI / UX Improvements

The dashboard is built with **Tailwind CSS (CDN)** — no PostCSS, no build step. To customise:

- Edit the `tailwind.config` object in the `<head>` of `index.html` to change colours, fonts, spacing.
- Custom CSS lives in the small `<style>` block below the Tailwind config.
- All UI logic is plain JavaScript in the main `<script>` block — no framework, no virtual DOM.

### Things we'd love help with

- **Accessibility audit** — keyboard navigation, ARIA labels, screen-reader support
- **Mobile polish** — the drawer sidebar works but could be smoother
- **Print stylesheet** — make `Print / Save-as-PDF` output cleaner for revision handouts
- **Performance** — the 379-question sidebar tree is built on every status change; consider diffing instead of rebuilding
- **Animations** — subtle entrance transitions for question cards, progress-bar fill animations

### Code style

- Use **descriptive names** (`renderExamCountdown`, not `renderTimer`).
- Add a brief **"why" comment** before non-obvious logic — explain intent, not mechanics.
- Keep functions small and single-purpose.
- No external dependencies beyond Tailwind & Mermaid CDNs.

---

## 📋 Pull Request Checklist

Before submitting a PR, please confirm:

- [ ] Answers are medically accurate and cross-checked against standard textbooks
- [ ] HTML inside `answer` strings is properly escaped (no unescaped `"` inside JS strings)
- [ ] Mermaid diagrams render in both light and dark mode
- [ ] No console errors in DevTools
- [ ] `localStorage` works after reload (your changes don't break persistence)
- [ ] Mobile layout still works (test at 375px width)
- [ ] Commit message follows the convention: `<type>: <subject>` (e.g. `content: add SLE answer for Pathology P1 Q5`)

Types: `content` (answers/diagrams), `feat` (new features), `fix` (bug fixes), `style` (UI/CSS), `docs` (README/MD files), `refactor`, `chore`.

---

## 🧪 Testing

There is no automated test suite (yet). For now, manual testing is expected:

1. Open `http://localhost:8000` in Chrome and Firefox.
2. Click through each subject in the sidebar — confirm questions load.
3. Toggle a question's status — confirm the sidebar dot updates and stats dashboard reflects the change after a reload.
4. Tick a few syllabus quests — confirm progress bar updates and the state survives reload.
5. Toggle dark mode — confirm Mermaid diagrams re-render with the correct theme.
6. Test the global search with 2–3 different queries.
7. Print preview any answer card — confirm only the answer prints, no sidebar/header.

If you'd like to add a Playwright or Cypress test suite, please open an issue first to discuss scope.

---

## 🗣️ Code of Conduct

By participating in this project, you agree to abide by the [Contributor Covenant 2.1](CODE_OF_CONDUCT.md). Be kind, be accurate, be helpful — medical content has real-world consequences.

---

## ❓ Questions?

- Open a [GitHub Issue](../../issues) for bugs or feature requests.
- Use [GitHub Discussions](../../discussions) for general Q&A.
- For sensitive corrections (e.g. factual errors in published answers), email the maintainer directly.

Happy studying, and thank you for making this better for the next batch of medical students. 🩺
