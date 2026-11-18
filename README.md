# Notion widgets

Small pages I embed in my Notion dashboard, and the style that dresses Notion itself. Nothing personal lives here.

- `clocks.html`: world clocks (West, Central and East US, UK, Eastern Europe); `?side=1` is the slim column
- `stats.html`: a bar of small number cards, numbers passed in the link (`?s=[[label, value, colour, of], ...]`)
  Optional `&t=<unix seconds>&ttl=<seconds>` greys the bar and shows "as of" once it is out of date; links without `t` never grey. `node test-stats.mjs` checks it.
- `vivarium.user.css`: my Notion look in Firefox (below). `node test-vivarium.mjs` checks it.
- `blueberry-sunrise.css`: my design system, Blueberry Sunrise, as one file any project can use (below), with an example page, `blueberry-sunrise.html`. `node test-blueberry-sunrise.mjs` checks both.

The colours in every file here are generated from Blueberry Sunrise's root; nothing here is edited by hand.

## How to use Blueberry Sunrise in another project

Light is the sunrise (sunlight on cream, cool violet shadow, clean pastel blocks in a plum outline); dark is the blueberry night (a starry indigo sky where pastels only arrive as light).

1. Link the file first, from here or a copy: `<link rel="stylesheet" href="https://maia235.github.io/notion-widgets/blueberry-sunrise.css">`. A copy goes stale when the system changes, so link it where I can.
2. Read only the role tokens, never raw values: `var(--ground)`, `var(--surface)`, `var(--text)`, `var(--text-2)`, `var(--edge)`, `var(--primary)`, `var(--font)`, `var(--space-8)`, `var(--radius-card)` and so on. The file's own comments say what each is for.
3. Dark follows the system by itself. `data-theme="dark"` or `data-theme="light"` on the page, or on any element, forces a theme for that part.
4. A block in my style, in five lines:

```css
.block { background: var(--surface); color: var(--text);
  border: var(--block-width) solid var(--block-line); border-radius: var(--radius-card);
  box-shadow: var(--glint) var(--starlight), var(--lift-3) var(--lip); }
.block[data-hue] { background: var(--hue-fill); color: var(--hue-text);
  box-shadow: var(--glint) var(--starlight), var(--lift-3) var(--hue-lip); }
```

Or use the ready-made `.bs-block` and `.bs-button` (`.bs-button.primary` for the main one). Give a block a hue with `data-hue="pink"` (`peach`, `butter`, `mint`, `sky`, `lav`). `.bs-sky` paints a page's open ground (the sunrise, or the still star field), `.bs-ribbon` is the rainbow hairline under a top bar, `.bs-veiled` puts the night veil over a picture.

Open ground takes `.bs-sky`: my flat cream by day; by night the sky fades from deepest at the top to a lighter horizon (fixed to the window) under the still stars. The dunes and the crescent are two small pictures: copy them inline from `blueberry-sunrise.html` into the region marked `.has-dunes` (the dunes sit at its foot, the crescent in its top right margin, by night only). Never inside a card, a panel or a table, and never behind writing.

`blueberry-sunrise.html` shows every swatch, a sample block and buttons, and the dunes and the crescent, light and dark side by side.

## The Vivarium style for Notion

One userstyle (a stylesheet my browser adds to a website) that gives Notion my flat block-pastel look. It only changes how Notion looks in my Firefox; it never reads or changes anything in my workspace.

**Nobody has seen it on screen yet.** I built it from Notion's live code (18 Nov 2026), not from a logged-in page, so the first time I open Notion with it I should look it over.

### What it does

On by default, and the most robust (part A):

- My colours, Blueberry Sunrise: my cream page with a lilac sidebar in light mode, the indigo night sky in dark mode; soft violet text instead of small grey. Notion's high contrast mode is left alone.
- Full width on every page, with a side margin I can set.
- Hides the AI button, the "?" help button and the "Add a comment" bar.

Nicer but more likely to break when Notion changes (part B), each with its own switch:

| Switch | What it does |
|---|---|
| Fira Sans | my font everywhere Notion uses its normal font; code, serif and mono pages keep theirs |
| Outlined cards and callouts | round corners, a plum outline and the little block shadow from my number bar; a hairline and a shadow of deeper night in dark |
| Pastel select pills | lavender, pink, mint, sky, butter and peach tags; red, grey and brown stay Notion's |
| Calmer tables | no vertical lines between columns (Notion already keeps table headers stuck to the top) |
| Nicer checkboxes | round, plum outline (a starlight line in dark), mint when ticked |
| Taller cover with round corners | a taller cover with rounded bottom corners |
| Quiet sidebar | soft violet section titles and a lavender selected row |
| Ticked to-dos fade | ticked to-dos turn my softest text colour, still easy to read |
| Focus mode (off by default) | hides the "..." on sidebar rows, the "Add icon / Add cover" row and the floating outline |

I can also set the page colour (light and dark), the accent colour, the corner radius and the side margin.

Every colour pair passes 4.5 to 1 contrast (the reading floor for body text). The file lists each pair and the worst one.

### Install it (3 minutes, my main Firefox profile, never the stream profile)

1. In my main Firefox, open the Firefox Add-ons page for **Stylus** (by its exact name: [Stylus](https://addons.mozilla.org/en-US/firefox/addon/styl-us/)) and press "Add to Firefox".
2. Open [https://maia235.github.io/notion-widgets/vivarium.user.css](https://maia235.github.io/notion-widgets/vivarium.user.css). Stylus opens its install page instead of showing the code.
3. Keep "automatically update" ticked and press **Install**.
4. Open Notion. If something looks wrong, I switch that part off (below) and tell the overseer which one.

### How it updates

When the file here changes, its version number goes up and Stylus fetches the new one by itself. To fetch it at once: Stylus's Manage page, then check for updates.

### Switch a part off

On a Notion tab, I click the Stylus icon in the toolbar, then the cog next to "Vivarium for Notion". Each part is a switch; the colours and sizes are there too. No code to edit.

### Remove it

Stylus icon, untick "Vivarium for Notion" to pause it, or open Stylus's Manage page and delete it. Notion goes straight back to normal.

### Honest limits

- It lives in my Firefox only. The iPhone app and every other browser see plain Notion.
- Notion changes its app often. A redesign can switch parts of the style off until I update this file; it never breaks a page, the changed part just looks like plain Notion again.
- The parts most likely to need a fix after my first look: the taller cover, the card and callout outlines, Fira Sans, and wide inline databases on full-width pages.
- It cannot know dates, so it never colours anything as overdue. That is Notion's own formula colour.
