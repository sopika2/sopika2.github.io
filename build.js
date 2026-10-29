// Builds the static site into docs/ (served by GitHub Pages) from projects/*.md. No dependencies.
// Run: node build.js
//
// Each projects/<slug>.md looks like:
//
//   ---
//   title: Google Ads Domain Checker
//   category: data           (one of the keys in CATEGORIES below)
//   tech: TypeScript, Apify SDK
//   born: 2026
//   status: live             (omit for a retired project; then give died:)
//   died: 2026
//   summary: One sentence shown on the card.
//   link: on the Apify Store | https://apify.com/...
//   ---
//   Paragraphs separated by blank lines. No markdown beyond that.
//
// Output is flat: docs/index.html and docs/<slug>.html, so every link also works when a file is opened
// straight from disk. GitHub Pages serves <slug>.html at /<slug> as well.
// The index has a hero, then one section per category in CATEGORIES order, with a menu in the header.
// Inside a section, live projects come first (newest first), then retired ones (newest death first).

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SRC = path.join(ROOT, "projects");
const OUT = path.join(ROOT, "docs");

const NAME = "Saekoto";
const TAGLINE = "Web data tools, self-hosted apps and game mods.";
const INTRO =
  "I build small, sharp tools: bulk checkers that turn a list of domains into clean rows, audits that document a whole website in one run, apps I host myself, and mods people still download. Available for freelance work.";
const CATEGORIES = [
  { key: "data", title: "Data tools", blurb: "Checkers, audits and collection jobs for people who need clean rows, not raw pages." },
  { key: "web", title: "Web work", blurb: "Self-hosted apps and sites, built for one user and kept running." },
  { key: "modding", title: "Modding", blurb: "Game mods published on Nexus Mods under the name saekoto." },
];
const CONTACT = [
  { label: "GitHub", url: "https://github.com/sopika2" },
  { label: "Apify Store", url: "https://apify.com/saekoto" },
];

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function parse(file) {
  const text = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text);
  if (!m) throw new Error(`${file}: missing front matter`);
  const meta = { links: [] };
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    const val = line.slice(i + 1).trim();
    if (key === "link") {
      const [label, url] = val.split("|").map((s) => s.trim());
      if (label && url) meta.links.push({ label, url });
    } else meta[key] = val;
  }
  const paragraphs = m[2].split(/\n\s*\n/).map((p) => p.replace(/\n/g, " ").trim()).filter(Boolean);
  const slug = path.basename(file, ".md");
  for (const k of ["title", "category", "born", "summary"]) if (!meta[k]) throw new Error(`${file}: missing ${k}`);
  if (!CATEGORIES.some((c) => c.key === meta.category)) throw new Error(`${file}: unknown category ${meta.category}`);
  const live = meta.status === "live";
  if (!live && !meta.died) throw new Error(`${file}: needs died: or status: live`);
  const tech = (meta.tech || "").split(",").map((s) => s.trim()).filter(Boolean);
  return { slug, live, ...meta, tech, paragraphs };
}

const when = (p) =>
  p.live ? `since ${p.born}` : p.born === p.died ? `${p.born}, retired` : `${p.born} – ${p.died}, retired`;

const tags = (list, extra = "") =>
  list.length ? `<ul class="tags${extra}">${list.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : "";

const buttons = (links) =>
  links.length
    ? `<p class="buttons">${links.map((l) => `<a class="btn" href="${esc(l.url)}">${esc(l.label)}</a>`).join("\n")}</p>`
    : "";

function page({ title, body, nav }) {
  const base = "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${base}style.css">
</head>
<body>
<header class="top">
  <a class="brand" href="index.html">${esc(NAME)}</a>
  <nav>${nav}</nav>
</header>
<main>
${body}
</main>
<footer>
  <p class="foot-text">Available for freelance work. Find me on</p>
  <p class="links">${CONTACT.map((l) => `<a href="${esc(l.url)}">${esc(l.label)}</a>`).join("\n")}</p>
</footer>
</body>
</html>
`;
}

