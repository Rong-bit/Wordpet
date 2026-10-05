import React from 'react';
import { PetStage } from '../types';
import { PetArchetype } from '../data/petSpecies';

export type FaceMood = 'ecstatic' | 'happy' | 'normal' | 'sad' | 'weak';

export interface SpeciesPalette {
  fill: string;
  primary: string;
  secondary: string;
  glow: string;
  line: string;
  belly: string;
}

interface SpeciesArtProps {
  archetype: PetArchetype;
  stage: PetStage;
  palette: SpeciesPalette;
  mood: FaceMood;
  hasWings: boolean;
}

export const HEAD_TOP: Record<PetArchetype, number> = {
  dragon: 60,
  fox: 58,
  deer: 58,
  bird: 66,
  cat: 60,
  unicorn: 58,
  robot: 58,
  bunny: 58,
  penguin: 66,
  slime: 56,
  panda: 58,
  redpanda: 58,
};

const INK = '#1E1B4B';

const Eyes: React.FC<{
  mood: FaceMood;
  y?: number;
  spread?: number;
  fill?: string;
  ring?: string;
  size?: number;
}> = ({ mood, y = 106, spread = 16, fill = INK, ring, size = 1 }) => {
  const xs = [100 - spread, 100 + spread];
  const stroke = ring || fill;

  if (mood === 'ecstatic') {
    return (
      <g>
        {xs.map(x => (
          <path
            key={x}
            d={`M ${x - 7},${y + 2} Q ${x},${y - 8} ${x + 7},${y + 2}`}
            fill="none"
            stroke={stroke}
            strokeWidth={3.4}
            strokeLinecap="round"
          />
        ))}
      </g>
    );
  }

  if (mood === 'weak') {
    return (
      <g>
        {xs.map(x => (
          <path
            key={x}
            d={`M ${x - 5},${y - 5} L ${x + 5},${y + 5} M ${x + 5},${y - 5} L ${x - 5},${y + 5}`}
            stroke={stroke}
            strokeWidth={3}
            strokeLinecap="round"
          />
        ))}
      </g>
    );
  }

  return (
    <g className="pet-blink">
      {xs.map(x => (
        <g key={x}>
          <ellipse
            cx={x}
            cy={y}
            rx={7.5 * size}
            ry={9.5 * size}
            fill={fill}
            stroke={ring}
            strokeWidth={ring ? 1.6 : 0}
          />
          <ellipse cx={x} cy={y + 3.6 * size} rx={4.6 * size} ry={3.4 * size} fill="#818CF8" opacity={0.45} />
          <circle cx={x - 2.6 * size} cy={y - 3.6 * size} r={3.2 * size} fill="#FFFFFF" />
          <circle cx={x + 2.8 * size} cy={y + 3 * size} r={1.5 * size} fill="#FFFFFF" />
        </g>
      ))}
    </g>
  );
};

type MouthType = 'smile' | 'cat' | 'bunny' | 'none';

