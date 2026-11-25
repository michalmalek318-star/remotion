import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

// Rolka IG 10 s, 9:16, 30 fps. Tło: ujęcie Michała (nocne miasto, czerwone linie łączą budynki) public/rolka10/miasto.mp4.
// Styl jak ExportStories: cięcia na bit 120 BPM, punch-in, glitch obrazu, wstrząs, błyski. Dźwięk: scripts/rolka10_sfx.py.
const C = {bg: '#111217', panel: '#1A1C23', line: '#2A2D37', red: '#E5383B', text: '#F2F2F4', muted: '#A9ACB8'};
const FONT = 'Inter, Montserrat, "DejaVu Sans", sans-serif';
export const CUTS = [0, 60, 120, 195, 255];
export const ROLKA10_FRAMES = 300;
const BEAT = 15; // 120 BPM przy 30 fps
const ZOOM = [1.0, 1.14, 1.04, 1.2, 1.1]; // bazowy kadr każdego segmentu

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const T: React.CSSProperties = {fontFamily: FONT, color: C.text, letterSpacing: -1.5};

const segAt = (f: number) => CUTS.reduce((acc, c, i) => (f >= c ? i : acc), 0);

const useIn = (delay: number, damping = 13) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping, stiffness: 190, mass: 0.7}});
};

const shake = (frame: number, at: number, power = 16, len = 10) => {
  const d = frame - at;
  if (d < 0 || d > len) return 'translate(0px,0px)';
  const k = (1 - d / len) * power;
  return `translate(${Math.sin(d * 7.3) * k}px, ${Math.cos(d * 5.1) * k}px)`;
};

const rgbText = (frame: number, at: number, len = 8) => {
  const d = frame - at;
  if (d < 0 || d > len) return '0 6px 34px rgba(0,0,0,.75)';
  const o = (1 - d / len) * 11;
  return `${o}px 0 rgba(229,56,59,.95), ${-o}px 0 rgba(0,220,255,.75), 0 6px 34px rgba(0,0,0,.75)`;
};

const Pop: React.FC<{at: number; children: React.ReactNode; from?: 'up' | 'zoom' | 'left' | 'right'; style?: React.CSSProperties}> = ({at, children, from = 'up', style}) => {
  const s = useIn(at);
  const frame = useCurrentFrame();
  const tr =
    from === 'zoom' ? `scale(${interpolate(s, [0, 1], [1.9, 1])})` :
    from === 'left' ? `translateX(${(1 - s) * -700}px)` :
    from === 'right' ? `translateX(${(1 - s) * 700}px)` :
    `translateY(${(1 - s) * 70}px)`;
  const blur = interpolate(frame - at, [0, 6], [14, 0], clamp);
  return <div style={{opacity: frame < at ? 0 : Math.min(1, s * 1.6), transform: tr, filter: `blur(${blur}px)`, ...style}}>{children}</div>;
};

// --- tło wideo: punch-in na cięciach, puls na bit, glitch pasami ----------
const Clip: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <OffthreadVideo src={staticFile('rolka10/miasto.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover', ...style}} />
);

