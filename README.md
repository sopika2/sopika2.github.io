# Saekoto — projects site

A small portfolio: data tools, web work and game mods, one short page each, with a menu by category. Served by GitHub Pages from the `docs/` folder.

## Editing

- One file per project in `projects/<slug>.md`. The front matter holds `title`, `category` (`data`, `web` or `modding`), `born`, `summary`, either `status: live` or `died: <year>`, and any number of `link: label | url` lines. The body is paragraphs separated by blank lines; nothing else is rendered.
- Each category is a section on the index with a menu link at the top. Inside a section, live projects come first, then retired ones.
- The name, intro sentence, categories (title and one-line blurb) and contact links are at the top of `build.js`.
- The look comes from `style.css`, built on the Project Graveyard design system tokens.

## Building

```
node build.js
```

writes everything into `docs/` as flat files (`index.html`, `<slug>.html`), so you can also open `docs/index.html` straight from disk and every link works. Commit `docs/` along with the source; GitHub Pages serves it as is, with no build step, and also answers `/<slug>` without the extension.

## Hosting on GitHub Pages

Push this repository to GitHub as `sopika2.github.io`, then in Settings → Pages choose "Deploy from a branch", branch `main`, folder `/docs`. The site is live at `https://sopika2.github.io/` a minute later. No domain or hosting cost.

## To fill in

- The three mods have no Nexus links yet; add a `link: on Nexus Mods | <url>` line to each.
- Years for the mods are guesses.
- Add an email or Upwork link to `CONTACT` in `build.js` if you want one in the footer.
