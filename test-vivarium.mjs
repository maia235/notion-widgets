// Checks vivarium.user.css without a browser: node test-vivarium.mjs
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import assert from "node:assert";

const FILE = "vivarium.user.css";
const src = readFileSync(new URL("./" + FILE, import.meta.url), "utf8");
const DOMAINS = ["notion.so", "www.notion.so", "notion.com", "app.notion.com", "notion.site"];
const UPDATE_URL = "https://maia235.github.io/notion-widgets/vivarium.user.css";

// 1. The UserCSS header.
const head = src.match(/^\/\* ==UserStyle==\n([\s\S]*?)\n==\/UserStyle== \*\//);
assert(head, "file starts with a /* ==UserStyle== ... ==/UserStyle== */ block");
const meta = {};
for (const m of head[1].matchAll(/^@(\w+)\s+(.+)$/gm)) if (m[1] !== "var") meta[m[1]] = m[2].trim();
for (const k of ["name", "namespace", "version", "description", "license", "updateURL"]) assert(meta[k], `header has @${k}`);
assert(/^\d+\.\d+\.\d+$/.test(meta.version), "@version is x.y.z");
assert.strictEqual(meta.updateURL, UPDATE_URL, "@updateURL is the GitHub Pages address");
assert.strictEqual(meta.preprocessor, "less", "@preprocessor less (the switches are Less guards)");

// 2. Every @var has a valid default, and every switch in the body is declared.
const vars = {};
for (const line of head[1].split("\n").filter(l => l.startsWith("@var"))) {
  const m = line.match(/^@var\s+(text|color|checkbox|select|range|number)\s+([\w-]+)\s+"[^"]+"\s+(\S.*)$/);
  assert(m, `@var line is complete (type, name, label, default): ${line}`);
  const [, type, name, def] = m;
  assert(!(name in vars), `@var ${name} declared once`);
  if (type === "checkbox") assert(/^[01]$/.test(def), `${name} default is 0 or 1`);
  if (type === "color") assert(/^#[0-9a-f]{6}$/i.test(def), `${name} default is a hex colour`);
  if (type === "range" || type === "number") {
    const a = JSON.parse(def);
    assert(typeof a[0] === "number", `${name} default is a number`);
    vars[name] = a[0] + (a.find(x => typeof x === "string") || "");
  } else vars[name] = def;
}
assert(Object.keys(vars).length > 0, "has @var settings");

// Code with comments removed (none of this file's strings contain comment marks).
const body = src.slice(head[0].length);
const code = body.replace(/\/\*[\s\S]*?\*\//g, "");
for (const m of code.matchAll(/@(viv\w+)/g)) assert(m[1] in vars, `@${m[1]} is a declared @var`);

// 3. Braces balance.
let depth = 0;
for (const ch of code.replace(/"[^"]*"/g, '""')) {
  if (ch === "{") depth++;
  if (ch === "}") depth--;
  assert(depth >= 0, "no closing brace before its opening one");
}
assert.strictEqual(depth, 0, "braces balance");

// 4. Everything sits in @-moz-document blocks scoped to Notion's domains only
//    (code outside such a block would apply to every website).
let i = 0, blocks = 0;
const flat = code.replace(/"[^"]*"/g, s => s.replace(/[{}]/g, "_"));
while (i < flat.length) {
  if (/\s/.test(flat[i])) { i++; continue; }
  assert(flat.startsWith("@-moz-document", i), `only @-moz-document blocks at the top level (found: ${flat.slice(i, i + 40)})`);
  const open = flat.indexOf("{", i);
  const args = code.slice(i + "@-moz-document".length, open).split(",").map(s => s.trim());
  for (const a of args) {
    const d = a.match(/^domain\("([^"]+)"\)$/);
    assert(d && DOMAINS.includes(d[1]), `@-moz-document matches only Notion domains: ${a}`);
  }
  assert.deepStrictEqual([...args].sort(), DOMAINS.map(d => `domain("${d}")`).sort(), "every Notion domain is listed");
  let k = open, n = 0;
  do { if (flat[k] === "{") n++; if (flat[k] === "}") n--; k++; } while (n > 0);
  i = k; blocks++;
}
assert(blocks >= 1, "has an @-moz-document block");

// 5. Nothing about me or my workspace, and no request to anywhere but the font host.
assert(!/[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}/i.test(src), "no UUID or page id");
assert(!/notion\.(so|site|com)\//i.test(src), "no Notion page link");
assert(!/[\w.+-]+@[\w-]+\.[\w.]+/.test(src.replace(/@-moz-document|@font-face/g, "")), "no email address");
assert(!/@import/i.test(code), "no @import");
for (const m of code.matchAll(/url\(\s*"?([^")]+)/g)) assert(m[1].startsWith("https://fonts.gstatic.com/"), `url() only to fonts.gstatic.com: ${m[1]}`);

// 6. Safe rules: display:none only on a named Notion element, never a bare
//    container; nothing sets font sizes or opacity (no smaller or fainter text).
for (const m of code.matchAll(/([^{};]+)\{([^{}]*)\}/g)) {
  const [, sel, decls] = m;
  if (/display:\s*none/.test(decls)) {
    for (const s of sel.split(",")) {
      const last = s.trim().split(/\s+|>|\+|~/).filter(Boolean).pop();
      assert(/^\.notion-[\w-]+$/.test(last), `display:none only on a .notion- element: ${s.trim()}`);
    }
  }
  assert(!/(^|[;\s{])(font-size|opacity|zoom)\s*:/.test(decls), `no font-size, opacity or zoom: ${sel.trim()}`);
}

// 7. Contrast, worked out from the colours in the file with default settings.
const hex = c => [1, 3, 5].map(k => parseInt(c.slice(k, k + 2), 16));
const toHex = t => "#" + t.map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
const mix = (a, p, b) => toHex(hex(a).map((v, k) => v * p + hex(b)[k] * (1 - p)));
const lum = c => hex(c).map(v => (v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4).reduce((s, v, k) => s + v * [0.2126, 0.7152, 0.0722][k], 0);
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const local = Object.fromEntries([...code.matchAll(/@(\w+):\s*(#[0-9a-f]{6});/gi)].map(m => [m[1], m[2]]));
const value = v => {
  v = v.trim();
  if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase();
  if (v.startsWith("@")) return value(vars[v.slice(1)] ?? local[v.slice(1)]);
  const m = v.match(/^color-mix\(in srgb, (\S+) (\d+)%, (\S+)\)$/);
  if (m) return m[3] === "transparent" ? { over: value(m[1]), p: m[2] / 100 } : mix(value(m[1]), m[2] / 100, value(m[3]));
  return null;
};
function tokens(selector) {
  const t = {};
  for (const m of code.matchAll(/([^{};]+)\{([^{}]*)\}/g)) {
    if (!m[1].includes(selector)) continue;
    for (const d of m[2].matchAll(/(--[\w-]+):\s*([^;]+);/g)) t[d[1]] = value(d[2]);
  }
  return t;
}
const TEXT = ["--c-texPri", "--c-texSec", "--c-texTer", "--c-texAccPri", "--c-sidSecCol"];
const BACK = ["--c-bacPri", "--c-bacSec", "--c-bacTer", "--c-bacInt", "--c-bacEle", "--c-popBac", "--cd-boaIteDefBac", "--cd-colGalPreCarBac", "--cd-tabHeaRowColBac"];
const known = { light: new Set(), dark: new Set(), pill: new Set(), tick: new Set() };
let worst = Infinity;
for (const theme of ["light", "dark"]) {
  const t = tokens(`.notion-${theme}-theme.notion-${theme}-theme`);
  const backs = BACK.map(k => t[k]);
  const sel = t["--ca-sidIteSelBac"];
  if (sel) backs.push(mix(sel.over, sel.p, t["--c-bacSec"]));
  for (const k of TEXT) {
    assert(typeof t[k] === "string", `${theme} sets ${k}`);
    known[theme].add(t[k]);
    for (const b of backs) {
      assert(typeof b === "string", `${theme} background resolves`);
      known[theme].add(b);
      const r = ratio(t[k], b);
      assert(r >= 4.5, `${theme} ${k} ${t[k]} on ${b} is ${r.toFixed(2)}, under 4.5`);
      worst = Math.min(worst, r);
    }
  }
}
// Pills keep Notion's own text colours (read from its build); the tick is plum on mint.
const pillText = { "--c-purBacTer": "#553b69", "--c-pinBacTer": "#68354e", "--c-greBacTer": "#2a533c", "--c-bluBacTer": "#264a72", "--c-yelBacTer": "#655121", "--c-oraBacTer": "#6a4222" };
const pills = tokens(".notion-light-theme.notion-light-theme");
for (const [k, text] of Object.entries(pillText)) {
  const r = ratio(text, pills[k]);
  assert(r >= 4.5, `pill ${k} is ${r.toFixed(2)}`);
  known.pill.add(text).add(pills[k]);
  worst = Math.min(worst, r);
}
assert(ratio(local.plum, local.mint) >= 4.5, "tick plum on mint");
known.tick.add(local.plum).add(local.mint);

// The comment table must match: every row recomputes, and the worst pair is right.
const rows = [...body.matchAll(/^\s+(light|dark|pill|tick)\s+\w+\s+(#[0-9a-f]{6})\s+\w+\s+(#[0-9a-f]{6})\s+([\d.]+)$/gm)];
assert(rows.length >= 10, "contrast table has rows");
for (const [line, kind, fg, bg, said] of rows) {
  const r = Math.round(ratio(fg, bg) * 100) / 100;
  assert(Math.abs(r - Number(said)) < 0.006, `table row says ${said}, it is ${r.toFixed(2)}: ${line.trim()}`);
  assert(r >= 4.5, `table row under 4.5: ${line.trim()}`);
  assert(known[kind].has(fg) && known[kind].has(bg), `table row uses colours the file really sets: ${line.trim()}`);
}
const stated = Number(body.match(/Worst pair: ([\d.]+)/)[1]);
assert(Math.abs(stated - Math.round(worst * 100) / 100) < 0.006, `worst pair is ${worst.toFixed(2)}, the file says ${stated}`);

// 8. A changed body needs a higher @version than the last commit, or Stylus never updates.
let committed = null;
try { committed = execFileSync("git", ["show", `HEAD:${FILE}`], { cwd: new URL(".", import.meta.url), encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }); } catch { /* new file */ }
if (committed !== null) {
  const ver = s => (s.match(/^@version\s+(\S+)/m) || [])[1].split(".").map(Number);
  const strip = s => s.replace(/^@version\s+\S+$/m, "");
  if (strip(committed) !== strip(src)) {
    const [a, b] = [ver(src), ver(committed)];
    const higher = a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
    assert(higher > 0, `the file changed, so @version must go above ${b.join(".")}`);
  }
}
console.log(`ok (worst contrast ${worst.toFixed(2)})`);
