# stisim.github.io

Public front door for STIsim: a static [Eleventy](https://www.11ty.dev) site that positions the model, points at the docs, and navigates the research done with it. It is not the docs. Tutorials and the API reference stay in Quarto at docs.stisim.org; this site links out to them.

## Run locally

```bash
npm install
npm run dev        # http://localhost:8080, with live reload
npm run build      # static output to ./_site
npm run serve      # serve the built ./_site
```

## Add or edit a study

Every study is one file in `src/research/`. Frontmatter is validated at build time by `src/research/research-validation.js`, so a malformed entry fails the build instead of shipping broken. Defaults for the optional fields live in `src/research/research.11tydata.js`.

Card behaviour is derived, never stored:

| `dashboardUrl` | `status`   | Renders as          | Click target       | Study page? |
| -------------- | ---------- | ------------------- | ------------------ | ----------- |
| set            | any        | Live-dashboard card | the external URL   | no          |
| unset          | published  | Writeup card        | /research/{slug}/  | yes         |
| unset          | in-flight  | Writeup card        | /research/{slug}/  | yes         |
| unset          | upcoming   | Writeup card        | /research/{slug}/  | yes         |

A publication is just an output with `kind: paper`; the card counts those.

## Layout

```
eleventy.config.js          collections, filters, passthrough copy, site metadata, sitemap
public/                     copied to the site root: site.css, site.js, CNAME, favicon, logos
src/index.njk               the single-page front door: hero, model, research grid
src/research/*.md           one file per study, with the frontmatter schema alongside
src/includes/               base.njk, study.njk, and header, footer, component macros
```

## Deploy to GitHub Pages

The workflow in `.github/workflows/publish.yml` builds and deploys on every push to `main`. It needs Settings → Pages → Build and deployment → Source set to **GitHub Actions**.

Custom domain: `public/CNAME` holds `stisim.org`. In Settings → Pages set the custom domain to `stisim.org` and add the matching DNS record with your provider.

If the site is ever served from a subpath instead (e.g. `stisim.github.io/stisim.github.io`), pass the prefix at build time — every internal link already goes through Eleventy's `url` filter:

```bash
npx eleventy --pathprefix=/subpath/
```

## Notes

- Styling is plain CSS with tokens at the top of `public/site.css`, not Tailwind, so the look is bespoke and the dependency list stays at one package.
- The only client-side JavaScript is the theme toggle and the research filter (`public/site.js`), plus a tiny inline script that applies a saved theme before first paint. Page transitions use the browser's native cross-document view transitions where supported, so there is no router.
- Dark mode follows the OS setting via `prefers-color-scheme`, overridable by the toggle and remembered in `localStorage`.
