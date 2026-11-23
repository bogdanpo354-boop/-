import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  BigText,
  Clouds,
  Hills,
  RAINBOW,
  Sky,
  Sun,
  Svg,
  Track,
  Train,
  TRAIN_LEN,
  WAGON_STEP,
  W,
  H,
  clamp01,
  lerp,
  prog,
  useAmp,
} from './common';
import {Character, Kind} from './characters';

const S = 0.9; // масштаб поезда на станции
const TRAIN_Y = 860;
const HEROES: Kind[] = ['benny', 'lily', 'toto'];
const RIDER_Y = -58;
const RIDER_S = 0.55;

const rider = (kind: Kind, i: number, extra?: {dance?: number; wave?: boolean}) => (
  <Character key={kind} kind={kind} x={115} y={RIDER_Y} scale={RIDER_S} phase={i * 1.3} {...extra} />
);

// ---------------------------------------------------------------- 1. станция
const StationBuilding: React.FC = () => (
  <g transform="translate(1530 560)">
    <rect x={0} y={60} width={340} height={240} rx={10} fill="#FFD6A5" />
    <path d="M -20 70 L 170 -40 L 360 70 Z" fill="#FF6B6B" />
    <rect x={40} y={110} width={70} height={70} rx={10} fill="#BDE7FF" />
    <rect x={230} y={110} width={70} height={70} rx={10} fill="#BDE7FF" />
    <rect x={135} y={160} width={70} height={140} rx={12} fill="#8B5CF6" />
    <circle cx={170} cy={20} r={30} fill="#fff" stroke="#6C5CE7" strokeWidth={6} />
    <path d="M 170 20 L 170 2 M 170 20 L 184 26" stroke="#6C5CE7" strokeWidth={5} strokeLinecap="round" />
    <rect x={95} y={72} width={150} height={34} rx={10} fill="#6C5CE7" />
    <text x={170} y={97} textAnchor="middle" fontFamily="Fredoka, Arial, sans-serif" fontWeight={700} fontSize={24} fill="#fff">
      STATION
    </text>
  </g>
);

const Platform: React.FC = () => (
  <g>
    <rect x={0} y={905} width={W} height={H - 905} fill="#cfc8dc" />
    <rect x={0} y={905} width={W} height={16} fill="#ece7f5" />
    <rect x={0} y={934} width={W} height={8} fill="#FFD43B" />
  </g>
);

const StationBG: React.FC<{trainX: number; wheel: number; riders?: React.ReactNode[]}> = ({trainX, wheel, riders}) => (
  <>
    <Sky id="sky-station" top="#7fcfff" bottom="#eaf8ff" />
    <Sun x={1560} y={190} r={70} />
    <Clouds />
    <Hills scroll={0} base={720} amp={45} period={960} color="#b9e9a6" />
    <Hills scroll={300} base={790} amp={35} period={720} color="#8fdc86" />
    <StationBuilding />
    <rect x={0} y={TRAIN_Y} width={W} height={50} fill="#9b93ad" />
    <rect x={0} y={TRAIN_Y} width={W} height={9} fill="#5d5670" />
    <Train x={trainX} y={TRAIN_Y} scale={S} wheel={wheel} riders={riders} />
    <Platform />
  </>
);

export const SceneStation: React.FC<{dur: number}> = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const x = interpolate(f, [0, 150], [-1350, 380], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const title = spring({frame: f - 25, fps, config: {damping: 11}});
  const startX = [560, 960, 1360];
  return (
    <Svg>
      <StationBG trainX={x} wheel={x * 2.4} />
      {HEROES.map((k, i) => (
        <Character key={k} kind={k} x={startX[i]} y={1035} scale={0.9} phase={i * 1.3} wave />
      ))}
      <BigText x={960} y={140} size={110} scale={title} fill="#fff" stroke="#6C5CE7">
        THE RAINBOW TRAIN
      </BigText>
    </Svg>
  );
};

