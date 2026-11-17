# Notion widgets

Small pages I embed in my Notion dashboard. Nothing personal lives here.

- `clocks.html`: world clocks (West, Central and East US, UK, Eastern Europe); `?side=1` is the slim column
- `stats.html`: a bar of small number cards, numbers passed in the link (`?s=[[label, value, colour, of], ...]`)
  Optional `&t=<unix seconds>&ttl=<seconds>` greys the bar and shows "as of" once it is out of date; links without `t` never grey. `node test-stats.mjs` checks it.
