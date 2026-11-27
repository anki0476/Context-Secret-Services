// Adapted from Watermelon UI's labeled-progress-indicator.
// Labels follow deliberate clicks rather than an automatic interval.
import React from 'react';
import {createRoot} from 'react-dom/client';
import {motion,AnimatePresence} from 'motion/react';
import {CRATE_CLICKS} from './crate-progress.js';
import './container-progress.css';
function LabeledProgressIndicator({clicks,status,reducedMotion}){
 const label=status==='opening'?'Seal released!':clicks>=4?'Almost there…':clicks>=2?'Loosening the lid…':'Tap Inspect to open';
 return <div className="crate-progress-content"><div className="crate-progress-label" aria-live="polite"><AnimatePresence mode="popLayout" initial={false}><motion.span key={label} initial={reducedMotion?false:{opacity:0,y:8,rotateX:-60,filter:'blur(4px)'}} animate={{opacity:1,y:0,rotateX:0,filter:'blur(0px)'}} exit={{opacity:0,rotateX:90}} transition={reducedMotion?{duration:0}:{type:'spring',stiffness:600,damping:100,mass:3}}>{label}</motion.span></AnimatePresence><b>{clicks} / {CRATE_CLICKS}</b></div><div className="crate-progress-track" role="progressbar" aria-label="Crate opening progress" aria-valuemin={0} aria-valuemax={CRATE_CLICKS} aria-valuenow={clicks}><motion.div className="crate-progress-fill" initial={false} animate={{width:`${clicks/CRATE_CLICKS*100}%`}} transition={{duration:reducedMotion?0:.14,ease:'easeOut'}}><motion.i aria-hidden="true" animate={reducedMotion?{}:{x:['-100%','200%']}} transition={{duration:2,repeat:Infinity,ease:'linear'}}/></motion.div></div></div>;
}
export function mountContainerProgress(host,reducedMotion){const root=createRoot(host);let previous='';return {update(id,state){const key=id?`${id}:${state.clicks}:${state.status}:${reducedMotion()}`:'';if(key===previous)return;previous=key;host.hidden=!id;root.render(id?<LabeledProgressIndicator key={id} {...state} reducedMotion={reducedMotion()}/>:null);}};}
