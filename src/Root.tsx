import React from 'react';
import {Composition} from 'remotion';
import {HandlowiecReel, TOTAL_FRAMES} from './HandlowiecReel';
import {EngineShort, ENGINE_FRAMES} from './EngineShort';
import {ScoringVideo, SCORING_FRAMES} from './ScoringVideo';

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id="ScoringVideo"
    component={ScoringVideo}
    durationInFrames={SCORING_FRAMES}
    fps={30}
    width={1080}
    height={1350}
    defaultProps={{withSound: true}}
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
