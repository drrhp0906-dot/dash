/* search.worker.js — runs the question-bank search off the main thread.
 *
 * Receives two message types:
 *   { type: 'index', docs: [{id, q, s, p, sec, a}, ...] }
 *     → builds a FlexSearch index, replies { type:'ready', count }
 *   { type: 'search', query: 'foo' }
 *     → replies { type:'results', ids:[...], query, tookMs }
 *
 * The index is built once on first message; subsequent messages just
 * run searches. We use FlexSearch's default preset which is a decent
 * trade-off between index size and recall for ~500 short documents.
 */
var index = null;
var docIds = [];

self.onmessage = function (e) {
  var msg = e.data;
  if (msg.type === 'index') {
    buildIndex(msg.docs);
  } else if (msg.type === 'search') {
    runSearch(msg.query);
  }
};

function buildIndex(docs) {
  // FlexSearch isn't available inside the worker by default (it's loaded
  // in the main thread via CDN). We import it here.
  try {
    importScripts('https://cdn.jsdelivr.net/npm/flexsearch@0.7.31/dist/flexsearch.bundle.min.js');
  } catch (e) {
    // CDN blocked — fall back to a hand-rolled inverted index.
    console.warn('[search.worker] FlexSearch CDN unreachable, using fallback index');
    index = buildFallbackIndex(docs);
    self.postMessage({ type: 'ready', count: docs.length, fallback: true });
    return;
  }

  index = new FlexSearch.Document({
    // tokenize per-word, lowercase, remove diacritics — standard stuff
    tokenize: 'forward',
    cache: 100,
    document: {
      id: 'id',
      index: [
        { field: 'q',  tokenize: 'forward', resolution: 9 },  // question text — highest weight
        { field: 's',  tokenize: 'forward', resolution: 7 },  // subject
        { field: 'p',  tokenize: 'forward', resolution: 5 },  // paper
        { field: 'sec', tokenize: 'forward', resolution: 5 }, // section
        { field: 'a',  tokenize: 'forward', resolution: 3 }   // answer body — lowest weight (huge)
      ]
    }
  });

  docs.forEach(function (d) {
    index.add(d);
    docIds.push(d.id);
  });

  self.postMessage({ type: 'ready', count: docs.length });
}

function runSearch(query) {
  var t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  var ids = [];

  if (!index) {
    self.postMessage({ type: 'results', ids: [], query: query, tookMs: 0 });
    return;
  }

  if (query && query.trim()) {
    if (index.search) {
      // FlexSearch.Document.search returns arrays of results per field.
      // We union them and rank by how many fields matched.
      var results = index.search(query, { limit: 200 });
      var ranked = {};
      results.forEach(function (fieldResult) {
        // fieldResult is an array of {id, ...} — each field's matches
        if (Array.isArray(fieldResult)) {
          fieldResult.forEach(function (r) {
            var id = (typeof r === 'object') ? r.id : r;
            ranked[id] = (ranked[id] || 0) + 1;
          });
        } else if (fieldResult && fieldResult.field) {
          (fieldResult.result || []).forEach(function (r) {
            var id = (typeof r === 'object') ? r.id : r;
            ranked[id] = (ranked[id] || 0) + 1;
          });
        }
      });
      // sort by match count desc, then by id asc for stable order
      ids = Object.keys(ranked).sort(function (a, b) {
        if (ranked[b] !== ranked[a]) return ranked[b] - ranked[a];
        return a < b ? -1 : 1;
      });
    } else {
      // fallback inverted index
      ids = index.search(query);
    }
  }

  var t1 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  self.postMessage({ type: 'results', ids: ids, query: query, tookMs: t1 - t0 });
}

// ─── fallback: hand-rolled inverted index (used if FlexSearch CDN fails) ──
function buildFallbackIndex(docs) {
  var tokens = {};  // token → Set of doc ids
  var docsById = {}; // id → concatenated searchable text

  docs.forEach(function (d) {
    var text = (d.q + ' ' + d.s + ' ' + d.p + ' ' + d.sec + ' ' + d.a).toLowerCase();
    docsById[d.id] = text;
    text.split(/[^a-z0-9]+/).forEach(function (tok) {
      if (tok.length < 2) return;
      if (!tokens[tok]) tokens[tok] = [];
      if (tokens[tok].indexOf(d.id) === -1) tokens[tok].push(d.id);
    });
  });

  return {
    search: function (q) {
      var qTokens = q.toLowerCase().split(/[^a-z0-9]+/).filter(function (t) { return t.length >= 2; });
      var hits = {};
      qTokens.forEach(function (tok) {
        // prefix match — covers partial queries like "amy" → "amyloidosis"
        Object.keys(tokens).forEach(function (idxTok) {
          if (idxTok.indexOf(tok) === 0) {
            tokens[idxTok].forEach(function (id) {
              hits[id] = (hits[id] || 0) + 1;
            });
          }
        });
      });
      return Object.keys(hits).sort(function (a, b) {
        return hits[b] - hits[a];
      });
    }
  };
}
