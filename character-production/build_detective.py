"""Build an editable, skinned detective using MakeHuman CC0 body/rig data.
Run with Blender --background --python build_detective.py.
No hosted AI or paid generation is used.
"""
import bpy, json, math, os, sys
from pathlib import Path
from mathutils import Vector, Quaternion
from mathutils.kdtree import KDTree

ROOT=Path(__file__).resolve().parent
HOST='--host' in sys.argv
NAME='party-host' if HOST else 'detective'
SRC=ROOT/'source'; OUT=ROOT/'output'/NAME; OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
verts=[]; faces=[]; uv=[]; face_uv=[]; group=''
for line in (SRC/'base.obj').read_text().splitlines():
    p=line.split()
    if not p: continue
    if p[0]=='v': verts.append(Vector(list(map(float,p[1:4]))))
    elif p[0]=='vt': uv.append(tuple(map(float,p[1:3])))
    elif p[0]=='g': group=p[1]
    elif p[0]=='f' and group=='body':
        faces.append([int(s.split('/')[0])-1 for s in p[1:]])
        face_uv.append([int(s.split('/')[1])-1 for s in p[1:]])
for filename,weight in [('asian-male-young.target',.8 if HOST else .5),('caucasian-male-young.target',.2 if HOST else .5),('universal-male-young-averagemuscle-averageweight.target',1)]:
    for line in (SRC/filename).read_text().splitlines():
        p=line.split()
        if p and p[0].isdigit(): verts[int(p[0])]+=Vector(list(map(float,p[1:4])))*weight
body_ids=sorted(set(i for f in faces for i in f)); min_y=min(verts[i].y for i in body_ids); max_y=max(verts[i].y for i in body_ids)
scale=1.85/(max_y-min_y)
verts=[Vector((v.x*scale,-v.z*scale,(v.y-min_y)*scale)) for v in verts]
rig_data=json.loads((SRC/'default.mhskel').read_text()); weights=json.loads((SRC/'default_weights.mhw').read_text())['weights']
def joint(name):
    ids=rig_data['joints'][name]; return sum((verts[i] for i in ids),Vector())/len(ids)
def head(name): return joint(rig_data['bones'][name]['head'])
def tail(name): return joint(rig_data['bones'][name]['tail'])
kd=KDTree(len(body_ids))
for i in body_ids: kd.insert(verts[i],i)
kd.balance()
vertex_weights={i:[] for i in range(len(verts))}
for bone,entries in weights.items():
    for i,w in entries:
        if w>.001: vertex_weights[i].append((bone,w))

def material(name,color,rough=.5,metal=0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1);m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Roughness'].default_value=rough;bs.inputs['Metallic'].default_value=metal
    return m
skin=material('Warm terracotta skin',(.43,.225,.135),.48)
skin.node_tree.nodes.get('Principled BSDF').inputs['Subsurface Weight'].default_value=.08
teal=material('Petrol teal woven jacket',(.025,.23,.27),.72)
teal_edge=material('Raised teal seams',(.052,.32,.34),.65)
coral=material('Coral cotton shirt',(.82,.17,.105),.72)
trousers=material('Charcoal twill',(.052,.066,.095),.8)
cream=material('Warm ivory sneakers',(.82,.76,.59),.58)
sole=material('Rubber soles',(.55,.53,.43),.85)
ochre=material('Saffron leather satchel',(.56,.28,.045),.4)
brass=material('Brushed brass hardware',(.65,.39,.11),.29,.7)
hair=material('Espresso swept hair',(.036,.02,.016),.85)
hair_glint=material('Hair ridge highlights',(.082,.042,.025),.43)
white=material('Eye sclera',(.69,.65,.53),.35)
iris=material('Brown irises',(.085,.034,.012),.3)
pupil=material('Pupils',(.007,.006,.005),.24)
lip=material('Natural muted lips',(.34,.105,.075),.55)
if HOST:
    for mat,col,rough in [(skin,(.56,.36,.23),.52),(teal,(.025,.028,.035),.34),(teal_edge,(.06,.06,.07),.35),(coral,(.025,.16,.18),.75),(hair,(.48,.51,.53),.45),(hair_glint,(.7,.72,.73),.48),(cream,(.035,.032,.03),.36),(sole,(.02,.02,.02),.7)]:
        mat.diffuse_color=(*col,1);bs=mat.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*col,1);bs.inputs['Roughness'].default_value=rough

