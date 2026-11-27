# Calico movement update — 2026-11-27

## Second reference refinement

The pre-refinement game and character-production files are preserved in
`../fallback-v0.0.11-before-reference-refinement/`. Its previous GLB SHA-256 is
`0F6CAB57D02A510B6D50BCB191BA860B9EE9FAE0FAE67DD731D13AEB146DC91F`.
The primary four-angle target is `calico-3d-target.png` in design-references.

The builder now runs `refine_calico_reference.py` and
`refine_calico_silhouette.py` after the original geometry refinement, before
skinning. These add an integrated lower face, shallower cheeks, recessed green
eyes, softly tapered ears, a fitted checked cap, woven taupe trench, flared hem,
shoulder cape, folded lapels, matte covered buckle, tapered sleeves, and a lower
curled tail with a rounded ivory tip. Eye size is not increased. Existing
Idle/Walk/Inspect clips and movement controls remain in use.

The tail control points follow the rebuilt tail; sleeve/cuff ancestry retains
forearm binding. Ear weights use explicit mesh prefixes, so the cap's rear peak
is no longer accidentally treated as an ear. Mesh UV projection now deselects
other objects first to preserve the painted head UVs.

Additional validation renders: `reference-front.png`, `reference-side.png`,
`reference-rear.png`, plus the existing idle, walk, and inspection views. These
are renders of the actual model, not illustrations of a proposed result.

Final asset: 5,813,940 bytes, SHA-256
`1AFDBD75DAD8A3AB144ACA2F127A4898C502157809FBE2D23F566F816DA2144F`.
All 24 game tests passed against this export, including an additional regression
test for rear hat-brim bone weights. The Devvit client/server build succeeded and
the app upload was bumped to 0.0.12. The asset is larger than the saved 0.0.11
model (4,013,140 bytes); real-device rendering/performance remains a manual check.
Devvit confirmed that version 0.0.12 was successfully installed to
`r/ContextSecretServices` on 2026-11-27.

## Original animation implementation

Fallback: `../fallback-v0.0.9-before-character-animation/` contains the previous
game source, assets, built bundles and previous character-production sources/output.
The previous GLB hash was verified against the saved copy before replacement.
Restore from its `game` directory into a separate checkout and upload/install that
build if needed. Do not overwrite the new working copy to perform a rollback.

`animate_calico.py` reuses the approved calico geometry from `build_calico.py`,
then applies a weighted skeleton with hips/spine/head, knees/ankles, elbows,
ears, eye controls and a tail chain. Boots were made more continuous. The
new user turnaround is saved at
`../design-references/context-secret-services/calico-turnaround-final.png`.

Output: `output/calico-animated/calico-detective.glb` and editable
`calico-animated.blend`. Exported actions: Idle, Walk, Inspect.
The GLB is copied into the game's `public/models/calico-detective.glb`.

The walk uses a two-link leg solution with a planted stance and lifted swing,
plus counter-rotation, breathing, blinking and tail motion. Runtime cadence is
driven by measured movement after collision resolution. Acceleration and braking
replace instant full-speed movement; pause/restart cancel momentum. Inspect
turns toward the selected object and briefly raises the inspection hand. It is
an inspect gesture, not a fully object-specific grasp/hand-contact simulation.
The human host receives subtle runtime breathing and looking around.

Rebuild:
`tools/blender-4.5.9-windows-x64/blender.exe --background --python animate_calico.py`

Validation: actual exported GLB loaded in Three.js by tests (textures omitted in
Node), checking skeleton/clips, planted-foot height, idle change, finite blended
poses and movement/collision behavior. Blender renders reviewed at idle, two walk
poses and inspection. Browser local preview connection timed out; real Reddit
desktop/mobile movement feel and performance remain manual checks.

This improves the existing reference interpretation; it is not a claim of a
perfect sculpt reconstruction or production motion capture. It does not add
cloth simulation, ground-adaptive foot IK, or a full human NPC animation library.

The later supplied `calico-3d-target.png` is the primary appearance reference.
`refine_calico_geometry.py` refines painted fur markings, ears, eyes, fabric,
lapels and boot geometry before skinning. The extra notebook and magnifier prop
were removed to match that reference. The model is still an approximation,
not an exact reconstruction of the supplied rendered turnaround.
