import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

// Wideo LinkedIn (4:5, 1080x1350, ~32 s): „Która z 3 firm jest warta telefonu?”.
// Pętla ciekawości: wyniki są ukryte („??”) aż do odsłony na końcu.
// Przejścia: zoom z rozmyciem, whip pan, maska koła, glitch, smuga światła, punch-in.
// Wszystkie firmy i liczby są przykładowe (napis „Dane przykładowe” w kadrze).
const C = {
  bg: '#111217',
  panel: '#1A1B22',
  line: '#2A2B34',
  text: '#FFFFFF',
  muted: '#9A9CA8',
  accent: '#E5383B',
  seg: ['#E5383B', '#F07174', '#F6A6A7', '#5A5C66'],
};
const FONT = 'Inter, "DejaVu Sans", sans-serif';
const W = 1080;
const H = 1350;
const OVERLAP = 10;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const FACTORS = [
  {name: 'Dopasowanie do ICP', max: 40, hook: 'Firma A wygląda jak klient marzeń.', sub: 'Branża, wielkość, region, model sprzedaży.'},
  {name: 'Rola decyzyjna', max: 30, hook: 'Ale w Firmie A piszesz do asystentki.', sub: 'Czy rozmawiasz z kimś, kto decyduje?'},
  {name: 'Sygnały zakupowe', max: 20, hook: 'Firma C właśnie szuka 3 handlowców.', sub: 'Czy jest powód, żeby napisać teraz?'},
  {name: 'Jakość danych', max: 10, hook: 'Ostatni szczegół: czy kontakt jest aktualny?', sub: 'Zweryfikowany e-mail i aktualne stanowisko.'},
];

const FIRMS = [
  {id: 'A', who: 'Sieć dystrybucji · 800 os.', pts: [38, 8, 4, 9]},
  {id: 'B', who: 'Producent · 120 os.', pts: [30, 22, 10, 6]},
  {id: 'C', who: 'Logistyka · 60 os.', pts: [34, 28, 18, 9]},
];
const total = (f: (typeof FIRMS)[number]) => f.pts.reduce((a, b) => a + b, 0);

// Sceny (klatki 30 fps). Kolejne sceny zachodzą na siebie o OVERLAP klatek (przejście).
type Tr = 'zoomblur' | 'whip' | 'circle' | 'glitch' | 'streak' | 'punch';
const SCENES: {id: string; from: number; dur: number; enter: Tr}[] = [
  {id: 'hook', from: 0, dur: 110, enter: 'punch'},
  {id: 'f0', from: 100, dur: 150, enter: 'zoomblur'},
  {id: 'f1', from: 240, dur: 150, enter: 'whip'},
  {id: 'f2', from: 380, dur: 150, enter: 'circle'},
  {id: 'f3', from: 520, dur: 130, enter: 'glitch'},
  {id: 'reveal', from: 640, dur: 200, enter: 'streak'},
  {id: 'cta', from: 830, dur: 140, enter: 'punch'},
];
export const SCORING_FRAMES = 970;

/* ---------- przejścia ---------- */

