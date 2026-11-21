import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// Rolka Hazeo: „Handlowiec, który szuka zamiast sprzedawać” (30 s, 1080x1920).
// Podgląd bez lektora. Kolory to założenie robocze, do podmiany na barwy marki.
const C = {
  bg: '#0B0F1A',
  panel: '#141A2A',
  line: '#232B40',
  text: '#FFFFFF',
  muted: '#8A93A8',
  accent: '#3DDC97',
  red: '#FF5A5F',
  yellow: '#FFD166',
};
const FONT = 'Inter, "DejaVu Sans", sans-serif';

// Czasy scen w klatkach (30 fps), zgodne z tabelą w scenariuszu.
const SCENES = [
  {from: 0, dur: 60}, // 0:00–0:02 hook
  {from: 60, dur: 180}, // 0:02–0:08 kalendarz
  {from: 240, dur: 210}, // 0:08–0:15 Hazeo Engine
  {from: 450, dur: 180}, // 0:15–0:21 zatwierdź + CRM
  {from: 630, dur: 150}, // 0:21–0:26 cytat
  {from: 780, dur: 120}, // 0:26–0:30 CTA
];
export const TOTAL_FRAMES = 900;

const fadeIn = (frame: number, start = 0, len = 10) =>
  interpolate(frame, [start, start + len], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

// Duży napis w górnej części kadru (poza strefą interfejsu Instagrama).
const Headline: React.FC<{children: React.ReactNode; delay?: number; top?: number; size?: number}> = ({
  children,
  delay = 0,
  top = 230,
  size = 76,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 200}});
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 70,
        right: 70,
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.12,
        color: C.text,
        opacity: s,
        transform: `translateY(${(1 - s) * 40}px)`,
        letterSpacing: -1,
      }}
    >
      {children}
    </div>
  );
};

const Hl: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = C.accent}) => (
  <span style={{color}}>{children}</span>
);

// Napisy do lektora na dole (nad strefą podpisu Instagrama).
const Caption: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 430,
        left: 90,
        right: 90,
        display: 'flex',
        justifyContent: 'center',
        opacity: fadeIn(frame, 4, 8),
      }}
    >
      <div
        style={{
          background: 'rgba(0,0,0,0.72)',
          color: C.text,
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 40,
          lineHeight: 1.3,
          padding: '16px 26px',
          borderRadius: 14,
          textAlign: 'center',
        }}
      >
        {text}
      </div>
    </div>
  );
};

