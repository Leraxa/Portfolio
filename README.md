# Leraxa Portfolio

A responsive, gallery-first portfolio built with HTML, CSS and JavaScript, served by Express.

## Run

Use Node.js and run:

    npm install
    npm start

Open http://localhost:3000. Use PORT to select another port; set NO_OPEN=1 to suppress automatic browser opening.

## Content and design

- public/data/portfolio.json: artwork titles, categories and image paths. All 27 original artworks are retained.
- public/css/style.css: design tokens, layouts, responsive rules and themes.
- public/js/main.js: gallery rendering, filters, persistent theme and accessible native dialog.
- public/index.html: page structure and introduction.

Artwork titles inferred from filenames are editorial labels; review them before publication.
Existing GitHub and YouTube links are retained. Empty software/icon sections were removed rather than populated with invented projects.

## Future json-render integration

Reference: https://json-render.dev/docs

The current site does not load json-render or use an AI service. The JSON content file is an ordinary content model, **not** a json-render spec.

For the migration:
1. Introduce a React build while retaining Express as the static server.
2. Define a catalog with @json-render/core and the React schema from @json-render/react/schema. Suggested components: PortfolioHero, ArtworkGallery, AboutSection.
3. Implement those components in a registry with @json-render/react, preserving these CSS tokens and interaction semantics.
4. Create a validated spec containing root and elements; map portfolio.json into component props or state. Render the spec through the registry.
5. Keep artwork paths and external destinations constrained to trusted content. AI generation is optional; a hand-authored spec is sufficient.

Check the current json-render documentation and package compatibility when performing that migration. Keeping the content independent now avoids tying the visual redesign to an unnecessary framework migration.

## Project cards and GitHub history

Edit public/data/profile.json to curate software projects and profile facts. Descriptions are based on the public project READMEs; profile facts use public GitHub information. Preview graphics are decorative illustrations.

GET /api/github/commits uses GitHub's public commit search for author:Leraxa and returns the latest six indexed commits. It is not the contribution calendar or a complete history: private and unindexed commits are absent. No token is required. Requests have an eight-second timeout, share an in-flight request and cache results for fifteen minutes. After an upstream failure, the last successful result is labelled stale; retries back off for one minute. With no cached result the API returns 503 and the UI offers a retry and profile link.

Requires Node.js 22+. Run npm test for cache, concurrent request, empty result and failure behavior checks.
