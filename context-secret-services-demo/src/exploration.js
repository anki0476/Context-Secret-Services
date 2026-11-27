import {dummyCrates} from './crate-progress.js';
// Inspectable objects are semantic props, not every individual polygon.
// Large props use a footprint so evidence remains reachable around furniture.
const object=(id,name,x,z,y=.7,radius=.25,clue=null,note='Nothing here connects to the photograph.')=>({id,name,x,z,y,radius,clue,note});
export const objects=[
 ...dummyCrates.map(c=>object(c.id,c.name,c.x,c.z,.9,.6,null,c.note)),
 object('trolley','Catering trolley',3.7,-2.8,1.5,.85,'receipt'),
 object('phone','Office phone',-3.05,-2.6,1.3,.65,'phone'),
 object('packing','Pastry delivery box',4.05,1.6,.9,.85,'plaque'),
 object('storage','Cold-storage crate',-2.6,1.3,1,.8,'crate'),
 object('banner','Party banner',-5.55,-.8,2.1,.75,'banner'),
 object('table','Reception table',0,0,1.8,2.15,null,'A polished table, set for the reception. No hidden note or mark.'),
 object('cake','Farewell cake',-.35,.35,2.65,2.1,null,'The icing says “GOOD RIDDANCE.” That is already in the photograph. You need evidence of why it is here.'),
 object('host','Returning CEO',1.9,-1.75,1.7,.4,null,'He is waiting for the reception to begin. His expression alone cannot tell you what happened.'),
 object('side-table','Drinks table',4.5,-.15,1.1,.5,null,'A little table for refreshments. Nothing concealed underneath.'),
 object('cups','Paper cups',4.5,-.15,1.5,.55,null,'Empty paper cups. No messages inside.'),
 object('cloche','Brass serving dome',4.02,-2.8,1.9,.8,null,'Only refreshments under the dome. No clue here.'),
 object('plates-stack','Stacked plates',3.37,-2.8,1.6,.8,null,'Clean plates, ready for cake. No clue here.'),
 object('console','Phone cabinet',-3.2,-2.8,1,.85,null,'A small cabinet used for party supplies. Its shelves contain no clue.'),
 object('mug','Coffee mug',-3.6,-2.9,1.5,.75,null,'The coffee has gone cold. Nothing relevant to the cake.'),
 object('purple-can','Purple soda can',1.4,-.7,2,1.15,null,'An unopened soda. The label has nothing to do with the party mix-up.'),
 object('orange-can','Orange soda can',-1.15,-.9,2,1.15,null,'A fizzy drink, not a secret message.'),
 ...[[-2.8,-.3],[2.7,-.1],[-1.7,2.8]].map(([x,z],i)=>object('chair-'+i,'Coral chair',x,z,1.2,.6,null,'You check the seat and underneath it. No clue here.')),
 ...[[1.35,.75],[-1.35,-.5]].flatMap(([x,z],i)=>[object('plate-'+i,'Dessert plate',x,z,1.9,1.2,null,'No crumbs, writing, or useful marks.'),object('fork-'+i,'Dessert fork',x+.37,z,1.9,1.2,null,'Ordinary cutlery. No clue here.')]),
 ...[[-5.7,-4],[5.6,-4.2],[-5.8,3.8],[4.8,3.8],[-3.5,-4]].map(([x,z],i)=>object('plant-'+i,'Potted plant',x,z,1,.6,null,'Leaves, soil, and an ordinary flowerpot. No clue here.')),
 ...[-4.6,-1.6,1.6,4.6].map((x,i)=>object('flowers-'+i,'Window flowers',x,-4.55,1.5,.7,null,'Decorative flowers along the parapet. Nothing tucked among them.')),
 ...[-4.95,-1.7,1.7,4.95].map((x,i)=>object('window-'+i,'Teal window bay',x,-4.95,2.4,1.1,null,'You examine the frame and panes. No clue here.')),
 ...Array.from({length:7},(_,i)=>object('lantern-'+i,'Paper lantern',-5.5+i*1.8,-3.9,3.7,.5,null,'A paper lantern and its cord. No clue here.')),
 ...[-4,0,4].map((x,i)=>object('bunting-'+i,'Party bunting',x,-4,3.5,1,null,'Colorful flags. Their pattern does not conceal a message.')),
 object('door','Terrace entrance',6.4,-1.5,1.8,1.5,null,'The reception entrance. No clue on the door or handle.'),
 object('steps','Terrace steps',5,4.3,.4,.7,null,'The stairs lead out of the case area. Nothing relevant on the steps.'),
 { ...object('left-wall','Stone parapet',-6.5,0,1,0,null,'Just the terrace wall. No clue here.'),bounds:[-6.6,-6.3,-4.7,4.5]},
 { ...object('right-wall','Stone parapet',6.5,0,1,0,null,'Just the terrace wall. No clue here.'),bounds:[6.3,6.6,-4.7,4.5]},
];
export function distanceToObject(position,item){
 if(item.bounds){const [l,r,b,f]=item.bounds;return Math.hypot(Math.max(l-position.x,0,position.x-r),Math.max(b-position.z,0,position.z-f));}
 return Math.max(0,Math.hypot(position.x-item.x,position.z-item.z)-item.radius);
}
export function nearbyObjects(position){return objects.filter(o=>distanceToObject(position,o)<=1.15).sort((a,b)=>Number(!!a.fallback)-Number(!!b.fallback)||distanceToObject(position,a)-distanceToObject(position,b));}
export const LENS_DURATION=1000;
export function lensVisible(now,until){return now<until;}