function card(p) {
  return `  <li class="card cat-${p.category}${p.live ? "" : " retired"}">
    <a class="card-link" href="${p.slug}.html">
      <span class="when">${esc(when(p))}</span>
      <span class="card-title">${esc(p.title)}</span>
      <span class="card-sum">${esc(p.summary)}</span>
    </a>
    ${tags(p.tech)}
  </li>`;
}

function section(cat, items) {
  if (!items.length) return "";
  return `<section id="${cat.key}" class="cat-${cat.key}">
<div class="sec-head">
  <h2>${esc(cat.title)}</h2>
  <p class="blurb">${esc(cat.blurb)}</p>
</div>
<ul class="grid">
${items.map(card).join("\n")}
</ul>
</section>`;
}

function hero(all) {
  const live = all.filter((p) => p.live).length;
  const stats = [
    { n: live, label: "live projects" },
    ...CATEGORIES.map((c) => ({ n: all.filter((p) => p.category === c.key).length, label: c.title.toLowerCase() })),
  ];
  return `<section class="hero">
<p class="eyebrow">${esc(TAGLINE)}</p>
<h1>${esc(NAME)}</h1>
<p class="lede">${esc(INTRO)}</p>
${buttons(CONTACT)}
<ul class="stats">${stats.map((s) => `<li><strong>${s.n}</strong><span>${esc(s.label)}</span></li>`).join("")}</ul>
</section>`;
}

function project(p) {
  const cat = CATEGORIES.find((c) => c.key === p.category);
  const paras = p.paragraphs.map((t) => `<p>${esc(t)}</p>`).join("\n");
  return `<article class="cat-${p.category}">
<p class="crumb"><a href="index.html#${cat.key}">${esc(cat.title)}</a></p>
<h1>${esc(p.title)}</h1>
<p class="lede">${esc(p.summary)}</p>
<dl class="facts">
  <div><dt>Status</dt><dd>${p.live ? "Live" : "Retired"}</dd></div>
  <div><dt>Years</dt><dd>${esc(p.live ? `${p.born} – now` : p.born === p.died ? p.born : `${p.born} – ${p.died}`)}</dd></div>
  <div><dt>Category</dt><dd>${esc(cat.title)}</dd></div>
  ${p.tech.length ? `<div class="wide"><dt>Built with</dt><dd>${tags(p.tech)}</dd></div>` : ""}
</dl>
<div class="prose">
${paras}
</div>
${buttons(p.links)}
</article>`;
}

const all = fs
  .readdirSync(SRC)
  .filter((f) => f.endsWith(".md"))
  .map((f) => parse(path.join(SRC, f)));

const order = (a, b) =>
  (b.live ? 1 : 0) - (a.live ? 1 : 0) || (b.live ? b.born - a.born : b.died - a.died) || a.title.localeCompare(b.title);

const navFor = (prefix) =>
  CATEGORIES.filter((c) => all.some((p) => p.category === c.key))
    .map((c) => `<a href="${prefix}#${c.key}">${esc(c.title)}</a>`)
    .join("\n");

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.copyFileSync(path.join(ROOT, "style.css"), path.join(OUT, "style.css"));
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");

fs.writeFileSync(
  path.join(OUT, "index.html"),
  page({
    title: NAME,
    nav: navFor(""),
    body: `${hero(all)}\n${CATEGORIES.map((c) => section(c, all.filter((p) => p.category === c.key).sort(order))).join("\n")}`,
  })
);

for (const p of all) {
  fs.writeFileSync(
    path.join(OUT, `${p.slug}.html`),
    page({ title: `${p.title} · ${NAME}`, nav: navFor("index.html"), body: project(p) })
  );
}

console.log(`built ${all.filter((p) => p.live).length} live and ${all.filter((p) => !p.live).length} retired projects into docs/`);
