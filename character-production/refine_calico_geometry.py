"""Geometry/material pass directed by calico-3d-target.png. Executed in builder scope."""
def remove_parts(prefixes):
 for ob in list(objects):
  if any(ob.name.startswith(n) for n in prefixes):objects.remove(ob);bpy.data.objects.remove(ob,do_unlink=True)
remove_parts(['Large velvet ear','Rose ear inset','Eye socket','Emerald iris','Large pupil','Catchlight','Small catchlight','Nose bridge','White chin','Front cap visor','Back cap visor','Pocket notebook','Notebook spiral','Magnifier'])
# Smooth painted fur boundaries, rather than polygon-by-polygon block edges.
im=bpy.data.images.new('Calico painted markings',width=512,height=256);pixels=[]
def softstep(a,b,t):
 v=max(0,min(1,(t-a)/(b-a)));return v*v*(3-2*v)
for py in range(256):
 lat=((py+.5)/256-.5)*math.pi
 for px in range(512):
  angle=((px+.5)/512-.5)*math.tau
  x=math.cos(lat)*math.cos(angle);y=math.cos(lat)*math.sin(angle);z=math.sin(lat)
  # An orange forehead blaze flanked by dark cheek patches; orange nape at back.
  cheek_edge=-.44+.45*(abs(x)-.35)**2
  dark_amount=softstep(.20+.15*(1-z),.23+.15*(1-z),abs(x))*softstep(cheek_edge,cheek_edge+.065,z)
  dark_amount=max(dark_amount,softstep(.62,.69,z))
  white_amount=(1-softstep(-.48,-.29,z))*softstep(.0,.35,-y)
  base=[.82,.52,.17];espresso=[.055,.033,.031];ivory=[.97,.94,.88]
  col=[(base[i]*(1-dark_amount)+espresso[i]*dark_amount)*(1-white_amount)+ivory[i]*white_amount for i in range(3)]
  pixels.extend(col+[1])
im.pixels.foreach_set(pixels);im.pack()
skin=mat('Smooth calico coat',(.5,.25,.1),.72)
tex=skin.node_tree.nodes.new('ShaderNodeTexImage');tex.image=im;skin.node_tree.links.new(tex.outputs['Color'],skin.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
skull.data.materials.clear();skull.data.materials.append(skin)
uv=skull.data.uv_layers.active or skull.data.uv_layers.new()
for polygon in skull.data.polygons:
 polygon.material_index=0
 coords=[]
 for idx in polygon.loop_indices:
  v=skull.data.vertices[skull.data.loops[idx].vertex_index].co
  coords.append((idx,math.atan2(v.y/.295,v.x/.405)/math.tau+.5,math.asin(max(-1,min(1,v.z/.335)))/math.pi+.5))
 wrap=max(t[1] for t in coords)-min(t[1] for t in coords)>.5
 for idx,u,v in coords:uv.data[idx].uv=(u+1 if wrap and u<.5 else u,v)

# Rounded triangular ears with a curved inset, matching the reference silhouette.
def ear_surface(side,inner=False):
 outline=[(-.12,.19),(-.12,.32),(-.10,.50),(-.065,.62),(-.015,.65),(.07,.53),(.13,.35),(.13,.22)]
 if side==1:outline=[(-x,z) for x,z in outline]
 center=(0,.36);outline=[(x*(.72 if inner else 1),(z-center[1])*(.77 if inner else 1)+center[1]) for x,z in outline]
 vs=[(side*.30+x,(-.10 if inner else -.075),z) for x,z in outline]
 vs+=[(side*.30+x*.85,.055,z) for x,z in outline]
 n=len(outline);fs=[tuple(range(n-1,-1,-1)),tuple(range(n,n*2))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
 ob=mesh('Rose ear inset' if inner else 'Soft velvet ear',vs,fs,pink if inner else dark,head)
 bevel=ob.modifiers.new('Rounded ear silhouette','BEVEL');bevel.width=.035 if inner else .055;bevel.segments=5
 return ob
for side in [-1,1]:
 ear_surface(side);ear_surface(side,True)
 x=side*.174
 ell('Eye socket',(x,-.263,.035),(.108,.018,.111),dark,head)
 ell('Emerald iris',(x,-.277,.035),(.099,.023,.101),iris,head)
 ell('Large pupil',(x,-.298,.042),(.069,.012,.074),pupil,head)
 ell('Catchlight',(x-.023,-.311,.082),(.021,.004,.021),glint,head,24)
 ell('Small catchlight',(x+.024,-.311,.008),(.005,.003,.005),glint,head,16)
ell('Nose bridge',(0,-.287,-.105),(.065,.032,.067),white,head)
ell('White chin',(0,-.240,-.224),(.166,.063,.068),white,head)
ell('Front cap visor',(0,-.164,.276),(.218,.115,.017),hat,head)
ell('Back cap visor',(0,.177,.278),(.21,.069,.018),hat,head)
# A central overlapping coat seam and restrained stitching unify the tailoring.
curve('Coat front seam',[(.018,-.205,.425),(.018,-.211,.55),(.018,-.19,.70),(.018,-.18,.90)],.0045,lapel)
for side in [-1,1]:
 curve('Cape stitching',[(side*.12,-.22,.96),(side*.22,-.19,.98),(side*.29,-.13,1.005)],.0025,lapel)
 curve('Belt loop',[(side*.18,-.154,.69),(side*.18,-.170,.75),(side*.18,-.150,.78)],.009,coat)
for ob in objects:
 if ob.type=='MESH' and ob.name.startswith('Raised collar and lapel'):
  ob.data.materials.clear();ob.data.materials.append(coat)
# Fine fabric weave: avoid the old coarse striped surface.
for material in [coat,hat]:
 for node in material.node_tree.nodes:
  if node.type=='TEX_IMAGE':
   texcoord=material.node_tree.nodes.new('ShaderNodeTexCoord');mapping=material.node_tree.nodes.new('ShaderNodeMapping');mapping.inputs['Scale'].default_value=(2.5,2.5,2.5)
   material.node_tree.links.new(texcoord.outputs['UV'],mapping.inputs['Vector']);material.node_tree.links.new(mapping.outputs['Vector'],node.inputs['Vector']);break
