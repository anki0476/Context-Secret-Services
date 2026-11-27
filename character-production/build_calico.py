"""Authored 3D interpretation of the user's final calico detective turnaround.
No external model service. Editable Blender source, textured GLB, and Walk clip.
Blender Z up, front -Y; glTF export converts to Y up / front +Z.
"""
import bpy, math, random
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parent
OUT=ROOT/'output'/'calico-detective';OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
objects=[]
def mat(name,col,rough=.65,metal=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*col,1);m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*col,1);bs.inputs['Roughness'].default_value=rough;bs.inputs['Metallic'].default_value=metal
 return m
def fabric(name,base,check=False):
 m=mat(name,base);im=bpy.data.images.new(name+' woven texture',width=256,height=256);pixels=[]
 random.seed(19)
 for y in range(256):
  for x in range(256):
   weave=(.87 if (x+y)%4<2 else 1.06)+random.random()*.05
   if check:weave*=.58 if (x//4+y//4)%2==0 else 1.07
   if check and (x%64<2 or y%64<2):weave*=.55
   pixels.extend([min(1,c*weave) for c in base]+[1])
 im.pixels.foreach_set(pixels);im.pack();tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=im
 m.node_tree.links.new(tex.outputs['Color'],m.node_tree.nodes.get('Principled BSDF').inputs['Base Color']);return m
fur=mat('Honey ginger',(.72,.31,.035));dark=mat('Calico espresso',(.045,.012,.009));white=mat('Ivory muzzle and paws',(.92,.84,.68));pink=mat('Warm rose inner ears',(.9,.26,.37));nose=mat('Rose nose',(.57,.14,.21),.4)
coat=fabric('Warm herringbone trench',(.48,.35,.20));hat=fabric('Checked deerstalker wool',(.46,.39,.27),True);edge=mat('Dark tailored piping',(.17,.095,.045));lapel=mat('Collar facing',(.37,.27,.16));leather=mat('Oxblood boot leather',(.10,.022,.012),.34);brass=mat('Aged brass',(.5,.32,.10),.32,.65);iris=mat('Leaf green iris',(.30,.74,.065),.28);irisedge=mat('Dark green eye rim',(.085,.22,.045));pupil=mat('Glossy brown pupils',(.025,.008,.006),.14);glint=mat('Eye catchlights',(1,.96,.83),.2);scarf=mat('Chocolate silk cravat',(.20,.09,.045));paper=mat('Notebook ivory',(.85,.82,.69));glass=mat('Magnifier glass',(.33,.59,.53),.16,.1)
def empty(name,loc=(0,0,0),parent=None):
 ob=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(ob);ob.location=loc;ob.parent=parent;objects.append(ob);return ob
root=empty('Calico_Detective');body=empty('Body',parent=root);head=empty('Head',(0,0,1.42),body)
def finish(ob,name,ma,parent):
 ob.name=name;ob.data.materials.append(ma)
 for f in ob.data.polygons:f.use_smooth=True
 if parent:ob.parent=parent
 objects.append(ob);return ob
def ell(name,pos,scale,ma,parent=body,seg=40):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=seg,ring_count=24,location=pos);ob=bpy.context.object;ob.scale=scale
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);return finish(ob,name,ma,parent)
def box(name,pos,size,ma,parent=body,bevel=.02):
 bpy.ops.mesh.primitive_cube_add(size=1,location=pos);ob=bpy.context.object;ob.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 mod=ob.modifiers.new('Soft edges','BEVEL');mod.width=bevel;mod.segments=3;bpy.ops.object.modifier_apply(modifier=mod.name);return finish(ob,name,ma,parent)
def mesh(name,vs,fs,ma,parent=body,sub=0):
 data=bpy.data.meshes.new(name);data.from_pydata(vs,[],fs);data.update();ob=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(ob);finish(ob,name,ma,parent)
 if sub:
  mod=ob.modifiers.new('Sculpt smoothing','SUBSURF');mod.levels=sub;bpy.context.view_layer.objects.active=ob;bpy.ops.object.modifier_apply(modifier=mod.name)
 # Smart UV projects the fabric continuously on arbitrary tailored pieces.
 bpy.ops.object.select_all(action='DESELECT')
 bpy.context.view_layer.objects.active=ob;ob.select_set(True);bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(island_margin=.01);bpy.ops.object.mode_set(mode='OBJECT');ob.select_set(False)
 return ob
