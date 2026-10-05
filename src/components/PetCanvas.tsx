import React from 'react';
import { Pet } from '../types';
import { getPetArchetype, PetArchetype } from '../data/petSpecies';
import { FaceMood, HEAD_TOP, SpeciesArt, SpeciesPalette } from './PetSpeciesArt';

interface PetCanvasProps {
  pet: Pet;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero' | 'fullscreen';
  interactive?: boolean;
  onClick?: () => void;
  showStatusAura?: boolean;
}

const ELEMENT_COLORS: Record<string, [string, string, string]> = {
  flame: ['#FB923C', '#EA580C', '#FDE68A'],
  frost: ['#7DD3FC', '#0EA5E9', '#E0F2FE'],
  nature: ['#6EE7B7', '#059669', '#BBF7D0'],
  thunder: ['#FDE047', '#EAB308', '#FEF9C3'],
  void: ['#A78BFA', '#6D28D9', '#EDE9FE'],
  radiant: ['#FBCFE8', '#F472B6', '#FFF1F2'],
  cyber: ['#67E8F9', '#0891B2', '#CFFAFE'],
};

const mixColor = (hex: string, target: string, amount: number) => {
  const re = /^#([0-9a-f]{6})$/i;
  if (!re.test(hex) || !re.test(target)) return hex;
  const a = parseInt(hex.slice(1), 16);
  const b = parseInt(target.slice(1), 16);
  const ch = (shift: number) => {
    const x = (a >> shift) & 255;
    const y = (b >> shift) & 255;
    return Math.round(x + (y - x) * amount);
  };
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
};

const NATIVE_HEADGEAR: PetArchetype[] = ['deer', 'unicorn', 'bunny', 'robot'];

