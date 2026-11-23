import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {AmpContext, ampAtFrame} from './common';
import {FPS, SCENES, SceneId} from './data/scenes';
import {
  SceneStation,
  SceneBoard,
  SceneCountryside,
  SceneColors,
  SceneDance,
  SceneCarrots,
  SceneBridge,
  SceneSunset,
} from './scenes';

const COMPONENTS: Record<SceneId, React.FC<{dur: number}>> = {
  station: SceneStation,
  board: SceneBoard,
  countryside: SceneCountryside,
  colors: SceneColors,
  dance: SceneDance,
  carrots: SceneCarrots,
  bridge: SceneBridge,
  sunset: SceneSunset,
};

const OVERLAP = 12; // кадров перекрёстного затухания между сценами

const FadeIn: React.FC<{overlap: number; children: React.ReactNode}> = ({overlap, children}) => {
  const f = useCurrentFrame();
  const opacity = overlap ? interpolate(f, [0, overlap], [0, 1], {extrapolateRight: 'clamp'}) : 1;
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  const amp = ampAtFrame(frame);
  return (
    <AmpContext.Provider value={amp}>
      <AbsoluteFill style={{backgroundColor: '#000'}}>
        <Audio src={staticFile('voice.mp3')} />
        {SCENES.map((s, i) => {
          const a = Math.round(s.start * FPS);
          const b = Math.round(s.end * FPS);
          const overlap = i === 0 ? 0 : OVERLAP;
          const Comp = COMPONENTS[s.id];
          return (
            <Sequence key={s.id} from={a - overlap} durationInFrames={b - a + overlap}>
              <FadeIn overlap={overlap}>
                <Comp dur={b - a + overlap} />
              </FadeIn>
            </Sequence>
          );
        })}
      </AbsoluteFill>
    </AmpContext.Provider>
  );
};
