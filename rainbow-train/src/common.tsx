import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import ampData from './data/amplitude.json';

export const W = 1920;
export const H = 1080;
export const FONT = 'Fredoka, "Baloo 2", "Arial Rounded MT Bold", Arial, sans-serif';
export const RAINBOW = ['#FF4B5C', '#FF9F1C', '#FFD93D', '#3DCB6C', '#3F8CFF', '#6C5CE7', '#C56CF0'];

// ---------- громкость озвучки (для движения ртов и "пульса") ----------
export const AmpContext = createContext<number>(0);
export const useAmp = () => useContext(AmpContext);

export const ampAtFrame = (frame: number): number => {
  const v = ampData.values;
  let s = 0;
  let c = 0;
  for (let k = -2; k <= 2; k++) {
    const i = frame + k;
    if (i >= 0 && i < v.length) {
      s += v[i];
      c++;
    }
  }
  return c ? s / c : 0;
};

// ---------- helpers ----------
export const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const prog = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut});

export const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {children}
    </svg>
  </AbsoluteFill>
);

export const Sky: React.FC<{id: string; top: string; bottom: string}> = ({id, top, bottom}) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill={`url(#${id})`} />
  </>
);

export const Sun: React.FC<{x: number; y: number; r: number; color?: string}> = ({x, y, r, color = '#FFE066'}) => {
  const f = useCurrentFrame();
  return (
    <g>
      <circle cx={x} cy={y} r={r * (1.5 + 0.05 * Math.sin(f / 12))} fill={color} opacity={0.25} />
      <circle cx={x} cy={y} r={r} fill={color} />
    </g>
  );
};

const Cloud: React.FC<{x: number; y: number; s: number; speed: number}> = ({x, y, s, speed}) => {
  const f = useCurrentFrame();
  const px = ((x + f * speed) % (W + 500)) - 250;
  return (
    <g transform={`translate(${px} ${y}) scale(${s})`} opacity={0.93}>
      <ellipse cx={0} cy={0} rx={90} ry={34} fill="#fff" />
      <ellipse cx={-55} cy={10} rx={55} ry={28} fill="#fff" />
      <ellipse cx={60} cy={12} rx={60} ry={26} fill="#fff" />
      <ellipse cx={20} cy={-22} rx={50} ry={32} fill="#fff" />
    </g>
  );
};

export const Clouds: React.FC<{tint?: string}> = () => (
  <>
    <Cloud x={200} y={180} s={1.2} speed={0.5} />
    <Cloud x={900} y={110} s={0.9} speed={0.35} />
    <Cloud x={1500} y={260} s={1.0} speed={0.45} />
  </>
);

export const Hills: React.FC<{scroll: number; base: number; amp: number; period: number; color: string}> = ({
  scroll,
  base,
  amp,
  period,
  color,
}) => {
  const off = ((scroll % period) + period) % period;
  let d = `M ${-period} ${H}`;
  for (let x = -period; x <= W + period; x += 40) {
    d += ` L ${x} ${base + amp * Math.sin((x / period) * Math.PI * 2)}`;
  }
  d += ` L ${W + period} ${H} Z`;
  return <path d={d} fill={color} transform={`translate(${-off} 0)`} />;
};

export const Track: React.FC<{y: number; scroll: number}> = ({y, scroll}) => {
  const items: React.ReactNode[] = [];
  const off = ((scroll % 70) + 70) % 70;
  for (let x = -70; x < W + 70; x += 70) {
    items.push(<rect key={x} x={x - off} y={y + 6} width={44} height={14} rx={4} fill="#8a5a3c" />);
  }
  return (
    <g>
      <rect x={0} y={y - 4} width={W} height={46} fill="#9b93ad" />
      {items}
      <rect x={0} y={y} width={W} height={9} fill="#5d5670" />
    </g>
  );
};

