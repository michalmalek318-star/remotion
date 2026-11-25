import React from 'react';
import {Composition} from 'remotion';
import {HandlowiecReel, TOTAL_FRAMES} from './HandlowiecReel';
import {EngineShort, ENGINE_FRAMES} from './EngineShort';
import {Rolka10s, ROLKA10_FRAMES} from './Rolka10s';

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id="Rolka10s"
    component={Rolka10s}
    durationInFrames={ROLKA10_FRAMES}
    fps={30}
    width={1080}
    height={1920}
  />
  <Composition
    id="EngineShort"
    component={EngineShort}
    durationInFrames={ENGINE_FRAMES}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{shotsAvailable: false}}
  />
  <Composition
    id="HandlowiecReel"
    component={HandlowiecReel}
    durationInFrames={TOTAL_FRAMES}
    fps={30}
    width={1080}
    height={1920}
  />
  </>
);
