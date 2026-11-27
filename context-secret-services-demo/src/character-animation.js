import * as THREE from 'three';

// Stance foot travel / stance duration, scaled to the world model's size.
export const CALICO_WALK_SPEED = .32 / (.62 * .8) * 1.3;
export function characterAnimation(gltf) {
  const mixer = new THREE.AnimationMixer(gltf.scene);
  const clip = gltf.animations.find(a => a.name === 'Walk') || gltf.animations[0];
  if (!clip) return {update() {},inspect() {},reset() {}};
  const tracks = clip.tracks.map(track => {
    const idle = track.clone();
    idle.times = new Float32Array([0]);
    idle.values = track.values.slice(0, track.getValueSize());
    return idle;
  });
  const idleClip=gltf.animations.find(a=>a.name==='Idle');
  const idle = mixer.clipAction(idleClip || new THREE.AnimationClip('Standing', 1, tracks)).play();
  const walk = mixer.clipAction(clip).play();
  walk.setEffectiveWeight(0);
  const inspectClip=gltf.animations.find(a=>a.name==='Inspect');
  const inspection=inspectClip?mixer.clipAction(inspectClip).setLoop(THREE.LoopOnce,1):null;
  if(inspection)inspection.clampWhenFinished=true;
  const head=gltf.scene.getObjectByName('Head'),spine=gltf.scene.getObjectByName('Spine');
  let amount=0,gestureTime=0,gesture=false,turn=0,elapsed=0;
  mixer.update(0);
  return {
    inspect(){if(!inspection||gesture)return;gesture=true;gestureTime=0;inspection.reset().setEffectiveWeight(0).play();},
    reset(){amount=0;gesture=false;gestureTime=0;turn=0;inspection?.stop();walk.time=0;idle.time=0;},
    update(dt, speed=0, options={}) {
      dt=Math.min(Math.max(dt,0),.05);elapsed+=dt;
      const actualSpeed=options.worldSpeed ?? speed*CALICO_WALK_SPEED;
      amount=THREE.MathUtils.damp(amount,THREE.MathUtils.clamp(actualSpeed/.45,0,1),14,dt);
      let gestureWeight=0;
      if(gesture){gestureTime+=dt;const duration=inspectClip.duration;
        gestureWeight=Math.min(1,gestureTime/.14,Math.max(0,(duration-gestureTime)/.18));
        if(gestureTime>=duration){gesture=false;inspection.stop();}
      }
      idle.setEffectiveWeight((1-amount)*(1-gestureWeight));walk.setEffectiveWeight(amount*(1-gestureWeight));
      walk.setEffectiveTimeScale(actualSpeed>.015?actualSpeed/CALICO_WALK_SPEED:0);
      if(gesture)inspection.setEffectiveWeight(gestureWeight);
      mixer.update(options.reducedMotion?0:dt);
      if(options.reducedMotion)return;
      turn=THREE.MathUtils.damp(turn,THREE.MathUtils.clamp(options.turnRate||0,-2,2),8,dt);
      if(idleClip&&head)head.rotation.y+=turn*.055;
      if(idleClip&&spine)spine.rotation.z-=turn*.022*amount;
      // Older human model: subtle breathing and looking rather than a frozen pose.
      if(!idleClip){gltf.scene.position.y=Math.sin(elapsed*1.7)*.004;gltf.scene.rotation.y=Math.sin(elapsed*.45)*.025;}
    }
  };
}