def curve(name,pts,r,ma,parent=body):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=12;c.bevel_depth=r;c.bevel_resolution=3;s=c.splines.new('BEZIER');s.bezier_points.add(len(pts)-1)
 for b,p in zip(s.bezier_points,pts):b.co=p;b.handle_left_type='AUTO';b.handle_right_type='AUTO'
 ob=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(ob);ob.data.materials.append(ma);ob.parent=parent;objects.append(ob);return ob
def ringbody(name,levels,ma,parent=body):
 n=64;vs=[];fs=[]
 for z,rx,ry in levels:
  for i in range(n):a=i*2*math.pi/n;vs.append((rx*math.sin(a),ry*math.cos(a),z))
 for j in range(len(levels)-1):
  for i in range(n):fs.append((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i))
 fs.extend([tuple(range(n-1,-1,-1)),tuple((len(levels)-1)*n+i for i in range(n))]);return mesh(name,vs,fs,ma,parent,1)
# Calico head: one continuous sculpted surface, with per-face fur patches.
skull=ell('Round calico head',(0,0,0),(.405,.295,.335),fur,head,64);skull.data.materials.append(dark);skull.data.materials.append(white)
for f in skull.data.polygons:
 c=f.center # polygon centers update after transform
 x,y,z=sum((skull.data.vertices[i].co for i in f.vertices),Vector())/len(f.vertices)
 if (x<-.09+.09*z and z>-.15) or (x>.13+.13*z and z>-.04):f.material_index=1
 if z<-.16 and y<.13:f.material_index=2
# Upright ears have rounded sculpted borders and inset pink surfaces.
for side in [-1,1]:
 x=side*.30
 vs=[(x-side*.14,-.08,.17),(x+side*.13,-.075,.17),(x+side*.15,-.035,.58),(x-side*.075,-.045,.45),(x-side*.14,.065,.17),(x+side*.13,.075,.17),(x+side*.15,.055,.58),(x-side*.075,.075,.45)]
 ear=mesh('Large velvet ear',vs,[(0,1,2,3),(4,7,6,5),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)],dark,head);mod=ear.modifiers.new('Rounded ear rim','BEVEL');mod.width=.04;mod.segments=4
 vs=[(x-side*.08,-.092,.22),(x+side*.085,-.095,.23),(x+side*.11,-.07,.52),(x-side*.045,-.08,.40)]
 ob=mesh('Rose ear inset',vs,[(0,1,2,3)],pink,head,1);mod=ob.modifiers.new('Inset thickness','SOLIDIFY');mod.thickness=.012
# Wide green eyes and properly layered dark pupils with a clean highlight.
for side in [-1,1]:
 x=side*.178
 ell('Eye socket',(x,-.255,.035),(.119,.025,.137),irisedge,head)
 ell('Emerald iris',(x,-.270,.035),(.109,.019,.125),iris,head)
 ell('Large pupil',(x+side*.004,-.285,.047),(.077,.010,.096),pupil,head)

 ell('Catchlight',(x-.021,-.298,.095),(.017,.005,.021),glint,head,24)
 ell('Small catchlight',(x+.027,-.297,.022),(.006,.004,.008),glint,head,16)
# White blaze and connected muzzle, pink nose, whiskers.
ell('Nose bridge',(0,-.271,-.095),(.077,.060,.113),white,head)
for side in [-1,1]:ell('Soft muzzle',(side*.066,-.289,-.159),(.095,.067,.066),white,head)
ell('White chin',(0,-.238,-.225),(.14,.063,.046),white,head)
mesh('Pink triangular nose',[(-.041,-.351,-.113),(.041,-.351,-.113),(0,-.366,-.149),(0,-.317,-.128)],[(0,1,2),(0,3,1),(1,3,2),(2,3,0)],nose,head,1)
curve('Mouth center',[(0,-.353,-.15),(0,-.355,-.175)],.0035,edge,head)
for side in [-1,1]:
 curve('Mouth curve',[(0,-.355,-.175),(side*.025,-.35,-.189),(side*.049,-.339,-.181)],.0035,edge,head)
 for j in range(3):curve('Ivory whisker',[(side*.096,-.33,-.16+j*.025),(side*.27,-.335,-.16+j*.041),(side*.48,-.28,-.17+j*.06)],.0017,white,head)
