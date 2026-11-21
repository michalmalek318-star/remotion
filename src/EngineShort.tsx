import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

// Short 15 s: „Hazeo Engine szuka klientów za Ciebie”.
// Tło wideo = 3 ujęcia z Higgsfield (public/engine/shot1-3.mp4); napisy i znak HAZEO dokładane tutaj.
const C = {bg: '#111217', text: '#FFFFFF', muted: '#B8BAC4', accent: '#E5383B'};
const FONT = 'Inter, Montserrat, "DejaVu Sans", sans-serif';
export const ENGINE_FRAMES = 450;

const SHOTS = [
  {file: 'engine/shot1.mp4', lines: [{t: 'Hazeo Engine'}, {t: 'szuka klientów', hl: true}, {t: 'za Ciebie'}]},
  {file: 'engine/shot2.mp4', lines: [{t: 'Sprawdzone firmy.'}, {t: 'Prawdziwi decydenci.', hl: true}]},
  {file: 'engine/shot3.mp4', lines: [{t: 'Twój handlowiec'}, {t: 'tylko dzwoni.', hl: true}]},
];

const Lines: React.FC<{lines: {t: string; hl?: boolean}[]}> = ({lines}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{position: 'absolute', top: 1230, left: 70, right: 70, fontFamily: FONT}}>
      {lines.map((l, i) => {
        const s = spring({frame: frame - 6 - i * 8, fps, config: {damping: 200}});
        return (
          <div key={l.t} style={{fontSize: 76, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1, color: l.hl ? C.accent : C.text, opacity: s, transform: `translateY(${(1 - s) * 40}px)`, textShadow: '0 4px 24px rgba(0,0,0,0.6)'}}>
            {l.t}
          </div>
        );
      })}
    </div>
  );
};

const Shot: React.FC<{file: string; available: boolean}> = ({file, available}) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 150], [1.0, 1.06]);
  return available ? (
    <AbsoluteFill style={{transform: `scale(${zoom})`}}>
      <OffthreadVideo src={staticFile(file)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
  ) : (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, #3a1214 0%, ${C.bg} 60%)`}} />
  );
};

export const EngineShort: React.FC<{shotsAvailable: boolean}> = ({shotsAvailable}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {SHOTS.map((s, i) => (
        <Sequence key={s.file} from={i * 150} durationInFrames={150}>
          <Shot file={s.file} available={shotsAvailable} />
          <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(17,18,23,0.55) 0%, rgba(17,18,23,0) 30%, rgba(17,18,23,0) 45%, rgba(17,18,23,0.9) 62%, rgba(17,18,23,0.95) 100%)'}} />
          <Lines lines={s.lines} />
        </Sequence>
      ))}
      <div style={{position: 'absolute', top: 110, left: 70, fontFamily: FONT, fontWeight: 800, fontSize: 34, letterSpacing: 8, color: C.text, display: 'flex', alignItems: 'center', gap: 14}}>
        <div style={{width: 14, height: 14, borderRadius: 7, background: C.accent, boxShadow: `0 0 18px ${C.accent}`}} />
        HAZEO
      </div>
      <div style={{position: 'absolute', top: 1500, left: 70, fontFamily: FONT, fontSize: 44, fontWeight: 700, color: C.text, opacity: interpolate(frame, [330, 345], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
        <span style={{color: C.accent}}>→</span> hazeo.pl
      </div>
    </AbsoluteFill>
  );
};
