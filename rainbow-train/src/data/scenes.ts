// Границы сцен (секунды) подобраны по паузам в озвучке.
// Если какая-то сцена начинается не там, где вы слышите смену фразы — просто поправьте числа здесь.
export const FPS = 30;
export const TOTAL_SECONDS = 73.9;
export const TOTAL_FRAMES = Math.round(TOTAL_SECONDS * FPS); // 2217

export type SceneId =
  | 'station'
  | 'board'
  | 'countryside'
  | 'colors'
  | 'dance'
  | 'carrots'
  | 'bridge'
  | 'sunset';

export const SCENES: {id: SceneId; start: number; end: number}[] = [
  {id: 'station', start: 0.0, end: 9.5},
  {id: 'board', start: 9.5, end: 20.9},
  {id: 'countryside', start: 20.9, end: 27.7},
  {id: 'colors', start: 27.7, end: 36.8},
  {id: 'dance', start: 36.8, end: 46.9},
  {id: 'carrots', start: 46.9, end: 57.7},
  {id: 'bridge', start: 57.7, end: 67.5},
  {id: 'sunset', start: 67.5, end: TOTAL_SECONDS},
];
