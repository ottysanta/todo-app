'use client'
import { motion } from 'framer-motion'
import type { CharacterMood, BondStage, CharacterSpecies, EquippedItems } from '@/lib/types'
import { ITEMS } from '@/lib/itemData'

interface Props {
  mood: CharacterMood
  bondStage?: BondStage
  size?: 'sm' | 'md' | 'lg'
  tapAnim?: 'bounce' | 'happy_jump' | 'flinch' | 'shy' | 'heart' | 'spin' | 'eat' | null
  species?: CharacterSpecies
  equippedItems?: EquippedItems
}

type ColorSet = { body: string; glow: string; eye: string; accent: string }

function getSpeciesColors(species: CharacterSpecies, mood: CharacterMood, bondStage: BondStage): ColorSet {
  if (bondStage === 'scared') return { body: '#94a3b8', glow: '#475569', eye: '#334155', accent: '#64748b' }
  if (bondStage === 'wary')   return { body: '#7c8fa0', glow: '#4b5e6d', eye: '#374151', accent: '#6b7280' }

  const isHappy = mood === 'happy'
  const isTired = mood === 'tired' || mood === 'weak' || mood === 'sleeping'

  type Trio = { happy: ColorSet; normal: ColorSet; tired: ColorSet }
  const palettes: Record<CharacterSpecies, Trio> = {
    lumie:   { happy:  { body:'#a78bfa', glow:'#7c3aed', eye:'#1e1b4b', accent:'#c4b5fd' },
               normal: { body:'#818cf8', glow:'#4f46e5', eye:'#1e1b4b', accent:'#a5b4fc' },
               tired:  { body:'#6b7280', glow:'#4b5563', eye:'#374151', accent:'#9ca3af' } },
    dino:    { happy:  { body:'#4ade80', glow:'#16a34a', eye:'#14532d', accent:'#86efac' },
               normal: { body:'#22c55e', glow:'#15803d', eye:'#14532d', accent:'#4ade80' },
               tired:  { body:'#6b7280', glow:'#4b5563', eye:'#374151', accent:'#9ca3af' } },
    bunny:   { happy:  { body:'#f9a8d4', glow:'#ec4899', eye:'#500724', accent:'#fce7f3' },
               normal: { body:'#f472b6', glow:'#be185d', eye:'#500724', accent:'#fbcfe8' },
               tired:  { body:'#9ca3af', glow:'#6b7280', eye:'#374151', accent:'#d1d5db' } },
    ghost:   { happy:  { body:'#e2e8f0', glow:'#94a3b8', eye:'#1e293b', accent:'#f8fafc' },
               normal: { body:'#cbd5e1', glow:'#64748b', eye:'#1e293b', accent:'#e2e8f0' },
               tired:  { body:'#94a3b8', glow:'#475569', eye:'#334155', accent:'#cbd5e1' } },
    dragon:  { happy:  { body:'#fb923c', glow:'#ea580c', eye:'#431407', accent:'#fed7aa' },
               normal: { body:'#f97316', glow:'#c2410c', eye:'#431407', accent:'#fdba74' },
               tired:  { body:'#78716c', glow:'#57534e', eye:'#292524', accent:'#a8a29e' } },
    frog:    { happy:  { body:'#a3e635', glow:'#65a30d', eye:'#1a2e05', accent:'#d9f99d' },
               normal: { body:'#84cc16', glow:'#4d7c0f', eye:'#1a2e05', accent:'#bef264' },
               tired:  { body:'#6b7280', glow:'#4b5563', eye:'#374151', accent:'#9ca3af' } },
    bear:    { happy:  { body:'#d97706', glow:'#92400e', eye:'#451a03', accent:'#fde68a' },
               normal: { body:'#b45309', glow:'#78350f', eye:'#451a03', accent:'#fcd34d' },
               tired:  { body:'#78716c', glow:'#57534e', eye:'#292524', accent:'#d6d3d1' } },
    cat:     { happy:  { body:'#fb923c', glow:'#ea580c', eye:'#431407', accent:'#fed7aa' },
               normal: { body:'#f97316', glow:'#c2410c', eye:'#1c1917', accent:'#fdba74' },
               tired:  { body:'#9ca3af', glow:'#6b7280', eye:'#1f2937', accent:'#d1d5db' } },
    alien:   { happy:  { body:'#22d3ee', glow:'#0e7490', eye:'#083344', accent:'#a5f3fc' },
               normal: { body:'#06b6d4', glow:'#0e7490', eye:'#083344', accent:'#67e8f9' },
               tired:  { body:'#64748b', glow:'#475569', eye:'#1e293b', accent:'#94a3b8' } },
    penguin: { happy:  { body:'#1d4ed8', glow:'#1e3a8a', eye:'#0f172a', accent:'#93c5fd' },
               normal: { body:'#2563eb', glow:'#1d4ed8', eye:'#0f172a', accent:'#bfdbfe' },
               tired:  { body:'#475569', glow:'#334155', eye:'#1e293b', accent:'#94a3b8' } },
  }

  const p = palettes[species]
  return isHappy ? p.happy : isTired ? p.tired : p.normal
}