export const PetCanvas: React.FC<PetCanvasProps> = ({
  pet,
  size = 'lg',
  interactive = true,
  onClick,
  showStatusAura = true,
}) => {
  const stage = pet?.stage || 'baby';
  const mood = pet?.mood || 'happy';
  const health = pet?.health ?? 100;
  const petId = (pet?.id || 'default_pet').replace(/[^a-zA-Z0-9_-]/g, '_');

  const genes = pet?.genes || ({} as any);
  const customization = pet?.customization || {
    hat: 'none',
    accessory: 'none',
    backgroundTheme: 'forest',
  };

  const sizeMap = {
    sm: 'w-24 h-24',
    md: 'w-40 h-40',
    lg: 'w-64 h-64 sm:w-72 sm:h-72',
    xl: 'w-80 h-80 sm:w-96 sm:h-96',
    hero: 'w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96',
    fullscreen: 'w-full max-w-[460px] aspect-square',
  };

  const isEgg = stage === 'egg';
  const isUltimate = stage === 'ultimate';
  const isWeak = mood === 'weak' || mood === 'danger_escape' || health < 35;
  const isEcstatic = mood === 'ecstatic' || mood === 'happy';

  const faceMood: FaceMood = isWeak
    ? 'weak'
    : mood === 'ecstatic'
    ? 'ecstatic'
    : mood === 'happy'
    ? 'happy'
    : mood === 'hungry'
    ? 'sad'
    : 'normal';

  const element = pet?.element || 'flame';
  const [defPrimary, defSecondary, defGlow] = ELEMENT_COLORS[element] || ELEMENT_COLORS.flame;
  const primary = genes.primaryColor || (genes as any).colorShift || defPrimary;
  const secondary = genes.secondaryColor || defSecondary;
  const glow = genes.glowColor || defGlow;

  const archetype = getPetArchetype(pet);

  const bodyTop = isWeak ? '#D1D5DB' : mixColor(primary, '#FFFFFF', 0.35);
  const bodyBottom = isWeak ? '#9CA3AF' : primary;
  const palette: SpeciesPalette = {
    fill: `url(#grad_body_${petId})`,
    primary: isWeak ? '#9CA3AF' : primary,
    secondary: isWeak ? '#6B7280' : secondary,
    glow,
    line: isWeak ? '#374151' : mixColor(secondary, '#1E1B4B', 0.6),
    belly: isWeak ? '#E5E7EB' : mixColor(primary, '#FFFBEB', 0.75),
  };

  let baseScale = 1.0;
  if (stage === 'egg') baseScale = 0.88;
  else if (stage === 'baby') baseScale = 0.94;
  else if (stage === 'juvenile') baseScale = 1.04;
  else if (stage === 'adult') baseScale = 1.12;
  else if (stage === 'ultimate') baseScale = 1.2;

  const currentLevel = Math.max(1, pet?.level || 1);
  const levelGrowth = Math.min(0.12, (currentLevel / 50) * 0.12);
  const petScale = +(baseScale + (stage === 'egg' ? 0 : levelGrowth)).toFixed(3);

  const wingsType = genes?.wings || (stage === 'adult' || stage === 'ultimate' ? 'dragon' : 'none');
  const hornsType = genes?.horns || 'none';
  const hatType = customization?.hat || (pet as any)?.accessory || 'none';
  const accessoryType: string = customization?.accessory || (pet as any)?.accessory || 'none';

  const showWings = !isEgg && stage !== 'baby' && wingsType !== 'none';
  const showGeneHorns = !isEgg && !NATIVE_HEADGEAR.includes(archetype);
  const headTop = isEgg ? 35 : HEAD_TOP[archetype];
  const hatShift = isEgg ? -30 : headTop - 70;
  const wingColor = isWeak ? '#9CA3AF' : mixColor(primary, '#FFFFFF', 0.2);

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center select-none overflow-visible ${sizeMap[size] || sizeMap.lg} ${
        interactive ? 'cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95' : ''
      }`}
    >
      {showStatusAura && (
        <div
          className={`absolute inset-0 rounded-full blur-3xl opacity-35 transition-all duration-700 pointer-events-none ${
            isUltimate ? 'animate-pulse scale-125' : isWeak ? 'opacity-15 scale-75' : 'scale-100'
          }`}
          style={{
            background: isWeak
              ? 'radial-gradient(circle, #6B7280 0%, transparent 70%)'
              : isUltimate
              ? `radial-gradient(circle, ${glow} 0%, ${primary} 50%, transparent 80%)`
              : `radial-gradient(circle, ${primary} 0%, transparent 70%)`,
          }}
        />
      )}

      <svg
        viewBox="-40 -40 280 280"
        className={`w-full h-full overflow-visible filter drop-shadow-2xl transition-transform duration-500 ${
          isWeak ? 'opacity-85 translate-y-2' : isEcstatic ? 'animate-float' : ''
        }`}
      >
        <defs>
          <linearGradient id={`grad_body_${petId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={bodyTop} />
            <stop offset="100%" stopColor={bodyBottom} />
          </linearGradient>
          <linearGradient id={`grad_egg_${petId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={mixColor(primary, '#FFFFFF', 0.7)} />
            <stop offset="100%" stopColor={mixColor(primary, '#FFFFFF', 0.25)} />
          </linearGradient>
        </defs>

        {isUltimate && (
          <g className="animate-spin" style={{ transformOrigin: '100px 100px', animationDuration: '14s' }}>
            <circle cx="100" cy="100" r="86" fill="none" stroke={glow} strokeWidth="2.5" strokeDasharray="10 6 3 6" opacity="0.8" />
            <circle cx="100" cy="14" r="5" fill={glow} />
            <circle cx="186" cy="100" r="5" fill={primary} />
            <circle cx="100" cy="186" r="5" fill={glow} />
            <circle cx="14" cy="100" r="5" fill={primary} />
          </g>
        )}

        <ellipse cx="100" cy="178" rx="58" ry="11" fill="rgba(0,0,0,0.3)" />
        <ellipse
          cx="100"
          cy="176"
          rx="50"
          ry="8"
          fill="none"
          stroke={glow}
          strokeWidth="1.5"
          opacity={isUltimate ? '0.7' : '0.3'}
          strokeDasharray="4 4"
        />

        <g transform={`translate(100 100) scale(${petScale}) translate(-100 -100)`}>
          {showWings && (
            <g transform="translate(0 22)" className={isEcstatic ? 'animate-pulse' : ''}>
              <path
                d={
                  wingsType === 'mecha'
                    ? 'M 60,90 L 5,60 L 25,115 L 60,105 Z'
                    : wingsType === 'dragon'
                    ? 'M 60,95 Q -5,55 15,125 Q 45,115 65,105 Z'
                    : 'M 65,95 C 10,55 0,115 58,115 Z'
                }
                fill={wingColor}
                opacity="0.92"
                stroke={palette.line}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d={
                  wingsType === 'mecha'
                    ? 'M 140,90 L 195,60 L 175,115 L 140,105 Z'
                    : wingsType === 'dragon'
                    ? 'M 140,95 Q 205,55 185,125 Q 155,115 135,105 Z'
                    : 'M 135,95 C 190,55 200,115 142,115 Z'
                }
                fill={wingColor}
                opacity="0.92"
                stroke={palette.line}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
            </g>
          )}

          {accessoryType === 'cape' && !isEgg && (
            <path d="M 72,132 C 54,180 146,180 128,132 C 116,142 84,142 72,132 Z" fill="#9333EA" opacity="0.92" stroke="#581C87" strokeWidth="2.5" />
          )}

          {isEgg ? (
            <g className="pet-squish">
              <path
                d="M 100,38 C 140,38 156,120 150,140 C 144,164 124,174 100,174 C 76,174 56,164 50,140 C 44,120 60,38 100,38 Z"
                fill={`url(#grad_egg_${petId})`}
                stroke={palette.line}
                strokeWidth="3"
              />
              <path d="M 52,118 L 64,108 L 76,120 L 88,108 L 100,120 L 112,108 L 124,120 L 136,108 L 148,118" fill="none" stroke={primary} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" opacity="0.8" />
              <circle cx="82" cy="74" r="7" fill={glow} opacity="0.9" />
              <circle cx="118" cy="66" r="5" fill={secondary} opacity="0.5" />
              <circle cx="124" cy="92" r="8" fill={glow} opacity="0.8" />
              <circle cx="72" cy="148" r="6" fill={secondary} opacity="0.4" />
              <circle cx="128" cy="150" r="5" fill={glow} opacity="0.9" />
              <ellipse cx="80" cy="60" rx="9" ry="5" transform="rotate(-30 80 60)" fill="#FFFFFF" opacity="0.55" />
              <path d="M 84,138 Q 90,132 96,138 M 104,138 Q 110,132 116,138" fill="none" stroke={palette.line} strokeWidth="2.6" strokeLinecap="round" />
              <ellipse cx="80" cy="146" rx="6" ry="3.5" fill="#FB7185" opacity="0.5" />
              <ellipse cx="120" cy="146" rx="6" ry="3.5" fill="#FB7185" opacity="0.5" />
              {(pet?.level || 1) >= 2 && (
                <path
                  d="M 100,48 L 92,62 L 104,74 L 94,88"
                  fill="none"
                  stroke={palette.line}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-pulse"
                />
              )}
            </g>
          ) : (
            <g className={isWeak ? undefined : 'pet-breathe'}>
              <SpeciesArt archetype={archetype} stage={stage} palette={palette} mood={faceMood} hasWings={showWings} />
            </g>
          )}

          {showGeneHorns && (
            <g transform="translate(0 -10)">
              {hornsType === 'crystal' && (
                <g>
                  <polygon points="85,75 80,40 92,68" fill="#7DD3FC" stroke={palette.line} strokeWidth="2" strokeLinejoin="round" />
                  <polygon points="115,75 120,40 108,68" fill="#7DD3FC" stroke={palette.line} strokeWidth="2" strokeLinejoin="round" />
                </g>
              )}
              {hornsType === 'dragon' && archetype !== 'dragon' && (
                <g>
                  <path d="M 80,75 C 65,45 55,35 45,40 C 62,55 75,70 82,80 Z" fill="#FEF3C7" stroke={palette.line} strokeWidth="2" />
                  <path d="M 120,75 C 135,45 145,35 155,40 C 138,55 125,70 118,80 Z" fill="#FEF3C7" stroke={palette.line} strokeWidth="2" />
                </g>
              )}
              {hornsType === 'cyber_antennae' && (
                <g>
                  <line x1="88" y1="75" x2="72" y2="44" stroke={palette.line} strokeWidth="2.5" />
                  <circle cx="72" cy="44" r="4.5" fill="#22D3EE" />
                  <line x1="112" y1="75" x2="128" y2="44" stroke={palette.line} strokeWidth="2.5" />
                  <circle cx="128" cy="44" r="4.5" fill="#22D3EE" />
                </g>
              )}
            </g>
          )}

          <g transform={`translate(0 ${hatShift})`}>
            {hatType === 'wizard_hat' && (
              <g>
                <ellipse cx="100" cy="74" rx="35" ry="8" fill="#4C1D95" stroke="#A78BFA" strokeWidth="1.5" />
                <polygon points="100,15 78,72 122,72" fill="#5B21B6" stroke="#C4B5FD" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="100" cy="15" r="4.5" fill="#FBBF24" />
              </g>
            )}
            {hatType === 'crown' && (
              <g>
                <polygon points="74,74 74,48 85,60 100,44 115,60 126,48 126,74" fill="#FBBF24" stroke="#D97706" strokeWidth="2" strokeLinejoin="round" />
                <circle cx="100" cy="44" r="3" fill="#EF4444" />
                <circle cx="74" cy="48" r="2.5" fill="#3B82F6" />
                <circle cx="126" cy="48" r="2.5" fill="#10B981" />
              </g>
            )}
            {hatType === 'graduation_cap' && (
              <g>
                <polygon points="100,48 65,63 100,73 135,63" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
                <rect x="85" y="68" width="30" height="12" fill="#0F172A" rx="2" />
                <line x1="100" y1="60" x2="132" y2="74" stroke="#FBBF24" strokeWidth="2" />
                <circle cx="132" cy="74" r="3" fill="#F59E0B" />
              </g>
            )}
          </g>
          {hatType === 'headphones' && !isEgg && (
            <g>
              <path d="M 58,104 C 58,46 142,46 142,104" fill="none" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
              <rect x="50" y="94" width="14" height="22" rx="6" fill="#DC2626" stroke="#7F1D1D" strokeWidth="1.5" />
              <rect x="136" y="94" width="14" height="22" rx="6" fill="#DC2626" stroke="#7F1D1D" strokeWidth="1.5" />
            </g>
          )}
          {hatType === 'sunglasses' && !isEgg && (
            <g>
              <rect x="72" y="98" width="24" height="14" rx="5" fill="#0F172A" stroke="#475569" strokeWidth="1.5" />
              <rect x="104" y="98" width="24" height="14" rx="5" fill="#0F172A" stroke="#475569" strokeWidth="1.5" />
              <line x1="96" y1="104" x2="104" y2="104" stroke="#0F172A" strokeWidth="2.5" />
              <path d="M 76,101 L 82,101" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            </g>
          )}

          {(accessoryType === 'halo' || hornsType === 'angel_halo') && (
            <ellipse cx="100" cy={headTop - 14} rx="30" ry="8" fill="none" stroke="#FDE047" strokeWidth="3.5" />
          )}
          {accessoryType === 'scarf' && !isEgg && (
            <g>
              <path d="M 70,134 Q 100,146 130,134 Q 134,142 126,148 Q 100,156 74,148 Q 66,142 70,134 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
              <path d="M 114,146 L 120,166 L 130,162 L 124,144 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="2" strokeLinejoin="round" />
            </g>
          )}
          {accessoryType === 'medal' && !isEgg && (
            <g>
              <polygon points="95,146 100,138 105,146" fill="#3B82F6" />
              <circle cx="100" cy="152" r="7" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
              <text x="97.5" y="155" fontSize="7" fontWeight="bold" fill="#78350F">★</text>
            </g>
          )}
          {accessoryType === 'star_badge' && !isEgg && (
            <path
              d="M 124,140 L 127,147 L 134,147 L 128.5,151.5 L 131,159 L 124,154.5 L 117,159 L 119.5,151.5 L 114,147 L 121,147 Z"
              fill="#FDE047"
              stroke="#CA8A04"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          )}
          {accessoryType === 'magic_orb' && !isEgg && (
            <g className="animate-bounce">
              <circle cx="152" cy="128" r="9" fill="#818CF8" opacity="0.85" stroke="#C7D2FE" strokeWidth="1.5" />
              <circle cx="149" cy="125" r="3" fill="#FFFFFF" />
            </g>
          )}
        </g>

        {mood === 'ecstatic' && !isWeak && (
          <g fill={glow} className="animate-pulse">
            <path d="M 30,60 L 33,68 L 41,71 L 33,74 L 30,82 L 27,74 L 19,71 L 27,68 Z" />
            <path d="M 172,48 L 174,54 L 180,56 L 174,58 L 172,64 L 170,58 L 164,56 L 170,54 Z" />
            <path d="M 176,128 L 178,133 L 183,135 L 178,137 L 176,142 L 174,137 L 169,135 L 174,133 Z" />
          </g>
        )}
      </svg>

      {mood === 'danger_escape' && (
        <div className="absolute top-1 right-1 bg-red-600/90 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-lg animate-bounce border border-red-400">
          ⚠️ 瀕臨逃跑！
        </div>
      )}
      {mood === 'weak' && (
        <div className="absolute top-1 right-1 bg-amber-600/90 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow border border-amber-400">
          💤 虛弱狀態
        </div>
      )}
    </div>
  );
};
