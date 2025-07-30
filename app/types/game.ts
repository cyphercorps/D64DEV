export type GamePhase = "character-creation" | "dungeon" | "combat" | "death" | "victory"

export interface Character {
  name: string
  class: string
  level: number
  hp: number
  maxHp: number
  xp: number
  xpToNext: number
  stats: Stats
  baseStats: Stats
  inventory: Item[]
  equipment: Equipment
  armorClass: number
  spellSlots: SpellSlot[]
  knownSpells: string[]
  tags: string[]
  statusEffects: StatusEffect[]
  gold: number
  deathCount: number
  storyEvents: string[]
  personalityTraits: string[]
}

export interface Item {
  name: string
  type: "weapon" | "armor" | "robe" | "helmet" | "hat" | "boots" | "shoes" | "pants" | "greaves" | 
        "ring" | "necklace" | "amulet" | "cloak" | "cape" | "shield" | 
        "consumable" | "treasure" | "tool"
  effect?: string
  damage?: number
  healing?: number
  defense?: number
  value: number
  weight?: number
  rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary"
  magical?: boolean
  statBonus?: Partial<Stats>
  temporaryStatBonus?: {
    duration: number
  } & Partial<Stats>
  restoresMana?: number
  spell?: string
  symbolic?: string
  aiGenerated?: boolean
}

export interface Equipment {
  mainHand?: Item
  offHand?: Item
  head?: Item
  body?: Item
  legs?: Item
  feet?: Item
  ring1?: Item
  ring2?: Item
  neck?: Item
  cloak?: Item
}

export interface Stats {
  STR: number
  DEX: number
  CON: number
  INT: number
  WIS: number
  CHA: number
}

export interface SpellSlot {
  level: number
  total: number
  used: number
}

export interface Spell {
  name: string
  level: number
  school: string
  castingTime: string
  range: string
  duration: string
  description: string
  damage?: string
  healing?: string
  effect?: string
  classes: string[]
}

export interface StatusEffect {
  name: string
  duration: number
  effect: string
}

export interface Room {
  id: string
  ascii: string[]
  exits: string[]
  description: string
  symbolicText: string
  explored: boolean
  hasLoot: boolean
  hasTrap: boolean
  hasEnemy: boolean
  loot?: Item[]
  enemy?: Enemy
  depth: number
  roomType: string
  aiContext?: string
}

export interface Enemy {
  name: string
  hp: number
  maxHp: number
  attack: number
  defense: number
  xpReward: number
  loot?: Item[]
  symbolic: string
  aiGenerated?: boolean
}

export interface LogEntry {
  text: string
  type: "combat" | "narrative" | "system" | "dice" | "death" | "level" | "ai"
  timestamp: number
}

export interface Dungeon {
  rooms: Map<string, Room>
  currentRoomId: string
  depth: number
  maxDepth: number
  theme: string
  aiNarrator: {
    tone: string
    focus: string[]
    memoryEvents: string[]
  }
}

export interface PartyMember {
  id: string
  name: string
  class: string
  level: number
  hp: number
  maxHp: number
  xp: number
  xpToNext: number
  stats: Stats
  baseStats: Stats
  inventory: Item[]
  equipment: Equipment
  armorClass: number
  spellSlots: SpellSlot[]
  knownSpells: string[]
  tags: string[]
  statusEffects: StatusEffect[]
  personalityTraits: string[]
  isPlayer: boolean
  loyalty: number
  relationships: { [memberId: string]: number }
  combatAI: "aggressive" | "defensive" | "support" | "balanced"
  portrait: string
  joinedAt: number
  backstory: string
  storyEvents: string[]
}

export interface Party {
  members: PartyMember[]
  sharedGold: number
  sharedInventory: Item[]
  formation: string[]
  morale: number
  reputation: number
}

export interface CombatTurn {
  memberId: string
  action: "attack" | "defend" | "use_item" | "flee" | "wait"
  target?: string
  item?: Item
}