export const BigText: React.FC<{
  x: number;
  y: number;
  size: number;
  fill?: string;
  stroke?: string;
  scale?: number;
  opacity?: number;
  rotate?: number;
  children: React.ReactNode;
}> = ({x, y, size, fill = '#fff', stroke = '#6C5CE7', scale = 1, opacity = 1, rotate = 0, children}) => (
  <text
    x={0}
    y={0}
    textAnchor="middle"
    fontFamily={FONT}
    fontWeight={700}
    fontSize={size}
    fill={fill}
    stroke={stroke}
    strokeWidth={size * 0.13}
    paintOrder="stroke"
    strokeLinejoin="round"
    opacity={opacity}
    transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}
  >
    {children}
  </text>
);

// ---------- поезд ----------
export const WAGON_COLORS = ['#FF4B5C', '#FFB020', '#3DCB6C', '#3F8CFF'];
export const WAGON_STEP = 250;

const Wheel: React.FC<{cx: number; cy: number; r: number; angle: number}> = ({cx, cy, r, angle}) => (
  <g transform={`translate(${cx} ${cy}) rotate(${angle})`}>
    <circle r={r} fill="#3b3358" />
    <circle r={r * 0.62} fill="#fff6d6" />
    <circle r={r * 0.2} fill="#3b3358" />
    <rect x={-r * 0.55} y={-3} width={r * 1.1} height={6} rx={3} fill="#3b3358" />
  </g>
);

export const Train: React.FC<{
  x: number;
  y: number;
  scale?: number;
  wheel: number;
  riders?: React.ReactNode[];
  smoke?: boolean;
}> = ({x, y, scale = 1, wheel, riders = [], smoke = true}) => {
  const f = useCurrentFrame();
  const puffs: React.ReactNode[] = [];
  if (smoke) {
    for (let k = 0; k < 5; k++) {
      const age = (f * 0.025 + k / 5) % 1;
      puffs.push(
        <circle
          key={k}
          cx={209 - age * 90}
          cy={-215 - age * 150}
          r={16 + age * 34}
          fill="#fff"
          opacity={(1 - age) * 0.85}
        />,
      );
    }
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {WAGON_COLORS.map((c, i) => (
        <g key={i} transform={`translate(${i * WAGON_STEP} 0)`}>
          <rect x={0} y={-190} width={230} height={150} rx={18} fill={c} opacity={0.3} />
          {riders[i] ?? null}
          <rect x={0} y={-112} width={230} height={72} rx={14} fill={c} />
          <rect x={10} y={-104} width={210} height={14} rx={7} fill="#fff" opacity={0.35} />
          <rect x={-8} y={-120} width={246} height={16} rx={8} fill="#fff" opacity={0.9} />
          <Wheel cx={52} cy={-24} r={24} angle={wheel} />
          <Wheel cx={178} cy={-24} r={24} angle={wheel} />
          <rect x={230} y={-52} width={20} height={9} rx={4} fill="#5d5670" />
        </g>
      ))}
      <g transform={`translate(${4 * WAGON_STEP} 0)`}>
        {puffs}
        <rect x={0} y={-210} width={110} height={170} rx={18} fill="#7C3AED" />
        <rect x={-6} y={-222} width={122} height={20} rx={10} fill="#FFD43B" />
        <rect x={22} y={-176} width={66} height={58} rx={12} fill="#BDE7FF" />
        <rect x={100} y={-150} width={160} height={110} rx={26} fill="#8B5CF6" />
        <rect x={100} y={-150} width={160} height={22} rx={11} fill="#fff" opacity={0.3} />
        <rect x={190} y={-196} width={38} height={50} rx={6} fill="#FFD43B" />
        <ellipse cx={209} cy={-198} rx={26} ry={10} fill="#FFB020" />
        <circle cx={262} cy={-100} r={15} fill="#FFF3A3" />
        <circle cx={262} cy={-100} r={8} fill="#FFD43B" />
        <path d="M 258 -40 L 292 -40 L 258 -62 Z" fill="#FF9F1C" />
        <Wheel cx={60} cy={-26} r={26} angle={wheel} />
        <Wheel cx={150} cy={-26} r={26} angle={wheel} />
        <Wheel cx={225} cy={-26} r={26} angle={wheel} />
      </g>
    </g>
  );
};

export const TRAIN_LEN = 4 * WAGON_STEP + 260;
