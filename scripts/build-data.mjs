// scripts/build-data.mjs — node scripts/build-data.mjs
//
// Reads:   answers.json          → id → full answer HTML (source of truth for ANSWERS)
//          data/questions.json   → question metadata + syllabus (answers field ignored)
// Writes:  data/questions.json   → same structure, answer fields emptied (small, loads fast)
//          data/answers/*.json   → one chunk per subject/paper/section (lazy-fetched)
//          data/index.json       → [{id, g, title, text}] — search seed for the worker
//
// Idempotent: safe to re-run. First run needs data/questions.json with question text.

import fs from 'node:fs';
import path from 'node:path';

const GROUP_DEPTH = 3; // "q0_0_1_3" → chunk "q0_0_1" (subject_paper_section)

const raw  = JSON.parse(fs.readFileSync('answers.json', 'utf8'));
const full = JSON.parse(fs.readFileSync('data/questions.json', 'utf8'));

const strip = (h) => h
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;|&[a-z]+;/g, ' ')
  .replace(/\s+/g, ' ').trim();

// ── collect question metadata + validate coverage against answers.json ──
const metaById = new Map();
for (const subj of full.questions ?? []) {
  for (const paper of subj.papers ?? []) {
    for (const sec of paper.sections ?? []) {
      for (const q of sec.questions ?? []) metaById.set(q.id, q);
    }
  }
}
const noAnswer = [...metaById.keys()].filter(id => !raw[id]);
const orphan   = Object.keys(raw).filter(id => !metaById.has(id));
if (noAnswer.length) console.warn(`⚠️  ${noAnswer.length} questions missing from answers.json:`, noAnswer.slice(0, 5));
if (orphan.length)   console.warn(`⚠️  ${orphan.length} orphan answers (no question):`, orphan.slice(0, 5));

// ── 1. group answers into chunks ──
const groups = {};
for (const [id, html] of Object.entries(raw)) {
  const g = id.split('_').slice(0, GROUP_DEPTH).join('_');
  (groups[g] ??= {})[id] = html;
}

// only clear the outputs — NEVER the whole data/ dir, because
// data/questions.json is both an input AND an output of this script.
fs.rmSync('data/answers', { recursive: true, force: true });
fs.mkdirSync('data/answers', { recursive: true });
for (const [g, items] of Object.entries(groups)) {
  fs.writeFileSync(path.join('data/answers', `${g}.json`), JSON.stringify(items));
}

// ── 2. search index: first heading + first 400 chars of plain text ──
const index = [];
for (const [id, q] of metaById) {
  const html = raw[id] ?? '';
  const h3 = [...html.matchAll(/<h[34][^>]*>(.*?)<\/h[34]>/g)].map(m => strip(m[1]));
  const title = h3.find(t => !/^(definition|clinical pearl)$/i.test(t)) ?? h3[0] ?? strip(q.question).slice(0, 80);
  index.push({ id, g: id.split('_').slice(0, GROUP_DEPTH).join('_'), title, text: strip(html).slice(0, 400) });
}
index.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
fs.writeFileSync('data/index.json', JSON.stringify(index));

// ── 3. rewrite questions.json with answers stripped out ──
for (const q of metaById.values()) q.answer = '';
fs.writeFileSync('data/questions.json', JSON.stringify(full));

const kb = (f) => (fs.statSync(f).size / 1024).toFixed(0);
console.log(`✓ ${metaById.size} questions · ${Object.keys(groups).length} chunks`);
console.log(`  data/questions.json  ${kb('data/questions.json')} KB · data/index.json ${kb('data/index.json')} KB`);