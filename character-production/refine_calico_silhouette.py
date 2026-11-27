"""Reference silhouette pass. Execute after refine_calico_reference.py.

Preserves Head / Arm_ / Tail parents so the subsequent rig builder can skin
the replacement geometry. Updates points for its existing four-bone tail chain.
"""

import bmesh

def catmull(a,b,c,d,t):
 return .5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t)

# Compact, outward-splayed velvet ears, with curved surfaces instead of slabs.
remove_parts(['Soft velvet ear','Rose ear inset'])
earvelvet=mat('Ear velvet espresso',(.018,.010,.012),.82)
earlining=mat('Soft rose ear lining',(.64,.27,.34),.88)
outline=[Vector(p) for p in [(-.12,.18),(.06,.17),(.135,.245),(.145,.36),(.115,.54),(.075,.575),(-.005,.48),(-.085,.33)]]
boundary=[]
for i in range(len(outline)):
 for j in range(5):boundary.append(catmull(outline[(i-1)%len(outline)],outline[i],outline[(i+1)%len(outline)],outline[(i+2)%len(outline)],j/5))
center=Vector((.012,.33));count=len(boundary)

def ear_surface_y(p,r,back=False):
 # Front and back meet on one curved rim. Thickness falls toward the tip,
 # avoiding a constant-depth extrusion and a flat top in side view.
 height=max(0,min(1,(p.y-.18)/.395))
 mid=-.025+.014*height
 depth=(.065*(1-.72*height)) if back else (.075*(1-.65*height))
 dome=math.sqrt(max(0,1-r*r))
 return mid+depth*dome if back else mid-depth*dome

for side in [-1,1]:
 for inset in [False,True]:
  vertices=[];faces=[];radii=[.015,.20,.40,.60,.80,.92,.97,1]
  size=.73 if inset else 1
  for r in radii:
   for point in boundary:
    p=center+(point-center)*r*size
    # The lining follows the front bowl, just above the velvet surface.
    y=ear_surface_y(p,r*size)-(.002 if inset else 0)
    vertices.append((side*(.30+p.x),y,p.y))
  for j in range(len(radii)-1):
   for i in range(count):faces.append((j*count+i,j*count+(i+1)%count,(j+1)*count+(i+1)%count,(j+1)*count+i))
  faces.append(tuple(range(count-1,-1,-1)))
  if not inset:
   # A many-ring dome rounds the back and the edge, rather than a broad fan.
   # Its outer ring reuses the front rim vertices so the velvet shell is closed.
   previous=(len(radii)-1)*count
   for r in reversed(radii[:-1]):
    offset=len(vertices)
    for point in boundary:
     p=center+(point-center)*r
     vertices.append((side*(.30+p.x),ear_surface_y(p,r,True),p.y))
    for i in range(count):faces.append((previous+i,previous+(i+1)%count,offset+(i+1)%count,offset+i))
    previous=offset
   faces.append(tuple(previous+i for i in range(count)))
  ob=mesh('Rose ear inset' if inset else 'Soft velvet ear',vertices,faces,earlining if inset else earvelvet,head)
  # Mirror topology as well as positions to retain outward-facing normals.
  if side==-1:
   for poly in ob.data.polygons:poly.flip()
  bm=bmesh.new();bm.from_mesh(ob.data);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(ob.data);bm.free()

# A tapered fabric sleeve, aligned with the paw and cuff, under the shoulder cape.
remove_parts(['Coat sleeve'])
for side in [-1,1]:
 arm=bpy.data.objects.get('Arm_'+str(side));verts=[];faces=[];n=36
 levels=[(.018,.080,.087,.003),(-.015,.096,.101,.010),(-.11,.090,.095,.027),(-.20,.080,.085,.037),(-.29,.076,.080,.040),(-.325,.075,.079,.040)]
 for z,rx,ry,cx in levels:
  for i in range(n):a=i*math.tau/n;verts.append((side*cx+rx*math.sin(a),-.01+ry*math.cos(a),z))
 for j in range(len(levels)-1):
  for i in range(n):faces.append((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i))
 faces.extend([tuple(range(n-1,-1,-1)),tuple((len(levels)-1)*n+i for i in range(n))])
 mesh('Tailored tapered sleeve',verts,faces,cloth,arm,1)
 for ob in objects:
  if ob.parent==arm and ob.name.startswith('Folded sleeve cuff'):ob.location.x+=side*.04;ob.location.y-=.01
  if ob.parent==arm and ob.name.startswith('Cuff horn button'):ob.location.x+=side*.04;ob.location.y-=.01

# Low curl on the detective's left, then a shorter rise behind the shoulder.
# Eight control points are retained because the rig samples indices 0,2,4,6,7.
points=[(0,0,0),(-.09,.16,-.23),(-.30,.20,-.34),(-.47,.18,-.20),(-.49,.13,.02),(-.50,.09,.24),(-.52,.06,.43),(-.56,.03,.57)]
controls=[Vector(p) for p in points];samples=[]
for i in range(len(controls)-1):
 for j in range(12):samples.append(catmull(controls[max(0,i-1)],controls[i],controls[i+1],controls[min(len(controls)-1,i+2)],j/12))
samples.append(controls[-1]);lengths=[0]
for i in range(1,len(samples)):lengths.append(lengths[-1]+(samples[i]-samples[i-1]).length)
total=lengths[-1];verts=[];faces=[];ring_uv=[];n=24
for i,point in enumerate(samples):
 tangent=(samples[min(len(samples)-1,i+1)]-samples[max(0,i-1)]).normalized()
 u=tangent.cross(Vector((0,1,0))).normalized();v=tangent.cross(u).normalized()
 t=lengths[i]/total
 # Hemispherical taper over the final few rings closes the tip naturally.
 tip=min(1,max(0,(1-t)/.075));radius=.063*(.96+.04*math.sin(t*math.pi))*math.sqrt(max(.002,1-(1-tip)**2))
 for j in range(n):
  a=j*math.tau/n;verts.append(point+radius*(u*math.cos(a)+v*math.sin(a)));ring_uv.append((j/n,t))
for i in range(len(samples)-1):
 for j in range(n):faces.append((i*n+j,i*n+(j+1)%n,(i+1)*n+(j+1)%n,(i+1)*n+j))
faces.extend([tuple(range(n-1,-1,-1)),tuple((len(samples)-1)*n+j for j in range(n))])
data=bpy.data.meshes.new('Reference curled tail surface');data.from_pydata(verts,[],faces);data.update()
old=tailmesh.data;tailmesh.data=data;data.materials.append(tailmat)
uv=data.uv_layers.new(name='Tail arc length bands')
for poly in data.polygons:
 poly.use_smooth=True
 for idx in poly.loop_indices:
  vertex=data.loops[idx].vertex_index;uv.data[idx].uv=ring_uv[vertex]
# This texture depends only on V. Arc length keeps painted bands consistent
# through the curl and preserves the original tailmat / tailimage assets.
if old.users==0:bpy.data.meshes.remove(old)

# Matte dark leather, as in the supplied turnaround, rather than wet gloss.
leather.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.65
leather.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.055,.022,.014,1)
