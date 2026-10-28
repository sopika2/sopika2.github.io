# Project Graveyard

The site at projects.niijimasisters.com: a plain list of dead projects, one short page each.

## Editing

- One file per project in `projects/<slug>.md`. The front matter holds `title`, `born`, `died`, `summary` and any number of `link: label | url` lines. The body is paragraphs separated by blank lines; nothing else is rendered.
- The list is ordered by `died`, newest first.
- The look comes from `style.css`, which mirrors the Project Graveyard design system.

## Building

```
node build.js
```

writes everything into `dist/`. No dependencies.

## Deploying on Cloudflare Pages

Connect this repository, set the build command to `node build.js` and the output directory to `dist`, then add `projects.niijimasisters.com` as a custom domain.

## Placeholders to correct

Years, summaries and causes of death were written from memory as a first draft. Check every file in `projects/` before publishing. The three Nexus mods and NeilaReacts have no links yet; add `link:` lines when you have the URLs.
