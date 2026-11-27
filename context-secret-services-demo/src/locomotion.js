export function createLocomotion(maxSpeed=1.75){
  let vx=0,vz=0;
  return {
    reset(){vx=0;vz=0;},
    step(direction,dt){
      dt=Math.min(.05,Math.max(0,dt));
      const length=Math.hypot(direction.x,direction.z),divisor=Math.max(1,length);
      const targetX=direction.x/divisor*maxSpeed,targetZ=direction.z/divisor*maxSpeed;
      const blend=1-Math.exp(-(length>.001?12:20)*dt);
      vx+=(targetX-vx)*blend;vz+=(targetZ-vz)*blend;
      if(length<.001&&Math.hypot(vx,vz)<.015){vx=0;vz=0;}
      return {dx:vx*dt,dz:vz*dt};
    }
  };
}