# Deerstalker cap seated between the ears, patterned wool and piping.
ell('Checked cap crown',(0,.018,.30),(.235,.205,.17),hat,head)
ell('Front cap visor',(0,-.194,.274),(.244,.16,.025),hat,head)
ell('Back cap visor',(0,.195,.278),(.225,.095,.023),hat,head)
curve('Cap center seam',[(0,-.183,.31),(0,-.135,.43),(0,.02,.468),(0,.17,.39),(0,.20,.31)],.008,edge,head)
for side in [-1,1]:curve('Cap bow',[(0,.016,.468),(side*.067,.03,.525),(side*.075,.01,.55),(side*.022,-.005,.521),(0,.016,.468)],.008,lapel,head)
# Tailored flared trench coat with a shoulder cape.
ringbody('Trench coat',[(.40,.29,.19),(.42,.32,.20),(.55,.31,.205),(.78,.245,.17),(1.04,.26,.18),(1.12,.22,.16),(1.14,.13,.12)],coat)
ringbody('Shoulder cape',[(.96,.33,.215),(.99,.335,.22),(1.10,.27,.19),(1.17,.12,.115)],coat)
curve('Cape hem',[(.33*math.sin(i*2*math.pi/48),.217*math.cos(i*2*math.pi/48),.966) for i in range(49)],.006,edge)
for side in [-1,1]:
 pts=[(side*.08,-.125,1.17),(side*.20,-.08,1.29),(side*.22,-.18,1.11),(side*.12,-.226,.95),(side*.028,-.207,1.075)]
 ob=mesh('Raised collar and lapel',pts,[tuple(range(5))],lapel);mod=ob.modifiers.new('Collar thickness','SOLIDIFY');mod.thickness=.016
 curve('Lapel piping',pts+[pts[0]],.005,edge)
 for z in [.91,.79,.56]:ell('Double breasted button',(side*.095,-(.205 if z<.7 else .18),z),(.025,.013,.028),edge)
 # Pocket seams and small notebook on the right.
 curve('Pocket lip',[(side*.16,-.178,.65),(side*.275,-.143,.61)],.008,edge)
ringbody('Leather waist belt',[(.69,.269,.184),(.705,.272,.188),(.755,.268,.185),(.766,.264,.182)],lapel)
box('Brass buckle',(0,-.201,.731),(.115,.022,.08),brass,bevel=.009);box('Buckle inset',(0,-.215,.731),(.079,.008,.047),edge,bevel=.005)
box('Pocket notebook',(.235,-.17,.657),(.081,.024,.13),paper,bevel=.008)
for i in range(5):curve('Notebook spiral',[(.2+i*.016,-.186,.71),(.2+i*.016,-.2,.726),(.2+i*.016,-.17,.73)],.003,edge)
ell('Cravat knot',(0,-.16,1.095),(.045,.035,.05),scarf)
mesh('Cravat fold',[(-.064,-.15,1.13),(.06,-.15,1.13),(0,-.215,.998)],[(0,1,2)],scarf)
for x in [-.025,0,.025]:ell('Cravat dot',(x,-.202,1.065),(.0035,.003,.004),paper,seg=16)
# Arms and boots are articulated at hidden joints below the coat/cape.
limbs=[]
for side in [-1,1]:
 leg=empty('Leg_'+str(side),(side*.135,0,.49),body);limbs.append((leg,side,.35))
 ell('Furred leg',(0,0,-.10),(.082,.08,.17),white,leg)
 ell('Tall boot shaft',(0,0,-.265),(.087,.092,.145),leather,leg)
 ell('Rounded boot toe',(0,-.043,-.395),(.095,.143,.054),leather,leg)
 box('Boot sole',(0,-.035,-.438),(.19,.27,.025),edge,leg,.015)
 arm=empty('Arm_'+str(side),(side*.28,0,1.04),body);limbs.append((arm,-side,.26))
 ell('Coat sleeve',(side*.038,-.01,-.17),(.095,.105,.23),coat,arm)
 ringbody('Turned cuff',[(-.36,.099,.108),(-.30,.104,.11)],coat,arm)
 ell('White paw',(side*.04,-.014,-.397),(.075,.077,.091),white,arm)
 for j in [-1,0,1]:curve('Paw toe seam',[(side*.04+j*.024,-.085,-.394),(side*.04+j*.023,-.077,-.435)],.002,lapel,arm)
 ell('Cuff button',(0,-.113,-.327),(.018,.01,.021),edge,arm,24)
 if side==-1:
  curve('Magnifier handle',[(0,-.075,-.43),(-.025,-.09,-.20)],.016,edge,arm)
  pts=[(-.04+.082*math.cos(i*math.pi*2/48),-.10,-.13+.10*math.sin(i*math.pi*2/48)) for i in range(49)]
  curve('Magnifier brass rim',pts,.012,brass,arm);ell('Magnifier lens',(-.04,-.10,-.13),(.074,.009,.091),glass,arm)
