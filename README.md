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
- napis HAZEO zamienić na logo, kolory w `C` na barwy marki.