arm=bpy.data.armatures.new('CSS human skeleton'); rig=bpy.data.objects.new('Detective_Rig',arm);bpy.context.collection.objects.link(rig)
bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
for name,b in rig_data['bones'].items():
    bone=arm.edit_bones.new(name);bone.head=joint(b['head']);bone.tail=joint(b['tail'])
    if (bone.tail-bone.head).length<.0001: bone.tail.z+=.01
for name,b in rig_data['bones'].items():
    if b['parent'] and b['parent'] in arm.edit_bones: arm.edit_bones[name].parent=arm.edit_bones[b['parent']]
bpy.ops.object.mode_set(mode='OBJECT');rig.select_set(False)
objects=[]
def bind(obj,original_ids=None,bone=None):
    if obj.type!='MESH': return
    if bone:
        g=obj.vertex_groups.new(name=bone);g.add(list(range(len(obj.data.vertices))),1,'REPLACE')
    else:
        groups={}
        for v in obj.data.vertices:
            source=original_ids[v.index] if original_ids is not None else kd.find(obj.matrix_world @ v.co)[1]
            pairs=vertex_weights.get(source,[])
            if not pairs: pairs=[('spine03',1)]
            for name,w in pairs:
                if name not in arm.bones: continue
                if name not in groups:groups[name]=obj.vertex_groups.new(name=name)
                groups[name].add([v.index],w,'REPLACE')
    mod=obj.modifiers.new('Skin deformation','ARMATURE');mod.object=rig;obj.parent=rig;objects.append(obj)
def mesh(name,vs,fs,mat,bind_to=None,ids=None,sub=0):
    data=bpy.data.meshes.new(name);data.from_pydata(vs,[],fs);data.update();ob=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(ob);ob.data.materials.append(mat)
    for p in data.polygons:p.use_smooth=True
    if sub:
        m=ob.modifiers.new('Smooth surface','SUBSURF');m.levels=sub;m.render_levels=sub
        bpy.context.view_layer.objects.active=ob;ob.select_set(True);bpy.ops.object.modifier_apply(modifier=m.name);ob.select_set(False);ids=None
    bind(ob,ids,bind_to);return ob
def patch(name,indices,mat,offset=0):
    fs=[faces[k] for k in indices];ids=sorted(set(i for f in fs for i in f));mapping={i:j for j,i in enumerate(ids)}
    ob=mesh(name,[verts[i] for i in ids],[[mapping[i] for i in f] for f in fs],mat,ids=ids)
    if offset:
        for v in ob.data.vertices:v.co+=v.normal*offset
    return ob
# Expose head, neck and hands; clothed torso and legs are omitted to avoid hidden geometry.
visible=[]
for k,f in enumerate(faces):
    c=sum((verts[i] for i in f),Vector())/len(f)
    if c.z>1.61 or (c.z>1.49 and abs(c.x)<.065) or (abs(c.x)>.46 and .92<c.z<1.2):visible.append(k)
body=patch('Sculpted face neck and hands',visible,skin)
# Subdivision retains actual facial topology, rather than separate spherical features.
sub=body.modifiers.new('Facial smoothing','SUBSURF');sub.levels=1;sub.render_levels=1

def tube(name,points,radii,mat,bone=None,segments=16,closed=True):
    pts=[Vector(p) for p in points];vs=[];fs=[]
    for j,p in enumerate(pts):
        tangent=(pts[min(j+1,len(pts)-1)]-pts[max(j-1,0)]).normalized()
        axis=Vector((0,1,0)) if abs(tangent.y)<.85 else Vector((1,0,0))
        u=tangent.cross(axis).normalized();v=tangent.cross(u).normalized()
        r=radii[j] if isinstance(radii,list) else radii
        rx,ry=r if isinstance(r,tuple) else (r,r)
        for i in range(segments):
            a=2*math.pi*i/segments;vs.append(p+u*(math.cos(a)*rx)+v*(math.sin(a)*ry))
        if j:
            for i in range(segments):fs.append(((j-1)*segments+i,(j-1)*segments+(i+1)%segments,j*segments+(i+1)%segments,j*segments+i))
    if closed:fs.extend([tuple(reversed(range(segments))),tuple((len(pts)-1)*segments+i for i in range(segments))])
    return mesh(name,vs,fs,mat,bind_to=bone)
def ellipsoid(name,center,radius,mat,bone=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=16,location=center);ob=bpy.context.object;ob.name=name;ob.scale=radius
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);ob.data.materials.append(mat)
    for p in ob.data.polygons:p.use_smooth=True
    bind(ob,bone=bone);ob.select_set(False);return ob