// ---------------------------------------------------------------- 2. посадка
export const SceneBoard: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const startMove = Math.max(200, dur - 120);
  const moved = f > startMove ? (f - startMove) ** 2 * 0.07 : 0;
  const trainX = 380 + moved;
  const startX = [560, 960, 1360];
  const t0 = (i: number) => 20 + i * 45;
  const t1 = (i: number) => t0(i) + 34;

  const riders: React.ReactNode[] = HEROES.map((k, i) => (f >= t1(i) ? rider(k, i, {wave: true}) : null));

  return (
    <Svg>
      <StationBG trainX={trainX} wheel={moved * 2.4} riders={riders} />
      {HEROES.map((k, i) => {
        if (f >= t1(i)) return null;
        const q = clamp01((f - t0(i)) / (t1(i) - t0(i)));
        const slotX = 380 + (i * WAGON_STEP + 115) * S;
        const slotY = TRAIN_Y + RIDER_Y * S;
        const px = lerp(startX[i], slotX, q);
        const py = lerp(1035, slotY, q) - 230 * Math.sin(Math.PI * q);
        const sc = lerp(0.9, RIDER_S * S, q);
        return <Character key={k} kind={k} x={px} y={py} scale={sc} phase={i * 1.3} wave={q === 0} />;
      })}
    </Svg>
  );
};

// ---------------------------------------------------------------- 3. загородом, танец
const Notes: React.FC = () => {
  const f = useCurrentFrame();
  const chars = ['♪', '♫', '♪', '♫', '♪', '♫', '♪', '♫'];
  return (
    <g>
      {chars.map((c, i) => {
        const age = ((f * 2 + i * 45) % 340) / 340;
        return (
          <text
            key={i}
            x={420 + i * 150 + Math.sin(f / 15 + i) * 20}
            y={560 - age * 360}
            fontSize={70}
            fontWeight={700}
            fill={RAINBOW[i % 7]}
            opacity={Math.sin(age * Math.PI)}
          >
            {c}
          </text>
        );
      })}
    </g>
  );
};

export const SceneCountryside: React.FC<{dur: number}> = () => {
  const f = useCurrentFrame();
  const scroll = f * 9;
  const bob = Math.sin(f / 4) * 2;
  const flowers: React.ReactNode[] = [];
  for (let i = 0; i < 16; i++) {
    const fx = (((i * 150 - scroll * 1.0) % (W + 200)) + (W + 200)) % (W + 200) - 100;
    flowers.push(
      <g key={i} transform={`translate(${fx} ${960 + (i % 3) * 30})`}>
        <circle r={12} fill={RAINBOW[i % 7]} />
        <circle r={5} fill="#fff6d6" />
      </g>,
    );
  }
  const riders = HEROES.map((k, i) => rider(k, i, {dance: 0.8}));
  return (
    <Svg>
      <Sky id="sky-country" top="#63c9ff" bottom="#d9f6ff" />
      <Sun x={300} y={170} r={65} />
      <Clouds />
      <Hills scroll={scroll * 0.15} base={620} amp={55} period={1200} color="#b9e9a6" />
      <Hills scroll={scroll * 0.4} base={720} amp={45} period={900} color="#8fdc86" />
      <Hills scroll={scroll * 0.7} base={820} amp={30} period={640} color="#5fc96b" />
      <Track y={TRAIN_Y} scroll={scroll} />
      <Train x={300} y={TRAIN_Y + bob} scale={S} wheel={scroll * 2.4} riders={riders} />
      <rect x={0} y={TRAIN_Y + 46} width={W} height={H} fill="#4fbf60" />
      {flowers}
      <Notes />
    </Svg>
  );
};

