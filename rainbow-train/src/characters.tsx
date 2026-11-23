import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useAmp} from './common';

export type Kind = 'benny' | 'lily' | 'toto';

const PAL: Record<Kind, {main: string; light: string; dark: string; inner: string}> = {
  benny: {main: '#FFC93C', light: '#FFE69A', dark: '#E39A00', inner: '#FFF1C2'},
  lily: {main: '#FF8FB8', light: '#FFC6DB', dark: '#E0558A', inner: '#FFE3EE'},
  toto: {main: '#5BB8FF', light: '#A9DBFF', dark: '#2F86D6', inner: '#D8EEFF'},
};

type Props = {
  kind: Kind;
  x?: number;
  y?: number;
  scale?: number;
  phase?: number;
  wave?: boolean;
  talk?: boolean; // рот двигается в такт озвучке
  dance?: number; // 0..1 — сила танца
  flip?: boolean;
};

// Персонаж нарисован в локальных координатах: (0,0) — центр под ногами, рост ≈ 260.
export const Character: React.FC<Props> = ({
  kind,
  x = 0,
  y = 0,
  scale = 1,
  phase = 0,
  wave = false,
  talk = true,
  dance = 0,
  flip = false,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const amp = useAmp();
  const t = frame / fps;
  const p = PAL[kind];
  const gid = `${kind}-g`;

  const beat = t * Math.PI * 1.7 + phase;
  const bounce = Math.abs(Math.sin(beat)) * (6 + dance * 30) + amp * 5;
  const sway = Math.sin(beat) * dance * 9;
  const blink = Math.floor(t * 10 + phase * 7) % 40 === 0 ? 0.12 : 1;
  const m = talk ? Math.min(1, amp * 1.5) : 0.1;
  const rArm = wave ? -135 + Math.sin(t * Math.PI * 3 + phase) * 22 : -15 - dance * 110 * (0.5 + 0.5 * Math.sin(beat));
  const lArm = 15 + dance * 110 * (0.5 + 0.5 * Math.sin(beat + Math.PI));

  const eye = (cx: number) => (
    <g>
      <ellipse cx={cx} cy={-158} rx={11} ry={13 * blink} fill="#fff" />
      <circle cx={cx + 1} cy={-157} r={6.5 * (blink > 0.5 ? 1 : 0.2)} fill="#2b2340" />
      <circle cx={cx + 3} cy={-160} r={2.4} fill="#fff" />
    </g>
  );

  const mouthX = kind === 'toto' ? -16 : 0;
  const mouthY = kind === 'toto' ? -118 : -122;

  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <defs>
        <radialGradient id={gid} cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor={p.light} />
          <stop offset="0.55" stopColor={p.main} />
          <stop offset="1" stopColor={p.dark} />
        </radialGradient>
      </defs>
      <ellipse cx={0} cy={0} rx={70 - bounce * 0.4} ry={12} fill="#000" opacity={0.18} />
      <g transform={`translate(0 ${-bounce}) rotate(${sway} 0 -10)`}>
        {/* уши (сзади головы) */}
        {kind === 'benny' && (
          <>
            <circle cx={-42} cy={-196} r={22} fill={`url(#${gid})`} />
            <circle cx={-42} cy={-196} r={12} fill={p.inner} />
            <circle cx={42} cy={-196} r={22} fill={`url(#${gid})`} />
            <circle cx={42} cy={-196} r={12} fill={p.inner} />
          </>
        )}
        {kind === 'lily' && (
          <>
            <g transform="rotate(-10 -24 -195)">
              <ellipse cx={-24} cy={-238} rx={16} ry={46} fill={`url(#${gid})`} />
              <ellipse cx={-24} cy={-236} rx={8} ry={32} fill={p.inner} />
            </g>
            <g transform="rotate(10 24 -195)">
              <ellipse cx={24} cy={-238} rx={16} ry={46} fill={`url(#${gid})`} />
              <ellipse cx={24} cy={-236} rx={8} ry={32} fill={p.inner} />
            </g>
          </>
        )}
        {kind === 'toto' && (
          <>
            <ellipse cx={-64} cy={-150} rx={36} ry={42} fill={`url(#${gid})`} />
            <ellipse cx={-64} cy={-150} rx={23} ry={29} fill={p.inner} />
            <ellipse cx={64} cy={-150} rx={36} ry={42} fill={`url(#${gid})`} />
            <ellipse cx={64} cy={-150} rx={23} ry={29} fill={p.inner} />
          </>
        )}
        {/* ноги */}
        <ellipse cx={-28} cy={-10} rx={27} ry={15} fill={p.dark} />
        <ellipse cx={28} cy={-10} rx={27} ry={15} fill={p.dark} />
        {/* тело */}
        <ellipse cx={0} cy={-75} rx={52} ry={58} fill={`url(#${gid})`} />
        <ellipse cx={0} cy={-68} rx={32} ry={38} fill={p.inner} opacity={0.9} />
        {/* руки */}
        <g transform={`translate(-46 -95) rotate(${lArm})`}>
          <ellipse cx={0} cy={24} rx={14} ry={32} fill={`url(#${gid})`} />
        </g>
        <g transform={`translate(46 -95) rotate(${rArm})`}>
          <ellipse cx={0} cy={24} rx={14} ry={32} fill={`url(#${gid})`} />
        </g>
        {/* голова */}
        <circle cx={0} cy={-150} r={57} fill={`url(#${gid})`} />
        <ellipse cx={-22} cy={-185} rx={20} ry={9} fill="#fff" opacity={0.35} transform="rotate(-20 -22 -185)" />
        {/* мордочка */}
        {kind === 'benny' && (
          <>
            <ellipse cx={0} cy={-130} rx={24} ry={18} fill={p.inner} />
            <ellipse cx={0} cy={-139} rx={9} ry={6} fill="#4a2c1a" />
          </>
        )}
        {kind === 'lily' && <ellipse cx={0} cy={-139} rx={7} ry={5} fill="#E0558A" />}
        {kind === 'toto' && (
          <path
            d="M 2 -142 Q 6 -104 32 -100"
            stroke={p.main}
            strokeWidth={24}
            strokeLinecap="round"
            fill="none"
          />
        )}
        {eye(-22)}
        {eye(22)}
        <circle cx={-38} cy={-136} r={9} fill="#FF7A9A" opacity={0.5} />
        <circle cx={38} cy={-136} r={9} fill="#FF7A9A" opacity={0.5} />
        {/* рот */}
        <ellipse cx={mouthX} cy={mouthY} rx={10 + 5 * m} ry={3 + 12 * m} fill="#7a1f3d" />
        {m > 0.25 && <ellipse cx={mouthX} cy={mouthY + 3 + 5 * m} rx={6} ry={2 + 4 * m} fill="#FF8AA5" />}
      </g>
    </g>
  );
};
