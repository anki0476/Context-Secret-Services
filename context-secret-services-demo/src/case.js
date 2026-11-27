export const clues = [
 {id:'receipt',name:'The original receipt',short:'Receipt',symbol:'▤',category:'DOCUMENT · BAKERY RECEIPT',description:'The bakery invoice is still clipped to the delivery trolley. The cake was ordered before anyone knew there would be a comeback.',quote:'“Farewell cake · GOOD RIDDANCE · Ordered 17 Nov · Paid in full.”',thought:'The icing belongs to last week’s farewell, not today’s return.',art:'receipt',material:'paper'},
 {id:'phone',name:'A very last-minute return',short:'Message',symbol:'▯',category:'MESSAGE · OFFICE GROUP CHAT',description:'An unlocked work phone sits beside the drinks. The office manager’s messages tell a different story from the photograph.',quote:'“He’s back. Reception at six. No time for a new cake—use the one in cold storage. Cover the old message!”',thought:'They meant to reuse the cake, not repeat its message.',art:'phone',material:'rigid'},
 {id:'plaque',name:'The missing welcome',short:'Plaque',symbol:'✦',category:'OBJECT · DELIVERY PACKAGING',description:'Lift the tissue paper in the open delivery box. An untouched sugar plaque is tucked beneath it.',quote:'“WELCOME BACK”',thought:'The new message arrived. It just never reached the cake.',art:'plaque',material:'rigid'},
 {id:'crate',name:'Seven days on ice',short:'Storage',symbol:'▧',category:'LABEL · COLD-STORAGE CRATE',description:'A cooler beside the dessert table carries the same bakery order number as the receipt. Its storage log bridges the two parties.',quote:'“Order #0417 · Stored 17 Nov · Released 24 Nov, 17:40.”',thought:'This really is the original cake. The matching order number connects the evidence.',art:'crate',material:'paper'},
 {id:'banner',name:'A room prepared for a return',short:'Banner',symbol:'⚑',category:'SCENE · THE PART OUTSIDE THE FRAME',description:'The photograph cut off the decorations behind the camera. The room is dressed for a welcome-back celebration.',quote:'“WELCOME BACK, BOSS”',thought:'The wider scene contradicts the idea that this was a farewell party.',art:'banner',material:'rigid'}
];
export const theories=[
 {id:'insult',text:'The team ordered an insulting cake for his return.',feedback:'Check the receipt: the cake was ordered a week earlier. The new welcome plaque also contradicts an intentional insult.'},
 {id:'reuse',text:'They reused his farewell cake, but forgot its new welcome plaque.',feedback:''},
 {id:'farewell',text:'The photograph is from last week’s farewell party.',feedback:'The current message and welcome-back decorations place this scene at the return celebration.'}
];
export const requiredClues=['receipt','phone','plaque'];
export const caseRiddle={
 title:'An old truth, a new accusation.',
 lines:[
  'I kept my word while the room changed its mind.',
  'Seven nights stood between my meaning and my audience.',
  'Another voice was meant to speak for me,',
  'but waited where no one was looking.',
  'The frame caught what I said,',
  'not why I was still saying it.',
  'What is guilty of bad timing,',
  'yet innocent of a new insult?'
 ]
};
export function canReconstruct(found){return requiredClues.every(id=>found.has(id));}
export function evaluateTheory(id,found){if(!canReconstruct(found))return {correct:false,message:'Find the receipt, the message, and the missing welcome first.'};const theory=theories.find(t=>t.id===id);return {correct:id==='reuse',message:theory?.feedback??'Choose an explanation first.'};}