def rounded_box(name,center,size,mat,bevel=.015,bone=None):
    bpy.ops.mesh.primitive_cube_add(size=1,location=center);ob=bpy.context.object;ob.name=name;ob.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    ob.data.materials.append(mat);m=ob.modifiers.new('Tailored rounded edges','BEVEL');m.width=bevel;m.segments=3;bpy.ops.object.modifier_apply(modifier=m.name)
    for p in ob.data.polygons:p.use_smooth=True
    ob.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL');bind(ob,bone=bone);ob.select_set(False);return ob
def ribbon(name,points,width,mat,bone='spine03'):
    vs=[];fs=[]
    for p in points:vs.extend([Vector(p)+Vector((-width/2,0,0)),Vector(p)+Vector((width/2,0,0))])
    for j in range(len(points)-1):fs.append((2*j,2*j+1,2*j+3,2*j+2))
    ob=mesh(name,vs,fs,mat,bind_to=bone);s=ob.modifiers.new('Thickness','SOLIDIFY');s.thickness=.003;return ob

# Trousers use the actual anatomical leg surface with generous cloth clearance.
pants_idx=[]
for k,f in enumerate(faces):
    c=sum((verts[i] for i in f),Vector())/len(f)
    if .105<c.z<1.015 and abs(c.x)<.35:pants_idx.append(k)
pants=patch('Tailored charcoal trousers',pants_idx,trousers,.013)
sub=pants.modifiers.new('Twill smoothing','SUBSURF');sub.levels=1
# Sculpted open jacket and the shirt behind it.
def torso(name,levels,mat,gap=0,bone=None):
    vs=[];fs=[];n=48
    for j,(z,rx,ry,cy) in enumerate(levels):
        for i in range(n+1):
            a=gap+(2*math.pi-2*gap)*i/n;vs.append((rx*math.sin(a),cy-ry*math.cos(a),z))
        if j:
            for i in range(n):a=(j-1)*(n+1)+i;fs.append((a,a+1,a+n+2,a+n+1))
    ob=mesh(name,vs,fs,mat,bind_to=bone,sub=1);solid=ob.modifiers.new('Garment thickness','SOLIDIFY');solid.thickness=.005;return ob
torso('Coral shirt',[(.98,.15,.085,.015),(1.14,.15,.092,.02),(1.34,.19,.102,.01),(1.48,.215,.08,0),(1.565,.075,.062,-.01)],coral)
torso('Open teal jacket',[(.94,.225,.12,.025),(.98,.22,.12,.025),(1.12,.185,.113,.025),(1.32,.21,.13,.01),(1.45,.245,.12,0),(1.50,.23,.10,0),(1.555,.09,.065,0)],teal,.32)
torso('Soft standing shirt collar',[(1.50,.079,.070,-.005),(1.51,.079,.070,-.005),(1.60,.071,.066,-.005),(1.605,.071,.066,-.005)],coral,bone='neck01')
for s,suffix in [(1,'L'),(-1,'R')]:
    sh=head('upperarm01.'+suffix);el=head('lowerarm01.'+suffix);wr=head('wrist.'+suffix)
    points=[sh+(sh-el).normalized()*.035,sh,sh.lerp(el,.45),el,el.lerp(wr,.5),el.lerp(wr,.83)]
    sleeve=tube('Jacket sleeve '+suffix,points,[.067,.079,.077,.065,.061,.056],teal)
    smooth=sleeve.modifiers.new('Soft sleeve surface','SUBSURF');smooth.levels=2
    tube('Coral cuff '+suffix,[el.lerp(wr,.78),el.lerp(wr,.91)],[.064,.059],coral)
    # angular lapels meet the open jacket front
    mesh('Notched lapel '+suffix,[(s*.063,-.067,1.54),(s*.185,-.091,1.47),(s*.105,-.135,1.38),(s*.072,-.125,1.22),(s*.048,-.127,1.42)],[(0,1,2,3,4)],teal_edge,bind_to='spine01')
    ribbon('Jacket hem seam '+suffix,[(s*.074,-.09,.952),(s*.17,-.065,.952),(s*.213,.005,.952)],.004,teal_edge)
    rounded_box('Jacket pocket '+suffix,(s*.135,-.099,1.087),(.092,.008,.067),teal,.008,'spine04')
    tube('Pocket welt '+suffix,[(s*.09,-.106,1.119),(s*.177,-.106,1.119)],.003,teal_edge,'spine04',8)
    foot=head('foot.'+suffix)
    rounded_box('Ivory sneaker '+suffix,(foot.x,-.075,.085),(.115,.29,.105),cream,.04,'foot.'+suffix)
    rounded_box('Sneaker sole '+suffix,(foot.x,-.075,.036),(.12,.297,.035),sole,.012,'foot.'+suffix)
    for j in range(4):tube('Lace '+suffix+str(j),[(foot.x-.036,-.08-j*.019,.142),(foot.x+.036,-.08-j*.019,.142)],.0035,cream,'foot.'+suffix,8)
