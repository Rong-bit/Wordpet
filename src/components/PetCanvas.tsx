import React from 'react';
import { Pet } from '../types';

interface PetCanvasProps {
  pet: Pet;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero' | 'fullscreen';
  interactive?: boolean;
  onClick?: () => void;
  showStatusAura?: boolean;
}

export const PetCanvas: React.FC<PetCanvasProps> = ({
  pet,
  size = 'lg',
  interactive = true,
  onClick,
  showStatusAura = true,
}) => {
  const { stage, genes, customization, mood, health } = pet;

  // Dimension scaling with generous breathing room
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

  // Base colors
  const primary = genes.primaryColor || '#F97316';
  const secondary = genes.secondaryColor || '#EF4444';
  const glow = genes.glowColor || '#FBBF24';

  // Stage internal scale inside SVG
  let petScale = 1.0;
  if (stage === 'egg') petScale = 0.88;
  else if (stage === 'baby') petScale = 0.92;
  else if (stage === 'juvenile') petScale = 1.05;
  else if (stage === 'adult') petScale = 1.15;
  else if (stage === 'ultimate') petScale = 1.25;

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center select-none overflow-visible ${sizeMap[size]} ${
        interactive ? 'cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95' : ''
      }`}
    >
      {/* Background glow or particle aura */}
      {showStatusAura && (
        <div
          className={`absolute inset-0 rounded-full blur-3xl opacity-35 transition-all duration-700 pointer-events-none ${
            isUltimate
              ? 'animate-pulse scale-125'
              : isWeak
              ? 'opacity-15 scale-75'
              : 'scale-100'
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

      {/* SVG Pet Container with expanded -40 -40 280 280 viewBox so wings, halos & horns never get cut off */}
      <svg
        viewBox="-40 -40 280 280"
        className={`w-full h-full overflow-visible filter drop-shadow-2xl transition-transform duration-500 ${
          isWeak ? 'opacity-85 translate-y-2' : isEcstatic ? 'animate-float' : ''
        }`}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id={`grad_body_${pet.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isWeak ? '#9CA3AF' : primary} />
            <stop offset="100%" stopColor={isWeak ? '#4B5563' : secondary} />
          </linearGradient>

          <radialGradient id={`grad_glow_${pet.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={glow} stopOpacity="0.8" />
            <stop offset="100%" stopColor={primary} stopOpacity="0" />
          </radialGradient>

          {/* Runic / Nebula Pattern */}
          <pattern id="rune_pattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1.5" fill="rgba(255,255,255,0.4)" />
            <path d="M 5,10 L 15,10 M 10,5 L 10,15" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* --- ULTIMATE DIVINE HALO / ENERGY ORBITS (Wide Radius) --- */}
        {isUltimate && (
          <g className="animate-spin" style={{ transformOrigin: '100px 100px', animationDuration: '14s' }}>
            <circle
              cx="100"
              cy="100"
              r="86"
              fill="none"
              stroke={glow}
              strokeWidth="2.5"
              strokeDasharray="10 6 3 6"
              opacity="0.8"
            />
            <circle cx="100" cy="14" r="5" fill={glow} />
            <circle cx="186" cy="100" r="5" fill={primary} />
            <circle cx="100" cy="186" r="5" fill={glow} />
            <circle cx="14" cy="100" r="5" fill={primary} />
          </g>
        )}

        {/* Floating Sanctuary Pedestal Shadow below pet */}
        <ellipse cx="100" cy="170" rx="65" ry="14" fill="rgba(0,0,0,0.35)" />
        <ellipse
          cx="100"
          cy="168"
          rx="55"
          ry="10"
          fill="none"
          stroke={glow}
          strokeWidth="1.5"
          opacity={isUltimate ? '0.7' : '0.3'}
          strokeDasharray="4 4"
        />

        {/* Main Pet Body Scale Group */}
        <g transform={`translate(100 100) scale(${petScale}) translate(-100 -100)`}>
          {/* --- WINGS LAYER (Adult & Ultimate) --- */}
          {(stage === 'juvenile' || stage === 'adult' || stage === 'ultimate') && (
            <g className={isEcstatic ? 'animate-pulse' : ''}>
              {/* Left Wing */}
              <path
                d={
                  genes.wings === 'mecha'
                    ? 'M 60,90 L 5,60 L 25,115 L 60,105 Z'
                    : genes.wings === 'dragon'
                    ? 'M 60,95 Q -5,55 15,125 Q 45,115 65,105 Z'
                    : 'M 65,95 C 10,55 0,115 58,115 Z'
                }
                fill={isWeak ? '#6B7280' : primary}
                opacity="0.9"
                stroke={glow}
                strokeWidth="1.5"
              />
              {/* Right Wing */}
              <path
                d={
                  genes.wings === 'mecha'
                    ? 'M 140,90 L 195,60 L 175,115 L 140,105 Z'
                    : genes.wings === 'dragon'
                    ? 'M 140,95 Q 205,55 185,125 Q 155,115 135,105 Z'
                    : 'M 135,95 C 190,55 200,115 142,115 Z'
                }
                fill={isWeak ? '#6B7280' : primary}
                opacity="0.9"
                stroke={glow}
                strokeWidth="1.5"
              />
            </g>
          )}

          {/* --- CAPE ACCESSORY --- */}
          {customization.accessory === 'cape' && !isEgg && (
            <path
              d="M 68,110 C 50,165 150,165 132,110 C 115,125 85,125 68,110 Z"
              fill="#9333EA"
              opacity="0.9"
            />
          )}

          {/* --- BODY RENDERING (Egg vs Creature) --- */}
          {isEgg ? (
            /* EGG STAGE */
            <g>
              {/* Egg Shell */}
              <path
                d="M 100,35 C 145,35 155,145 100,155 C 45,145 55,35 100,35 Z"
                fill={`url(#grad_body_${pet.id})`}
                stroke={glow}
                strokeWidth="3"
              />

              {/* Egg Patterns */}
              <path
                d="M 70,85 Q 100,70 130,85 Q 100,100 70,85 Z"
                fill={glow}
                opacity="0.6"
              />
              <path
                d="M 75,115 Q 100,105 125,115 Q 100,125 75,115 Z"
                fill={glow}
                opacity="0.5"
              />

              {/* Hatch Crack Lines depending on Level / Progress */}
              {pet.level >= 2 && (
                <path
                  d="M 100,60 L 92,75 L 105,90 L 95,105 L 108,120"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              )}
            </g>
          ) : (
            /* CREATURE BODY */
            <g>
              {/* Tail */}
              <path
                d="M 60,135 Q 25,150 35,172 Q 55,160 70,145 Z"
                fill={`url(#grad_body_${pet.id})`}
                stroke={glow}
                strokeWidth="1.5"
              />

              {/* Main Body */}
              <ellipse
                cx="100"
                cy="115"
                rx={stage === 'baby' ? 36 : stage === 'juvenile' ? 42 : 46}
                ry={stage === 'baby' ? 38 : stage === 'juvenile' ? 44 : 48}
                fill={`url(#grad_body_${pet.id})`}
                stroke={glow}
                strokeWidth="2.5"
              />

              {/* Belly patch */}
              <ellipse
                cx="100"
                cy="125"
                rx="26"
                ry="28"
                fill="#FEF3C7"
                opacity={isWeak ? '0.4' : '0.85'}
              />

              {/* Horns or Antlers */}
              {genes.horns === 'crystal' && (
                <g>
                  <polygon points="85,75 80,40 92,68" fill="#38BDF8" stroke="#E0F2FE" strokeWidth="1" />
                  <polygon points="115,75 120,40 108,68" fill="#38BDF8" stroke="#E0F2FE" strokeWidth="1" />
                </g>
              )}
              {genes.horns === 'dragon' && (
                <g>
                  <path d="M 80,75 C 65,45 55,35 45,40 C 62,55 75,70 82,80 Z" fill={secondary} />
                  <path d="M 120,75 C 135,45 145,35 155,40 C 138,55 125,70 118,80 Z" fill={secondary} />
                </g>
              )}
              {genes.horns === 'angel_halo' && (
                <ellipse cx="100" cy="52" rx="34" ry="9" fill="none" stroke="#FDE047" strokeWidth="3" />
              )}
              {genes.horns === 'cyber_antennae' && (
                <g>
                  <line x1="88" y1="75" x2="72" y2="44" stroke="#06B6D4" strokeWidth="2.5" />
                  <circle cx="72" cy="44" r="4.5" fill="#22D3EE" />
                  <line x1="112" y1="75" x2="128" y2="44" stroke="#06B6D4" strokeWidth="2.5" />
                  <circle cx="128" cy="44" r="4.5" fill="#22D3EE" />
                </g>
              )}
              {genes.horns === 'antlers' && (
                <g stroke="#10B981" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M 82,75 C 75,50 60,40 50,35 M 65,48 C 55,48 50,55 45,55" fill="none" />
                  <path d="M 118,75 C 125,50 140,40 150,35 M 135,48 C 145,48 150,55 155,55" fill="none" />
                </g>
              )}

              {/* Ears */}
              <polygon points="72,82 60,50 86,75" fill={primary} stroke={glow} strokeWidth="1.5" />
              <polygon points="128,82 140,50 114,75" fill={primary} stroke={glow} strokeWidth="1.5" />

              {/* Face Details */}
              {isWeak ? (
                /* Dizzy / Weak Face */
                <g>
                  <text x="80" y="112" fontSize="16" fill="#1F2937" fontWeight="bold">✕</text>
                  <text x="108" y="112" fontSize="16" fill="#1F2937" fontWeight="bold">✕</text>
                  <path d="M 94,132 Q 100,126 106,132" fill="none" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
                  <path d="M 68,90 Q 64,80 66,76 Q 72,82 68,90 Z" fill="#60A5FA" />
                  <rect x="90" y="76" width="20" height="7" rx="2" fill="#FDE68A" transform="rotate(-10 100 80)" stroke="#D97706" strokeWidth="0.8" />
                </g>
              ) : (
                /* Cute / Determined Face */
                <g>
                  {/* Cheeks */}
                  <ellipse cx="78" cy="118" rx="6" ry="4" fill="#F43F5E" opacity="0.6" />
                  <ellipse cx="122" cy="118" rx="6" ry="4" fill="#F43F5E" opacity="0.6" />

                  {/* Left Eye */}
                  <ellipse cx="86" cy="108" rx="6" ry="8" fill="#0F172A" />
                  <circle cx="84" cy="105" r="2.5" fill="#FFFFFF" />

                  {/* Right Eye */}
                  <ellipse cx="114" cy="108" rx="6" ry="8" fill="#0F172A" />
                  <circle cx="112" cy="105" r="2.5" fill="#FFFFFF" />

                  {/* Nose */}
                  <ellipse cx="100" cy="116" rx="2.5" ry="1.8" fill="#0F172A" />

                  {/* Mouth */}
                  <path
                    d={
                      isEcstatic
                        ? 'M 94,121 Q 100,129 106,121'
                        : 'M 95,121 Q 100,124 105,121'
                    }
                    fill={isEcstatic ? '#BE123C' : 'none'}
                    stroke="#0F172A"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </g>
              )}

              {/* Feet / Paws */}
              <ellipse cx="80" cy="155" rx="10" ry="7" fill={secondary} stroke={glow} strokeWidth="1" />
              <ellipse cx="120" cy="155" rx="10" ry="7" fill={secondary} stroke={glow} strokeWidth="1" />
            </g>
          )}

          {/* --- CUSTOMIZATION: HATS & CROWNS --- */}
          {customization.hat === 'wizard_hat' && (
            <g>
              <ellipse cx="100" cy="74" rx="35" ry="8" fill="#4C1D95" stroke="#A78BFA" strokeWidth="1" />
              <polygon points="100,15 78,72 122,72" fill="#5B21B6" stroke="#C4B5FD" strokeWidth="1" />
              <circle cx="100" cy="15" r="4.5" fill="#FBBF24" />
            </g>
          )}
          {(customization.hat === 'crown' || pet.accessory === 'crown') && (
            <g>
              <polygon points="74,74 74,48 85,60 100,44 115,60 126,48 126,74" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
              <circle cx="100" cy="44" r="3" fill="#EF4444" />
              <circle cx="74" cy="48" r="2.5" fill="#3B82F6" />
              <circle cx="126" cy="48" r="2.5" fill="#10B981" />
            </g>
          )}
          {customization.hat === 'graduation_cap' && (
            <g>
              <polygon points="100,48 65,63 100,73 135,63" fill="#1E293B" stroke="#475569" strokeWidth="1" />
              <rect x="85" y="68" width="30" height="12" fill="#0F172A" rx="2" />
              <line x1="100" y1="60" x2="132" y2="74" stroke="#FBBF24" strokeWidth="2" />
              <circle cx="132" cy="74" r="3" fill="#F59E0B" />
            </g>
          )}
          {customization.hat === 'headphones' && (
            <g>
              <path d="M 68,105 C 68,55 132,55 132,105" fill="none" stroke="#EF4444" strokeWidth="4.5" strokeLinecap="round" />
              <rect x="62" y="98" width="12" height="18" rx="4" fill="#DC2626" />
              <rect x="126" y="98" width="12" height="18" rx="4" fill="#DC2626" />
            </g>
          )}
          {customization.hat === 'sunglasses' && !isEgg && (
            <g>
              <rect x="74" y="103" width="22" height="12" rx="3" fill="#0F172A" stroke="#475569" strokeWidth="1" />
              <rect x="104" y="103" width="22" height="12" rx="3" fill="#0F172A" stroke="#475569" strokeWidth="1" />
              <line x1="96" y1="108" x2="104" y2="108" stroke="#0F172A" strokeWidth="2.5" />
            </g>
          )}

          {/* --- CUSTOMIZATION: ACCESSORY --- */}
          {(customization.accessory === 'halo' || pet.accessory === 'halo') && (
            <ellipse cx="100" cy="46" rx="36" ry="10" fill="none" stroke="#FDE047" strokeWidth="3" />
          )}
          {(customization.accessory === 'scarf' || pet.accessory === 'scarf') && !isEgg && (
            <path d="M 75,130 Q 100,140 125,130 Q 130,138 120,145 Q 100,150 78,142 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
          )}
          {customization.accessory === 'medal' && !isEgg && (
            <g>
              <polygon points="95,134 100,126 105,134" fill="#3B82F6" />
              <circle cx="100" cy="138" r="6" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
              <text x="98.5" y="140.5" fontSize="6" fontWeight="bold" fill="#78350F">★</text>
            </g>
          )}
          {customization.accessory === 'magic_orb' && !isEgg && (
            <g className="animate-bounce">
              <circle cx="145" cy="120" r="9" fill="#818CF8" opacity="0.85" stroke="#C7D2FE" strokeWidth="1.5" />
              <circle cx="142" cy="117" r="3" fill="#FFFFFF" />
            </g>
          )}
        </g>
      </svg>

      {/* Danger escape warning badge */}
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