const sizeMap = { sm: 60, md: 100, lg: 160 }

export default function CharacterDisplay({
  mood,
  bondStage = 'neutral',
  size = 'md',
  tapAnim = null,
  species = 'lumie',
  equippedItems = {},
}: Props) {
  const s = sizeMap[size]
  const colors = getSpeciesColors(species, mood, bondStage)
  const isSleeping = mood === 'sleeping'
  const isHappy = mood === 'happy' && bondStage !== 'scared' && bondStage !== 'wary'
  const isScared = bondStage === 'scared'
  const isWary = bondStage === 'wary'
  const isLoving = bondStage === 'loving'

  const baseAnim = isScared
    ? { x: [0, -2, 2, -2, 0], transition: { duration: 0.4, repeat: Infinity, repeatDelay: 1.5 } }
    : isSleeping
    ? { y: [0, 3, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const } }
    : { y: [0, -8, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const } }

  const tapVariants = {
    bounce:     { y: [0, -20, 0], transition: { duration: 0.4 } },
    happy_jump: { y: [0, -30, 0], scale: [1, 1.1, 1], transition: { duration: 0.5 } },
    flinch:     { x: [0, -20, 0], transition: { duration: 0.3 } },
    shy:        { rotate: [0, -8, 8, -8, 0], transition: { duration: 0.5 } },
    heart:      { scale: [1, 1.15, 1], y: [0, -15, 0], transition: { duration: 0.5 } },
    spin:       { rotate: [0, 360], transition: { duration: 0.5, ease: 'easeInOut' as const } },
    eat:        { y: [0, -5, 0, -8, 0, -4, 0], scale: [1, 1.04, 1, 1.04, 1], transition: { duration: 1.2, ease: 'easeInOut' as const } },
  }

  const isEating = tapAnim === 'eat'
  const currentTapAnim = tapAnim ? tapVariants[tapAnim] : {}

  // species-specific ear renderer
  const renderEars = () => {
    if (isScared) {
      return (
        <>
          <ellipse cx="22" cy="30" rx="7" ry="10" fill={colors.body} transform="rotate(-15 22 30)" />
          <ellipse cx="78" cy="30" rx="7" ry="10" fill={colors.body} transform="rotate(15 78 30)" />
        </>
      )
    }
    if (isWary) {
      return (
        <>
          <ellipse cx="28" cy="32" rx="7" ry="10" fill={colors.body} transform="rotate(-35 28 32)" />
          <ellipse cx="72" cy="32" rx="7" ry="10" fill={colors.body} transform="rotate(35 72 32)" />
        </>
      )
    }

    switch (species) {
      case 'bunny':
        return (
          <>
            <ellipse cx="32" cy="12" rx="7" ry="20" fill={colors.body} />
            <ellipse cx="68" cy="12" rx="7" ry="20" fill={colors.body} />
            <ellipse cx="32" cy="13" rx="3.5" ry="15" fill="#f9a8d4" fillOpacity="0.6" />
            <ellipse cx="68" cy="13" rx="3.5" ry="15" fill="#f9a8d4" fillOpacity="0.6" />
          </>
        )
      case 'cat':
        return (
          <>
            <polygon points="20,32 26,12 34,32" fill={colors.body} />
            <polygon points="66,32 74,12 80,32" fill={colors.body} />
            <polygon points="22,30 26,16 32,30" fill={colors.accent} fillOpacity="0.4" />
            <polygon points="68,30 74,16 78,30" fill={colors.accent} fillOpacity="0.4" />
          </>
        )
      case 'bear':
        return (
          <>
            <circle cx="30" cy="30" r="11" fill={colors.body} />
            <circle cx="70" cy="30" r="11" fill={colors.body} />
            <circle cx="30" cy="30" r="6" fill={colors.accent} fillOpacity="0.35" />
            <circle cx="70" cy="30" r="6" fill={colors.accent} fillOpacity="0.35" />
          </>
        )
      case 'dino':
        return (
          <>
            <polygon points="24,36 30,18 36,36" fill={colors.body} />
            <polygon points="64,36 70,18 76,36" fill={colors.body} />
          </>
        )
      case 'dragon':
        return (
          <>
            <polygon points="20,34 24,14 32,34" fill={colors.body} />
            <polygon points="68,34 76,14 80,34" fill={colors.body} />
            <polygon points="21,32 24,18 30,32" fill={colors.accent} fillOpacity="0.4" />
            <polygon points="69,32 76,18 79,32" fill={colors.accent} fillOpacity="0.4" />
          </>
        )
      case 'frog':
        return (
          <>
            <circle cx="30" cy="28" r="9" fill={colors.body} />
            <circle cx="70" cy="28" r="9" fill={colors.body} />
          </>
        )
      case 'alien':
        // no ears — antennae added separately
        return null
      case 'ghost':
        // no ears
        return null
      case 'penguin':
        return null
      case 'lumie':
      default:
        return (
          <>
            <ellipse cx="26" cy="28" rx="8" ry="13" fill={colors.body} transform="rotate(-18 26 28)" />
            <ellipse cx="74" cy="28" rx="8" ry="13" fill={colors.body} transform="rotate(18 74 28)" />
            <ellipse cx="26" cy="29" rx="4" ry="7" fill={colors.glow} fillOpacity="0.4" transform="rotate(-18 26 29)" />
            <ellipse cx="74" cy="29" rx="4" ry="7" fill={colors.glow} fillOpacity="0.4" transform="rotate(18 74 29)" />
          </>
        )
    }
  }

  // species extras (drawn after body)
  const renderExtras = () => {
    switch (species) {
      case 'alien':
        return (
          <>
            <line x1="35" y1="30" x2="26" y2="12" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" />
            <circle cx="26" cy="11" r="3.5" fill={colors.accent} />
            <line x1="65" y1="30" x2="74" y2="12" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" />
            <circle cx="74" cy="11" r="3.5" fill={colors.accent} />
          </>
        )
      case 'cat':
        return (
          <>
            <line x1="15" y1="60" x2="30" y2="62" stroke={colors.accent} strokeWidth="1.2" opacity="0.7" />
            <line x1="15" y1="64" x2="30" y2="64" stroke={colors.accent} strokeWidth="1.2" opacity="0.7" />
            <line x1="16" y1="68" x2="30" y2="66" stroke={colors.accent} strokeWidth="1.2" opacity="0.7" />
            <line x1="70" y1="62" x2="85" y2="60" stroke={colors.accent} strokeWidth="1.2" opacity="0.7" />
            <line x1="70" y1="64" x2="85" y2="64" stroke={colors.accent} strokeWidth="1.2" opacity="0.7" />
            <line x1="70" y1="66" x2="85" y2="68" stroke={colors.accent} strokeWidth="1.2" opacity="0.7" />
          </>
        )
      case 'bear':
        return (
          <ellipse cx="50" cy="67" rx="13" ry="9" fill={colors.accent} fillOpacity="0.4" />
        )
      case 'penguin':
        return (
          <ellipse cx="50" cy="65" rx="20" ry="26" fill="white" fillOpacity="0.88" />
        )
      case 'dino':
        return (
          <>
            <polygon points="13,60 19,44 25,60" fill={colors.accent} fillOpacity="0.6" />
            <polygon points="8,68 15,53 22,68" fill={colors.accent} fillOpacity="0.45" />
            <polygon points="17,53 23,40 29,53" fill={colors.accent} fillOpacity="0.5" />
          </>
        )
      case 'dragon':
        return (
          <>
            <path d="M17 58 Q4 46 8 34 Q14 46 22 58" fill={colors.accent} fillOpacity="0.45" />
            <path d="M83 58 Q96 46 92 34 Q86 46 78 58" fill={colors.accent} fillOpacity="0.45" />
          </>
        )
      case 'frog':
        return (
          <>
            <circle cx="44" cy="57" r="2.5" fill={colors.glow} fillOpacity="0.55" />
            <circle cx="56" cy="57" r="2.5" fill={colors.glow} fillOpacity="0.55" />
          </>
        )
      default:
        return null
    }
  }

  // feet / bottom — ghost gets wavy
  const renderFeet = () => {
    if (species === 'ghost') {
      return (
        <path
          d="M17 94 Q25 86 33 94 Q41 102 49 94 Q57 86 65 94 Q73 102 83 94"
          fill={colors.body}
          stroke="none"
        />
      )
    }
    return (
      <>
        <ellipse cx="40" cy="94" rx="12" ry="7" fill={colors.body} />
        <ellipse cx="60" cy="94" rx="12" ry="7" fill={colors.body} />
      </>
    )
  }

  // arms — scared/wary keep original; penguin uses small flippers
  const renderArms = () => {
    if (isScared) {
      return (
        <>
          <ellipse cx="22" cy="70" rx="6" ry="9" fill={colors.body} transform="rotate(-10 22 70)" />
          <ellipse cx="78" cy="70" rx="6" ry="9" fill={colors.body} transform="rotate(10 78 70)" />
        </>
      )
    }
    if (isWary) {
      return (
        <>
          <ellipse cx="20" cy="65" rx="7" ry="12" fill={colors.body} transform="rotate(-25 20 65)" />
          <ellipse cx="80" cy="65" rx="7" ry="12" fill={colors.body} transform="rotate(25 80 65)" />
          <rect x="32" y="62" width="16" height="5" rx="2.5" fill={colors.body} transform="rotate(5 32 62)" />
          <rect x="52" y="60" width="16" height="5" rx="2.5" fill={colors.body} transform="rotate(-5 52 60)" />
        </>
      )
    }
    if (species === 'penguin') {
      return (
        <>
          <ellipse cx="16" cy="68" rx="5" ry="13" fill={colors.body} transform="rotate(-20 16 68)" />
          <ellipse cx="84" cy="68" rx="5" ry="13" fill={colors.body} transform="rotate(20 84 68)" />
        </>
      )
    }
    return (
      <>
        <ellipse cx="18" cy="67" rx="7" ry="11" fill={colors.body} transform="rotate(-28 18 67)" />
        <ellipse cx="82" cy="67" rx="7" ry="11" fill={colors.body} transform="rotate(28 82 67)" />
      </>
    )
  }

  const headItem = equippedItems.head ? ITEMS[equippedItems.head] : null
  const accessoryItem = equippedItems.accessory ? ITEMS[equippedItems.accessory] : null
  const armorItem = equippedItems.armor ? ITEMS[equippedItems.armor] : null

  return (
    <motion.div
      animate={Object.keys(currentTapAnim).length > 0 ? currentTapAnim : baseAnim}
      style={{ width: s, height: s * 1.1, position: 'relative', display: 'inline-block' }}
    >
      {/* glow */}
      <div
        style={{
          position: 'absolute',
          bottom: '-5%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '65%',
          height: '18%',
          background: colors.glow,
          borderRadius: '50%',
          filter: 'blur(8px)',
          opacity: isSleeping || isScared ? 0.15 : 0.55,
        }}
      />

      <svg viewBox="0 0 100 110" width={s} height={s * 1.1}>
        <g transform={isScared ? 'translate(50,55) scale(0.9) translate(-50,-55)' : ''}>

          {/* species extras behind body (wings, dino spikes on back) */}
          {(species === 'dino' || species === 'dragon') && renderExtras()}

          {/* ears */}
          {renderEars()}

          {/* alien antennae */}
          {species === 'alien' && renderExtras()}

          {/* body */}
          <ellipse
            cx="50"
            cy="60"
            rx="33"
            ry="36"
            fill={colors.body}
            fillOpacity={species === 'ghost' ? 0.85 : 1}
          />
          {/* belly highlight */}
          <ellipse cx="50" cy="66" rx="19" ry="21" fill="white" fillOpacity="0.12" />

          {/* penguin belly & bear snout & cat whiskers on top of body */}
          {species !== 'dino' && species !== 'dragon' && species !== 'alien' && renderExtras()}

          {/* eyes */}
          {isSleeping ? (
            <>
              <path d="M34 53 Q39 58 44 53" stroke={colors.glow} strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M56 53 Q61 58 66 53" stroke={colors.glow} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </>
          ) : isScared ? (
            <>
              <circle cx="39" cy="53" r="9" fill="white" />
              <circle cx="61" cy="53" r="9" fill="white" />
              <circle cx="39" cy="55" r="5" fill={colors.eye} />
              <circle cx="61" cy="55" r="5" fill={colors.eye} />
              <circle cx="41" cy="52" r="2" fill="white" />
              <circle cx="63" cy="52" r="2" fill="white" />
            </>
          ) : isWary ? (
            <>
              <circle cx="39" cy="53" r="6" fill="white" />
              <circle cx="61" cy="53" r="6" fill="white" />
              <line x1="33" y1="49" x2="45" y2="49" stroke={colors.body} strokeWidth="3" strokeLinecap="round" />
              <line x1="55" y1="49" x2="67" y2="49" stroke={colors.body} strokeWidth="3" strokeLinecap="round" />
              <circle cx="40" cy="53" r="3.5" fill={colors.eye} />
              <circle cx="62" cy="53" r="3.5" fill={colors.eye} />
            </>
          ) : isLoving && tapAnim === 'heart' ? (
            <>
              <circle cx="39" cy="53" r="7" fill="white" />
              <circle cx="61" cy="53" r="7" fill="white" />
              <text x="35" y="57" fontSize="10" textAnchor="middle" fill="#ec4899">♥</text>
              <text x="65" y="57" fontSize="10" textAnchor="middle" fill="#ec4899">♥</text>
            </>
          ) : species === 'alien' ? (
            // alien: larger eyes
            <>
              <ellipse cx="38" cy="53" rx="9" ry="10" fill="white" />
              <ellipse cx="62" cy="53" rx="9" ry="10" fill="white" />
              <circle cx="38" cy="54" r="5" fill={colors.eye} />
              <circle cx="62" cy="54" r="5" fill={colors.eye} />
              <circle cx="40" cy="51" r="2" fill="white" />
              <circle cx="64" cy="51" r="2" fill="white" />
            </>
          ) : (
            <>
              <circle cx="39" cy="53" r="7" fill="white" />
              <circle cx="61" cy="53" r="7" fill="white" />
              <circle cx="40" cy="54" r="4" fill={colors.eye} />
              <circle cx="62" cy="54" r="4" fill={colors.eye} />
              <circle cx="42" cy="52" r="1.5" fill="white" />
              <circle cx="64" cy="52" r="1.5" fill="white" />
            </>
          )}

          {/* mouth */}
          {isEating && (
            <ellipse cx="50" cy="72" rx="7" ry="5" fill={colors.glow} fillOpacity="0.8" />
          )}
          {isHappy && !isEating && (
            <path d="M40 69 Q50 78 60 69" stroke={colors.glow} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}
          {mood === 'normal' && !isScared && !isWary && (
            <path d="M42 69 Q50 74 58 69" stroke={colors.glow} strokeWidth="2" fill="none" strokeLinecap="round" />
          )}
          {(mood === 'tired' || mood === 'weak') && (
            <path d="M42 71 Q50 67 58 71" stroke={colors.glow} strokeWidth="2" fill="none" strokeLinecap="round" />
          )}
          {isSleeping && (
            <>
              <path d="M44 69 Q50 66 56 69" stroke="#6b7280" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <text x="66" y="36" fontSize="11" fill="white" fillOpacity="0.45">z</text>
              <text x="73" y="26" fontSize="8" fill="white" fillOpacity="0.25">z</text>
            </>
          )}
          {isScared && (
            <path d="M42 72 Q50 68 58 72" stroke={colors.glow} strokeWidth="2" fill="none" strokeLinecap="round" />
          )}
          {isWary && (
            <path d="M43 71 Q50 68 57 71" stroke={colors.glow} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          )}

          {/* cheeks */}
          {(isHappy || isLoving) && !isScared && !isWary && (
            <>
              <ellipse cx="30" cy="62" rx="6" ry="4" fill="#f9a8d4" fillOpacity="0.45" />
              <ellipse cx="70" cy="62" rx="6" ry="4" fill="#f9a8d4" fillOpacity="0.45" />
            </>
          )}
          {tapAnim === 'shy' && (
            <>
              <ellipse cx="30" cy="62" rx="8" ry="5" fill="#fb7185" fillOpacity="0.4" />
              <ellipse cx="70" cy="62" rx="8" ry="5" fill="#fb7185" fillOpacity="0.4" />
            </>
          )}

          {/* arms */}
          {renderArms()}

          {/* feet / bottom */}
          {renderFeet()}
        </g>

        {isScared && (
          <text x="72" y="30" fontSize="12" fill="#93c5fd" fillOpacity="0.8">💧</text>
        )}

        {/* Equipment overlays */}
        {headItem && (
          <text
            x="50" y={size === 'sm' ? 18 : 14}
            fontSize={size === 'sm' ? 12 : size === 'md' ? 16 : 20}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {headItem.emoji}
          </text>
        )}
        {accessoryItem && (
          <text
            x="78" y="55"
            fontSize={size === 'sm' ? 10 : size === 'md' ? 14 : 18}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {accessoryItem.emoji}
          </text>
        )}
        {armorItem && (
          <text
            x="50" y="88"
            fontSize={size === 'sm' ? 10 : size === 'md' ? 13 : 17}
            textAnchor="middle"
            dominantBaseline="middle"
            opacity="0.85"
          >
            {armorItem.emoji}
          </text>
        )}
      </svg>
    </motion.div>
  )
}