for z in [1.08,1.18,1.28,1.38]:ellipsoid('Shirt button',(0,-.108,z),(.008,.004,.008),cream,'spine03')
rounded_box('Leather belt',(0,-.092,1.012),(.31,.017,.035),trousers,.006,'spine05')
rounded_box('Brass belt buckle',(0,-.105,1.012),(.036,.009,.032),brass,.003,'spine05')

# Eyes sit inside the existing eyelids; irises are small, not exposed black beads.
for s,suffix in [(1,'L'),(-1,'R')]:
    ec=head('eye.'+suffix);et=tail('eye.'+suffix);front=ec.lerp(et,.67)
    ellipsoid('Eye '+suffix,ec,(.018,.018,.018),white,'head')
    ellipsoid('Iris '+suffix,(front.x,ec.y-.017,ec.z),(.007,.002,.007),iris,'head')
    ellipsoid('Pupil '+suffix,(front.x,ec.y-.019,ec.z),(.0035,.001,.0035),pupil,'head')
    ellipsoid('Eye catchlight '+suffix,(front.x-.003,ec.y-.020,ec.z+.004),(.002,.001,.002),white,'head')
    tube('Eyebrow '+suffix,[(s*.017,-.145,ec.z+.035),(s*.041,-.148,ec.z+.038),(s*.065,-.135,ec.z+.029)],[.005,.007,.003],hair,'head',10)

# Smooth scalp cap with controlled hairline and rounded swept fringe.
vs=[];fs=[]; rings=16; segments=48
for j in range(rings+1):
    for i in range(segments):
        az=math.tau*i/segments
        limit=1.5 if math.sin(az)<0 else 1.94
        theta=.001+(limit-.001)*j/rings
        vs.append((.106*math.sin(theta)*math.cos(az),.012+.112*math.sin(theta)*math.sin(az),1.775+.091*math.cos(theta)))
        if j:
            a=(j-1)*segments+i;b=(j-1)*segments+(i+1)%segments
            fs.append((a,b,j*segments+(i+1)%segments,j*segments+i))
mesh('Sculpted hair cap',vs,fs,hair,bind_to='head')
for j in range(4):
    ob=ellipsoid('Swept fringe '+str(j),(-.058+j*.035,-.064+j*.006,1.838+j*.002),(.044,.075,.028),hair,'head')
    ob.rotation_euler.z=-.45

# Satchel with flap, seam, buckle and a continuous shoulder strap.
rounded_box('Satchel body',(.225,-.10,.98),(.17,.095,.18),ochre,.024,'spine05')
rounded_box('Satchel flap',(.225,-.154,1.035),(.178,.014,.09),ochre,.015,'spine05')
rounded_box('Satchel buckle',(.225,-.167,1.015),(.032,.012,.035),brass,.004,'spine05')
ribbon('Crossbody shoulder strap',[(-.16,-.10,1.49),(-.11,-.14,1.4),(-.025,-.148,1.28),(.08,-.14,1.14),(.21,-.15,1.02)],.026,ochre)
if HOST:
    for ob in list(objects):
        if ob.name.startswith(('Satchel','Crossbody')):
            objects.remove(ob);bpy.data.objects.remove(ob,do_unlink=True)
    for s,suffix in [(1,'L'),(-1,'R')]:
        ec=head('eye.'+suffix);x=ec.x;z=ec.z
        outline=[(x-.027,-.166,z-.018),(x+.027,-.166,z-.018),(x+.029,-.162,z+.018),(x-.027,-.166,z+.018),(x-.027,-.166,z-.018)]
        tube('Glasses rim '+suffix,outline,.0018,trousers,'head',8)
        tube('Glasses temple '+suffix,[(s*.062,-.161,z+.01),(s*.092,-.04,z+.003)],.002,trousers,'head',8)
    tube('Glasses bridge',[(-.009,-.169,head('eye.L').z+.008),(0,-.179,head('eye.L').z+.012),(.009,-.169,head('eye.L').z+.008)],.0018,trousers,'head',8)