// ---------------------------------------------------------------- 4. цвета
const Apple: React.FC = () => (
  <g>
    <ellipse cx={0} cy={20} rx={78} ry={74} fill="#FF3B4E" />
    <ellipse cx={-30} cy={-8} rx={20} ry={30} fill="#fff" opacity={0.35} transform="rotate(25 -30 -8)" />
    <path d="M 0 -50 Q 4 -80 20 -92" stroke="#6b4423" strokeWidth={9} strokeLinecap="round" fill="none" />
    <ellipse cx={38} cy={-78} rx={30} ry={14} fill="#3DCB6C" transform="rotate(-25 38 -78)" />
  </g>
);
const Flower: React.FC = () => (
  <g>
    <rect x={-6} y={10} width={12} height={110} rx={6} fill="#3DCB6C" />
    <ellipse cx={-30} cy={80} rx={30} ry={12} fill="#3DCB6C" transform="rotate(-25 -30 80)" />
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
      <ellipse key={i} cx={0} cy={-52} rx={20} ry={36} fill="#FFD93D" transform={`rotate(${i * 45} 0 -10)`} />
    ))}
    <circle cx={0} cy={-10} r={28} fill="#FF9F1C" />
  </g>
);
const Trees: React.FC = () => (
  <g>
    <rect x={-60} y={30} width={22} height={80} rx={6} fill="#8a5a3c" />
    <circle cx={-49} cy={-5} r={52} fill="#2FB45A" />
    <circle cx={-70} cy={20} r={34} fill="#3DCB6C" />
    <rect x={36} y={50} width={24} height={70} rx={6} fill="#8a5a3c" />
    <circle cx={48} cy={10} r={58} fill="#3DCB6C" />
    <circle cx={30} cy={-20} r={30} fill="#5fe08a" opacity={0.6} />
  </g>
);
const SkyIcon: React.FC = () => (
  <g>
    <circle cx={0} cy={0} r={92} fill="#8fd0ff" />
    <g fill="#fff">
      <ellipse cx={-10} cy={10} rx={58} ry={24} />
      <ellipse cx={-40} cy={20} rx={34} ry={20} />
      <ellipse cx={26} cy={-8} rx={34} ry={24} />
    </g>
  </g>
);

export const SceneColors: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const items = [
    {name: 'RED', bg: '#FF6B7A', icon: <Apple />},
    {name: 'YELLOW', bg: '#FFD93D', icon: <Flower />},
    {name: 'GREEN', bg: '#5BD98A', icon: <Trees />},
    {name: 'BLUE', bg: '#5BA8FF', icon: <SkyIcon />},
  ];
  const step = (dur - 40) / 4;
  const active = Math.min(3, Math.floor(Math.max(0, f - 10) / step));
  return (
    <Svg>
      <Sky id="sky-colors" top="#ffe7f3" bottom="#fff7d6" />
      <Clouds />
      <Hills scroll={0} base={880} amp={30} period={960} color="#8fdc86" />
      <rect x={0} y={930} width={W} height={150} fill="#5fc96b" />
      {items.map((it, i) => {
        const sp = spring({frame: f - (10 + i * step), fps, config: {damping: 10, stiffness: 110}});
        const hi = i === active ? 1.07 : 1;
        const cx = 110 + i * 440 + 190;
        return (
          <g key={it.name} transform={`translate(${cx} 420) scale(${sp * hi})`} opacity={clamp01(sp * 2)}>
            <rect x={-190} y={-250} width={380} height={470} rx={44} fill={it.bg} />
            <rect x={-170} y={-230} width={340} height={30} rx={15} fill="#fff" opacity={0.35} />
            <g transform="translate(0 -60)">{it.icon}</g>
            <BigText x={0} y={170} size={72} stroke="#6C5CE7">
              {it.name}
            </BigText>
          </g>
        );
      })}
      <Character kind="benny" x={330} y={1040} scale={0.8} dance={0.3} />
      <Character kind="lily" x={960} y={1040} scale={0.8} dance={0.3} phase={1.3} />
      <Character kind="toto" x={1590} y={1040} scale={0.8} dance={0.3} phase={2.6} />
    </Svg>
  );
};

