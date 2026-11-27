"""Second sculpt/tailoring pass, after the first reference refinements."""
# Rebuild a broad integrated lower jaw and shallow cheeks before fusing them.
# The old bridge/chin projected like a separate snout in the side view.
remove_parts(['Soft muzzle','White chin','Nose bridge','Pink triangular nose'])
ell('White chin',(0,-.075,-.192),(.296,.197,.137),white,head)
for side in [-1,1]:ell('Soft muzzle',(side*.046,-.265,-.151),(.078,.056,.058),white,head)
pieces=[skull]+[o for o in objects if o.type=='MESH' and any(o.name.startswith(p) for p in ['Soft muzzle','White chin'])]
bpy.ops.object.select_all(action='DESELECT')
for o in pieces:o.select_set(True)
bpy.context.view_layer.objects.active=skull
for o in pieces:
 if o!=skull:objects.remove(o)
bpy.ops.object.join()
remesh=skull.modifiers.new('Continuous sculpted cheeks','REMESH');remesh.mode='VOXEL';remesh.voxel_size=.008;remesh.use_smooth_shade=True
bpy.ops.object.modifier_apply(modifier=remesh.name)
sm=skull.modifiers.new('Soften muzzle transitions','SMOOTH');sm.factor=.65;sm.iterations=8;bpy.ops.object.modifier_apply(modifier=sm.name)
dec=skull.modifiers.new('Mobile head topology','DECIMATE');dec.ratio=.55;bpy.ops.object.modifier_apply(modifier=dec.name)
skull.data.materials.clear();skull.data.materials.append(skin)
uv=skull.data.uv_layers.active or skull.data.uv_layers.new()
for poly in skull.data.polygons:
 poly.material_index=0;poly.use_smooth=True;coords=[]
 for idx in poly.loop_indices:
  v=skull.data.vertices[skull.data.loops[idx].vertex_index].co
  coords.append((idx,math.atan2(v.y/.295,v.x/.405)/math.tau+.5,math.asin(max(-1,min(1,v.z/.335)))/math.pi+.5))
 wrap=max(t[1] for t in coords)-min(t[1] for t in coords)>.5
 for idx,u,v in coords:uv.data[idx].uv=(u+1 if wrap and u<.5 else u,v)
# Broader ivory jaw, with a small white blaze surrounding the pink nose.
pixels=[]
for py in range(256):
 lat=((py+.5)/256-.5)*math.pi
 for px in range(512):
  angle=((px+.5)/512-.5)*math.tau;x=math.cos(lat)*math.cos(angle);y=math.cos(lat)*math.sin(angle);z=math.sin(lat)
  lower=-.40+.34*(abs(x)-.36)**2
  patches=softstep(.17+.17*(1-z),.205+.17*(1-z),abs(x))*softstep(lower,lower+.07,z)
  patches=max(patches,softstep(.64,.71,z))
  jawedge=-.21-.27*abs(x)
  jaw=(1-softstep(jawedge-.035,jawedge+.035,z))*softstep(-.05,.15,-y)
  blaze=(1-softstep(.72,1.05,(x/.18)**2+((z+.26)/.29)**2))*softstep(.45,.75,-y)
  white_area=max(jaw,blaze)
  ginger=[.83,.57,.22];espresso=[.075,.043,.038];ivory=[.98,.96,.91]
  pixels.extend([(ginger[i]*(1-patches)+espresso[i]*patches)*(1-white_area)+ivory[i]*white_area for i in range(3)]+[1])
im.pixels.foreach_set(pixels);im.pack()
nose.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.65,.28,.33,1)
nosepiece=mesh('Pink triangular nose',[(-.035,-.347,-.111),(.035,-.347,-.111),(0,-.354,-.147),(-.035,-.319,-.111),(.035,-.319,-.111),(0,-.326,-.147)],[(0,2,1),(3,4,5),(0,1,4,3),(1,2,5,4),(2,0,3,5)],nose,head)
nosepiece.location.y=.018
softnose=nosepiece.modifiers.new('Soft pink nose corners','BEVEL');softnose.width=.009;softnose.segments=3
remove_parts(['Mouth center','Mouth curve','Ivory whisker'])
curve('Mouth center',[(0,-.318,-.144),(0,-.320,-.17)],.0025,edge,head)
for side in [-1,1]:
 curve('Mouth curve',[(0,-.320,-.17),(side*.024,-.317,-.184),(side*.046,-.309,-.177)],.0025,edge,head)
 for j in range(3):curve('Ivory whisker',[(side*.093,-.303,-.16+j*.024),(side*.27,-.315,-.16+j*.041),(side*.47,-.27,-.17+j*.058)],.0015,white,head)

# Recess the eye rims, rounding the iris volumes without enlarging their footprint.
remove_parts(['Eye socket','Emerald iris','Large pupil','Catchlight','Small catchlight'])
for side in [-1,1]:
 x=side*.174
 ell('Eye socket',(x,-.249,.035),(.108,.028,.111),dark,head)
 ell('Emerald iris',(x,-.260,.035),(.100,.047,.103),iris,head)
 ell('Large pupil',(x,-.299,.041),(.064,.016,.070),pupil,head)
 ell('Catchlight',(x-.022,-.316,.081),(.020,.003,.020),glint,head,24)
 ell('Small catchlight',(x+.024,-.317,.009),(.005,.002,.005),glint,head,16)

