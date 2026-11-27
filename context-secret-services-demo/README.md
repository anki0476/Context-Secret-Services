# Context Secret Services — The Comeback Cake

A 3D detective playtest built with Three.js and React, packaged for Devvit Web. App: https://developers.reddit.com/apps/context-secret-svc
Community: https://www.reddit.com/r/ContextSecretServices/

## Development

- `npm install`
- `npm run dev`: standalone local preview.
- `npm test`: gameplay checks.
- `npx devvit upload`: builds client and server and uploads a private app version.
- `npx devvit install ContextSecretServices`: updates the community installation.
- Community overflow menu → Create Context Secret Services case: creates a playable post (moderators only).

## Playtest

Open the interactive post in current desktop Reddit or the Reddit iOS/Android app. Choose Investigate, then Start Game. Chief Marlowe introduces the fictional case. Move with the joystick or WASD/arrows, approach props and inspect them, open crates with repeated clicks, review evidence in the folder, and connect the clues. Detective tools include hints and the case briefing. Pause offers music and navigation controls.

The inline newspaper opens the `game` entry in Reddit's expanded view. That entry hosts the game in a same-origin iframe. On a portrait mobile viewport (or a narrow viewport up to 600px), it swaps the iframe dimensions and turns it 90 degrees, giving the game a real landscape viewport even when Reddit keeps its native view locked upright. Holding the phone sideways makes it readable. When the host supplies landscape dimensions, rotation is removed without reloading the session. This does not request or guarantee an OS orientation lock. Real iOS/Android verification remains necessary; a desktop viewport simulation does not establish native-app compatibility. Preview the wrapper locally at `/game.html`.

## Case and content

The CEO firing/rehiring premise is fictional, inspired by a hypothetical example rather than a real news report. The team reused an earlier farewell cake. All case dialogue and fictional reactions belong to this authored mystery.

Only Case 001 is implemented. Weekly manually authored content is planned; there is no automatic news retrieval, AI generation, or release scheduler. Reports are previewed/copied and explicitly posted by players in Reddit comments. The in-game gallery reads eligible moderator-approved reports from those comments. See COMMUNITY-FLOW.md for moderation rules and remaining live verification. Feedback and spoiler-marked discussion use Reddit.

## Assets

DM Sans and Manrope are bundled locally; their OFL notices are in public/licenses. Geometry is authored in Three.js with generated textures and supplied AI-created art/music. Keep source provenance and component licenses when distributing. This integration does not enable external HTTP access or an AI API.
