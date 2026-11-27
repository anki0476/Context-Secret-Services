"""Preserve the approved calico design; add weighted joints and authored actions.
Run with Blender --background --python animate_calico.py.
"""
from pathlib import Path
import math, json
import bpy
from mathutils import Vector, Quaternion

ROOT=Path(__file__).resolve().parent
# Reuse the actual reference-based geometry, not a second approximate character.
source=(ROOT/'build_calico.py').read_text(encoding='utf-8')
exec(compile(source.split('# Export a named node animation')[0],str(ROOT/'build_calico.py'),'exec'))
exec(compile((ROOT/'refine_calico_geometry.py').read_text(encoding='utf-8'),str(ROOT/'refine_calico_geometry.py'),'exec'))
exec(compile((ROOT/'refine_calico_reference.py').read_text(encoding='utf-8'),str(ROOT/'refine_calico_reference.py'),'exec'))
exec(compile((ROOT/'refine_calico_silhouette.py').read_text(encoding='utf-8'),str(ROOT/'refine_calico_silhouette.py'),'exec'))
# Replace separated boot bubbles with a continuous tailored shaft and overlapping toe.
for ob in list(objects):
 if any(ob.name.startswith(n) for n in ['Tall boot shaft','Rounded boot toe','Boot sole']):
  objects.remove(ob);bpy.data.objects.remove(ob,do_unlink=True)
for side in [-1,1]:
 leg=bpy.data.objects.get('Leg_'+str(side))
 # A single continuous boot surface grows into the toe; no floating sole layers.
 levels=[(-.442,.080,.125,-.04),(-.43,.090,.14,-.04),(-.395,.09,.14,-.04),(-.36,.082,.097,-.005),(-.25,.088,.083,0),(-.20,.093,.089,0)]
 vs=[];fs=[];n=40
 for z,rx,ry,cy in levels:
  for i in range(n):a=i*math.tau/n;vs.append((rx*math.sin(a),cy+ry*math.cos(a),z))
 for j in range(len(levels)-1):
  for i in range(n):fs.append((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i))
 fs.extend([tuple(range(n-1,-1,-1)),tuple((len(levels)-1)*n+i for i in range(n))]);mesh('Tailored boot',vs,fs,leather,leg,1)
bpy.context.view_layer.update()
parts=[]
for ob in list(objects):
 if ob.type not in {'MESH','CURVE'}:continue
 ancestry=[];p=ob.parent
 while p:ancestry.append(p.name);p=p.parent
 matrix=ob.matrix_world.copy()
 bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
 if ob.type=='CURVE':bpy.ops.object.convert(target='MESH')
 for modifier in list(ob.modifiers):bpy.ops.object.modifier_apply(modifier=modifier.name)
 ob.parent=None;ob.matrix_world=matrix
 bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 parts.append((ob,ancestry))

arm=bpy.data.armatures.new('Calico articulated skeleton');rig=bpy.data.objects.new('CalicoRig',arm);bpy.context.collection.objects.link(rig)
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);bpy.context.view_layer.objects.active=rig;bpy.ops.object.mode_set(mode='EDIT')
def bone(name,a,b,parent=None):
 x=arm.edit_bones.new(name);x.head=a;x.tail=b
 if parent:x.parent=arm.edit_bones[parent]
bone('Root',(0,0,0),(0,0,.2))
bone('Hips',(0,0,.49),(0,0,.76),'Root')
bone('Spine',(0,0,.76),(0,0,1.16),'Hips')
bone('Head',(0,0,1.42),(0,0,1.72),'Spine')
for s in [-1,1]:
 suffix='L' if s==-1 else 'R'
 bone('Thigh'+suffix,(s*.135,0,.49),(s*.135,0,.27),'Hips')
 bone('Shin'+suffix,(s*.135,0,.27),(s*.135,0,.07),'Thigh'+suffix)
 bone('Foot'+suffix,(s*.135,0,.07),(s*.135,-.16,.07),'Shin'+suffix)
 bone('UpperArm'+suffix,(s*.28,0,1.04),(s*.31,-.01,.83),'Spine')
 bone('Forearm'+suffix,(s*.31,-.01,.83),(s*.32,-.02,.64),'UpperArm'+suffix)
 bone('Ear'+suffix,(s*.30,0,1.60),(s*.36,0,1.94),'Head')
 bone('Eye'+suffix,(s*.178,-.27,1.455),(s*.178,-.27,1.55),'Head')