# Textile color and weave are shared by the cap, coat and lapels.
def tailored_fabric(name,base,checked=False):
 m=mat(name,base,.86);image=bpy.data.images.new(name+' fine weave',width=256,height=256);data=[];normaldata=[]
 random.seed(41)
 for y in range(256):
  for x in range(256):
   weave=1+(.055 if (x+y)%4<2 else -.055)+(random.random()-.5)*.025
   if checked:
    tooth=((1,1,0,1),(1,1,1,0),(0,1,0,0),(1,0,0,0))
    weave*=.76 if tooth[(y//4)%4][(x//4)%4] else 1.05
   data.extend([min(1,c*weave) for c in base]+[1])
   normaldata.extend([.5+.11*math.sin(x*math.pi/2),.5+.11*math.sin(y*math.pi/2),.98,1])
 image.pixels.foreach_set(data);image.pack();texture=m.node_tree.nodes.new('ShaderNodeTexImage');texture.image=image
 coords=m.node_tree.nodes.new('ShaderNodeTexCoord');mapping=m.node_tree.nodes.new('ShaderNodeMapping');mapping.inputs['Scale'].default_value=(1.3,1.3,1.3) if checked else (4,4,4)
 m.node_tree.links.new(coords.outputs['UV'],mapping.inputs['Vector']);m.node_tree.links.new(mapping.outputs['Vector'],texture.inputs['Vector']);m.node_tree.links.new(texture.outputs['Color'],m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
 weave_normal=bpy.data.images.new(name+' woven surface',width=256,height=256);weave_normal.colorspace_settings.name='Non-Color';weave_normal.pixels.foreach_set(normaldata);weave_normal.pack()
 normaltex=m.node_tree.nodes.new('ShaderNodeTexImage');normaltex.image=weave_normal
 normal=m.node_tree.nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.35
 m.node_tree.links.new(mapping.outputs['Vector'],normaltex.inputs['Vector']);m.node_tree.links.new(normaltex.outputs['Color'],normal.inputs['Color']);m.node_tree.links.new(normal.outputs['Normal'],m.node_tree.nodes.get('Principled BSDF').inputs['Normal'])
 return m
cloth=tailored_fabric('Reference taupe tweed',(.53,.45,.34));capcloth=tailored_fabric('Reference checked wool',(.49,.42,.33),True)
thread=mat('Muted stitching',(.29,.23,.16),.85);buttonmat=mat('Brown horn buttons',(.13,.087,.053),.6)
for ob in objects:
 if ob.type in {'MESH','CURVE'}:
  for idx,ma in enumerate(ob.data.materials):
   if ma==coat:ob.data.materials[idx]=cloth
   elif ma==hat:ob.data.materials[idx]=capcloth

remove_parts(['Trench coat','Shoulder cape','Cape hem','Raised collar and lapel','Lapel piping','Coat front seam','Cape stitching','Pocket lip','Double breasted button','Leather waist belt','Brass buckle','Buckle inset','Belt loop','Checked cap crown','Cap center seam','Cap bow','Front cap visor','Back cap visor','Turned cuff','Cuff button'])

# A flared coat with an open rear tail vent and a true shoulder cape.
def garment(name,levels,start=0,end=math.tau):
 n=64;verts=[];faces=[]
 for z,rx,ry in levels:
  for i in range(n+1):
   a=start+(end-start)*i/n;zz=z
   # Back hem rises around the tail instead of passing through it.
   if name=='Trench coat' and z<.60:zz+=.13*max(0,math.cos(a))**18*(1-softstep(.4,.6,z))
   verts.append((rx*math.sin(a),ry*math.cos(a),zz))
 for j in range(len(levels)-1):
  for i in range(n):k=j*(n+1)+i;faces.append((k,k+1,k+n+2,k+n+1))
 ob=mesh(name,verts,faces,cloth,body,1);sol=ob.modifiers.new('Tailored cloth thickness','SOLIDIFY');sol.thickness=.012
 return ob
trench=garment('Trench coat',[(.405,.355,.213),(.43,.36,.22),(.57,.33,.215),(.74,.27,.18),(1.02,.285,.185),(1.15,.17,.125)])
garment('Shoulder cape',[(.94,.40,.236),(.96,.401,.238),(1.05,.33,.205),(1.16,.19,.135),(1.18,.16,.123)],-math.pi+.32,math.pi-.32)
capeedge=[]
for i in range(65):
 a=-math.pi+.32+(math.tau-.64)*i/64;capeedge.append((.401*math.sin(a),.239*math.cos(a),.952))
curve('Cape sewn edge',capeedge,.0028,thread)
# Raised collar and overlapping lapels are thin cloth panels, not bulky triangles.
garment('Standing collar',[(1.13,.15,.12),(1.16,.16,.125),(1.28,.22,.16),(1.30,.22,.16)],-math.pi+.48,math.pi-.48)
for side in [-1,1]:
 pts=[(side*.10,-.13,1.27),(side*.20,-.17,1.14),(side*.09,-.226,.99),(side*.005,-.206,1.10)]
 ob=mesh('Folded lapel',pts,[(0,1,2,3)],cloth);solid=ob.modifiers.new('Lapel thickness','SOLIDIFY');solid.thickness=.013
 bevel=ob.modifiers.new('Soft folded edge','BEVEL');bevel.width=.008;bevel.segments=3
 curve('Lapel stitching',pts+[pts[0]],.002,thread)
 for z in [.90,.79,.56]:
  y=-.190 if z>.7 else -.218
  ell('Inset horn button',(side*.072,y-.009,z),(.024,.009,.026),buttonmat)
  for dx in [-.005,.005]:ell('Button stitch',(side*.072+dx,y-.018,z),(.002,.002,.006),thread,seg=12)
 pocket=[]
 for j in range(12):
  t=j/11;x=side*(.14+.14*t);z=.66-.08*t;rx=.30+.03*t;ry=.198+.015*t
  hit,point,_,_=trench.ray_cast(Vector((x,-1,z)),Vector((0,1,0)))
  pocket.append((x,point.y-.008 if hit else -ry*math.sqrt(max(0,1-(x/rx)**2))-.004,z))
 curve('Slanted pocket seam',pocket,.0022,thread)
curve('Overlapping coat front',[(.022,-.223,.417),(.022,-.224,.56),(.022,-.190,.75),(.022,-.192,.97)],.0028,thread)
ringbody('Tweed belt',[(.695,.279,.189),(.71,.282,.192),(.758,.274,.185),(.77,.27,.182)],cloth)
box('Covered belt buckle',(0,-.209,.735),(.105,.026,.075),thread,bevel=.008)
box('Buckle center',(0,-.225,.735),(.069,.006,.043),cloth,bevel=.005)
for side in [-1,1]:
 box('Belt keeper',(side*.18,-.150,.73),(.026,.020,.086),cloth,bevel=.006)
 arm=bpy.data.objects.get('Arm_'+str(side))
 ringbody('Folded sleeve cuff',[(-.37,.096,.103),(-.355,.101,.106),(-.315,.101,.106),(-.30,.096,.101)],cloth,arm)
 ell('Cuff horn button',(side*.025,-.112,-.335),(.019,.008,.020),buttonmat,arm,24)

# Deerstalker crown shaped like the reference, with a short front peak.
verts=[];faces=[];rings=12;n=48
for j in range(rings+1):
 t=j/rings;rad=max(.015,math.sqrt(max(0,1-t*t)))
 for i in range(n):
  a=i*math.tau/n;verts.append((.225*rad*math.sin(a),.19*rad*math.cos(a),.276+.245*t))
for j in range(rings):
 for i in range(n):faces.append((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i))
mesh('Deerstalker fitted crown',verts,faces,capcloth,head,1)
ell('Cap short front peak',(0,-.153,.277),(.223,.099,.013),capcloth,head)
ell('Cap short rear peak',(0,.158,.278),(.211,.075,.013),capcloth,head)
curve('Cap sewn center',[(0,-.19,.28),(0,-.17,.39),(0,-.10,.49),(0,0,.523),(0,.10,.49),(0,.17,.39),(0,.19,.28)],.0025,thread,head)
for side in [-1,1]:curve('Small cap bow',[(0,0,.52),(side*.033,.012,.546),(side*.042,0,.548),(side*.02,-.008,.528),(0,0,.52)],.005,thread,head)

# Continuous painted tail bands; no jagged polygon borders or separate white bead.
tailmesh=bpy.data.objects.get('Striped curled tail')
remove_parts(['Soft white tail tip'])
tailmat=mat('Painted tail bands',(.7,.4,.1),.72);tailimage=bpy.data.images.new('Soft calico tail bands',width=32,height=256);data=[]
for j in range(256):
 z=j/255
 white_blend=softstep(.84,.88,z)
 stripe=max((1-softstep(.20,.23,z))*softstep(.07,.10,z),(1-softstep(.65,.68,z))*softstep(.46,.49,z))
 col=[(.82,.53,.19)[i]*(1-stripe)+(.065,.035,.025)[i]*stripe for i in range(3)]
 col=[col[i]*(1-white_blend)+(.98,.95,.90)[i]*white_blend for i in range(3)]
 for _ in range(32):data.extend(col+[1])
tailimage.pixels.foreach_set(data);tailimage.pack();tex=tailmat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=tailimage;tailmat.node_tree.links.new(tex.outputs['Color'],tailmat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
tailmesh.data.materials.clear();tailmesh.data.materials.append(tailmat);uv=tailmesh.data.uv_layers.active or tailmesh.data.uv_layers.new()
for poly in tailmesh.data.polygons:
 poly.material_index=0
 for idx in poly.loop_indices:
  v=tailmesh.data.vertices[tailmesh.data.loops[idx].vertex_index].co;uv.data[idx].uv=(.5,(v.z+.28)/1.18)
