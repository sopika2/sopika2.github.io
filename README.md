# Saekoto — projects site

A plain portfolio: what I am working on now, then the projects that are finished or dead, one short page each. Served by GitHub Pages from the `docs/` folder.

## Editing

- One file per project in `projects/<slug>.md`. The front matter holds `title`, `born`, `summary`, either `status: live` or `died: <year>`, and any number of `link: label | url` lines. The body is paragraphs separated by blank lines; nothing else is rendered.
- Live projects are listed under "Shipped", newest first. The rest go under "Shelved", newest death first.
- The name, intro sentence and contact links are at the top of `build.js`.
- The look comes from `style.css`, which mirrors the Project Graveyard design system.

## Building

```
node build.js
```

writes everything into `docs/`. Commit `docs/` along with the source; GitHub Pages serves it as is, with no build step.

## Hosting on GitHub Pages

Push this repository to GitHub as `sopika2.github.io`, then in Settings → Pages choose "Deploy from a branch", branch `main`, folder `/docs`. The site is live at `https://sopika2.github.io/` a minute later. No domain or hosting cost.

## Placeholders to correct

The years, summaries and causes of death of the earlier projects were written from memory as a first draft. Check every file in `projects/` before publishing. The three Nexus mods and NeilaReacts have no links yet; add `link:` lines when you have the URLs. Add an email or Upwork link to `CONTACT` in `build.js` if you want one on the page.
