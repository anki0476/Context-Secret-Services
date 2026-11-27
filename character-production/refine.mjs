import fs from 'node:fs';
const p=new URL('./build_detective.py',import.meta.url);let s=fs.readFileSync(p,'utf8');
s=s.replace("(.036,.02,.016),.36","(.036,.02,.016),.85");
s=s.replace("(.027,.025,.025)","(.018,.018,.018)").replaceAll('ec.y-.023','ec.y-.017').replaceAll('ec.y-.026','ec.y-.019').replaceAll('ec.y-.027','ec.y-.020').replace('(.010,.003,.010)','(.007,.002,.007)').replace('(.0045,.0015,.0045)','(.0035,.001,.0035)');
let a=s.indexOf("torso('Coral shirt'");let b=s.indexOf("for s,suffix in [(1,'L'),(-1,'R')]:",a);
s=s.slice(0,a)+`# Continuous fitted garments follow the human mesh, including shoulder transitions.
shirt_ids=[]; jacket_ids=[]
for k,f in enumerate(faces):
    c=sum((verts[i] for i in f),Vector())/len(f)
    if .98<c.z<1.56 and abs(c.x)<.24: shirt_ids.append(k)
    if .99<c.z<1.53 and abs(c.x)<.47 and not (c.y<-.045 and abs(c.x)<.065): jacket_ids.append(k)
shirt=patch('Fitted coral shirt',shirt_ids,coral,.012)
jacket=patch('Continuous tailored jacket',jacket_ids,teal,.026)
for garment in [shirt,jacket]:
    sub=garment.modifiers.new('Cloth smoothing','SUBSURF');sub.levels=1
    solid=garment.modifiers.new('Fabric thickness','SOLIDIFY');solid.thickness=.004
`+s.slice(b);
s=s.replace("    tube('Jacket sleeve '+suffix,points,[.087,.09,.08,.073,.067,.061],teal)","");
a=s.indexOf('# Follow the skull surface');b=s.indexOf('# Satchel with flap',a);
s=s.slice(0,a)+`# Smooth scalp cap with controlled hairline and rounded swept fringe.
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

`+s.slice(b);fs.writeFileSync(p,s);