/* ---------- Scena 1: nieskończony arkusz ---------- */
const SceneSheet: React.FC = () => {
  const frame = useCurrentFrame();
  const scroll = interpolate(frame, [0, 60], [0, 1400]);
  const zoom = interpolate(frame, [0, 60], [1, 1.06]);
  const rows = Array.from({length: 70}, (_, i) => i);
  const firms = ['Firma', 'Nazwisko', 'Stanowisko', 'E-mail', 'Telefon'];
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <div
        style={{
          position: 'absolute',
          top: 560,
          left: 60,
          right: 60,
          height: 820,
          overflow: 'hidden',
          borderRadius: 24,
          background: '#F4F6F8',
          transform: `scale(${zoom})`,
        }}
      >
        <div style={{transform: `translateY(${-scroll}px)`}}>
          <div style={{display: 'flex', background: '#1E7145', color: 'white', fontFamily: FONT, fontSize: 24, fontWeight: 700}}>
            {firms.map((h) => (
              <div key={h} style={{flex: 1, padding: '14px 12px', borderRight: '1px solid #2c8a57'}}>{h}</div>
            ))}
          </div>
          {rows.map((r) => (
            <div key={r} style={{display: 'flex', fontFamily: FONT, fontSize: 22, color: '#333'}}>
              {firms.map((h, ci) => (
                <div
                  key={h}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRight: '1px solid #d9dde3',
                    borderBottom: '1px solid #d9dde3',
                    background: ci === 3 && r % 3 === 0 ? '#FDECEC' : 'transparent',
                    color: ci === 3 && r % 3 === 0 ? '#C0392B' : '#333',
                  }}
                >
                  {ci === 0 ? `Sp. z o.o. ${r + 1}` : ci === 3 && r % 3 === 0 ? 'brak' : '...'}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <Headline>
        Twój handlowiec sprzedaje <Hl color={C.yellow}>2 dni</Hl> w tygodniu?
      </Headline>
    </AbsoluteFill>
  );
};

/* ---------- Scena 2: kalendarz 3 + 2 ---------- */
const SceneCalendar: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const days = [
    {d: 'Pn', label: 'Szukanie kontaktów', search: true},
    {d: 'Wt', label: 'Szukanie kontaktów', search: true},
    {d: 'Śr', label: 'Szukanie kontaktów', search: true},
    {d: 'Cz', label: 'Rozmowy z klientami', search: false},
    {d: 'Pt', label: 'Rozmowy z klientami', search: false},
  ];
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Headline>
        Reszta: szukanie <Hl color={C.red}>firm, nazwisk, maili</Hl>
      </Headline>
      <div style={{position: 'absolute', top: 560, left: 70, right: 70, display: 'flex', flexDirection: 'column', gap: 22}}>
        {days.map((day, i) => {
          const s = spring({frame: frame - 12 - i * 10, fps, config: {damping: 18}});
          const color = day.search ? C.red : C.accent;
          return (
            <div key={day.d} style={{display: 'flex', alignItems: 'center', gap: 24}}>
              <div style={{width: 90, fontFamily: FONT, fontSize: 40, fontWeight: 700, color: C.muted}}>{day.d}</div>
              <div style={{flex: 1, height: 116, background: C.panel, borderRadius: 18, overflow: 'hidden'}}>
                <div
                  style={{
                    width: `${s * 100}%`,
                    height: '100%',
                    background: color,
                    opacity: 0.9,
                    borderRadius: 18,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 30,
                    fontFamily: FONT,
                    fontSize: 38,
                    fontWeight: 700,
                    color: C.bg,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {day.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Caption text="Płacisz za to, a nikt nie rozmawia z klientem." />
    </AbsoluteFill>
  );
};

/* ---------- Scena 3: Hazeo Engine (makieta, docelowo nagranie ekranu) ---------- */
const SceneEngine: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const leads = [
    {n: 'Logistyka Północ', who: 'Dyrektor sprzedaży', score: 92},
    {n: 'MetalTech Śląsk', who: 'Prezes zarządu', score: 87},
    {n: 'AgroSerwis', who: 'Head of Sales', score: 81},
    {n: 'BudPol Systemy', who: 'COO', score: 74},
  ];
  const steps = ['znajduje firmy', 'ocenia dopasowanie', 'pisze szkic'];
  const draft = 'Dzień dobry Pani Anno, widzę, że Logistyka Północ otwiera magazyn w Gdańsku...';
  const typed = Math.max(0, Math.floor(interpolate(frame, [120, 200], [0, draft.length], {extrapolateRight: 'clamp'})));
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Headline size={64}>
        <Hl>Hazeo Engine:</Hl>
      </Headline>
      <div style={{position: 'absolute', top: 320, left: 70, right: 70, display: 'flex', gap: 14, flexWrap: 'wrap'}}>
        {steps.map((st, i) => (
          <div
            key={st}
            style={{
              opacity: fadeIn(frame, 10 + i * 25, 10),
              fontFamily: FONT,
              fontSize: 40,
              fontWeight: 700,
              color: C.text,
            }}
          >
            {st}
            {i < steps.length - 1 ? <span style={{color: C.accent}}> →</span> : null}
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', top: 540, left: 70, right: 70, display: 'flex', flexDirection: 'column', gap: 18}}>
        {leads.map((l, i) => {
          const s = spring({frame: frame - 15 - i * 8, fps, config: {damping: 200}});
          const sc = Math.round(interpolate(frame, [40 + i * 8, 90 + i * 8], [0, l.score], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
          return (
            <div
              key={l.n}
              style={{
                opacity: s,
                transform: `translateX(${(1 - s) * 80}px)`,
                background: C.panel,
                border: `2px solid ${i === 0 && frame > 100 ? C.accent : C.line}`,
                borderRadius: 18,
                padding: '22px 28px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: FONT,
              }}
            >
              <div>
                <div style={{fontSize: 36, fontWeight: 700, color: C.text}}>{l.n}</div>
                <div style={{fontSize: 28, color: C.muted, marginTop: 4}}>{l.who}</div>
              </div>
              <div style={{fontSize: 46, fontWeight: 800, color: sc >= 80 ? C.accent : C.yellow}}>{sc}%</div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1150,
          left: 70,
          right: 70,
          opacity: fadeIn(frame, 110, 10),
          background: '#1B2236',
          borderRadius: 18,
          padding: 28,
          fontFamily: FONT,
          fontSize: 30,
          lineHeight: 1.4,
          color: C.text,
          minHeight: 150,
        }}
      >
        <div style={{fontSize: 24, color: C.accent, fontWeight: 700, marginBottom: 8}}>SZKIC WIADOMOŚCI</div>
        {draft.slice(0, typed)}
        <span style={{opacity: frame % 20 < 10 ? 1 : 0}}>|</span>
      </div>
      <div style={{position: 'absolute', top: 1360, left: 70, fontFamily: FONT, fontSize: 22, color: C.muted}}>
        Dane przykładowe
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Scena 4: Zatwierdź + karta leada w CRM ---------- */
const SceneApprove: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const press = interpolate(frame, [30, 36, 42], [1, 0.92, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const approved = frame >= 36;
  const card = spring({frame: frame - 60, fps, config: {damping: 200}});
  const history = ['Znaleziony: Logistyka Północ', 'Dopasowanie: 92%', 'Wiadomość zaakceptowana', 'Odpowiedź: „Zapraszam na rozmowę”'];
  // kursor dojeżdża do przycisku
  const cx = interpolate(frame, [0, 28], [900, 560], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const cy = interpolate(frame, [0, 28], [1100, 700], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Headline>
        Nic nie wychodzi <Hl>bez Twojej zgody</Hl>
      </Headline>
      <div
        style={{
          position: 'absolute',
          top: 620,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: interpolate(frame, [50, 62], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
        }}
      >
        <div
          style={{
            transform: `scale(${press})`,
            background: approved ? C.accent : C.panel,
            border: `3px solid ${C.accent}`,
            color: approved ? C.bg : C.accent,
            fontFamily: FONT,
            fontSize: 52,
            fontWeight: 800,
            padding: '34px 80px',
            borderRadius: 22,
          }}
        >
          {approved ? '✓ Zatwierdzone' : 'Zatwierdź'}
        </div>
      </div>
      {frame < 55 ? (
        <div style={{position: 'absolute', left: cx, top: cy, width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderBottom: `44px solid ${C.text}`, transform: 'rotate(-30deg)'}} />
      ) : null}
      <div
        style={{
          position: 'absolute',
          top: 560,
          left: 70,
          right: 70,
          opacity: card,
          transform: `translateY(${(1 - card) * 60}px)`,
          background: C.panel,
          border: `2px solid ${C.line}`,
          borderRadius: 24,
          padding: 36,
          fontFamily: FONT,
        }}
      >
        <div style={{fontSize: 24, fontWeight: 700, color: C.accent}}>CRM · NOWY LEAD</div>
        <div style={{fontSize: 44, fontWeight: 800, color: C.text, marginTop: 10}}>Anna K., Logistyka Północ</div>
        <div style={{fontSize: 30, color: C.muted, marginTop: 6}}>Dyrektor sprzedaży</div>
        <div style={{marginTop: 26, display: 'flex', flexDirection: 'column', gap: 14}}>
          {history.map((h, i) => (
            <div key={h} style={{opacity: fadeIn(frame, 75 + i * 10, 8), display: 'flex', gap: 16, alignItems: 'center', fontSize: 30, color: C.text}}>
              <div style={{width: 16, height: 16, borderRadius: 8, background: C.accent}} />
              {h}
            </div>
          ))}
        </div>
      </div>
      <Caption text="Handlowiec dostaje leada z historią i dzwoni." />
    </AbsoluteFill>
  );
};

/* ---------- Scena 5: cytat (w finale: Michał do kamery) ---------- */
const SceneQuote: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <div style={{position: 'absolute', top: 520, left: 80, right: 80, fontFamily: FONT}}>
        <div style={{fontSize: 84, fontWeight: 800, color: C.text, lineHeight: 1.1, opacity: fadeIn(frame, 0, 10)}}>
          Nie obiecuję liczby leadów.
        </div>
        <div style={{fontSize: 84, fontWeight: 800, color: C.accent, lineHeight: 1.1, marginTop: 30, opacity: fadeIn(frame, 30, 10)}}>
          Obiecuję proces.
        </div>
        <div style={{marginTop: 60, fontSize: 34, color: C.muted, opacity: fadeIn(frame, 60, 12)}}>
          Michał, Hazeo · 12 lat w sprzedaży B2B
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Scena 6: CTA ---------- */
const SceneCta: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: frame - 8, fps, config: {damping: 10}});
  return (
    <AbsoluteFill style={{background: C.bg, alignItems: 'center', fontFamily: FONT}}>
      <div style={{position: 'absolute', top: 330, fontSize: 64, fontWeight: 800, color: C.text, letterSpacing: 6}}>HAZEO</div>
      <div style={{position: 'absolute', top: 600, fontSize: 52, fontWeight: 700, color: C.text}}>Napisz w komentarzu</div>
      <div
        style={{
          position: 'absolute',
          top: 720,
          transform: `scale(${pop})`,
          background: C.accent,
          color: C.bg,
          fontSize: 150,
          fontWeight: 900,
          padding: '20px 70px',
          borderRadius: 30,
          letterSpacing: 8,
        }}
      >
        MAPA
      </div>
      <div style={{position: 'absolute', top: 1000, width: 900, textAlign: 'center', fontSize: 40, color: C.muted, lineHeight: 1.3, opacity: fadeIn(frame, 25, 10)}}>
        Wyślę Ci mapę firm z Twojej branży
      </div>
      <div style={{position: 'absolute', top: 1170, fontSize: 48, fontWeight: 700, color: C.accent, opacity: fadeIn(frame, 40, 10)}}>hazeo.pl</div>
    </AbsoluteFill>
  );
};

const SCENE_COMPONENTS = [SceneSheet, SceneCalendar, SceneEngine, SceneApprove, SceneQuote, SceneCta];

export const HandlowiecReel: React.FC = () => (
  <AbsoluteFill style={{background: C.bg}}>
    {SCENES.map((s, i) => {
      const Comp = SCENE_COMPONENTS[i];
      return (
        <Sequence key={i} from={s.from} durationInFrames={s.dur}>
          <Comp />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
