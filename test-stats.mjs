// Runs the script in stats.html against a tiny fake page: node test-stats.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert";
const src = readFileSync(new URL("./stats.html", import.meta.url), "utf8").match(/<script>([\s\S]*)<\/script>/)[1];
const now = Math.floor(Date.now() / 1000), s = encodeURIComponent('[["A","1","mint","2"]]');
function run(query) {
  const cls = new Set(), asof = { textContent: "", hidden: true };
  const bar = { title: "", innerHTML: "", appendChild() {}, classList: { toggle: (c, on) => (on ? cls.add(c) : cls.delete(c)) } };
  const document = { getElementById: id => (id === "bar" ? bar : asof), createElement: () => ({}) };
  new Function("document", "location", "setInterval", src)(document, { search: "?s=" + s + query }, () => {});
  return { cls, asof, bar };
}
let r = run(`&t=${now - 7200}&ttl=3600`);
assert(r.cls.has("stale") && /^as of /.test(r.asof.textContent) && !r.asof.hidden, "stale");
r = run(`&t=${now - 60}&ttl=3600`);
assert(!r.cls.has("stale") && r.asof.hidden && /^as of /.test(r.bar.title), "fresh");
r = run("");
assert(!r.cls.has("stale") && r.asof.hidden && r.bar.title === "", "no t");
r = run("&t=0&ttl=3600");
assert(r.cls.has("stale") && r.asof.textContent === "not updated yet", "t=0");
for (const q of ["&t=abc&ttl=x", "&t=&ttl=", "&t=-5&ttl=9", "&t=1e999&ttl=NaN", "&t=5", "&ttl=5"]) run(q);
console.log("ok");
