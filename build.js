// Builds the static site into dist/ from projects/*.md. No dependencies.
// Run: node build.js
//
// Each projects/<slug>.md looks like:
//
//   ---
//   title: NeilaReacts
//   born: 2025
//   died: 2026
//   summary: One sentence shown in the list.
//   link: source on GitHub | https://github.com/...
//   link: the mod on Nexus | https://www.nexusmods.com/...
//   ---
//   Paragraphs separated by blank lines. No markdown beyond that.
//
// Entries are listed newest death first, then by title.

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SRC = path.join(ROOT, "projects");
const OUT = path.join(ROOT, "dist");
const SITE = "Project Graveyard";
const INTRO = "Projects I built and no longer use. All of them are dead. Each one has a short page.";

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
  for (const k of ["title", "born", "died", "summary"]) if (!meta[k]) throw new Error(`${file}: missing ${k}`);
  return { slug, ...meta, paragraphs };
}

const years = (p) => (p.born === p.died ? p.born : `${p.born} – ${p.died}`);

function page({ title, body, depth }) {
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
<main>
${body}
</main>
</body>
</html>
`;
}

function entry(p) {
  return `  <li>
    <a href="${p.slug}/">${esc(p.title)}</a>
    <p class="small">${esc(years(p))}</p>
    <p class="muted">${esc(p.summary)}</p>
  </li>`;
}

function project(p) {
  const paras = p.paragraphs.map((t) => `<p>${esc(t)}</p>`).join("\n");
  const links = p.links.length
    ? `<p class="links">${p.links.map((l) => `<a href="${esc(l.url)}">${esc(l.label)}</a>`).join("\n")}</p>`
    : "";
  return `<p class="small"><a href="../">${esc(SITE)}</a></p>
<h1>${esc(p.title)}</h1>
<p class="small">${esc(years(p))}</p>
<p class="muted">${esc(p.summary)}</p>
${paras}
${links}`;
}

const projects = fs
  .readdirSync(SRC)
  .filter((f) => f.endsWith(".md"))
  .map((f) => parse(path.join(SRC, f)))
  .sort((a, b) => b.died - a.died || a.title.localeCompare(b.title));

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.copyFileSync(path.join(ROOT, "style.css"), path.join(OUT, "style.css"));

fs.writeFileSync(
  path.join(OUT, "index.html"),
  page({
    title: SITE,
    depth: 0,
    body: `<h1>${esc(SITE)}</h1>\n<p class="muted">${esc(INTRO)}</p>\n<ul class="list">\n${projects.map(entry).join("\n")}\n</ul>`,
  })
);

for (const p of projects) {
  const dir = path.join(OUT, p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), page({ title: `${p.title} · ${SITE}`, depth: 1, body: project(p) }));
}

console.log(`built ${projects.length} projects into dist/`);
