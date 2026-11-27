export const CRATE_CLICKS=6;
export const dummyCrates=[
 {id:'supplies-napkins',name:'Coral supply crate',x:-4.9,z:1.6,color:0xe98568,note:'Folded napkins and spare tablecloths. Nothing here explains the photograph.'},
 {id:'supplies-cups',name:'Teal supply crate',x:1.2,z:3.8,color:0x329e9a,note:'Stacks of unused paper cups. No clue here.'},
 {id:'supplies-ribbons',name:'Honey supply crate',x:.6,z:-3.8,color:0xd6a34e,note:'Spare ribbons and decoration rolls. No hidden note or useful evidence.'}
];
export const containerIds=new Set(['storage','packing',...dummyCrates.map(c=>c.id)]);
export function createCrateProgress(){
 const states=new Map();
 const get=id=>states.get(id)||{clicks:0,status:'closed'};
 return {get,click(id){if(!containerIds.has(id))return null;const previous=get(id);if(previous.status==='opening'||previous.status==='open')return previous;const clicks=Math.min(CRATE_CLICKS,previous.clicks+1),next={clicks,status:clicks===CRATE_CLICKS?'opening':'closed'};states.set(id,next);return next;},finish(id){if(get(id).status==='opening')states.set(id,{clicks:CRATE_CLICKS,status:'open'});},reset(){states.clear();}};
}
