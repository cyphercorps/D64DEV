
import { Spell } from "../types/game"

export const SPELLS: Spell[] = [
  // Level 0 (Cantrips)
  {
    name: "Light",
    level: 0,
    school: "Evocation",
    castingTime: "1 action",
    range: "Touch",
    duration: "1 hour",
    description: "Creates a bright light on an object",
    classes: ["Cleric", "Mage"]
  },
  {
    name: "Mage Hand",
    level: 0,
    school: "Conjuration",
    castingTime: "1 action",
    range: "30 feet",
    duration: "1 minute",
    description: "Creates a spectral hand that can manipulate objects",
    classes: ["Mage"]
  },
  {
    name: "Sacred Flame",
    level: 0,
    school: "Evocation",
    castingTime: "1 action",
    range: "60 feet",
    duration: "Instantaneous",
    description: "Divine flame descends on a creature",
    damage: "1d8",
    classes: ["Cleric"]
  },
  {
    name: "Eldritch Blast",
    level: 0,
    school: "Evocation",
    castingTime: "1 action",
    range: "120 feet",
    duration: "Instantaneous",
    description: "A beam of crackling energy",
    damage: "1d10",
    classes: ["Mage"]
  },

  // Level 1 Spells
  {
    name: "Magic Missile",
    level: 1,
    school: "Evocation",
    castingTime: "1 action",
    range: "120 feet",
    duration: "Instantaneous",
    description: "Creates 3 darts of magical force",
    damage: "3d4+3",
    classes: ["Mage"]
  },
  {
    name: "Cure Light Wounds",
    level: 1,
    school: "Evocation",
    castingTime: "1 action",
    range: "Touch",
    duration: "Instantaneous",
    description: "Heals a creature",
    healing: "1d8+3",
    classes: ["Cleric"]
  },
  {
    name: "Shield",
    level: 1,
    school: "Abjuration",
    castingTime: "1 reaction",
    range: "Self",
    duration: "1 round",
    description: "+5 AC until start of next turn",
    effect: "+5 AC",
    classes: ["Mage"]
  },
  {
    name: "Bless",
    level: 1,
    school: "Enchantment",
    castingTime: "1 action",
    range: "30 feet",
    duration: "1 minute",
    description: "Blesses up to 3 creatures",
    effect: "+1d4 to attack rolls and saves",
    classes: ["Cleric"]
  },
  {
    name: "Burning Hands",
    level: 1,
    school: "Evocation",
    castingTime: "1 action",
    range: "Self (15-foot cone)",
    duration: "Instantaneous",
    description: "A thin sheet of flames shoots forth",
    damage: "3d6",
    classes: ["Mage"]
  },

  // Level 2 Spells
  {
    name: "Scorching Ray",
    level: 2,
    school: "Evocation",
    castingTime: "1 action",
    range: "120 feet",
    duration: "Instantaneous",
    description: "Creates 3 rays of fire",
    damage: "3 × 2d6",
    classes: ["Mage"]
  },
  {
    name: "Cure Moderate Wounds",
    level: 2,
    school: "Evocation",
    castingTime: "1 action",
    range: "Touch",
    duration: "Instantaneous",
    description: "Heals moderate wounds",
    healing: "2d8+5",
    classes: ["Cleric"]
  },
  {
    name: "Hold Person",
    level: 2,
    school: "Enchantment",
    castingTime: "1 action",
    range: "60 feet",
    duration: "1 minute",
    description: "Paralyzes a humanoid",
    effect: "Target is paralyzed",
    classes: ["Cleric", "Mage"]
  },
  {
    name: "Mirror Image",
    level: 2,
    school: "Illusion",
    castingTime: "1 action",
    range: "Self",
    duration: "1 minute",
    description: "Creates illusory duplicates of yourself",
    effect: "Creates 3 duplicates",
    classes: ["Mage"]
  },

  // Level 3 Spells
  {
    name: "Fireball",
    level: 3,
    school: "Evocation",
    castingTime: "1 action",
    range: "150 feet",
    duration: "Instantaneous",
    description: "A bright flash then a roar of flame",
    damage: "8d6",
    classes: ["Mage"]
  },
  {
    name: "Cure Serious Wounds",
    level: 3,
    school: "Evocation",
    castingTime: "1 action",
    range: "Touch",
    duration: "Instantaneous",
    description: "Heals serious wounds",
    healing: "3d8+7",
    classes: ["Cleric"]
  },
  {
    name: "Lightning Bolt",
    level: 3,
    school: "Evocation",
    castingTime: "1 action",
    range: "Self (100-foot line)",
    duration: "Instantaneous",
    description: "A stroke of lightning forming a line",
    damage: "8d6",
    classes: ["Mage"]
  },
  {
    name: "Dispel Magic",
    level: 3,
    school: "Abjuration",
    castingTime: "1 action",
    range: "120 feet",
    duration: "Instantaneous",
    description: "Dispels magical effects",
    effect: "Removes magic effects",
    classes: ["Cleric", "Mage"]
  }
]

export const getSpellsByClass = (className: string): Spell[] => {
  return SPELLS.filter(spell => spell.classes.includes(className))
}

export const getSpellsByLevel = (level: number): Spell[] => {
  return SPELLS.filter(spell => spell.level === level)
}

export const getSpell = (name: string): Spell | undefined => {
  return SPELLS.find(spell => spell.name === name)
}

export const getSpellSlotsByClassAndLevel = (className: string, level: number): SpellSlot[] => {
  const slots: SpellSlot[] = []
  
  if (className === "Mage") {
    if (level >= 1) slots.push({ level: 1, total: Math.min(level + 1, 4), used: 0 })
    if (level >= 3) slots.push({ level: 2, total: Math.min(Math.floor(level / 2), 3), used: 0 })
    if (level >= 5) slots.push({ level: 3, total: Math.min(Math.floor(level / 3), 3), used: 0 })
    if (level >= 7) slots.push({ level: 4, total: Math.min(Math.floor(level / 4), 3), used: 0 })
    if (level >= 9) slots.push({ level: 5, total: Math.min(Math.floor(level / 5), 2), used: 0 })
  } else if (className === "Cleric") {
    if (level >= 1) slots.push({ level: 1, total: Math.min(level, 4), used: 0 })
    if (level >= 3) slots.push({ level: 2, total: Math.min(Math.floor(level / 2), 3), used: 0 })
    if (level >= 5) slots.push({ level: 3, total: Math.min(Math.floor(level / 3), 3), used: 0 })
    if (level >= 7) slots.push({ level: 4, total: Math.min(Math.floor(level / 4), 3), used: 0 })
    if (level >= 9) slots.push({ level: 5, total: Math.min(Math.floor(level / 5), 2), used: 0 })
  }
  
  return slots
}
