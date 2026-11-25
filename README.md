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

## Stories „Producent · eksport” (36 s)

Kompozycja `ExportStories`: okładka z hakiem + 6 scen ze scenariusza (tekst dosłownie), cięcia na bit 120 BPM,
błyski z ujęciem silnika na każdym cięciu, RGB-glitch i wstrząs na kluczowych słowach, licznik ceny.
Pliki: `public/eksport/silnik.mp4` (ujęcie silnika), `public/eksport/tlo.jpg` (nocne miasto), `public/eksport/beat.wav`
(synteza: `python3 scripts/eksport_sfx.py`, czasy cięć = `CUTS` w `src/ExportStories.tsx`).

```bash
npx remotion render ExportStories out/eksport-stories.mp4
npx remotion still ExportStories out/okladka.png --frame=30
```
