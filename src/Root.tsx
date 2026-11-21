import React from 'react';
import {Composition} from 'remotion';
import {HandlowiecReel, TOTAL_FRAMES} from './HandlowiecReel';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="HandlowiecReel"
    component={HandlowiecReel}
    durationInFrames={TOTAL_FRAMES}
    fps={30}
    width={1080}
    height={1920}
  />
);
