# Context Secret Services

A stylized 3D detective game for Reddit. Play as a calico cat investigator, step into the scene behind a misleading photograph, collect evidence, reconstruct the missing context, and share your interpretation with the community.

Source and runtime assets correspond to the deployed Devvit **v0.0.12** playtest. The current authored case is **The Comeback Cake**. Its CEO firing/rehiring scenario is fictional, not a real news report.

- [Playtest post](https://www.reddit.com/r/ContextSecretServices/comments/1y66m9x/context_secret_services_case_001_the_comeback/)
- [Community](https://www.reddit.com/r/ContextSecretServices/)
- [Devvit app](https://developers.reddit.com/apps/context-secret-svc)

## Repository layout

| Directory | Contents |
| --- | --- |
| `context-secret-services-demo/` | Vite/React/Three.js client, Devvit server/configuration, tests, bundled music, illustrations, fonts and GLB models |
| `character-production/` | Blender scripts for construction, rigging, animation and rendering; source geometry and license notices |
| `design-references/context-secret-services/` | Final calico turnaround and primary 3D appearance reference |

## Run locally

Use Node.js and npm (the current Devvit CLI recommends Node.js 24).

```sh
cd context-secret-services-demo
npm ci
npm run dev
```

Open the URL printed by Vite. `/game.html` previews the expanded landscape wrapper; `/characters.html` opens the character studio. No AI API key is required to play this authored case. Reddit-dependent community features require a Reddit/Devvit context.

## Test and build

```sh
cd context-secret-services-demo
npm test
npm run build
```

The 24 tests cover case logic, exploration, containers, movement/collision, landscape layout, POV, character animation and community-report filtering. Device-specific appearance and the live player/moderator sharing flow still require manual checks.

## Deploy to Reddit

Authenticate the official Devvit CLI with your own Reddit developer account. The checked-in configuration targets the existing `context-secret-svc` app and `ContextSecretServices` community; another account requires configuring an app/subreddit you control.

```sh
cd context-secret-services-demo
npx devvit upload
npx devvit install ContextSecretServices
```

Upload runs the client and server build commands in `devvit.json`. Credentials are not included. To create a playtest post, use the moderator menu item **Create Context Secret Services case** in the configured subreddit.

## Character production

Exported GLB assets are included, so Blender is not needed to run the game. To rebuild the calico model with Blender 4.5:

```sh
blender --background --python character-production/animate_calico.py
```

Copy `character-production/output/calico-animated/calico-detective.glb` to `context-secret-services-demo/public/models/calico-detective.glb`. The builder applies geometry/reference/silhouette refinements and exports Idle, Walk and Inspect clips. See `character-production/ANIMATION-UPDATE.md`.

## Community and content status

Reports are previewed/copied, explicitly posted by players in Reddit comments, and shown in-game only after moderator approval and eligibility filtering. See `context-secret-services-demo/COMMUNITY-FLOW.md`. Discussion and support use Reddit. Only Case 001 exists; leaderboards, additional recurring cases and a release scheduler are not implemented. Live AI case generation is deferred.

## Included and excluded files

Application code, configuration, lockfile, tests, required runtime assets, authoring scripts and existing third-party notices are included. Installed dependencies, generated build/render output, downloaded Blender binaries, credentials, logs, hosting metadata and old fallback archives remain outside Git. Fallback archives remain in the original local workspace.

Preserve bundled font notices and character source licenses when distributing. Asset provenance is recorded in `character-production/ASSET-LICENSES.txt`; third-party rights are not replaced by package metadata.
