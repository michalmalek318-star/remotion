import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

// Stories „Producent · eksport” jako jedno wideo 9:16 (36 s, 30 fps).
// Tekst scen 1–6 dosłownie ze scenariusza Michała; okładka (scena 0) to nowy hak.
// Tło: public/eksport/tlo.jpg (nocne miasto), silnik: public/eksport/silnik.mp4, dźwięk: scripts/eksport_sfx.py.
const C = {bg: '#111217', panel: '#1A1C23', line: '#2A2D37', red: '#E5383B', yellow: '#FFD23F', text: '#F2F2F4', muted: '#9A9DA8'};
const FONT = 'Inter, Montserrat, "DejaVu Sans", sans-serif';
export const CUTS = [0, 60, 180, 330, 510, 705, 900];
export const EXPORT_FRAMES = 1080;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// --- efekty wspólne -------------------------------------------------------
const useIn = (delay: number, damping = 14) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping, stiffness: 180, mass: 0.7}});
};

const shakeAt = (frame: number, at: number, power = 14, len = 10) => {
  const d = frame - at;
  if (d < 0 || d > len) return 'translate(0px,0px)';
  const k = (1 - d / len) * power;
  return `translate(${Math.sin(d * 7.3) * k}px, ${Math.cos(d * 5.1) * k}px)`;
};

// RGB-split przez cienie tekstu, wygasa po `len` klatkach od `at`.
const glitch = (frame: number, at: number, len = 8) => {
  const d = frame - at;
  if (d < 0 || d > len) return '0 6px 30px rgba(0,0,0,.55)';
  const o = (1 - d / len) * 10;
  return `${o}px 0 rgba(229,56,59,.9), ${-o}px 0 rgba(0,220,255,.7), 0 6px 30px rgba(0,0,0,.55)`;
};

const Pop: React.FC<{at: number; children: React.ReactNode; from?: 'up' | 'zoom' | 'left' | 'right'; style?: React.CSSProperties}> = ({at, children, from = 'up', style}) => {
  const s = useIn(at);
  const frame = useCurrentFrame();
  const tr =
    from === 'zoom' ? `scale(${interpolate(s, [0, 1], [1.8, 1])})` :
    from === 'left' ? `translateX(${(1 - s) * -700}px)` :
    from === 'right' ? `translateX(${(1 - s) * 700}px)` :
    `translateY(${(1 - s) * 70}px)`;
  const blur = interpolate(frame - at, [0, 6], [12, 0], clamp);
  return <div style={{opacity: frame < at ? 0 : Math.min(1, s * 1.6), transform: tr, filter: `blur(${blur}px)`, ...style}}>{children}</div>;
};

const City: React.FC<{dim?: number; zoom?: [number, number]; dur: number}> = ({dim = 0.5, zoom = [1.05, 1.18], dur}) => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, dur], zoom);
  const y = interpolate(frame, [0, dur], [0, -60]);
  return (
    <AbsoluteFill>
      <Img src={staticFile('eksport/tlo.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z}) translateY(${y}px)`}} />
      <AbsoluteFill style={{background: `rgba(10,11,15,${dim})`}} />
    </AbsoluteFill>
  );
};

const Engine: React.FC<{rate?: number; start?: number; zoom?: [number, number]; dur: number; style?: React.CSSProperties}> = ({rate = 1, start = 0, zoom = [1.0, 1.12], dur, style}) => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, dur], zoom);
  return (
    <AbsoluteFill style={{transform: `scale(${z})`, ...style}}>
      <OffthreadVideo src={staticFile('eksport/silnik.mp4')} muted playbackRate={rate} startFrom={start} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
  );
};

// Cięcie: 4 klatki silnika z czerwonym tintem + biały błysk, na każdym CUTS > 0.
const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {CUTS.slice(1).map((c, i) => {
        const d = frame - c;
        if (d < -3 || d > 6) return null;
        const flash = interpolate(d, [-1, 0, 6], [0.2, 0.85, 0], clamp);
        return (
          <AbsoluteFill key={c}>
            {d < 1 && (
              <Sequence from={c - 3} durationInFrames={4} layout="none">
                <Engine start={20 + i * 18} zoom={[1.5, 1.6]} dur={4} style={{filter: 'saturate(1.6) contrast(1.3)'}} />
                <AbsoluteFill style={{background: 'rgba(229,56,59,.35)', mixBlendMode: 'screen'}} />
              </Sequence>
            )}
            <AbsoluteFill style={{background: '#fff', opacity: flash}} />
          </AbsoluteFill>
        );
      })}
    </>
  );
};