tailpoints=[Vector((0,.15,.52))+Vector(points[i]) for i in [0,2,4,6,7]]
for i in range(4):bone('Tail'+str(i),tailpoints[i],tailpoints[i+1],'Hips' if i==0 else 'Tail'+str(i-1))
bpy.ops.object.mode_set(mode='OBJECT')
def smooth(a,b,x):
 t=max(0,min(1,(x-a)/(b-a)));return t*t*(3-2*t)
def pair(a,b,t):return {a:1-t,b:t}
for ob,ancestry in parts:
 groups={name:ob.vertex_groups.new(name=name) for name in arm.bones.keys()}
 for v in ob.data.vertices:
  x,y,z=v.co;suffix='L' if x<0 else 'R';w={'Spine':1}
  if 'Head' in ancestry:
   w={'Head':1}
   if ob.name.startswith(('Soft velvet ear','Rose ear inset')):w={'Ear'+suffix:1}
   if any(token in ob.name for token in ['Eye socket','Emerald iris','Large pupil','Catchlight','Small catchlight']):w={'Eye'+suffix:1}
  elif any(a.startswith('Leg_') for a in ancestry):
   if z>.27:w=pair('Shin'+suffix,'Thigh'+suffix,smooth(.23,.33,z))
   else:w=pair('Foot'+suffix,'Shin'+suffix,smooth(.095,.20,z))
  elif any(a.startswith('Arm_') for a in ancestry):
   if 'Magnifier' in ob.name:w={'Forearm'+suffix:1}
   else:w=pair('Forearm'+suffix,'UpperArm'+suffix,smooth(.76,.91,z))
  elif 'Tail' in ancestry:
   # Blend between nearest tail controls along the curved centerline.
   near=sorted(range(4),key=lambda i:(v.co-tailpoints[i]).length)[:2]
   d0=(v.co-tailpoints[near[0]]).length;d1=(v.co-tailpoints[near[1]]).length
   w=pair('Tail'+str(near[0]),'Tail'+str(near[1]),d0/max(.00001,d0+d1))
  else:
   w=pair('Hips','Spine',smooth(.65,1.02,z))
   if 'Trench coat' in ob.name and z<.65:
    t=(1-smooth(.40,.65,z))*.30;w={k:a*(1-t) for k,a in w.items()};w['Thigh'+suffix]=t
  for name,value in w.items():
   if value>0:groups[name].add([v.index],value,'REPLACE')
 ob.parent=rig;mod=ob.modifiers.new('Soft articulated skin','ARMATURE');mod.object=rig
 # Preserve volumes through elbows and knees in Blender; exported skin uses linear weights.
 mod.use_deform_preserve_volume=True

# Put the sole on the origin plane; game root already supplies the tile clearance.
rig.location.z=-.04
def rot(name,axis,angle):
 p=rig.pose.bones[name];p.rotation_mode='QUATERNION'
 local=arm.bones[name].matrix_local.to_quaternion().inverted()@Vector(axis)
 p.rotation_quaternion=Quaternion(local,angle)
def legpose(suffix,forward,lift,hip):
 # Two-link sagittal IK. A planted foot travels backwards at constant speed.
 down=.42+hip-lift;d=min(.419,max(.15,math.hypot(down,forward)))
 knee=math.pi-math.acos(max(-1,min(1,(.22**2+.20**2-d*d)/(2*.22*.20))))
 thigh=math.atan2(forward,down)+math.acos(max(-1,min(1,(.22**2+d*d-.20**2)/(2*.22*d))))
 rot('Thigh'+suffix,(1,0,0),-thigh);rot('Shin'+suffix,(1,0,0),knee);rot('Foot'+suffix,(1,0,0),thigh-knee)