// ---------------------------------------------------------------- 5. большой танец
export const SceneDance: React.FC<{dur: number}> = () => {
  const f = useCurrentFrame();
  const amp = useAmp();
  const rings = RAINBOW.map((c, k) => (
    <circle
      key={c}
      cx={960}
      cy={540}
      r={90 + k * 115 + amp * 30}
      fill="none"
      stroke={c}
      strokeWidth={46}
      opacity={0.5}
    />
  ));
  const tiles: React.ReactNode[] = [];
  for (let i = 0; i < 16; i++) {
    tiles.push(
      <rect
        key={i}
        x={i * 120}
        y={900}
        width={120}
        height={180}
        fill={RAINBOW[(i + Math.floor(f / 8)) % 7]}
        opacity={0.55}
      />,
    );
  }
  const conf: React.ReactNode[] = [];
  for (let i = 0; i < 45; i++) {
    const age = ((f * (2 + (i % 4)) + i * 53) % 900) / 900;
    conf.push(
      <rect
        key={i}
        x={(i * 97) % W}
        y={-30 + age * (H + 60)}
        width={16}
        height={26}
        rx={4}
        fill={RAINBOW[i % 7]}
        transform={`rotate(${f * 4 + i * 30} ${(i * 97) % W} ${-30 + age * (H + 60)})`}
      />,
    );
  }
  return (
    <Svg>
      <Sky id="sky-dance" top="#5b2a86" bottom="#ff5fa2" />
      <g transform={`rotate(${f * 0.3} 960 540)`}>{rings}</g>
      {tiles}
      {conf}
      <Character kind="benny" x={560} y={990} scale={1.25} dance={1} />
      <Character kind="lily" x={960} y={1010} scale={1.35} dance={1} phase={1.6} />
      <Character kind="toto" x={1360} y={990} scale={1.25} dance={1} phase={3.2} />
    </Svg>
  );
};

// ---------------------------------------------------------------- 6. морковки 1-2-3
const Carrot: React.FC = () => (
  <g>
    <path d="M -46 -230 Q 0 -262 46 -230 Q 24 -100 0 0 Q -24 -100 -46 -230 Z" fill="#FF8A1F" />
    <path d="M -30 -200 L -8 -196 M 24 -170 L 6 -166 M -18 -130 L 0 -126" stroke="#E56F00" strokeWidth={6} strokeLinecap="round" />
    <ellipse cx={-20} cy={-200} rx={8} ry={24} fill="#fff" opacity={0.3} />
    <ellipse cx={-20} cy={-262} rx={14} ry={40} fill="#3DCB6C" transform="rotate(-25 -20 -240)" />
    <ellipse cx={0} cy={-272} rx={14} ry={46} fill="#2FB45A" />
    <ellipse cx={20} cy={-262} rx={14} ry={40} fill="#3DCB6C" transform="rotate(25 20 -240)" />
  </g>
);

export const SceneCarrots: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const xs = [620, 960, 1300];
  const times = [0.1, 0.36, 0.62].map((p) => Math.round(p * dur));
  const colors = ['#FF4B5C', '#3DCB6C', '#3F8CFF'];
  return (
    <Svg>
      <Sky id="sky-carrot" top="#9fdcff" bottom="#fff4c9" />
      <Sun x={1650} y={170} r={60} />
      <Clouds />
      <Hills scroll={0} base={700} amp={40} period={960} color="#b9e9a6" />
      <rect x={0} y={720} width={W} height={360} fill="#8fdc86" />
      <rect x={0} y={780} width={W} height={300} fill="#9a6b45" />
      {xs.map((x, i) => {
        const sp = spring({frame: f - times[i], fps, config: {damping: 9, stiffness: 120}});
        return (
          <g key={x}>
            <g transform={`translate(${x} 790) scale(${sp * 1.25})`}>
              <Carrot />
            </g>
            <ellipse cx={x} cy={792} rx={90} ry={22} fill="#7a5233" />
            <g transform={`translate(${x} 250) scale(${sp})`}>
              <circle r={80} fill={colors[i]} />
              <BigText x={0} y={38} size={110} stroke="#fff">
                {String(i + 1)}
              </BigText>
            </g>
          </g>
        );
      })}
      <Character kind="toto" x={230} y={1040} scale={1} dance={0.3} />
      <Character kind="lily" x={960} y={1060} scale={1.1} phase={1.3} dance={0.2} />
      <Character kind="benny" x={1690} y={1040} scale={1} dance={0.3} phase={2.6} />
    </Svg>
  );
};

