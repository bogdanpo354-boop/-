import React from 'react';
import {Composition} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Fredoka';
import {Main} from './Main';
import {FPS, TOTAL_FRAMES} from './data/scenes';

loadFont();

export const Root: React.FC = () => (
  <Composition
    id="RainbowTrain"
    component={Main}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