const Wordmark: React.FC = () => (
  <div style={{position: 'absolute', top: 150, left: 80, fontFamily: FONT, fontWeight: 800, fontSize: 32, letterSpacing: 9, color: C.text, display: 'flex', alignItems: 'center', gap: 14}}>
    <div style={{width: 14, height: 14, borderRadius: 7, background: C.red, boxShadow: `0 0 18px ${C.red}`}} />
    HAZEO
  </div>
);

// Delikatne ziarno i winieta dla „filmowego” wyglądu.
const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)'}} />
      <AbsoluteFill style={{opacity: 0.07, backgroundImage: 'repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 3px)', transform: `translateY(${(frame * 7) % 3}px)`}} />
    </AbsoluteFill>
  );
};

const T: React.CSSProperties = {fontFamily: FONT, color: C.text, letterSpacing: -1.5};

// --- sceny ----------------------------------------------------------------
const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 0.6 + 0.4 * Math.sin(frame / 4);
  return (
    <AbsoluteFill>
      <City dim={0.15} dur={60} zoom={[1.12, 1.2]} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(17,18,23,0) 30%, rgba(17,18,23,.85) 52%, #111217 75%)'}} />
      <div style={{position: 'absolute', left: 80, right: 80, top: 1000, ...T}}>
        <Pop at={0}><div style={{display: 'inline-block', background: C.red, color: '#fff', fontWeight: 800, fontSize: 34, letterSpacing: 4, padding: '10px 22px', borderRadius: 10}}>PRODUCENCI · EKSPORT</div></Pop>
        <Pop at={3} from="zoom"><div style={{marginTop: 34, fontSize: 132, fontWeight: 900, lineHeight: 0.98, textShadow: glitch(frame, 3)}}>Eksport stoi?</div></Pop>
        <Pop at={9} from="zoom"><div style={{marginTop: 20, fontSize: 92, fontWeight: 900, lineHeight: 1.02, color: C.red, textShadow: glitch(frame, 9)}}>To nie wina produktu.</div></Pop>
        <Pop at={16}><div style={{marginTop: 46, fontSize: 40, fontWeight: 700, color: C.muted, opacity: pulse}}>Sprawdź, kto powinien szukać Twoich kupców ↓</div></Pop>
      </div>
    </AbsoluteFill>
  );
};

const S1: React.FC = () => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, 120], [1, 1.14]);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <div style={{position: 'absolute', left: 80, right: 80, top: 620, ...T, color: C.yellow, fontWeight: 900, transform: `scale(${z}) ${shakeAt(frame, 50, 16)}`, transformOrigin: '50% 40%'}}>
        <Pop at={2} from="zoom"><div style={{fontSize: 118, lineHeight: 1.0, textShadow: glitch(frame, 2)}}>Eksport poniżej 20% przychodu?</div></Pop>
        <Pop at={50} from="zoom"><div style={{marginTop: 60, fontSize: 98, lineHeight: 1.02, textShadow: glitch(frame, 50)}}>Twoja fabryka to nie problem.</div></Pop>
      </div>
    </AbsoluteFill>
  );
};

