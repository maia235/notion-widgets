# Notion widgets

Small pages I embed in my Notion dashboard, and the style that dresses Notion itself. Nothing personal lives here.

- `clocks.html`: world clocks (West, Central and East US, UK, Eastern Europe); `?side=1` is the slim column
- `stats.html`: a bar of small number cards, numbers passed in the link (`?s=[[label, value, colour, of], ...]`)
  Optional `&t=<unix seconds>&ttl=<seconds>` greys the bar and shows "as of" once it is out of date; links without `t` never grey. `node test-stats.mjs` checks it.
- `vivarium.user.css`: my Notion look in Firefox (below). `node test-vivarium.mjs` checks it.

## The Vivarium style for Notion

One userstyle (a stylesheet my browser adds to a website) that gives Notion my flat block-pastel look. It only changes how Notion looks in my Firefox; it never reads or changes anything in my workspace.

**Nobody has seen it on screen yet.** I built it from Notion's live code (18 Nov 2026), not from a logged-in page, so the first time I open Notion with it I should look it over.

### What it does

On by default, and the most robust (part A):

- My colours: a warm off-white page with a lavender sidebar in light mode, a deep plum in dark mode; soft plum text instead of small grey. Notion's high contrast mode is left alone.
- Full width on every page, with a side margin I can set.
- Hides the AI button, the "?" help button and the "Add a comment" bar.

Nicer but more likely to break when Notion changes (part B), each with its own switch:

| Switch | What it does |
|---|---|
| Fira Sans | my font everywhere Notion uses its normal font; code, serif and mono pages keep theirs |
| Outlined cards and callouts | round corners, a plum outline and the little block shadow from my number bar |
| Pastel select pills | lavender, pink, mint, sky, butter and peach tags; red, grey and brown stay Notion's |
| Calmer tables | no vertical lines between columns (Notion already keeps table headers stuck to the top) |
| Nicer checkboxes | round, plum outline, mint when ticked |
| Taller cover with round corners | a taller cover with rounded bottom corners |
| Quiet sidebar | soft plum section titles and a lavender selected row |
| Ticked to-dos fade | ticked to-dos turn soft plum, still easy to read |
| Focus mode (off by default) | hides the "..." on sidebar rows, the "Add icon / Add cover" row and the floating outline |

I can also set the page colour (light and dark), the accent colour, the corner radius and the side margin.

Every colour pair passes 4.5 to 1 contrast (the reading floor for body text); the worst is 5.04. The file lists each pair.

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
