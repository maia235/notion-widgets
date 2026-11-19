// Runs the script in stats.html against a tiny fake page: node test-stats.mjs
// Every value here is made up. The numbers ride after # (never sent to a server); an old ?s= link still shows, once.
import { readFileSync } from "node:fs";
import assert from "node:assert";
const html = readFileSync(new URL("./stats.html", import.meta.url), "utf8");
const src = html.match(/<script>([\s\S]*)<\/script>/)[1];
const now = Math.floor(Date.now() / 1000), s = encodeURIComponent('[["Apples","1","mint","2"],["Pears","7","nope",""]]');

function node(tag) {
  const n = { tag, className: "", textContent: "", style: {}, kids: [], title: "", hidden: false,
              appendChild(k) { this.kids.push(k); return k; } };
  const cls = new Set();
  n.classList = { toggle: (c, on) => (on ? cls.add(c) : cls.delete(c)), has: c => cls.has(c) };
  return n;
}
function run(link) {
  const at = new URL(link, "https://widgets.example/stats.html");
  const bar = node("div"), asof = node("div"), replaced = [];
  asof.hidden = true;
  const document = { getElementById: id => (id === "bar" ? bar : asof), createElement: node };
  const location = { hash: at.hash, search: at.search, pathname: at.pathname };
  const history = { replaceState: (st, t, url) => replaced.push(url) };
  new Function("document", "location", "history", "setInterval", src)(document, location, history, () => {});
  return { bar, asof, replaced };
}
const text = n => n.textContent + n.kids.map(text).join("");

let r = run(`#s=${s}&t=${now - 7200}&ttl=3600`);
assert.equal(r.bar.kids.length, 2, "two cards from the fragment");
assert.equal(text(r.bar.kids[0]), "Apples1/ 2");
assert.equal(r.bar.kids[0].kids[1].style.background, "var(--mint)");
assert.equal(r.bar.kids[1].kids[1].style.background, "var(--lav)", "an unknown colour is lavender");
assert(r.bar.classList.has("stale") && /^as of /.test(r.asof.textContent) && !r.asof.hidden, "stale");
assert.deepEqual(r.replaced, [], "a fragment link is left as it is");
r = run(`#s=${s}&t=${now - 60}&ttl=3600`);
assert(!r.bar.classList.has("stale") && r.asof.hidden && /^as of /.test(r.bar.title), "fresh");
r = run(`#s=${s}`);
assert(!r.bar.classList.has("stale") && r.asof.hidden && r.bar.title === "", "no t");
r = run(`#s=${s}&t=0&ttl=3600`);
assert(r.bar.classList.has("stale") && r.asof.textContent === "not updated yet", "t=0");
for (const q of ["&t=abc&ttl=x", "&t=&ttl=", "&t=-5&ttl=9", "&t=1e999&ttl=NaN", "&t=5", "&ttl=5"]) run(`#s=${s}${q}`);
for (const bad of ["#s=%5B", "#s=%7B%7D", "#s=%5B5%5D", "#", ""]) assert.equal(run(bad).bar.kids.length, bad === "#s=%5B5%5D" ? 1 : 0);
r = run(`#s=${encodeURIComponent('[["<b>x</b>","<img src=x>","pink",""]]')}`);
assert.equal(text(r.bar.kids[0]), "<b>x</b><img src=x>", "words are shown as words, never as markup");

// the hand-over: an old ?s= link shows the same, and is taken out of the address at once
r = run(`?s=${s}&t=${now - 60}&ttl=3600`);
assert.equal(text(r.bar.kids[0]), "Apples1/ 2");
assert(/^as of /.test(r.bar.title));
assert.deepEqual(r.replaced, ["/stats.html"], "the query is taken out of the address");
r = run(`?s=${encodeURIComponent('[["Old","0","pink",""]]')}#s=${s}`);
assert.equal(text(r.bar.kids[0]), "Apples1/ 2", "the fragment wins");
assert.deepEqual(r.replaced, []);
console.log("ok");