const S2: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <City dim={0.35} dur={150} zoom={[1.2, 1.32]} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(17,18,23,.2) 0%, rgba(17,18,23,.8) 40%, #111217 70%)'}} />
      <div style={{position: 'absolute', left: 80, right: 80, top: 820, ...T}}>
        {['Produkt masz.', 'Certyfikaty masz.'].map((l, i) => (
          <Pop key={l} at={4 + i * 18} from="left">
            <div style={{fontSize: 88, fontWeight: 900, lineHeight: 1.12, display: 'flex', alignItems: 'center', gap: 26}}>
              <span style={{color: C.red, fontSize: 70}}>✓</span>{l}
            </div>
          </Pop>
        ))}
        <div style={{marginTop: 56, fontSize: 66, fontWeight: 800, lineHeight: 1.16, transform: shakeAt(frame, 72, 18)}}>
          <Pop at={44}>Kupców w Skandynawii, Francji i Beneluksie</Pop>
          <Pop at={72} from="zoom"><span style={{display: 'inline-block', marginTop: 8, fontSize: 104, fontWeight: 900, color: C.red, textShadow: glitch(frame, 72, 10)}}>nie masz,</span></Pop>
          <Pop at={92}>bo nikt ich nie szuka.</Pop>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const S3: React.FC = () => {
  const frame = useCurrentFrame();
  const L = ['Targi raz w roku.', 'Zapytania, kiedy trafią same.'];
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Engine dur={180} rate={0.8} start={30} zoom={[1.3, 1.45]} style={{opacity: 0.18, filter: 'grayscale(1) blur(6px)'}} />
      <div style={{position: 'absolute', left: 80, right: 80, top: 520, ...T}}>
        <Pop at={3}><div style={{fontSize: 74, fontWeight: 900, lineHeight: 1.1, borderLeft: `10px solid ${C.red}`, paddingLeft: 34}}>Bez export managera eksport robi się „przy okazji”.</div></Pop>
        {L.map((l, i) => (
          <Pop key={l} at={45 + i * 30} from="left">
            <div style={{marginTop: 40, fontSize: 66, fontWeight: 800, lineHeight: 1.1, color: '#C9CCD6', borderLeft: `10px solid ${C.line}`, paddingLeft: 34}}>{l}</div>
          </Pop>
        ))}
        <div style={{transform: shakeAt(frame, 112, 20)}}>
          <Pop at={112} from="zoom">
            <div style={{marginTop: 60, fontSize: 82, fontWeight: 900, lineHeight: 1.05, color: C.red, borderLeft: `10px solid ${C.red}`, paddingLeft: 34, textShadow: glitch(frame, 112, 12)}}>Konkurencja pisze do kupców co tydzień.</div>
          </Pop>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const S4: React.FC = () => {
  const frame = useCurrentFrame();
  const steps = ['Firmy', 'Decydenci', 'Wiadomość', 'Twój handlowiec'];
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill style={{height: 1150}}>
        <Engine dur={195} rate={0.75} zoom={[1.0, 1.15]} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(17,18,23,.5) 0%, rgba(17,18,23,0) 18%, rgba(17,18,23,0) 42%, rgba(17,18,23,.95) 58%, #111217 70%)'}} />
      <div style={{position: 'absolute', left: 80, right: 80, top: 1010, ...T}}>
        <Pop at={4}><div style={{fontSize: 56, fontWeight: 700, lineHeight: 1.2}}><span style={{color: C.red, fontWeight: 900}}>Hazeo Engine</span> znajduje firmy i decydentów na wybranych rynkach, ocenia dopasowanie i przygotowuje spersonalizowany kontakt.</div></Pop>
        <div style={{marginTop: 46, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px 12px'}}>
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <Pop at={40 + i * 14} from="zoom">
                <div style={{fontSize: 38, fontWeight: 800, padding: '14px 24px', borderRadius: 18, background: i === 3 ? C.red : C.panel, border: `2px solid ${i === 3 ? C.red : C.line}`}}>{s}</div>
              </Pop>
              {i < 3 && <Pop at={47 + i * 14}><span style={{color: C.red, fontSize: 40, fontWeight: 900}}>→</span></Pop>}
            </React.Fragment>
          ))}
        </div>
        <div style={{transform: shakeAt(frame, 125, 16)}}>
          <Pop at={125} from="zoom"><div style={{marginTop: 64, fontSize: 70, fontWeight: 900, lineHeight: 1.06, textShadow: glitch(frame, 125)}}>Nic nie wychodzi bez <span style={{color: C.red}}>Twojej zgody.</span></div></Pop>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const S5: React.FC = () => {
  const frame = useCurrentFrame();
  const price = Math.round(interpolate(frame, [110, 140], [0, 4900], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)}));
  const priceTxt = price >= 1000 ? `${Math.floor(price / 1000)} ${String(price % 1000).padStart(3, '0')}` : String(price);
  const chips = ['10 dni roboczych', '3 rynki', '40 firm', '160 kontaktów', '3 sekwencje'];
  return (
    <AbsoluteFill>
      <City dim={0.78} dur={195} zoom={[1.3, 1.4]} />
      <div style={{position: 'absolute', left: 80, right: 80, top: 330, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, ...T}}>
        <Pop at={2} from="left"><div style={{height: 300, borderRadius: 28, padding: 34, background: C.panel, border: `2px solid ${C.line}`, color: '#A8ACB8', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}><div style={{fontSize: 46, fontWeight: 800, lineHeight: 1.1}}>Etat export managera</div><div style={{fontSize: 32, fontWeight: 700, color: C.muted}}>cały rok</div></div></Pop>
        <Pop at={10} from="right"><div style={{height: 300, borderRadius: 28, padding: 34, background: 'rgba(229,56,59,.16)', border: `3px solid ${C.red}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 0 60px rgba(229,56,59,.35)'}}><div style={{fontSize: 46, fontWeight: 900, lineHeight: 1.1}}>Audyt<br />4 900 zł</div><div style={{fontSize: 32, fontWeight: 700, color: '#F0B8B9'}}>10 dni roboczych</div></div></Pop>
      </div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 720, ...T}}>
        <Pop at={26}><div style={{fontSize: 54, fontWeight: 700, color: '#C9CCD6', lineHeight: 1.15}}>Export manager to etat na cały rok.</div></Pop>
        <Pop at={44}><div style={{marginTop: 22, fontSize: 62, fontWeight: 900, lineHeight: 1.1}}>Zacznij od Audytu gotowości eksportowej:</div></Pop>
        <div style={{marginTop: 38, display: 'flex', flexWrap: 'wrap', gap: '14px 12px', alignItems: 'center'}}>
          {chips.map((c, i) => (
            <React.Fragment key={c}>
              <Pop at={64 + i * 8} from="zoom"><div style={{fontSize: 40, fontWeight: 800, padding: '12px 22px', borderRadius: 16, background: C.panel, border: `2px solid ${C.line}`}}>{c}</div></Pop>
              {i < chips.length - 1 && <Pop at={68 + i * 8}><span style={{color: C.red, fontSize: 40, fontWeight: 900}}>•</span></Pop>}
            </React.Fragment>
          ))}
        </div>
        <div style={{transform: shakeAt(frame, 140, 18)}}>
          <Pop at={108} from="zoom"><div style={{marginTop: 54, fontSize: 140, fontWeight: 900, color: C.red, letterSpacing: -4, lineHeight: 1, textShadow: glitch(frame, 140, 10)}}>{priceTxt} zł <span style={{fontSize: 60, color: C.text, letterSpacing: 0}}>netto</span></div></Pop>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const S6: React.FC = () => {
  const frame = useCurrentFrame();
  const swap = 78;
  const outA = interpolate(frame, [swap - 6, swap], [1, 0], clamp);
  const stamp = useIn(swap + 14, 9);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Engine dur={180} rate={0.6} start={60} zoom={[1.1, 1.25]} style={{opacity: 0.35, filter: 'blur(3px)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(17,18,23,.6), rgba(17,18,23,.9))'}} />
      <div style={{position: 'absolute', left: 80, right: 80, top: 620, opacity: outA, ...T}}>
        <Pop at={2} from="zoom"><div style={{fontSize: 92, fontWeight: 900, lineHeight: 1.02, textShadow: glitch(frame, 2)}}>Nie obiecujemy liczby leadów.</div></Pop>
        <Pop at={26}><div style={{marginTop: 34, fontSize: 60, fontWeight: 800, lineHeight: 1.15}}>Obiecujemy proces: <span style={{color: C.red}}>kupcy, kontakt, historia rozmowy.</span></div></Pop>
        <Pop at={48}><div style={{marginTop: 44, paddingTop: 30, borderTop: `2px solid ${C.line}`, fontSize: 40, fontWeight: 700, color: C.muted, lineHeight: 1.3}}>12 lat w sprzedaży B2B. 16 rynków otwartych osobiście.</div></Pop>
      </div>
      {frame >= swap && (
        <div style={{position: 'absolute', left: 80, right: 80, top: 560, textAlign: 'center', ...T, transform: shakeAt(frame, swap + 14, 22)}}>
          <Pop at={swap + 2}><div style={{fontSize: 70, fontWeight: 900}}>Napisz</div></Pop>
          <div style={{display: 'inline-block', margin: '30px 0', background: C.red, color: '#fff', fontSize: 190, fontWeight: 900, letterSpacing: 6, padding: '18px 70px', borderRadius: 34, lineHeight: 1.05, opacity: stamp, transform: `scale(${interpolate(stamp, [0, 1], [3, 1])}) rotate(${interpolate(stamp, [0, 1], [-8, -2])}deg)`, boxShadow: '0 0 90px rgba(229,56,59,.55)'}}>MAPA</div>
          <Pop at={swap + 22}><div style={{fontSize: 70, fontWeight: 900}}>w DM</div></Pop>
          <Pop at={swap + 36}><div style={{marginTop: 40, fontSize: 44, fontWeight: 600, color: '#C9CCD6', lineHeight: 1.3}}>Pokażemy, jakich kupców warto szukać dla Twojej firmy.</div></Pop>
          <Pop at={swap + 50}><div style={{marginTop: 70, fontSize: 54, fontWeight: 900, color: C.red}}>hazeo.pl</div></Pop>
        </div>
      )}
    </AbsoluteFill>
  );
};

const SCENES = [Cover, S1, S2, S3, S4, S5, S6];

export const ExportStories: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {SCENES.map((Scene, i) => {
        const from = CUTS[i];
        const to = CUTS[i + 1] ?? EXPORT_FRAMES;
        return (
          <Sequence key={i} from={from} durationInFrames={to - from}>
            <Scene />
          </Sequence>
        );
      })}
      <CutFlash />
      <Grain />
      <Wordmark />
      <Audio src={staticFile('eksport/beat.wav')} volume={0.8} />
    </AbsoluteFill>
  );
};