def pose(kind,t,duration):
 for p in rig.pose.bones:p.location=(0,0,0);p.rotation_mode='QUATERNION';p.rotation_quaternion=Quaternion();p.scale=(1,1,1)
 phase=t/duration*math.tau
 hip=-.040
 if kind=='Walk':hip+=.007*math.cos(phase*2)
 rig.pose.bones['Hips'].location=arm.bones['Hips'].matrix_local.to_quaternion().inverted()@Vector((0,0,hip))
 for i,suffix in enumerate(['L','R']):
  forward=0;lift=0;p=(t/duration+i*.5)%1
  if kind=='Walk':
   if p<.62:forward=.16-.32*p/.62
   else:
    u=(p-.62)/.38;forward=-.16+.32*smooth(0,1,u);lift=.09*math.sin(math.pi*u)**1.3
  legpose(suffix,forward,lift,hip)
  armwave=math.sin(phase+i*math.pi) if kind=='Walk' else .12*math.sin(phase)
  rot('UpperArm'+suffix,(1,0,0),.17*armwave)
  rot('Forearm'+suffix,(1,0,0),-.14-.07*max(0,-armwave))
  rot('Ear'+suffix,(0,1,0),.018*math.sin(phase+i*.8))
 if kind=='Idle':
  rot('Spine',(0,1,0),.012*math.sin(phase));rot('Head',(0,0,1),.025*math.sin(phase))
  rig.pose.bones['Spine'].scale.y=1+.006*math.sin(phase)
  blink=max(0,1-abs(t-2.3)/.13)
  for suffix in ['L','R']:rig.pose.bones['Eye'+suffix].scale.y=1-.94*blink
 elif kind=='Walk':
  rot('Hips',(0,0,1),.045*math.sin(phase));rot('Spine',(0,0,1),-.065*math.sin(phase))
  rot('Head',(0,0,1),.022*math.sin(phase));rot('Spine',(1,0,0),.035)
 else:
  reach=math.sin(math.pi*t/duration)**2
  rot('Spine',(1,0,0),.10*reach);rot('Head',(1,0,0),.16*reach)
  rot('UpperArmL',(1,0,0),-.65*reach);rot('ForearmL',(1,0,0),-.14-.75*reach)
 for i in range(4):rot('Tail'+str(i),(0,0,1),(.035 if kind=='Walk' else .055)*math.sin(phase-i*.55))

scene.render.fps=30
for kind,duration in [('Idle',4),('Walk',.8),('Inspect',1.1)]:
 rig.animation_data_create();action=bpy.data.actions.new(kind);rig.animation_data.action=action
 frames=round(duration*30)
 for frame in range(frames+1):
  pose(kind,frame/30,duration)
  for p in rig.pose.bones:
   for prop in ['location','rotation_quaternion','scale']:p.keyframe_insert(data_path=prop,frame=frame+1,group=p.name)
 track=rig.animation_data.nla_tracks.new();track.name=kind;track.strips.new(kind,1,action);track.mute=True;rig.animation_data.action=None
pose('Idle',0,4)
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True)
for ob,_ in parts:ob.select_set(True)
bpy.context.view_layer.objects.active=rig
OUT=ROOT/'output'/'calico-animated';OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'calico-detective.glb'),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_apply=False,export_yup=True,export_force_sampling=True)
# Studio preview/contact sheet is rendered from the actual rig and poses.
floor=mat('Studio floor',(.15,.21,.24));bpy.ops.mesh.primitive_plane_add(size=200);bpy.context.object.data.materials.append(floor)
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.36,.43,.49,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.5
for loc,power,size in [((-3,-4,5),450,4),((3,-1,3),250,3),((0,3,4),500,3)]:
 bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.data.energy=power;l.data.shape='DISK';l.data.size=size;l.rotation_euler=(Vector((0,0,1))-l.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(2.5,-5,2.5));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,1))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=2.65;scene.camera=cam
scene.render.engine='CYCLES';scene.cycles.samples=16;scene.cycles.use_denoising=True;scene.render.resolution_x=520;scene.render.resolution_y=640;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='AgX'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'calico-animated.blend'))
for kind,t in [('Idle',0),('Walk',.12),('Walk',.32),('Inspect',.55)]:
 pose(kind,t,{'Idle':4,'Walk':.8,'Inspect':1.1}[kind]);bpy.context.view_layer.update();scene.render.filepath=str(OUT/f'{kind}-{t}.png');bpy.ops.render.render(write_still=True)
pose('Idle',0,4)
for name,position in [('front',(0,-5,1.12)),('side',(5,0,1.12)),('rear',(0,5,1.12))]:
 cam.location=position;cam.rotation_euler=(Vector((0,0,1.02))-cam.location).to_track_quat('-Z','Y').to_euler();bpy.context.view_layer.update();scene.render.filepath=str(OUT/f'reference-{name}.png');bpy.ops.render.render(write_still=True)
print('ANIMATED CALICO READY',OUT)
