# Hazeo – rolki Instagram (Remotion)

Rolka „Handlowiec, który szuka zamiast sprzedawać” (30 s, 1080x1920, 30 fps).
Podgląd bez lektora: animowane napisy i makiety ekranów, bez płatnych generatorów.

```bash
npm install
npm run studio   # podgląd w przeglądarce
npm run render   # out/handlowiec.mp4
```

Czasy scen są w `SCENES` w `src/HandlowiecReel.tsx`. W montażu finalnym:
- scena 3: makietę zastąpić nagraniem ekranu Hazeo Engine (6 s),
- scena 5: planszę zastąpić nagraniem Michała do kamery (5 s),
- dołożyć lektora (`<Audio>`) i dopasować czasy scen do długości kwestii,
- znak słowny HAZEO zamienić na plik logo; tło #111217 jest z hazeo.pl, czerwień akcentu to przybliżenie do podmiany na dokładny hex.

## Short „Hazeo Engine szuka klientów za Ciebie” (15 s)

Kompozycja `EngineShort`. Tło = 3 ujęcia z Higgsfield (Cinema Studio 3.0, 5 s, 9:16, bez dźwięku),
pliki w `public/engine/shot1.mp4`–`shot3.mp4` (poza gitem). Render: `npx remotion render EngineShort out/short.mp4`.

## Wideo LinkedIn „Która z 3 firm jest warta telefonu?” (ScoringVideo)

4:5 (1080x1350), ok. 32 s, ze scoringiem 0–100 z karuzeli. Wyniki są ukryte (??) aż do odsłony, żeby widz został do końca.
Przejścia: punch-in, zoom z rozmyciem, whip pan, maska koła, glitch, czerwona smuga światła. Dźwięki generuje `npm run sfx` (bez zewnętrznych plików).

```bash
npm run render:scoring   # out/scoring.mp4
```

Firmy i liczby są przykładowe. Prawdziwe dane klientów tylko po akceptacji.