# Long upturned tail, continuous silhouette with calico bands and white tip.
tail=empty('Tail',(0,.15,.52),body)
points=[(0,0,0),(.12,.15,-.14),(.33,.20,-.21),(.52,.18,-.09),(.61,.13,.15),(.63,.09,.42),(.60,.07,.69),(.54,.06,.84)]
c=bpy.data.curves.new('Tail path','CURVE');c.dimensions='3D';c.resolution_u=16;c.bevel_depth=.071;c.bevel_resolution=5;s=c.splines.new('BEZIER');s.bezier_points.add(len(points)-1)
for i,(b,p) in enumerate(zip(s.bezier_points,points)):b.co=p;b.handle_left_type='AUTO';b.handle_right_type='AUTO';b.radius=1 if i<len(points)-1 else .72
ob=bpy.data.objects.new('Striped curled tail',c);bpy.context.collection.objects.link(ob);ob.parent=tail;objects.append(ob);bpy.context.view_layer.objects.active=ob;ob.select_set(True);bpy.ops.object.convert(target='MESH');ob.select_set(False)
for ma in [fur,dark,white]:ob.data.materials.append(ma)
for f in ob.data.polygons:
 z=sum(ob.data.vertices[i].co.z for i in f.vertices)/len(f.vertices);f.material_index=2 if z>.68 else (1 if -.13<z<.04 or .28<z<.49 else 0);f.use_smooth=True
ell('Soft white tail tip',points[-1],(.051,.052,.051),white,tail)
# Export a named node animation, compatible with the existing game mixer.
scene.render.fps=30
for ob,side,amp in limbs:
 for fr in range(1,32,2):
  phase=(fr-1)/30*math.tau;ob.rotation_euler.x=math.sin(phase)*amp*side;ob.keyframe_insert(data_path='rotation_euler',frame=fr)
for ob in [head,tail]:
 for fr in range(1,32,2):
  phase=(fr-1)/30*math.tau;ob.rotation_euler.y=math.sin(phase)*(.035 if ob==head else .10);ob.keyframe_insert(data_path='rotation_euler',frame=fr)
for ob in objects:
 if ob.animation_data and ob.animation_data.action:
  action=ob.animation_data.action;track=ob.animation_data.nla_tracks.new();track.name='Walk';track.strips.new('Walk',1,action);ob.animation_data.action=None
scene.frame_set(1)
# Convert curves, apply shading, and export only the authored character.
bpy.ops.object.select_all(action='DESELECT')
for ob in objects:ob.select_set(True)
bpy.context.view_layer.objects.active=root
bpy.ops.export_scene.gltf(filepath=str(OUT/'calico-detective.glb'),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_apply=True,export_yup=True)
# Neutral studio render for quality review.
floor=mat('Studio floor',(.20,.23,.23));bpy.ops.mesh.primitive_plane_add(size=200);bpy.context.object.data.materials.append(floor)
world=scene.world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.40,.46,.50,1);world.node_tree.nodes['Background'].inputs[1].default_value=.45
for loc,power,size in [((-3,-4,5),450,4),((3,-1,3),250,3),((0,3,4),500,3)]:
 bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.data.energy=power;l.data.shape='DISK';l.data.size=size;l.rotation_euler=(Vector((0,0,1))-l.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(2.5,-5,2.5));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,1))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=2.7;scene.camera=cam
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True;scene.render.resolution_x=850;scene.render.resolution_y=1000;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='AgX'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'calico-detective.blend'))
scene.render.filepath=str(OUT/'calico-preview.png');bpy.ops.render.render(write_still=True)
print('CALICO READY',OUT)
