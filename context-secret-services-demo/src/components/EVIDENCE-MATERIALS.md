# Evidence material components

PaperCrumple, HoloCard, and TearTicket are the JavaScript + CSS components supplied by the user from React Bits on 26 November 2026. The only source adaptation is adding the default React import for this project's JSX transform.

`inspection-materials.jsx` selects the surface from each clue's explicit `material` field. The receipt and cold-storage log are paper. The phone, sugar plaque, and rigid printed welcome sign use HoloCard. Evidence text is unchanged, and original local SVG artwork lives in `evidence-artwork.js`.

Paper restores to a readable flat sheet after release. Holographic glare is restrained, and the phone has a weaker sheen. Reduced motion displays the original still image. Closing the inspection unmounts its WebGL surface; collected evidence is never modified by the effect.

TearTicket is retained for future ticket-shaped clues, not loaded into the current game bundle. Its `motion` dependency is already present. There is no ticket or tear-to-collect requirement in this case.

With Vite running, `/tools/material-preview.html` reviews all five surfaces without replaying the case. This developer page is not a production build entry.