const Mouth: React.FC<{ mood: FaceMood; type: MouthType; y: number; color?: string }> = ({
  mood,
  type,
  y,
  color = INK,
}) => {
  if (type === 'none') return null;
  const common = { fill: 'none', stroke: color, strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  if (mood === 'weak') {
    return <path d={`M 93,${y + 2} Q 96.5,${y - 1} 100,${y + 2} Q 103.5,${y + 5} 107,${y + 2}`} {...common} />;
  }
  if (mood === 'sad') {
    return <path d={`M 95,${y + 3} Q 100,${y - 1} 105,${y + 3}`} {...common} />;
  }
  if (type === 'cat') {
    return <path d={`M 92,${y} Q 96,${y + 5} 100,${y} Q 104,${y + 5} 108,${y}`} {...common} />;
  }
  if (type === 'bunny') {
    return (
      <g>
        <path d={`M 100,${y - 3} L 100,${y} Q 96,${y + 4} 93,${y + 1} M 100,${y} Q 104,${y + 4} 107,${y + 1}`} {...common} />
        <rect x={97} y={y + 1.5} width={6} height={5} rx={1.2} fill="#FFFFFF" stroke={color} strokeWidth={1.2} />
      </g>
    );
  }
  if (mood === 'ecstatic' || mood === 'happy') {
    return (
      <g>
        <path
          d={`M 93,${y - 1} Q 100,${y + 10} 107,${y - 1} Z`}
          fill="#9F1239"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <ellipse cx={100} cy={y + 4.5} rx={3.6} ry={2.2} fill="#FB7185" />
      </g>
    );
  }
  return <path d={`M 95,${y} Q 100,${y + 4} 105,${y}`} {...common} />;
};

const Face: React.FC<{
  mood: FaceMood;
  mouth?: MouthType;
  mouthY?: number;
  eyeY?: number;
  eyeSpread?: number;
  eyeFill?: string;
  eyeRing?: string;
  eyeSize?: number;
  blushY?: number;
  line?: string;
}> = ({
  mood,
  mouth = 'smile',
  mouthY = 120,
  eyeY = 106,
  eyeSpread = 16,
  eyeFill,
  eyeRing,
  eyeSize,
  blushY = 117,
  line = INK,
}) => (
  <g>
    {mood !== 'weak' && (
      <g>
        <ellipse cx={73} cy={blushY} rx={7} ry={4.5} fill="#FB7185" opacity={0.5} />
        <ellipse cx={127} cy={blushY} rx={7} ry={4.5} fill="#FB7185" opacity={0.5} />
      </g>
    )}
    {mood === 'sad' && (
      <path
        d={`M ${100 - eyeSpread - 7},${eyeY - 12} L ${100 - eyeSpread + 6},${eyeY - 16} M ${100 + eyeSpread + 7},${eyeY - 12} L ${100 + eyeSpread - 6},${eyeY - 16}`}
        stroke={line}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    )}
    <Eyes mood={mood} y={eyeY} spread={eyeSpread} fill={eyeFill} ring={eyeRing} size={eyeSize} />
    <Mouth mood={mood} type={mouth} y={mouthY} color={line} />
    {mood === 'weak' && (
      <path d="M 136,80 Q 130,92 136,96 Q 142,92 136,80 Z" fill="#60A5FA" stroke="#1D4ED8" strokeWidth={1.2} />
    )}
  </g>
);

const bodySize = (stage: PetStage) =>
  stage === 'baby' ? { rx: 30, ry: 24 } : stage === 'juvenile' ? { rx: 33, ry: 27 } : { rx: 36, ry: 30 };

const ChibiBody: React.FC<{
  p: SpeciesPalette;
  stage: PetStage;
  arm?: string;
  foot?: string;
  belly?: string | null;
}> = ({ p, stage, arm, foot, belly }) => {
  const { rx, ry } = bodySize(stage);
  const cy = 150;
  const armL = 100 - rx + 4;
  const armR = 100 + rx - 4;
  return (
    <g>
      <ellipse cx={100} cy={cy} rx={rx} ry={ry} fill={p.fill} stroke={p.line} strokeWidth={3} />
      {belly !== null && <ellipse cx={100} cy={cy + 4} rx={rx * 0.6} ry={ry * 0.68} fill={belly || p.belly} />}
      <ellipse cx={86} cy={172} rx={10} ry={6.5} fill={foot || p.secondary} stroke={p.line} strokeWidth={2.5} />
      <ellipse cx={114} cy={172} rx={10} ry={6.5} fill={foot || p.secondary} stroke={p.line} strokeWidth={2.5} />
      <ellipse
        cx={armL}
        cy={cy - 4}
        rx={7}
        ry={10}
        transform={`rotate(25 ${armL} ${cy - 4})`}
        fill={arm || p.fill}
        stroke={p.line}
        strokeWidth={2.5}
      />
      <ellipse
        cx={armR}
        cy={cy - 4}
        rx={7}
        ry={10}
        transform={`rotate(-25 ${armR} ${cy - 4})`}
        fill={arm || p.fill}
        stroke={p.line}
        strokeWidth={2.5}
      />
    </g>
  );
};

const Head: React.FC<{ p: SpeciesPalette; rx?: number; ry?: number; cy?: number }> = ({
  p,
  rx = 42,
  ry = 42,
  cy = 100,
}) => (
  <g>
    <ellipse cx={100} cy={cy} rx={rx} ry={ry} fill={p.fill} stroke={p.line} strokeWidth={3} />
    <ellipse cx={80} cy={cy - 24} rx={11} ry={6} transform={`rotate(-25 80 ${cy - 24})`} fill="#FFFFFF" opacity={0.35} />
  </g>
);

const Leaf: React.FC<{ x: number; y: number; angle: number }> = ({ x, y, angle }) => (
  <path
    d={`M ${x},${y} Q ${x + 6},${y - 10} ${x + 14},${y - 8} Q ${x + 10},${y + 2} ${x},${y} Z`}
    transform={`rotate(${angle} ${x} ${y})`}
    fill="#4ADE80"
    stroke="#15803D"
    strokeWidth={1.5}
    strokeLinejoin="round"
  />
);

export const SpeciesArt: React.FC<SpeciesArtProps> = ({ archetype, stage, palette: p, mood, hasWings }) => {
  const grown = stage === 'adult' || stage === 'ultimate';
  const ultimate = stage === 'ultimate';
  const sw = { stroke: p.line, strokeWidth: 3, strokeLinejoin: 'round' as const };

  switch (archetype) {
    case 'dragon':
      return (
        <g>
          <g className="pet-wag">
            <path d="M 122,156 Q 156,166 160,136 Q 150,146 126,142 Z" fill={p.fill} {...sw} />
            <path d="M 160,138 Q 148,124 156,108 Q 160,120 168,116 Q 168,130 160,138 Z" fill="#FBBF24" {...sw} strokeWidth={2.5} />
          </g>
          {!hasWings && (
            <g>
              <path d="M 76,136 Q 52,118 50,140 Q 60,136 66,146 Z" fill={p.secondary} {...sw} strokeWidth={2.5} />
              <path d="M 124,136 Q 148,118 150,140 Q 140,136 134,146 Z" fill={p.secondary} {...sw} strokeWidth={2.5} />
            </g>
          )}
          <ChibiBody p={p} stage={stage} />
          <path
            d="M 86,150 Q 100,154 114,150 M 88,160 Q 100,164 112,160"
            fill="none"
            stroke={p.secondary}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.4}
          />
          <path d="M 86,66 L 92,48 L 99,62 L 104,44 L 111,62 L 118,50 L 118,68 Z" fill={p.secondary} {...sw} strokeWidth={2.5} />
          {grown ? (
            <g>
              <path d="M 70,74 Q 52,46 60,30 Q 74,52 84,66 Z" fill="#FEF3C7" {...sw} strokeWidth={2.5} />
              <path d="M 130,74 Q 148,46 140,30 Q 126,52 116,66 Z" fill="#FEF3C7" {...sw} strokeWidth={2.5} />
            </g>
          ) : (
            <g>
              <path d="M 72,74 Q 62,54 70,46 Q 78,58 84,68 Z" fill="#FEF3C7" {...sw} strokeWidth={2.5} />
              <path d="M 128,74 Q 138,54 130,46 Q 122,58 116,68 Z" fill="#FEF3C7" {...sw} strokeWidth={2.5} />
            </g>
          )}
          <Head p={p} rx={44} ry={40} />
          <ellipse cx={100} cy={122} rx={17} ry={10} fill={p.belly} />
          <circle cx={95} cy={117} r={1.6} fill={p.line} />
          <circle cx={105} cy={117} r={1.6} fill={p.line} />
          <Face mood={mood} mouthY={123} eyeY={102} blushY={115} line={p.line} />
        </g>
      );

    case 'fox': {
      const tails = ultimate ? [-30, 0, 30] : grown ? [-18, 18] : [0];
      return (
        <g>
          <g className="pet-wag">
            {tails.map(a => (
              <g key={a} transform={`rotate(${a} 124 152)`}>
                <path d="M 122,158 C 150,164 168,146 170,124 L 156,118 C 150,134 140,140 124,142 Z" fill={p.fill} {...sw} />
                <path d="M 170,124 C 172,110 168,100 160,92 C 155,102 155,112 156,118 Z" fill="#FFFFFF" {...sw} />
              </g>
            ))}
          </g>
          <ChibiBody p={p} stage={stage} belly="#FFFFFF" />
          <path d="M 66,82 L 60,36 L 96,64 Z" fill={p.fill} {...sw} />
          <path d="M 70,74 L 66,48 L 88,64 Z" fill="#FBCFE8" />
          <path d="M 134,82 L 140,36 L 104,64 Z" fill={p.fill} {...sw} />
          <path d="M 130,74 L 134,48 L 112,64 Z" fill="#FBCFE8" />
          <path
            d="M 100,58 C 128,58 142,78 142,98 L 152,112 L 140,114 C 134,132 118,140 100,140 C 82,140 66,132 60,114 L 48,112 L 58,98 C 58,78 72,58 100,58 Z"
            fill={p.fill}
            {...sw}
          />
          <ellipse cx={80} cy={76} rx={11} ry={6} transform="rotate(-25 80 76)" fill="#FFFFFF" opacity={0.35} />
          <path d="M 100,108 C 116,108 128,118 124,128 C 116,138 84,138 76,128 C 72,118 84,108 100,108 Z" fill="#FFFFFF" opacity={0.92} />
          <path d="M 96,115 Q 100,113 104,115 Q 100,121 96,115 Z" fill={p.line} />
          <Face mood={mood} mouth="cat" mouthY={121} eyeY={102} blushY={116} line={p.line} />
        </g>
      );
    }

    case 'deer':
      return (
        <g>
          <circle cx={128} cy={140} r={8} fill="#FFFFFF" {...sw} strokeWidth={2.5} />
          <ChibiBody p={p} stage={stage} belly="#FDE7C8" />
          <circle cx={88} cy={140} r={2.6} fill="#FFFFFF" opacity={0.9} />
          <circle cx={114} cy={144} r={2.2} fill="#FFFFFF" opacity={0.9} />
          <g fill="none" stroke="#92400E" strokeWidth={4.5} strokeLinecap="round">
            <path d="M 84,66 Q 78,48 66,38 M 77,52 Q 68,52 60,58" />
            <path d="M 116,66 Q 122,48 134,38 M 123,52 Q 132,52 140,58" />
            {grown && <path d="M 70,42 Q 70,30 76,24 M 130,42 Q 130,30 124,24" />}
          </g>
          <Leaf x={64} y={38} angle={-150} />
          <Leaf x={136} y={38} angle={-30} />
          {grown && <Leaf x={76} y={24} angle={-100} />}
          {grown && <Leaf x={124} y={24} angle={-80} />}
          <ellipse cx={56} cy={92} rx={16} ry={8} transform="rotate(-25 56 92)" fill={p.fill} {...sw} strokeWidth={2.5} />
          <ellipse cx={57} cy={92} rx={9} ry={4} transform="rotate(-25 57 92)" fill="#FBCFE8" />
          <ellipse cx={144} cy={92} rx={16} ry={8} transform="rotate(25 144 92)" fill={p.fill} {...sw} strokeWidth={2.5} />
          <ellipse cx={143} cy={92} rx={9} ry={4} transform="rotate(25 143 92)" fill="#FBCFE8" />
          <Head p={p} />
          <circle cx={92} cy={74} r={3} fill="#FFFFFF" opacity={0.9} />
          <circle cx={106} cy={70} r={2.4} fill="#FFFFFF" opacity={0.9} />
          <circle cx={113} cy={78} r={2} fill="#FFFFFF" opacity={0.9} />
          <ellipse cx={100} cy={122} rx={15} ry={10} fill="#FDE7C8" />
          <ellipse cx={100} cy={116} rx={4.5} ry={3.2} fill={p.line} />
          <Face mood={mood} mouthY={123} line={p.line} />
        </g>
      );

    case 'bird':
      return (
        <g>
          <path d="M 140,140 L 166,130 L 158,146 L 170,154 L 142,156 Z" fill={p.secondary} {...sw} />
          <path d="M 94,68 L 86,44 L 98,54 L 102,32 L 108,54 L 120,44 L 110,70 Z" fill={p.secondary} {...sw} />
          <circle cx={100} cy={116} r={50} fill={p.fill} {...sw} />
          <ellipse cx={80} cy={88} rx={12} ry={7} transform="rotate(-25 80 88)" fill="#FFFFFF" opacity={0.35} />
          <ellipse cx={100} cy={138} rx={30} ry={24} fill="#FFFBEB" opacity={0.9} />
          <g className={mood === 'ecstatic' ? 'pet-flap' : undefined}>
            <path d="M 54,112 Q 36,130 50,150 Q 62,140 64,124 Z" fill={p.secondary} {...sw} />
          </g>
          <g className={mood === 'ecstatic' ? 'pet-flap-r' : undefined}>
            <path d="M 146,112 Q 164,130 150,150 Q 138,140 136,124 Z" fill={p.secondary} {...sw} />
          </g>
          <ellipse cx={88} cy={168} rx={8} ry={5} fill="#FB923C" {...sw} strokeWidth={2} />
          <ellipse cx={112} cy={168} rx={8} ry={5} fill="#FB923C" {...sw} strokeWidth={2} />
          {grown && (
            <path d="M 76,92 L 92,96 M 124,92 L 108,96" stroke={p.line} strokeWidth={3} strokeLinecap="round" />
          )}
          <Face mood={mood} mouth="none" eyeY={106} blushY={120} line={p.line} />
          <path d="M 92,117 L 108,117 L 100,128 Z" fill="#FB923C" {...sw} strokeWidth={2.2} />
        </g>
      );

    case 'cat':
      return (
        <g>
          <g className="pet-wag">
            <path
              d="M 124,160 C 160,166 168,130 152,120 C 142,114 134,126 144,132"
              fill="none"
              stroke={p.line}
              strokeWidth={13}
              strokeLinecap="round"
            />
            <path
              d="M 124,160 C 160,166 168,130 152,120 C 142,114 134,126 144,132"
              fill="none"
              stroke={p.primary}
              strokeWidth={7.5}
              strokeLinecap="round"
            />
          </g>
          <ChibiBody p={p} stage={stage} />
          <path d="M 64,84 Q 56,44 70,42 Q 86,50 94,64 Z" fill={p.fill} {...sw} />
          <path d="M 69,76 Q 65,54 72,52 Q 82,58 87,66 Z" fill="#FBCFE8" />
          <path d="M 136,84 Q 144,44 130,42 Q 114,50 106,64 Z" fill={p.fill} {...sw} />
          <path d="M 131,76 Q 135,54 128,52 Q 118,58 113,66 Z" fill="#FBCFE8" />
          <Head p={p} rx={44} ry={40} />
          <path d="M 105,66 A 9 9 0 1 1 95,80 A 7 7 0 1 0 105,66 Z" fill="#FDE68A" />
          <g stroke={p.line} strokeWidth={1.6} strokeLinecap="round" opacity={0.7}>
            <path d="M 68,114 L 50,110 M 68,119 L 50,121" />
            <path d="M 132,114 L 150,110 M 132,119 L 150,121" />
          </g>
          <path d="M 97,113 Q 100,111 103,113 Q 100,117 97,113 Z" fill="#F472B6" />
          <Face mood={mood} mouth="cat" mouthY={118} eyeY={102} blushY={114} line={p.line} />
        </g>
      );

    case 'unicorn':
      return (
        <g>
          <g className="pet-wag" fill="none" strokeLinecap="round" strokeWidth={8}>
            <path d="M 124,150 Q 156,146 160,170" stroke="#F9A8D4" />
            <path d="M 126,156 Q 150,160 150,176" stroke="#C4B5FD" />
            <path d="M 122,144 Q 160,134 166,156" stroke="#7DD3FC" />
          </g>
          <ChibiBody p={p} stage={stage} belly="#FFFFFF" foot="#C4B5FD" />
          <path d="M 70,74 L 64,50 L 86,64 Z" fill={p.fill} {...sw} />
          <path d="M 130,74 L 136,50 L 114,64 Z" fill={p.fill} {...sw} />
          <Head p={p} />
          <path d={`M 92,64 L 100,${grown ? 18 : 28} L 108,64 Z`} fill="#FDE047" stroke="#CA8A04" strokeWidth={2.5} strokeLinejoin="round" />
          <path d="M 94,56 L 106,52 M 95,47 L 105,44 M 97,38 L 103,36" stroke="#CA8A04" strokeWidth={2} strokeLinecap="round" />
          <path d="M 66,82 Q 76,58 102,62 Q 90,68 88,82 Q 80,72 70,92 Z" fill="#F9A8D4" stroke={p.line} strokeWidth={2.5} strokeLinejoin="round" />
          <path d="M 102,62 Q 124,58 136,78 Q 120,70 110,78 Z" fill="#C4B5FD" stroke={p.line} strokeWidth={2.5} strokeLinejoin="round" />
          <ellipse cx={100} cy={123} rx={16} ry={10} fill="#FCE7F3" />
          <circle cx={95} cy={120} r={1.5} fill={p.line} />
          <circle cx={105} cy={120} r={1.5} fill={p.line} />
          <Face mood={mood} mouthY={125} line={p.line} />
        </g>
      );

    case 'robot': {
      const led = '#67E8F9';
      return (
        <g>
          <line x1={100} y1={60} x2={100} y2={grown ? 32 : 40} stroke={p.line} strokeWidth={3} />
          <circle cx={100} cy={grown ? 30 : 38} r={6} fill={p.glow} stroke={p.line} strokeWidth={2} className="animate-pulse" />
          <rect x={74} y={132} width={52} height={38} rx={14} fill={p.fill} {...sw} />
          <path d="M 100,158 C 92,152 92,145 97,145 Q 100,145 100,149 Q 100,145 103,145 C 108,145 108,152 100,158 Z" fill="#F472B6" />
          <rect x={60} y={138} width={14} height={22} rx={7} fill={p.secondary} {...sw} strokeWidth={2.5} />
          <rect x={126} y={138} width={14} height={22} rx={7} fill={p.secondary} {...sw} strokeWidth={2.5} />
          <rect x={80} y={166} width={16} height={10} rx={4} fill={p.secondary} {...sw} strokeWidth={2.5} />
          <rect x={104} y={166} width={16} height={10} rx={4} fill={p.secondary} {...sw} strokeWidth={2.5} />
          <rect x={50} y={90} width={12} height={22} rx={5} fill={p.secondary} {...sw} strokeWidth={2.5} />
          <rect x={138} y={90} width={12} height={22} rx={5} fill={p.secondary} {...sw} strokeWidth={2.5} />
          <rect x={58} y={58} width={84} height={80} rx={26} fill={p.fill} {...sw} />
          <ellipse cx={78} cy={70} rx={10} ry={5} transform="rotate(-20 78 70)" fill="#FFFFFF" opacity={0.35} />
          <rect x={68} y={78} width={64} height={46} rx={16} fill="#0F172A" stroke={p.secondary} strokeWidth={2} />
          {mood === 'ecstatic' ? (
            <path d="M 80,103 Q 87,92 94,103 M 106,103 Q 113,92 120,103" fill="none" stroke={led} strokeWidth={3.5} strokeLinecap="round" />
          ) : mood === 'weak' ? (
            <path d="M 82,94 L 92,104 M 92,94 L 82,104 M 108,94 L 118,104 M 118,94 L 108,104" stroke="#F87171" strokeWidth={3} strokeLinecap="round" />
          ) : (
            <g className="pet-blink">
              <rect x={81} y={91} width={10} height={15} rx={5} fill={led} />
              <rect x={109} y={91} width={10} height={15} rx={5} fill={led} />
            </g>
          )}
          {mood !== 'weak' && (
            <g>
              <ellipse cx={78} cy={113} rx={5} ry={3} fill="#F472B6" opacity={0.7} />
              <ellipse cx={122} cy={113} rx={5} ry={3} fill="#F472B6" opacity={0.7} />
            </g>
          )}
          <path
            d={mood === 'sad' || mood === 'weak' ? 'M 94,117 Q 100,112 106,117' : 'M 94,112 Q 100,119 106,112'}
            fill="none"
            stroke={mood === 'weak' ? '#F87171' : led}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </g>
      );
    }

    case 'bunny':
      return (
        <g>
          <circle cx={130} cy={160} r={10} fill="#FFFFFF" {...sw} strokeWidth={2.5} />
          <ChibiBody p={p} stage={stage} belly="#FFFFFF" />
          <g className="pet-ear">
            <ellipse cx={82} cy={44} rx={12} ry={grown ? 34 : 30} transform="rotate(-12 82 44)" fill={p.fill} {...sw} />
            <ellipse cx={82} cy={46} rx={6} ry={grown ? 25 : 22} transform="rotate(-12 82 46)" fill="#FDA4AF" opacity={0.75} />
          </g>
          <ellipse cx={124} cy={48} rx={12} ry={grown ? 32 : 28} transform="rotate(24 124 48)" fill={p.fill} {...sw} />
          <ellipse cx={124} cy={50} rx={6} ry={grown ? 23 : 20} transform="rotate(24 124 50)" fill="#FDA4AF" opacity={0.75} />
          <Head p={p} />
          <path d="M 97,114 Q 100,112 103,114 Q 100,118 97,114 Z" fill="#F472B6" />
          <Face mood={mood} mouth="bunny" mouthY={119} line={p.line} />
        </g>
      );

    case 'penguin':
      return (
        <g>
          <path d="M 54,112 Q 36,134 48,152 Q 58,140 62,124 Z" fill={p.secondary} {...sw} />
          <path d="M 146,112 Q 164,134 152,152 Q 142,140 138,124 Z" fill={p.secondary} {...sw} />
          <ellipse cx={100} cy={118} rx={48} ry={52} fill={p.fill} {...sw} />
          <path
            d="M 100,86 C 90,70 60,76 62,104 C 64,128 84,140 100,140 C 116,140 136,128 138,104 C 140,76 110,70 100,86 Z"
            fill="#FFFFFF"
          />
          <ellipse cx={100} cy={146} rx={32} ry={22} fill="#FFFFFF" />
          <ellipse cx={78} cy={80} rx={10} ry={5} transform="rotate(-25 78 80)" fill="#FFFFFF" opacity={0.3} />
          <path d="M 98,66 Q 94,54 104,52 Q 99,58 104,66" fill="none" stroke={p.line} strokeWidth={2.5} strokeLinecap="round" />
          <ellipse cx={86} cy={171} rx={10} ry={5.5} fill="#FB923C" {...sw} strokeWidth={2.2} />
          <ellipse cx={114} cy={171} rx={10} ry={5.5} fill="#FB923C" {...sw} strokeWidth={2.2} />
          <Face mood={mood} mouth="none" eyeY={104} blushY={118} line={p.line} />
          <path d="M 92,115 Q 100,109 108,115 Q 100,124 92,115 Z" fill="#FB923C" {...sw} strokeWidth={2} />
        </g>
      );

    case 'slime':
      return (
        <g className={mood === 'weak' ? undefined : 'pet-squish'}>
          <ellipse cx={100} cy={170} rx={52} ry={7} fill={p.secondary} opacity={0.35} />
          <path
            d="M 100,48 C 112,62 152,82 152,128 C 152,158 130,172 100,172 C 70,172 48,158 48,128 C 48,82 88,62 100,48 Z"
            fill={p.fill}
            opacity={0.94}
            {...sw}
          />
          <ellipse cx={70} cy={104} rx={7} ry={14} transform="rotate(20 70 104)" fill="#FFFFFF" opacity={0.6} />
          <circle cx={78} cy={84} r={3.2} fill="#FFFFFF" opacity={0.75} />
          <g fill="#FFFFFF" opacity={0.75}>
            <circle cx={128} cy={140} r={1.8} />
            <circle cx={74} cy={150} r={1.4} />
            <circle cx={118} cy={158} r={1.2} />
            <path d="M 132,100 L 134,105 L 139,107 L 134,109 L 132,114 L 130,109 L 125,107 L 130,105 Z" />
          </g>
          <Face mood={mood} eyeY={118} mouthY={133} blushY={130} line={p.line} />
        </g>
      );

    case 'panda': {
      const black = '#1F2937';
      return (
        <g>
          <circle cx={128} cy={158} r={7} fill={black} />
          <ChibiBody p={p} stage={stage} arm={black} foot={black} belly={null} />
          <circle cx={66} cy={66} r={13} fill={black} {...sw} />
          <circle cx={134} cy={66} r={13} fill={black} {...sw} />
          <Head p={p} />
          <path d="M 104,62 Q 112,44 128,46 Q 122,60 104,62 Z" fill="#4ADE80" stroke="#15803D" strokeWidth={1.8} strokeLinejoin="round" />
          <path d="M 106,60 Q 116,52 124,49" fill="none" stroke="#15803D" strokeWidth={1.2} />
          <ellipse cx={83} cy={105} rx={13} ry={11} transform="rotate(-30 83 105)" fill={black} />
          <ellipse cx={117} cy={105} rx={13} ry={11} transform="rotate(30 117 105)" fill={black} />
          <ellipse cx={100} cy={117} rx={5} ry={3.5} fill={black} />
          <Face
            mood={mood}
            mouthY={122}
            eyeY={105}
            eyeSpread={17}
            eyeFill="#0B0B12"
            eyeRing="#FFFFFF"
            eyeSize={0.75}
            blushY={121}
            line={black}
          />
        </g>
      );
    }

    case 'redpanda': {
      const dark = p.secondary;
      const tailPath = grown
        ? 'M 118,160 C 164,174 184,136 172,100 C 167,86 152,82 143,92 C 158,108 158,140 118,146 Z'
        : 'M 120,160 C 158,170 174,140 166,110 C 162,98 150,94 143,102 C 153,114 152,138 120,146 Z';
      const rings = grown ? [118, 132, 146, 160, 174] : [126, 142, 158];
      const maple =
        'M 0,-11 L 3,-5 L 9,-7 L 6,-1 L 11,1 L 5,4 L 6,10 L 0,6 L -6,10 L -5,4 L -11,1 L -6,-1 L -9,-7 L -3,-5 Z';
      return (
        <g>
          <defs>
            <clipPath id={`rp-tail-${grown ? 'g' : 'b'}`}>
              <path d={tailPath} />
            </clipPath>
          </defs>
          <g className="pet-wag">
            <path d={tailPath} fill={p.fill} {...sw} />
            <g clipPath={`url(#rp-tail-${grown ? 'g' : 'b'})`}>
              {rings.map(x => (
                <line
                  key={x}
                  x1={x - 18}
                  y1={176}
                  x2={x + 22}
                  y2={84}
                  stroke={ultimate ? p.glow : dark}
                  strokeWidth={7}
                  opacity={ultimate ? 0.9 : 0.75}
                />
              ))}
            </g>
            <path d={tailPath} fill="none" {...sw} />
            {ultimate && (
              <path
                d="M 166,96 Q 160,80 170,66 Q 172,78 180,80 Q 182,92 172,100 Z"
                fill="#FBBF24"
                stroke="#EA580C"
                strokeWidth={2}
                strokeLinejoin="round"
              />
            )}
          </g>
          <ChibiBody p={p} stage={stage} arm={dark} foot={dark} belly={dark} />
          <path d="M 58,82 Q 52,52 72,50 Q 90,54 90,66 Z" fill={p.fill} {...sw} />
          <path d="M 63,76 Q 60,58 72,57 Q 83,60 83,66 Z" fill="#FFFFFF" />
          <path d="M 142,82 Q 148,52 128,50 Q 110,54 110,66 Z" fill={p.fill} {...sw} />
          <path d="M 137,76 Q 140,58 128,57 Q 117,60 117,66 Z" fill="#FFFFFF" />
          <Head p={p} rx={44} ry={41} />
          {stage !== 'baby' && (
            <path d={maple} transform="translate(118 64) rotate(18) scale(1.1)" fill="#DC2626" stroke="#7F1D1D" strokeWidth={1.4} strokeLinejoin="round" />
          )}
          <ellipse cx={84} cy={88} rx={6} ry={4} fill="#FFFFFF" />
          <ellipse cx={116} cy={88} rx={6} ry={4} fill="#FFFFFF" />
          <ellipse cx={69} cy={114} rx={13} ry={11} fill="#FFFFFF" />
          <ellipse cx={131} cy={114} rx={13} ry={11} fill="#FFFFFF" />
          <ellipse cx={100} cy={121} rx={18} ry={12} fill="#FFFFFF" />
          <path d="M 82,112 Q 80,124 86,132 M 118,112 Q 120,124 114,132" fill="none" stroke={dark} strokeWidth={3} strokeLinecap="round" opacity={0.55} />
          <ellipse cx={100} cy={115} rx={5} ry={3.4} fill={p.line} />
          <Face mood={mood} mouth="cat" mouthY={120} eyeY={102} blushY={118} line={p.line} />
        </g>
      );
    }

    default:
      return null;
  }
};
