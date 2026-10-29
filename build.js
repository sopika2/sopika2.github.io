// Builds the static site into docs/ (served by GitHub Pages) from projects/*.md. No dependencies.
// Run: node build.js
//
// Each projects/<slug>.md looks like:
//
//   ---
//   title: Google Ads Domain Checker
//   category: data           (one of the keys in CATEGORIES below)
//   born: 2026
//   status: live             (omit for a retired project; then give died:)
//   died: 2026
//   summary: One sentence shown in the list.
//   link: on the Apify Store | https://apify.com/...
//   ---
//   Paragraphs separated by blank lines. No markdown beyond that.
//
// The index has one section per category, in CATEGORIES order, with a menu at the top.
// Inside a section, live projects come first (newest first), then retired ones (newest death first).

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SRC = path.join(ROOT, "projects");
const OUT = path.join(ROOT, "docs");

const NAME = "Saekoto";
const INTRO =
  "I build web data tools, small self-hosted web apps and game mods. Available for freelance work.";
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
  return { slug, live, ...meta, paragraphs };
}

const when = (p) =>
  p.live ? `since ${p.born}` : p.born === p.died ? `${p.born}, retired` : `${p.born} – ${p.died}, retired`;

const linkRow = (links, cls) =>
  links.length ? `<p class="${cls}">${links.map((l) => `<a href="${esc(l.url)}">${esc(l.label)}</a>`).join("\n")}</p>` : "";

function page({ title, body, depth, nav }) {
  const base = depth ? "../" : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${esc(title)}</title>
<link rel="stylesheet" href="${base}style.css">
</head>
<body>
<header class="top">
  <a class="brand" href="${base || "./"}">${esc(NAME)}</a>
  <nav>${nav}</nav>
</header>
<main>
${body}
</main>
<footer>
  ${linkRow(CONTACT, "links")}
</footer>
</body>
</html>
`;
}

function entry(p) {
  return `  <li${p.live ? "" : ' class="retired"'}>
    <a href="${p.slug}/">${esc(p.title)}</a>
    <span class="when">${esc(when(p))}</span>
    <p>${esc(p.summary)}</p>
  </li>`;
}

function section(cat, items) {
  if (!items.length) return "";
  return `<section id="${cat.key}">
<h2>${esc(cat.title)}</h2>
<p class="blurb">${esc(cat.blurb)}</p>
<ul class="list">
${items.map(entry).join("\n")}
</ul>
</section>`;
}

function project(p) {
  const cat = CATEGORIES.find((c) => c.key === p.category);
  const paras = p.paragraphs.map((t) => `<p>${esc(t)}</p>`).join("\n");
  return `<p class="crumb"><a href="../#${cat.key}">${esc(cat.title)}</a></p>
<h1>${esc(p.title)}</h1>
<p class="when">${esc(when(p))}</p>
<p class="lede">${esc(p.summary)}</p>
${paras}
${linkRow(p.links, "links")}`;
}

const all = fs
  .readdirSync(SRC)
  .filter((f) => f.endsWith(".md"))
  .map((f) => parse(path.join(SRC, f)));

const order = (a, b) =>
  (b.live ? 1 : 0) - (a.live ? 1 : 0) || (b.live ? b.born - a.born : b.died - a.died) || a.title.localeCompare(b.title);

const navFor = (base) =>
  CATEGORIES.filter((c) => all.some((p) => p.category === c.key))
    .map((c) => `<a href="${base}#${c.key}">${esc(c.title)}</a>`)
    .join("\n");

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.copyFileSync(path.join(ROOT, "style.css"), path.join(OUT, "style.css"));
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");

fs.writeFileSync(
  path.join(OUT, "index.html"),
  page({
    title: NAME,
    depth: 0,
    nav: navFor(""),
    body: `<h1>${esc(NAME)}</h1>\n<p class="lede">${esc(INTRO)}</p>\n${CATEGORIES.map((c) =>
      section(c, all.filter((p) => p.category === c.key).sort(order))
    ).join("\n")}`,
  })
);

for (const p of all) {
  const dir = path.join(OUT, p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "index.html"),
    page({ title: `${p.title} · ${NAME}`, depth: 1, nav: navFor("../"), body: project(p) })
  );
}

console.log(`built ${all.filter((p) => p.live).length} live and ${all.filter((p) => !p.live).length} retired projects into docs/`);
