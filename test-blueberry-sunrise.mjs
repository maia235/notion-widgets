// Checks blueberry-sunrise.css and its example page without a browser: node test-blueberry-sunrise.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert";

const read = name => readFileSync(new URL("./" + name, import.meta.url), "utf8");
const css = read("blueberry-sunrise.css");
const page = read("blueberry-sunrise.html");
const code = css.replace(/\/\*[\s\S]*?\*\//g, "");

// 1. The header says what it is, that it is generated, its version and the root it was written from.
const head = css.match(/^\/\* Blueberry Sunrise (\d+\.\d+\.\d+): [\s\S]*?\*\//);
assert(head, "starts with a header naming Blueberry Sunrise and its version");
assert(/GENERATED from the Blueberry Sunrise root [0-9a-f]{12}; never edit this file by hand/.test(head[0]), "says it is generated");

// 2. Light and dark are two complete sets: every colour token in one is in the other.
const block = sel => {
  const m = code.match(new RegExp("(?:^|\\n)" + sel.replace(/[[\]()".:*]/g, "\\$&") + " \\{([\\s\\S]*?)\\n\\}"));
  assert(m, `has a ${sel} block`);
  return new Set([...m[1].matchAll(/--([\w-]+):/g)].map(x => x[1]));
};
const light = block(':root,\n[data-theme="light"]');
const dark = block('[data-theme="dark"]');
assert(light.size > 80, "the light set is complete");
assert.deepStrictEqual([...light].filter(t => !dark.has(t)), [], "every light token has a dark value");
assert.deepStrictEqual([...dark].filter(t => !light.has(t)), [], "every dark token has a light value");
assert(/@media \(prefers-color-scheme: dark\)/.test(code), "dark follows the system setting");

// 3. Braces balance, and every var() the file or the page reads is defined in the file.
let depth = 0;
for (const ch of code) { depth += ch === "{" ? 1 : ch === "}" ? -1 : 0; assert(depth >= 0, "no stray closing brace"); }
assert.strictEqual(depth, 0, "braces balance");
const defined = new Set([...code.matchAll(/--([\w-]+)\s*:/g)].map(x => x[1]));
for (const src of [code, page.replace(/<!--[\s\S]*?-->/g, "")]) {
  for (const m of src.matchAll(/var\(--([\w-]+)/g)) assert(defined.has(m[1]), `--${m[1]} is defined`);
}
for (const t of ["ground", "surface", "text", "edge", "lip", "prism", "veil", "hue-fill", "hue-text", "hue-lip",
  "dunes-h", "moon-size", "moon-top", "moon-right", "moon"]) {
  assert(defined.has(t), `--${t} is there`);
}
for (const c of [".bs-sky", ".bs-sky.at-window", ".bs-ribbon", ".bs-veiled", ".bs-block", ".bs-button"]) {
  assert(code.includes("\n" + c + " {"), `${c} is ready-made`);
}

// 3b. Seven hues and cream, each a full ramp in both themes and a data-hue of its own; each wing wears one of them.
const hues = ["pink", "peach", "butter", "mint", "aqua", "sky", "lav", "cream"];
for (const h of hues) {
  for (const step of ["-wash", "-tint", "", "-shade", "-line"]) {
    assert(light.has(h + step) && dark.has(h + step), `--${h}${step} in both themes`);
  }
  assert(code.includes(`[data-hue="${h}"] {`), `data-hue="${h}" is there`);
}
for (const w of ["plans", "me", "home", "people", "stream", "growing", "library", "viv"]) {
  const m = code.match(new RegExp(`\\[data-hue="${w}"\\] \\{ --hue: var\\(--(\\w+)\\)`));
  assert(m && hues.includes(m[1]), `the ${w} wing wears one of the hues`);
}

// 3c. The scenery is one definition: the old pieces are gone from the file and the page.
for (const old of ["--motif", "motif-", "has-dunes"]) {
  assert(!css.includes(old) && !page.includes(old), `nothing still says ${old}`);
}
assert.strictEqual(code.match(/\n\.bs-sky \{/g).length, 1, "the scenery is drawn once");
assert(/@media \(max-width: \d+px\) \{ :root \{[^}]*--moon-size: 0px/.test(code), "no crescent on a phone");

// 4. Nothing to download: the only url() are pictures written into the file itself, no @import, and the stars never move.
for (const m of code.matchAll(/url\(\s*(["']?)([^"')]*)/g)) assert(m[2].startsWith("data:image/svg+xml,"), "url() is an inline picture");
assert(!/@import/.test(code), "no @import in the system file");
assert(!/https?:\/\//.test(code.replace(/url\("data:[^"]*"\)/g, "")), "no address outside the inline pictures");
assert(!/@keyframes|animation:/.test(code.replace(/@media \(prefers-reduced-motion[\s\S]*$/, "")), "the motifs are still");

// 5. The example page links the file, wears only its tokens, and shows both themes.
assert(page.includes('<link rel="stylesheet" href="blueberry-sunrise.css">'), "the page links the file");
assert(/GENERATED from the Blueberry Sunrise root [0-9a-f]{12}/.test(page), "the page says it is generated");
const styles = [...page.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join("") +
  [...page.matchAll(/style="([^"]*)"/g)].map(m => m[1]).join(";");
assert(!/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i.test(styles), "the page's styles hold no raw colour");
assert(page.includes('data-theme="light"') && page.includes('data-theme="dark"'), "both themes side by side");
assert(!/<script|https?:\/\//.test(page.replace(/<!--[\s\S]*?-->/g, "").replaceAll('xmlns="http://www.w3.org/2000/svg"', "")),
  "no scripts and no requests");
assert(page.includes('class="side bs-sky" data-theme="light"') && page.includes('class="side bs-sky" data-theme="dark"'),
  "the page wears the scenery in both themes");
assert(!/<svg/.test(page), "the scenery comes from the file, never a copied picture");
console.log(`ok (Blueberry Sunrise ${head[1]}, ${light.size} tokens a theme)`);
