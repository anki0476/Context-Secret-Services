# Context Secret Services character models

The current investigator is the calico cat built by `animate_calico.py`. It applies `refine_calico_geometry.py`, `refine_calico_reference.py` and `refine_calico_silhouette.py`, then exports a skinned GLB with Idle, Walk and Inspect animations. See `ANIMATION-UPDATE.md`. The final GLB is bundled in the game's `public/models` folder. Generated Blender/output files and downloaded Blender binaries are excluded from Git; use a Blender 4.5 installation to rebuild them. The human model notes below document the earlier model pipeline and the remaining party host.

This implements the selected base-mesh approach, without a paid generation service.

## Files

- `output/detective/detective.blend` and `.glb`: investigator with teal jacket, coral shirt and satchel.
- `output/party-host/party-host.blend` and `.glb`: silver-haired party host with glasses.
- Each output folder contains full-body, face and walk-pose renders.
- `build_detective.py`: reproducible Blender authoring script.
- `ASSET-LICENSES.txt`: source provenance. MakeHuman graphical assets are CC0.

## Rebuild

Run the portable `tools/blender-4.5.9-windows-x64/blender.exe` with `--background --python build_detective.py`. Add `-- --host` to build the host. Run `node validate-glb.mjs` afterwards.

Copy each resulting GLB into the demo's `public/models/` directory. The game and `/characters.html` viewer share those files. The viewer supports orbit, zoom, model switching and a standing/walking toggle. The game blends between the standing pose and the walk animation in response to joystick or keyboard movement.

## Scope and limitations

These are editable first-pass stylized models, not image-to-3D reconstructions of the references. They have a human anatomical base, separate fingers, skeletal weights, authored garments, simple PBR color materials and a one-second walking loop. Clothing fit, hair sculpting, facial expression and hand animation need further artistic refinement. There are no baked fabric/skin texture maps or mobile LODs yet; each export is approximately 3.2 MB and 105,000 triangles.

The game is now deployed through Devvit Web. No fal credits or other paid generation calls were used for these authored models.