# Pose the rig into a relaxed stance and author a seamless in-place walking clip.
def world_rotation(name,axis,angle):
    local_axis=arm.bones[name].matrix_local.to_quaternion().inverted() @ Vector(axis)
    return Quaternion(local_axis,angle)
base_pose={}
for s,suffix in [(1,'L'),(-1,'R')]:base_pose['upperarm01.'+suffix]=world_rotation('upperarm01.'+suffix,(0,1,0),s*math.radians(24))
def pose_walk(phase,amount):
    for p in rig.pose.bones:p.rotation_mode='QUATERNION';p.rotation_quaternion=base_pose.get(p.name,Quaternion())
    for s,suffix in [(1,'L'),(-1,'R')]:
        wave=math.sin(phase)*s
        for name,angle in [('upperleg01.'+suffix,wave*.32),('lowerleg01.'+suffix,max(0,-wave)*.48),('foot.'+suffix,-wave*.10),('upperarm01.'+suffix,-wave*.20)]:
            p=rig.pose.bones[name];p.rotation_quaternion=base_pose.get(name,Quaternion()) @ world_rotation(name,(1,0,0),angle*amount)
scene.render.fps=30;scene.frame_start=1;scene.frame_end=31
pose_walk(0,0)
rig.animation_data_create();action=bpy.data.actions.new('Walk');rig.animation_data.action=action
animated=[n for n in arm.bones.keys() if n.startswith(('upperleg01','lowerleg01','foot.','upperarm01'))]
for frame in range(1,32,3):
    pose_walk((frame-1)/30*math.tau,1)
    for name in animated:rig.pose.bones[name].keyframe_insert(data_path='rotation_quaternion',frame=frame,group=name)
rig.animation_data.action=None;pose_walk(0,0)
# Retain the walk in an NLA strip so glTF exports a named animation.
track=rig.animation_data.nla_tracks.new();track.name='Walk';strip=track.strips.new('Walk',1,action);track.mute=True

scene.world.color=(.15,.15,.15)
bpy.ops.object.camera_add(location=(2.65,-5.8,2.5));camera=bpy.context.object;camera.name='Presentation camera';camera.rotation_euler=(Vector((0,0,1))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=2.35;scene.camera=camera
for name,loc,power,size,color in [('Warm key',(-3,-4,5),450,4,(1,.82,.68)),('Cool fill',(3,-2,3),300,3,(.65,.85,1)),('Rim',(0,3,4),550,3,(.7,1,.91))]:
    bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.name=name;l.data.energy=power;l.data.shape='DISK';l.data.size=size;l.data.color=color;l.rotation_euler=(Vector((0,0,1))-l.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.mesh.primitive_plane_add(size=200);floor=bpy.context.object;floor.name='Studio floor';floor.data.materials.append(material('Studio lilac',(.18,.14,.25),.8));floor.location.z=-.005
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True;scene.render.resolution_x=900;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG';scene.render.filepath=str(OUT/(NAME+'-preview.png'))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/(NAME+'.blend')))
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True)
for ob in objects:ob.select_set(True)
track.mute=False
bpy.ops.export_scene.gltf(filepath=str(OUT/(NAME+'.glb')),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_apply=True,export_materials='EXPORT',export_skins=True,export_yup=True)
track.mute=True;pose_walk(0,0)
bpy.ops.render.render(write_still=True)
camera.location=(.35,-3,1.77);camera.rotation_euler=(Vector((0,-.02,1.7))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.ortho_scale=.52
scene.render.resolution_x=800;scene.render.resolution_y=800;scene.render.filepath=str(OUT/(NAME+'-face.png'));bpy.ops.render.render(write_still=True)
camera.location=(2.65,-5.8,2.5);camera.rotation_euler=(Vector((0,0,1))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.ortho_scale=2.35
pose_walk(math.pi/2,1);scene.render.resolution_x=700;scene.render.resolution_y=900;scene.render.filepath=str(OUT/(NAME+'-walk.png'));bpy.ops.render.render(write_still=True)
report={'height_m':1.85,'mesh_objects':len(objects),'vertices':sum(len(o.data.vertices) for o in objects),'bones':len(arm.bones),'source':'MakeHuman CC0 base mesh, adult shape targets and default rig weights','animation':'Walk, 1 second loop','method':'Base mesh customization and authored garments; not image-to-3D conversion'}
(OUT/'build-report.json').write_text(json.dumps(report,indent=2))
print('CHARACTER BUILD COMPLETE',report)