const Enter: React.FC<{type: Tr; dur: number; children: React.ReactNode}> = ({type, dur, children}) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, OVERLAP + 4], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  // wyjście: szybki zoom do przodu z rozmyciem, przykryty wejściem następnej sceny
  const out = interpolate(f, [dur - OVERLAP, dur], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  let style: React.CSSProperties = {};
  if (type === 'zoomblur') style = {transform: `scale(${1.35 - 0.35 * t})`, filter: `blur(${(1 - t) * 24}px)`, opacity: t};
  if (type === 'whip') style = {transform: `translateX(${(1 - t) * W}px) skewX(${(1 - t) * -12}deg)`, filter: `blur(${(1 - t) * 30}px)`};
  if (type === 'circle') style = {clipPath: `circle(${t * 150}% at 50% 55%)`};
  if (type === 'punch') style = {transform: `scale(${0.7 + 0.3 * t})`, opacity: t, filter: `blur(${(1 - t) * 12}px)`};
  if (type === 'streak') style = {opacity: interpolate(f, [4, 10], [0, 1], clamp)};
  if (type === 'glitch') style = {opacity: t};
  const exitStyle: React.CSSProperties = {
    transform: `scale(${1 + out * 0.5})`,
    filter: `blur(${out * 18}px)`,
    opacity: 1 - out,
  };
  const glitching = type === 'glitch' && f < 14;
  return (
    <AbsoluteFill style={exitStyle}>
      <AbsoluteFill style={{...style, background: C.bg}}>
        {children}
        {glitching ? <GlitchBands frame={f}>{children}</GlitchBands> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Przesunięte poziome pasy kadru + rozszczepienie kolorów (glitch).
const GlitchBands: React.FC<{frame: number; children: React.ReactNode}> = ({frame, children}) => {
  const bands = 7;
  return (
    <>
      {Array.from({length: bands}).map((_, i) => {
        const y0 = random(`y${i}-${frame}`) * 100;
        const h = 2 + random(`h${i}-${frame}`) * 5;
        const dx = (random(`x${i}-${frame}`) - 0.5) * 160;
        return (
          <AbsoluteFill key={i} style={{clipPath: `inset(${y0}% 0 ${Math.max(0, 100 - y0 - h)}% 0)`, transform: `translateX(${dx}px)`, background: C.bg}}>
            {children}
            <AbsoluteFill style={{background: i % 2 ? 'rgba(229,56,59,0.12)' : 'rgba(80,220,255,0.08)', mixBlendMode: 'screen'}} />
          </AbsoluteFill>
        );
      })}
    </>
  );
};

// Czerwona smuga światła przecinająca kadr (nawiązanie do smug z hazeo.pl) + błysk.
const Streak: React.FC = () => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, 14], [-1.2, 1.4], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const flash = interpolate(f, [6, 9, 16], [0, 0.85, 0], clamp);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          top: -400,
          left: x * W,
          width: 260,
          height: H + 800,
          transform: 'rotate(18deg)',
          background: `linear-gradient(90deg, transparent, ${C.accent}, #ffd0d0, ${C.accent}, transparent)`,
          filter: 'blur(28px)',
        }}
      />
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    </AbsoluteFill>
  );
};

/* ---------- elementy ---------- */

const Brand: React.FC = () => (
  <div style={{position: 'absolute', top: 64, left: 70, fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: 8, color: C.text, display: 'flex', alignItems: 'center', gap: 12}}>
    <div style={{width: 12, height: 12, borderRadius: 6, background: C.accent, boxShadow: `0 0 16px ${C.accent}`}} />
    HAZEO
  </div>
);

// Pasek postępu całego filmu (widz widzi, że koniec jest blisko).
const Progress: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', top: 0, left: 0, height: 8, width: (f / SCORING_FRAMES) * W, background: C.accent, boxShadow: `0 0 14px ${C.accent}`}} />
  );
};

