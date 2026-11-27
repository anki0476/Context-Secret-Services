// Adapted from Watermelon UI's invite-disclosure registry component.
// Preserves its shared-layout pill/card morph, badge morph, and staggered rows.
import React,{useEffect,useRef} from 'react';
import {AnimatePresence,motion,MotionConfig} from 'motion/react';
import {MdOutlineClose} from 'react-icons/md';

export function InviteDisclosure({title,badgeCount,invites,isOpen,onOpenChange,onSelect,reducedMotion=false}){
 const panel=useRef(null),trigger=useRef(null);
 useEffect(()=>{
  if(!isOpen)return;
  panel.current?.querySelector('button')?.focus();
  const handle=event=>{
   if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();onOpenChange(false);}
   if(event.key==='Tab'){
    const buttons=[...panel.current.querySelectorAll('button:not(:disabled)')];
    const i=buttons.indexOf(document.activeElement);
    if(event.shiftKey&&i<=0){event.preventDefault();buttons.at(-1)?.focus();}
    else if(!event.shiftKey&&i===buttons.length-1){event.preventDefault();buttons[0]?.focus();}
   }
  };
  window.addEventListener('keydown',handle,true);
  return()=>window.removeEventListener('keydown',handle,true);
 },[isOpen,onOpenChange]);
 const transition=reducedMotion?{duration:0}:{type:'spring',stiffness:800,damping:80,mass:isOpen?5:4};
 return <MotionConfig transition={transition}>
  <AnimatePresence mode="popLayout" initial={false}>
   {!isOpen?<motion.button key="closed" ref={trigger} layoutId="detective-disclosure" className="disclosure-trigger" style={{borderRadius:32}} onClick={()=>onOpenChange(true)} aria-expanded="false" aria-label="Detective tools">
    <motion.span layoutId="detective-title">{title}</motion.span>
    <motion.span layoutId="detective-badge" className="disclosure-badge">{badgeCount}</motion.span>
   </motion.button>:<motion.section key="open" ref={panel} layoutId="detective-disclosure" className="disclosure-card" style={{borderRadius:24}} role="dialog" aria-modal="true" aria-label="Detective equipment">
    <header><motion.h2 layoutId="detective-title">{title}</motion.h2><motion.button layoutId="detective-badge" className="disclosure-close" aria-label="Close detective tools" onClick={()=>onOpenChange(false)}><MdOutlineClose/></motion.button></header>
    <div className="disclosure-items">{invites.map((item,index)=><motion.button key={item.id} className="disclosure-item" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} whileHover={reducedMotion?undefined:{scale:1.02}} transition={reducedMotion?{duration:0}:{delay:index*.04+.1,type:'spring',stiffness:260,damping:20}} onClick={()=>onSelect(item.id)}>
     <span className="disclosure-icon">{item.icon}</span><span><strong>{item.title}</strong><small>{item.description}</small></span>
    </motion.button>)}</div>
   </motion.section>}
  </AnimatePresence>
 </MotionConfig>;
}

