import React from 'react';
import { Pet } from '../types';

interface PetCanvasProps {
  pet: Pet;
  size?: 'sm' | 'md' | 'lg' | 'xl';
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

  // Dimension scaling
  const sizeMap = {
    sm: 'w-24 h-24',
    md: 'w-40 h-40',
    lg: 'w-64 h-64',
    xl: 'w-80 h-80',
  };

  const isEgg = stage === 'egg';
  const isUltimate = stage === 'ultimate';
  const isWeak = mood === 'weak' || mood === 'danger_escape' || health < 35;
  const isEcstatic = mood === 'ecstatic' || mood === 'happy';

  // Base colors
  const primary = genes.primaryColor || '#F97316';
  const secondary = genes.secondaryColor || '#EF4444';
  const glow = genes.glowColor || '#FBBF24';

  // Determine stage scale inside SVG
  let petScale = 1.0;
  if (stage === 'egg') petScale = 0.85;
  else if (stage === 'baby') petScale = 0.9;
  else if (stage === 'juvenile') petScale = 1.05;
  else if (stage === 'adult') petScale = 1.2;
  else if (stage === 'ultimate') petScale = 1.35;

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center select-none ${sizeMap[size]} ${
        interactive ? 'cursor-pointer transition-transform hover:scale-105 active:scale-95' : ''
      }`}
    >
      {/* Background glow or particle aura */}
      {showStatusAura && (
        <div
          className={`absolute inset-0 rounded-full blur-2xl opacity-40 transition-all duration-700 pointer-events-none ${
            isUltimate
              ? 'animate-pulse scale-125'
              : isWeak
              ? 'opacity-20 scale-75'
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

      {/* SVG Pet Container */}
      <svg
        viewBox="0 0 200 200"
        className={`w-full h-full filter drop-shadow-lg transition-transform duration-500 ${
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

        {/* --- ULTIMATE DIVINE HALO / ENERGY ORBITS --- */}
        {isUltimate && (
          <g className="animate-spin" style={{ transformOrigin: '100px 100px', animationDuration: '14s' }}>
            <circle cx="100" cy="100" r="82" fill="none" stroke={glow} strokeWidth="2.5" strokeDasharray="10 6 3 6" opacity="0.75" />
            <circle cx="100" cy="18" r="4.5" fill={glow} />
            <circle cx="182" cy="100" r="4.5" fill={primary} />
            <circle cx="100" cy="182" r="4.5" fill={glow} />
            <circle cx="18" cy="100" r="4.5" fill={primary} />
          </g>
        )}

        {/* Main Pet Body Scale Group */}
        <g transform={`translate(100 100) scale(${petScale}) translate(-100 -100)`}>
          {/* --- WINGS LAYER (Adult & Ultimate) --- */}
          {(stage === 'juvenile' || stage === 'adult' || stage === 'ultimate') && (
            <g className={isEcstatic ? 'animate-pulse' : ''}>
              {/* Left Wing */}
              <path
                d={
                  genes.wings === 'mecha'
                    ? 'M 60,90 L 15,65 L 30,110 L 60,105 Z'
                    : genes.wings === 'dragon'
                    ? 'M 60,95 Q 10,60 25,120 Q 50,115 65,105 Z'
                    : 'M 65,95 C 20,60 10,110 58,115 Z'
                }
                fill={isWeak ? '#6B7280' : primary}
                opacity="0.85"
                stroke={glow}
                strokeWidth="1.5"
              />
              {/* Right Wing */}
              <path
                d={
                  genes.wings === 'mecha'
                    ? 'M 140,90 L 185,65 L 170,110 L 140,105 Z'
                    : genes.wings === 'dragon'
                    ? 'M 140,95 Q 190,60 175,120 Q 150,115 135,105 Z'
                    : 'M 135,95 C 180,60 190,110 142,115 Z'
                }
                fill={isWeak ? '#6B7280' : primary}
                opacity="0.85"
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
              {/* Egg Shadow */}
              <ellipse cx="100" cy="165" rx="35" ry="10" fill="rgba(0,0,0,0.3)" />

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
              {/* Shadow */}
              <ellipse cx="100" cy="160" rx="38" ry="12" fill="rgba(0,0,0,0.25)" />

              {/* Tail */}
              <path
                d="M 60,135 Q 30,150 40,170 Q 55,160 70,145 Z"
                fill={`url(#grad_body_${pet.id})`}
                stroke={glow}
                strokeWidth="1"
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
                opacity={isWeak ? "0.4" : "0.85"}
              />

              {/* Horns or Halo */}
              {genes.horns === 'crystal' && (
                <g>
                  <polygon points="85,75 80,45 92,68" fill="#38BDF8" stroke="#E0F2FE" strokeWidth="1" />
                  <polygon points="115,75 120,45 108,68" fill="#38BDF8" stroke="#E0F2FE" strokeWidth="1" />
                </g>
              )}
              {genes.horns === 'dragon' && (
                <g>
                  <path d="M 80,75 C 65,50 60,40 50,45 C 65,55 75,70 82,80 Z" fill={secondary} />
                  <path d="M 120,75 C 135,50 140,40 150,45 C 135,55 125,70 118,80 Z" fill={secondary} />
                </g>
              )}
              {genes.horns === 'angel_halo' && (
                <ellipse cx="100" cy="55" rx="32" ry="8" fill="none" stroke="#FDE047" strokeWidth="3" />
              )}
              {genes.horns === 'cyber_antennae' && (
                <g>
                  <line x1="88" y1="75" x2="75" y2="48" stroke="#06B6D4" strokeWidth="2.5" />
                  <circle cx="75" cy="48" r="4" fill="#22D3EE" />
                  <line x1="112" y1="75" x2="125" y2="48" stroke="#06B6D4" strokeWidth="2.5" />
                  <circle cx="125" cy="48" r="4" fill="#22D3EE" />
                </g>
              )}

              {/* Ears */}
              <polygon points="72,82 62,52 86,75" fill={primary} stroke={glow} strokeWidth="1.5" />
              <polygon points="128,82 138,52 114,75" fill={primary} stroke={glow} strokeWidth="1.5" />

              {/* Face Details */}
              {isWeak ? (
                /* Dizzy / Weak Face */
                <g>
                  {/* Spiral / X Eyes */}
                  <text x="80" y="112" fontSize="16" fill="#1F2937" fontWeight="bold">✕</text>
                  <text x="108" y="112" fontSize="16" fill="#1F2937" fontWeight="bold">✕</text>
                  {/* Sad mouth */}
                  <path d="M 94,132 Q 100,126 106,132" fill="none" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
                  {/* Sweat drops */}
                  <path d="M 68,90 Q 64,80 66,76 Q 72,82 68,90 Z" fill="#60A5FA" />
                  {/* Forehead bandage */}
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

          {/* --- CUSTOMIZATION: HATS --- */}
          {customization.hat === 'wizard_hat' && (
            <g>
              <ellipse cx="100" cy="74" rx="35" ry="8" fill="#4C1D95" stroke="#A78BFA" strokeWidth="1" />
              <polygon points="100,18 78,72 122,72" fill="#5B21B6" stroke="#C4B5FD" strokeWidth="1" />
              <circle cx="100" cy="18" r="4.5" fill="#FBBF24" />
            </g>
          )}
          {customization.hat === 'crown' && (
            <g>
              <polygon points="76,74 76,52 86,62 100,48 114,62 124,52 124,74" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
              <circle cx="100" cy="48" r="3" fill="#EF4444" />
              <circle cx="76" cy="52" r="2.5" fill="#3B82F6" />
              <circle cx="124" cy="52" r="2.5" fill="#10B981" />
            </g>
          )}
          {customization.hat === 'graduation_cap' && (
            <g>
              <polygon points="100,50 65,65 100,75 135,65" fill="#1E293B" stroke="#475569" strokeWidth="1" />
              <rect x="85" y="70" width="30" height="12" fill="#0F172A" rx="2" />
              <line x1="100" y1="62" x2="132" y2="76" stroke="#FBBF24" strokeWidth="2" />
              <circle cx="132" cy="76" r="3" fill="#F59E0B" />
            </g>
          )}
          {customization.hat === 'headphones' && (
            <g>
              <path d="M 68,105 C 68,60 132,60 132,105" fill="none" stroke="#EF4444" strokeWidth="4.5" strokeLinecap="round" />
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
        <div className="absolute top-1 right-1 bg-red-600/90 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-lg animate-bounce border border-red-400">
          ⚠️ 瀕臨逃跑！
        </div>
      )}
      {mood === 'weak' && (
        <div className="absolute top-1 right-1 bg-amber-600/90 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow border border-amber-400">
          💤 虛弱狀態
        </div>
      )}
    </div>
  );
};
