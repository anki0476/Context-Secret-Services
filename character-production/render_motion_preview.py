import bpy
from pathlib import Path
root=Path(__file__).resolve().parent/'output'/'calico-animated'
bpy.ops.wm.open_mainfile(filepath=str(root/'calico-animated.blend'))
scene=bpy.context.scene;rig=bpy.data.objects['CalicoRig']
for track in rig.animation_data.nla_tracks:
 track.mute=track.name!='Walk'
 if track.name=='Walk':track.strips[0].repeat=2
scene.frame_start=1;scene.frame_end=48;scene.render.fps=30
scene.cycles.samples=8;scene.render.resolution_x=384;scene.render.resolution_y=480
scene.render.image_settings.file_format='FFMPEG';scene.render.ffmpeg.format='MPEG4';scene.render.ffmpeg.codec='H264';scene.render.ffmpeg.constant_rate_factor='MEDIUM'
scene.render.filepath=str(root/'calico-walk-preview.mp4')
bpy.ops.render.render(animation=True)
