import fs from 'node:fs';
import assert from 'node:assert/strict';
for(const name of ['detective','party-host']){
 const path=new URL(`./output/${name}/${name}.glb`,import.meta.url),data=fs.readFileSync(path);
 assert.equal(data.toString('utf8',0,4),'glTF');assert.equal(data.readUInt32LE(4),2);assert.equal(data.readUInt32LE(8),data.length);
 const length=data.readUInt32LE(12),gltf=JSON.parse(data.toString('utf8',20,20+length));
 assert.ok(gltf.skins?.length,'Missing skin');assert.ok(gltf.animations?.some(x=>x.name==='Walk'),'Missing walk animation');
 assert.ok(gltf.meshes.length>10,'Unexpectedly few meshes');
 const skinned=gltf.meshes.flatMap(m=>m.primitives).filter(p=>p.attributes.JOINTS_0!==undefined&&p.attributes.WEIGHTS_0!==undefined);
 assert.ok(skinned.length>10,'Missing joint/weight attributes');
 const triangles=gltf.meshes.flatMap(m=>m.primitives).reduce((n,p)=>n+(p.indices!==undefined?gltf.accessors[p.indices].count/3:0),0);
 console.log(JSON.stringify({name,bytes:data.length,meshes:gltf.meshes.length,triangles,skins:gltf.skins.length,bones:gltf.skins[0].joints.length,animations:gltf.animations.map(a=>a.name)}));
}
