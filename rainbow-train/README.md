# Rainbow Train — Remotion

```bash
npm install
npm start          # превью в Remotion Studio
npm run build      # рендер в out/rainbow-train.mp4 (1920x1080, 30 fps)
```

- Озвучка: `public/voice.mp3` (73.9 c).
- Границы 8 сцен: `src/data/scenes.ts` (секунды) — правьте под фактические фразы.
- Рты и подпрыгивание персонажей идут от громкости озвучки: `src/data/amplitude.json`.
- Персонажи: `src/characters.tsx`; сцены: `src/scenes.tsx`; поезд и фоны: `src/common.tsx`.