const Kinetic: React.FC<{text: string; delay?: number; size?: number; color?: string; weight?: number}> = ({text, delay = 0, size = 70, color = C.text, weight = 800}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = text.split(' ');
  return (
    <div style={{fontFamily: FONT, fontSize: size, fontWeight: weight, lineHeight: 1.1, letterSpacing: -1, color, display: 'flex', flexWrap: 'wrap', columnGap: size * 0.26}}>
      {words.map((w, i) => {
        const s = spring({frame: f - delay - i * 3, fps, config: {damping: 14, stiffness: 160}});
        return (
          <span key={i} style={{display: 'inline-block', opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 50}px) rotate(${(1 - s) * 6}deg)`, filter: `blur(${Math.max(0, 1 - s) * 8}px)`}}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

// Karta firmy ze skumulowanym paskiem; `upto` = indeks aktualnie animowanego czynnika.
const FirmCard: React.FC<{firm: (typeof FIRMS)[number]; upto: number; delay: number; showScore?: boolean; highlight?: boolean}> = ({firm, upto, delay, showScore, highlight}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const inS = spring({frame: f - delay, fps, config: {damping: 16}});
  const grow = interpolate(f, [delay + 22, delay + 52], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const barW = W - 140 - 64;
  return (
    <div
      style={{
        background: C.panel,
        border: `2px solid ${highlight ? C.accent : C.line}`,
        boxShadow: highlight ? `0 0 40px rgba(229,56,59,0.45)` : 'none',
        borderRadius: 26,
        padding: '32px 36px',
        marginTop: 26,
        fontFamily: FONT,
        opacity: inS,
        transform: `translateX(${(1 - inS) * 120}px)`,
      }}
    >
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
        <div>
          <div style={{fontSize: 44, fontWeight: 800, color: C.text}}>Firma {firm.id}</div>
          <div style={{fontSize: 28, color: C.muted, marginTop: 4}}>{firm.who}</div>
        </div>
        <div style={{fontSize: 56, fontWeight: 800, color: showScore ? (highlight ? C.accent : C.text) : C.muted}}>{showScore ? total(firm) : '??'}</div>
      </div>
      <div style={{display: 'flex', height: 28, marginTop: 22, background: C.line, borderRadius: 14, overflow: 'hidden', width: barW}}>
        {firm.pts.map((p, i) =>
          i > upto ? null : (
            <div key={i} style={{width: (barW * p * (i === upto ? grow : 1)) / 100, background: C.seg[i], borderRight: `2px solid ${C.panel}`}} />
          ),
        )}
      </div>
    </div>
  );
};

/* ---------- sceny ---------- */

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const pulse = 1 + Math.sin(f / 4) * 0.04;
  return (
    <AbsoluteFill style={{padding: '150px 70px 0'}}>
      <Kinetic text="3 firmy. Jeden telefon." size={84} />
      <div style={{height: 12}} />
      <Kinetic text="Która jest warta rozmowy?" size={84} color={C.accent} delay={14} />
      <div style={{marginTop: 30}}>
        {FIRMS.map((fm, i) => (
          <FirmCard key={fm.id} firm={fm} upto={-1} delay={28 + i * 6} />
        ))}
      </div>
      <div style={{marginTop: 40, fontFamily: FONT, fontSize: 38, fontWeight: 700, color: C.text, opacity: interpolate(f, [55, 65], [0, 1], clamp), transform: `scale(${pulse})`, transformOrigin: 'left center'}}>
        Wynik na końcu <span style={{color: C.accent}}>↓</span>
      </div>
    </AbsoluteFill>
  );
};

const Factor: React.FC<{i: number}> = ({i}) => {
  const f = useCurrentFrame();
  const fac = FACTORS[i];
  const count = Math.round(interpolate(f, [8, 34], [0, fac.max], {...clamp, easing: Easing.out(Easing.cubic)}));
  return (
    <AbsoluteFill style={{padding: '150px 70px 0'}}>
      <div style={{fontFamily: FONT, fontSize: 28, fontWeight: 700, color: C.accent, letterSpacing: 3, textTransform: 'uppercase'}}>
        {i + 1}/4 · {fac.name}
      </div>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 16, fontFamily: FONT, marginTop: 6}}>
        <div style={{fontSize: 170, fontWeight: 800, color: C.text, letterSpacing: -6, lineHeight: 1}}>{count}</div>
        <div style={{fontSize: 50, fontWeight: 800, color: C.accent}}>pkt</div>
        <div style={{fontSize: 28, color: C.muted, marginLeft: 12}}>{fac.sub}</div>
      </div>
      <div style={{marginTop: 18}}>
        <Kinetic text={fac.hook} size={60} delay={14} />
      </div>
      <div style={{marginTop: 30}}>
        {FIRMS.map((fm, k) => (
          <FirmCard key={fm.id} firm={fm} upto={i} delay={22 + k * 8} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  // najpierw kolejność A, B, C, potem animowane przetasowanie według wyniku
  const sorted = [...FIRMS].sort((a, b) => total(b) - total(a));
  const swap = spring({frame: f - 70, fps, config: {damping: 18}});
  const slot = 214;
  return (
    <AbsoluteFill style={{padding: '150px 70px 0'}}>
      <Kinetic text="Wynik?" size={84} delay={10} />
      <div style={{position: 'relative', marginTop: 10, height: slot * 3}}>
        {FIRMS.map((fm, k) => {
          const target = sorted.indexOf(fm);
          const y = interpolate(swap, [0, 1], [k * slot, target * slot]);
          const top = target === 0;
          return (
            <div key={fm.id} style={{position: 'absolute', left: 0, right: 0, top: y, transform: `scale(${top ? 1 + swap * 0.04 : 1 - swap * 0.03})`, opacity: top ? 1 : 1 - swap * 0.35}}>
              <FirmCard firm={fm} upto={3} delay={-60} showScore={f > 30} highlight={top && f > 70} />
            </div>
          );
        })}
      </div>
      <div style={{marginTop: 34}}>
        {f > 95 ? <Kinetic text="Nie największa." size={66} delay={95} /> : null}
        <div style={{height: 8}} />
        {f > 110 ? <Kinetic text="Najbardziej gotowa do rozmowy." size={66} color={C.accent} delay={110} /> : null}
      </div>
    </AbsoluteFill>
  );
};

const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const glow = 0.5 + Math.sin(f / 6) * 0.5;
  return (
    <AbsoluteFill style={{padding: '340px 70px 0'}}>
      <Kinetic text="Handlowiec dostaje priorytety," size={72} />
      <Kinetic text="nie listę nazw." size={72} color={C.accent} delay={12} />
      <div
        style={{
          marginTop: 80,
          background: C.accent,
          borderRadius: 28,
          padding: '36px 44px',
          fontFamily: FONT,
          fontSize: 42,
          fontWeight: 800,
          lineHeight: 1.3,
          color: '#fff',
          boxShadow: `0 0 ${30 + glow * 40}px rgba(229,56,59,0.6)`,
          opacity: interpolate(f, [30, 42], [0, 1], clamp),
          transform: `translateY(${interpolate(f, [30, 42], [40, 0], clamp)}px)`,
        }}
      >
        Chcesz zobaczyć scoring dla Twojego ICP? Napisz do nas.
      </div>
      <div style={{marginTop: 40, fontFamily: FONT, fontSize: 44, fontWeight: 700, color: C.text, opacity: interpolate(f, [50, 60], [0, 1], clamp)}}>
        <span style={{color: C.accent}}>→</span> hazeo.pl
      </div>
    </AbsoluteFill>
  );
};

/* ---------- dźwięk ---------- */

const SFX: {at: number; file: string; vol?: number}[] = [
  {at: 0, file: 'sfx/hit.wav', vol: 0.7},
  ...SCENES.slice(1).map((s) => ({at: s.from - 4, file: s.enter === 'glitch' ? 'sfx/glitch.wav' : 'sfx/whoosh.wav', vol: 0.8})),
  ...[0, 1, 2, 3].map((i) => ({at: SCENES[i + 1].from + 8, file: 'sfx/tick.wav', vol: 0.5})),
  {at: SCENES[5].from + 30, file: 'sfx/rise.wav', vol: 0.6},
  {at: SCENES[5].from + 70, file: 'sfx/hit.wav', vol: 0.9},
];

export const ScoringVideo: React.FC<{withSound: boolean}> = ({withSound}) => {
  const comps: Record<string, React.ReactNode> = {
    hook: <Hook />,
    f0: <Factor i={0} />,
    f1: <Factor i={1} />,
    f2: <Factor i={2} />,
    f3: <Factor i={3} />,
    reveal: <Reveal />,
    cta: <Cta />,
  };
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {SCENES.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.dur}>
          <Enter type={s.enter} dur={s.id === 'cta' ? 9999 : s.dur}>
            {comps[s.id]}
          </Enter>
        </Sequence>
      ))}
      <Sequence from={SCENES[5].from - 6} durationInFrames={20}>
        <Streak />
      </Sequence>
      <Brand />
      <div style={{position: 'absolute', bottom: 40, right: 70, fontFamily: FONT, fontSize: 22, color: C.muted}}>Dane przykładowe</div>
      <Progress />
      {withSound
        ? SFX.map((s, i) => (
            <Sequence key={i} from={Math.max(0, s.at)} durationInFrames={60}>
              <Audio src={staticFile(s.file)} volume={s.vol ?? 1} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  );
};