// ---------------------------------------------------------------- 7. радужный мост
export const SceneBridge: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const cx = 960;
  const cy = 900;
  const R0 = 640; // внешний радиус
  const draw = prog(f, 0, 70);
  const tStart = 80;
  const tEnd = dur - 20;
  const q = clamp01((f - tStart) / (tEnd - tStart));
  const th = Math.PI * (1 - q); // π → 0
  const px = cx + (R0 + 20) * Math.cos(th);
  const py = cy - (R0 + 20) * Math.sin(th);
  const angle = (Math.atan2(Math.cos(th), Math.sin(th)) * 180) / Math.PI;
  const trainScale = 0.36;
  const arcs = RAINBOW.map((c, k) => {
    const r = R0 - k * 34;
    const len = Math.PI * r;
    return (
      <path
        key={c}
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke={c}
        strokeWidth={34}
        strokeDasharray={len}
        strokeDashoffset={len * (1 - draw)}
      />
    );
  });
  const riders = HEROES.map((k, i) => rider(k, i, {wave: true}));
  return (
    <Svg>
      <Sky id="sky-bridge" top="#6fd0ff" bottom="#fdf3ff" />
      <Sun x={260} y={170} r={60} />
      <Clouds />
      <Hills scroll={0} base={880} amp={35} period={960} color="#8fdc86" />
      <rect x={0} y={930} width={W} height={150} fill="#5fc96b" />
      {arcs}
      <g transform={`translate(${px} ${py}) rotate(${angle}) scale(${trainScale}) translate(${-TRAIN_LEN / 2} 0)`}>
        <Train x={0} y={0} scale={1} wheel={f * 8} riders={riders} />
      </g>
    </Svg>
  );
};

// ---------------------------------------------------------------- 8. закат и прощание
export const SceneSunset: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = ['THANK YOU FOR', 'SINGING', 'WITH US!'];
  const fadeOut = interpolate(f, [dur - 18, dur], [0, 1], {extrapolateLeft: 'clamp'});
  const stars: React.ReactNode[] = [];
  for (let i = 0; i < 26; i++) {
    stars.push(
      <circle
        key={i}
        cx={(i * 211) % W}
        cy={40 + ((i * 97) % 300)}
        r={3 + (i % 3)}
        fill="#fff"
        opacity={0.4 + 0.5 * Math.abs(Math.sin(f / 15 + i))}
      />,
    );
  }
  const hearts: React.ReactNode[] = [];
  for (let i = 0; i < 8; i++) {
    const age = ((f * 1.6 + i * 60) % 480) / 480;
    hearts.push(
      <text
        key={i}
        x={300 + i * 190}
        y={900 - age * 480}
        fontSize={56}
        fill={RAINBOW[i % 7]}
        opacity={Math.sin(age * Math.PI)}
      >
        ♥
      </text>,
    );
  }
  const trainX = 40 + f * 2.2;
  const sp = (i: number) => spring({frame: f - 14 - i * 12, fps, config: {damping: 10}});
  return (
    <Svg>
      <Sky id="sky-sunset" top="#5a4a9a" bottom="#ffb48a" />
      {stars}
      <Sun x={960} y={700} r={150} color="#FFD27A" />
      <Hills scroll={0} base={760} amp={40} period={960} color="#8a5fb0" />
      <Hills scroll={200} base={840} amp={30} period={720} color="#5d3f8a" />
      <rect x={0} y={900} width={W} height={180} fill="#3f2b6b" />
      <Train x={trainX} y={880} scale={0.45} wheel={f * 5} />
      {hearts}
      <Character kind="benny" x={560} y={1050} scale={1.15} wave phase={0} />
      <Character kind="lily" x={960} y={1060} scale={1.25} wave phase={1.3} />
      <Character kind="toto" x={1360} y={1050} scale={1.15} wave phase={2.6} />
      <BigText x={960} y={170} size={100} scale={sp(0)} fill="#fff" stroke="#E0558A">
        {words[0]}
      </BigText>
      <BigText x={960} y={290} size={100} scale={sp(1)} fill="#FFE066" stroke="#E0558A">
        {words[1] + ' ' + words[2]}
      </BigText>
      <rect width={W} height={H} fill="#000" opacity={fadeOut} />
    </Svg>
  );
};