const VideoBg: React.FC = () => {
  const frame = useCurrentFrame();
  const i = segAt(frame);
  const c = CUTS[i];
  const d = frame - c;
  const punch = i === 0 ? 0 : 0.16 * Math.exp(-d / 5);
  const beatD = frame >= CUTS[1] ? (frame - CUTS[1]) % BEAT : 99;
  const beat = 0.018 * Math.exp(-beatD / 3);
  const drift = interpolate(frame - c, [0, 80], [0, 0.05], clamp);
  const scale = ZOOM[i] + punch + beat + drift;
  // końcówka: przyciemnienie i rozmycie pod znak HAZEO
  const endDim = interpolate(frame, [CUTS[4], CUTS[4] + 12], [0, 0.62], clamp);
  const endBlur = interpolate(frame, [CUTS[4], CUTS[4] + 12], [0, 7], clamp);
  const bright = 1 + 0.25 * Math.exp(-beatD / 2.5);

  // glitch: od 2 klatek przed do 6 po każdym cięciu
  const near = CUTS.slice(1).find((x) => frame - x >= -2 && frame - x <= 6);
  const g = near === undefined ? 0 : 1 - Math.abs(frame - near) / 7;
  const strips = [0, 1, 2, 3, 4, 5];

  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <svg width="0" height="0" style={{position: 'absolute'}}>
        <filter id="onlyR"><feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" /></filter>
        <filter id="onlyGB"><feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" /></filter>
      </svg>
      <AbsoluteFill style={{transform: `scale(${scale})`, filter: `brightness(${bright}) contrast(1.08) saturate(1.15) blur(${endBlur}px)`}}>
        <Clip style={g > 0 ? {filter: 'url(#onlyGB)', transform: `translateX(${-16 * g}px)`} : undefined} />
        {g > 0 && (
          <>
            <AbsoluteFill style={{mixBlendMode: 'screen', transform: `translateX(${16 * g}px)`}}>
              <Clip style={{filter: 'url(#onlyR)'}} />
            </AbsoluteFill>
            {strips.map((s) => {
              const top = ((s * 37 + (near ?? 0) * 13 + frame * 23) % 90) + 2;
              const h = 2 + ((s * 7 + frame) % 6);
              const dx = Math.sin(frame * 3.1 + s * 2) * 90 * g;
              return (
                <AbsoluteFill key={s} style={{clipPath: `inset(${top}% 0 ${Math.max(0, 100 - top - h)}% 0)`, transform: `translateX(${dx}px)`}}>
                  <Clip />
                </AbsoluteFill>
              );
            })}
          </>
        )}
      </AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(10,11,15,${endDim})`}} />
      {/* niebo u góry ściemnione pod tekst */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,11,15,.75) 0%, rgba(10,11,15,.35) 34%, rgba(10,11,15,0) 46%, rgba(10,11,15,0) 78%, rgba(10,11,15,.55) 100%)'}} />
    </AbsoluteFill>
  );
};

const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const near = CUTS.slice(1).find((x) => frame - x >= -1 && frame - x <= 6);
  if (near === undefined) return null;
  const o = interpolate(frame - near, [-1, 0, 4], [0.2, 0.9, 0], clamp);
  return (
    <>
      <AbsoluteFill style={{background: '#fff', opacity: o * 0.42}} />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, rgba(229,56,59,.9), rgba(229,56,59,0) 60%)', opacity: o * 0.6, mixBlendMode: 'screen'}} />
    </>
  );
};

// Czerwone smugi światła przelatujące po kadrze (jak na hazeo.pl).
const Streaks: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      {CUTS.slice(1).map((c, i) => {
        const p = interpolate(frame - c, [0, 14], [-0.4, 1.4], clamp);
        if (frame < c || frame > c + 14) return null;
        const y = [520, 1180, 760, 1420][i];
        return <div key={c} style={{position: 'absolute', left: `${p * 100 - 30}%`, top: y, width: '60%', height: 6, borderRadius: 3, background: `linear-gradient(90deg, rgba(229,56,59,0), ${C.red}, rgba(255,255,255,.9))`, boxShadow: `0 0 30px 6px rgba(229,56,59,.6)`, transform: `rotate(${i % 2 ? -8 : 6}deg)`}} />;
      })}
    </AbsoluteFill>
  );
};

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)'}} />
      <AbsoluteFill style={{opacity: 0.07, backgroundImage: 'repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 3px)', transform: `translateY(${(frame * 7) % 3}px)`}} />
    </AbsoluteFill>
  );
};

const Wordmark: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [CUTS[4] - 4, CUTS[4]], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', top: 150, left: 80, opacity: o, fontFamily: FONT, fontWeight: 800, fontSize: 32, letterSpacing: 9, color: C.text, display: 'flex', alignItems: 'center', gap: 14}}>
      <div style={{width: 14, height: 14, borderRadius: 7, background: C.red, boxShadow: `0 0 18px ${C.red}`}} />
      HAZEO
    </div>
  );
};

// --- sceny (tekst w ciemnym niebie, y ≈ 260–680, poza strefami UI Instagrama) ---
const S0: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 80, right: 80, top: 270, ...T}}>
      <Pop at={0}><div style={{display: 'inline-block', background: C.red, color: '#fff', fontWeight: 800, fontSize: 32, letterSpacing: 4, padding: '10px 22px', borderRadius: 10}}>EKSPORT B2B</div></Pop>
      <Pop at={4} from="zoom"><div style={{marginTop: 30, fontSize: 84, fontWeight: 900, lineHeight: 1.0, textShadow: rgbText(frame, 4)}}>Gdzieś w tym mieście</div></Pop>
      <div style={{transform: shake(frame, 16, 18)}}>
        <Pop at={16} from="zoom"><div style={{marginTop: 14, fontSize: 98, fontWeight: 900, lineHeight: 1.0, color: C.red, textShadow: rgbText(frame, 16, 10)}}>jest Twój kupiec.</div></Pop>
      </div>
    </div>
  );
};

const S1: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 80, right: 80, top: 300, ...T, transform: shake(frame, 30, 20)}}>
      <Pop at={2} from="left"><div style={{fontSize: 104, fontWeight: 900, lineHeight: 1.0, textShadow: rgbText(frame, 2)}}>Ale on nie wie,</div></Pop>
      <Pop at={30} from="zoom"><div style={{marginTop: 18, fontSize: 112, fontWeight: 900, lineHeight: 1.0, color: C.red, textShadow: rgbText(frame, 30, 10)}}>że istniejesz.</div></Pop>
    </div>
  );
};

// Linia skanowania + celownik HUD na czas „Hazeo Engine go znajduje”.
const Scan: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [0, dur], [700, 1800], clamp);
  const o = interpolate(frame, [0, 6, dur - 8, dur], [0, 1, 1, 0], clamp);
  const lock = useIn(34, 10);
  const blink = frame % 8 < 5 ? 1 : 0.35;
  return (
    <AbsoluteFill style={{opacity: o, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: y, height: 3, background: C.red, boxShadow: `0 0 26px 8px rgba(229,56,59,.55)`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: y - 160, height: 160, background: 'linear-gradient(180deg, rgba(229,56,59,0), rgba(229,56,59,.18))'}} />
      {/* celownik zaciska się na środku miasta */}
      <div style={{position: 'absolute', left: 540, top: 1150, width: 0, height: 0, transform: `scale(${interpolate(lock, [0, 1], [2.6, 1])}) rotate(${interpolate(lock, [0, 1], [45, 0])}deg)`, opacity: frame < 34 ? 0 : 1}}>
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => (
          <div key={`${sx}${sy}`} style={{position: 'absolute', left: sx * 130 - (sx < 0 ? 0 : 50), top: sy * 130 - (sy < 0 ? 0 : 50), width: 50, height: 50, filter: 'drop-shadow(0 0 10px rgba(229,56,59,.9))', borderLeft: sx < 0 ? `8px solid ${C.red}` : undefined, borderRight: sx > 0 ? `8px solid ${C.red}` : undefined, borderTop: sy < 0 ? `8px solid ${C.red}` : undefined, borderBottom: sy > 0 ? `8px solid ${C.red}` : undefined}} />
        ))}
        <div style={{position: 'absolute', left: -9, top: -9, width: 18, height: 18, borderRadius: 9, background: C.red, boxShadow: `0 0 24px ${C.red}`}} />
        <div style={{position: 'absolute', left: -180, top: 150, width: 360, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 34, letterSpacing: 5, color: "#fff", background: "rgba(229,56,59,.85)", padding: "6px 0", borderRadius: 8, opacity: blink, textShadow: '0 2px 12px rgba(0,0,0,.9)'}}>DOPASOWANIE</div>
      </div>
    </AbsoluteFill>
  );
};

const S2: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = 0.6 + 0.4 * Math.sin(frame / 3);
  const tags = ['firmy', 'decydenci', 'dopasowanie'];
  return (
    <>
      <Scan dur={CUTS[3] - CUTS[2]} />
      <div style={{position: 'absolute', left: 80, right: 80, top: 290, ...T}}>
        <Pop at={2} from="zoom"><div style={{fontSize: 118, fontWeight: 900, lineHeight: 1.0, color: C.red, textShadow: `0 0 ${30 * glow}px rgba(229,56,59,.8), ${rgbText(frame, 2)}`}}>Hazeo Engine</div></Pop>
        <Pop at={14} from="left"><div style={{marginTop: 14, fontSize: 96, fontWeight: 900, lineHeight: 1.0}}>go znajduje.</div></Pop>
        <div style={{marginTop: 36, display: 'flex', gap: 14, flexWrap: 'wrap'}}>
          {tags.map((t, i) => (
            <Pop key={t} at={30 + i * 7} from="zoom"><div style={{fontSize: 36, fontWeight: 800, padding: '10px 22px', borderRadius: 14, background: 'rgba(26,28,35,.85)', border: `2px solid ${i === 2 ? C.red : C.line}`}}>{t}</div></Pop>
          ))}
        </div>
      </div>
    </>
  );
};

const S3: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 80, right: 80, top: 290, ...T}}>
      <Pop at={2} from="zoom"><div style={{fontSize: 98, fontWeight: 900, lineHeight: 1.0, textShadow: rgbText(frame, 2)}}>A Ty decydujesz,</div></Pop>
      <div style={{transform: shake(frame, 22, 18)}}>
        <Pop at={22} from="zoom"><div style={{marginTop: 14, fontSize: 112, fontWeight: 900, lineHeight: 1.0, color: C.red, textShadow: rgbText(frame, 22, 10)}}>czy piszesz.</div></Pop>
      </div>
      <Pop at={36}><div style={{marginTop: 34, fontSize: 40, fontWeight: 700, color: C.muted}}>Nic nie wychodzi bez Twojej zgody.</div></Pop>
    </div>
  );
};

const S4: React.FC = () => {
  const frame = useCurrentFrame();
  const stamp = useIn(2, 9);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', ...T, transform: shake(frame, 6, 24, 12)}}>
      <div style={{marginTop: -120, textAlign: 'center'}}>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 30, fontSize: 150, fontWeight: 900, letterSpacing: 22, opacity: Math.min(1, stamp * 1.5), transform: `scale(${interpolate(stamp, [0, 1], [2.6, 1])})`, textShadow: rgbText(frame, 4, 10)}}>
          <div style={{width: 54, height: 54, borderRadius: 27, background: C.red, boxShadow: `0 0 50px 8px rgba(229,56,59,.8)`}} />
          HAZEO
        </div>
        <Pop at={14}><div style={{marginTop: 36, fontSize: 54, fontWeight: 800, lineHeight: 1.2}}>Człowiek zatwierdza.<br /><span style={{color: C.red}}>AI przyspiesza.</span></div></Pop>
        <Pop at={24}><div style={{marginTop: 50, fontSize: 50, fontWeight: 900, color: C.red, letterSpacing: 1}}>hazeo.pl</div></Pop>
      </div>
    </AbsoluteFill>
  );
};

const SCENES = [S0, S1, S2, S3, S4];

export const Rolka10s: React.FC = () => (
  <AbsoluteFill style={{background: C.bg}}>
    <VideoBg />
    <Streaks />
    {SCENES.map((Scene, i) => {
      const from = CUTS[i];
      const to = CUTS[i + 1] ?? ROLKA10_FRAMES;
      return (
        <Sequence key={i} from={from} durationInFrames={to - from}>
          <AbsoluteFill><Scene /></AbsoluteFill>
        </Sequence>
      );
    })}
    <Flash />
    <Grain />
    <Wordmark />
    <Audio src={staticFile('rolka10/beat.wav')} volume={0.85} />
  </AbsoluteFill>
);
