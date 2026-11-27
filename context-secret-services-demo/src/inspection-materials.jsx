import React from 'react';
import {createRoot} from 'react-dom/client';
import PaperCrumple from './components/PaperCrumple.jsx';
import HoloCard from './components/HoloCard.jsx';
import {evidenceArtwork} from './evidence-artwork.js';
import './inspection-materials.css';

export function mountInspectionMaterials(host, dialog, reducedMotion) {
  const root = createRoot(host);
  dialog.addEventListener('close', () => root.render(null));
  return {
    show(clue) {
      const paper = clue.material === 'paper';
      const reduce = reducedMotion() || matchMedia('(prefers-reduced-motion: reduce)').matches;
      const image = evidenceArtwork[clue.art];
      root.render(<div className={`material-exhibit material-${paper ? 'paper' : clue.art}`} key={clue.id}>
        <span className="material-label">{paper ? 'PAPER EVIDENCE' : 'OBJECT EVIDENCE'}</span>
        <div className="material-stage">
          {reduce ? <img className="material-still" src={image} alt={clue.name} /> : paper ?
            <PaperCrumple src={image} alt={clue.name} width={270} height={387} sceneHeight={430}
              style={{height:'100%'}} imageFit="contain" releaseBehavior="restore"
              crumpleAmount={0.72} crumpleDuration={0.6} releaseDuration={0.65}
              foldCount={6} wrinkleDepth={0.65} detail={48} paperColor="#fff1d2"
              paperTexture={0.08} rotation={-3} shadowOpacity={0.16} dragRadius={70} /> :
            <HoloCard image={image} alt={clue.name} width={clue.art === 'phone' ? 230 : 310}
              preset={clue.art === 'phone' ? 'rainbow' : 'gold'} intensity={clue.art === 'phone' ? 0.18 : 0.42}
              edgeSparkle={0.18} glare={0.15} tiltMax={12} hoverScale={1.025}
              radius={clue.art === 'phone' ? 24 : 8} idle={false} />}
        </div>
        <p className="material-hint">{reduce ? 'Original evidence · motion reduced' : paper ? 'Hold to crumple · Release to unfold' : 'Move across the object to catch the light'}</p>
      </div>);
    }
  };
}
