
import { Item } from "../types/game"

export interface EquipmentSlot {
  name: string
  allowedTypes: string[]
}

export const EQUIPMENT_SLOTS: EquipmentSlot[] = [
  { name: "mainHand", allowedTypes: ["weapon", "shield"] },
  { name: "offHand", allowedTypes: ["weapon", "shield"] },
  { name: "head", allowedTypes: ["helmet", "hat"] },
  { name: "body", allowedTypes: ["armor", "robe"] },
  { name: "legs", allowedTypes: ["pants", "greaves"] },
  { name: "feet", allowedTypes: ["boots", "shoes"] },
  { name: "ring1", allowedTypes: ["ring"] },
  { name: "ring2", allowedTypes: ["ring"] },
  { name: "neck", allowedTypes: ["necklace", "amulet"] },
  { name: "cloak", allowedTypes: ["cloak", "cape"] }
]

export const WEAPONS: Item[] = [
  // Melee Weapons
  { name: "Iron Dagger", type: "weapon", damage: 4, value: 20, effect: "Light, quick weapon", rarity: "common", weight: 1 },
  { name: "Short Sword", type: "weapon", damage: 6, value: 50, effect: "Versatile blade", rarity: "common", weight: 2 },
  { name: "Longsword", type: "weapon", damage: 8, value: 100, effect: "Classic warrior's blade", rarity: "common", weight: 3 },
  { name: "Battleaxe", type: "weapon", damage: 10, value: 150, effect: "Heavy two-handed weapon", rarity: "common", weight: 4 },
  { name: "Warhammer", type: "weapon", damage: 9, value: 120, effect: "Crushing bludgeon", rarity: "common", weight: 3 },
  
  // Magical Weapons
  { name: "Flaming Sword", type: "weapon", damage: 12, value: 800, effect: "+2 fire damage, glows with flame", rarity: "rare", weight: 3, magical: true },
  { name: "Frost Dagger", type: "weapon", damage: 6, value: 400, effect: "+1 cold damage, chance to slow", rarity: "uncommon", weight: 1, magical: true },
  { name: "Thunder Hammer", type: "weapon", damage: 14, value: 1200, effect: "+3 thunder damage, stuns on crit", rarity: "rare", weight: 4, magical: true },
  
  // Ranged Weapons
  { name: "Shortbow", type: "weapon", damage: 6, value: 75, effect: "Light ranged weapon", rarity: "common", weight: 2 },
  { name: "Longbow", type: "weapon", damage: 8, value: 150, effect: "Long range weapon", rarity: "common", weight: 3 },
  { name: "Crossbow", type: "weapon", damage: 10, value: 200, effect: "Mechanical ranged weapon", rarity: "common", weight: 4 },
  
  // Staves and Wands
  { name: "Wooden Staff", type: "weapon", damage: 4, value: 30, effect: "Basic spellcasting focus", rarity: "common", weight: 2 },
  { name: "Crystal Staff", type: "weapon", damage: 6, value: 300, effect: "+2 spell damage", rarity: "uncommon", weight: 3, magical: true },
  { name: "Archmage Staff", type: "weapon", damage: 8, value: 1000, effect: "+4 spell damage, +1 spell slot", rarity: "rare", weight: 3, magical: true },
  { name: "Wand of Magic Missiles", type: "weapon", damage: 3, value: 500, effect: "Casts Magic Missile (3 charges)", rarity: "uncommon", weight: 1, magical: true }
]

export const ARMOR: Item[] = [
  // Light Armor
  { name: "Leather Armor", type: "armor", defense: 2, value: 50, effect: "+2 AC, light armor", rarity: "common", weight: 2 },
  { name: "Studded Leather", type: "armor", defense: 3, value: 100, effect: "+3 AC, light armor", rarity: "common", weight: 3 },
  
  // Medium Armor
  { name: "Chain Shirt", type: "armor", defense: 4, value: 200, effect: "+4 AC, medium armor", rarity: "common", weight: 4 },
  { name: "Scale Mail", type: "armor", defense: 5, value: 300, effect: "+5 AC, medium armor", rarity: "common", weight: 5 },
  { name: "Chainmail", type: "armor", defense: 6, value: 500, effect: "+6 AC, medium armor", rarity: "common", weight: 6 },
  
  // Heavy Armor
  { name: "Plate Armor", type: "armor", defense: 8, value: 1000, effect: "+8 AC, heavy armor", rarity: "common", weight: 8 },
  { name: "Full Plate", type: "armor", defense: 10, value: 2000, effect: "+10 AC, heavy armor", rarity: "uncommon", weight: 10 },
  
  // Magical Armor
  { name: "Elven Chainmail", type: "armor", defense: 7, value: 1500, effect: "+7 AC, +1 DEX, silent movement", rarity: "rare", weight: 4, magical: true },
  { name: "Dragon Scale Mail", type: "armor", defense: 9, value: 3000, effect: "+9 AC, fire resistance", rarity: "rare", weight: 6, magical: true },
  
  // Robes
  { name: "Simple Robes", type: "robe", defense: 1, value: 25, effect: "+1 AC, cloth armor", rarity: "common", weight: 1 },
  { name: "Mage Robes", type: "robe", defense: 2, value: 200, effect: "+2 AC, +1 INT", rarity: "uncommon", weight: 1 },
  { name: "Archmage Robes", type: "robe", defense: 3, value: 800, effect: "+3 AC, +2 INT, +1 spell slot", rarity: "rare", weight: 1, magical: true }
]

export const ACCESSORIES: Item[] = [
  // Rings
  { name: "Ring of Protection", type: "ring", defense: 1, value: 500, effect: "+1 AC, +1 to all saves", rarity: "uncommon", weight: 0, magical: true },
  { name: "Ring of Strength", type: "ring", value: 600, effect: "+2 STR", rarity: "uncommon", weight: 0, magical: true, statBonus: { STR: 2 } },
  { name: "Ring of Wizardry", type: "ring", value: 1000, effect: "+2 INT, +1 spell slot", rarity: "rare", weight: 0, magical: true, statBonus: { INT: 2 } },
  { name: "Ring of Regeneration", type: "ring", value: 1500, effect: "Regenerate 1 HP per turn", rarity: "rare", weight: 0, magical: true },
  
  // Necklaces & Amulets
  { name: "Amulet of Health", type: "amulet", value: 800, effect: "+3 CON", rarity: "uncommon", weight: 0, magical: true, statBonus: { CON: 3 } },
  { name: "Holy Symbol", type: "necklace", value: 100, effect: "Divine spellcasting focus", rarity: "common", weight: 0 },
  { name: "Amulet of Natural Armor", type: "amulet", defense: 2, value: 600, effect: "+2 natural AC", rarity: "uncommon", weight: 0, magical: true },
  
  // Cloaks
  { name: "Cloak of Elvenkind", type: "cloak", value: 500, effect: "+2 DEX, advantage on stealth", rarity: "uncommon", weight: 1, magical: true, statBonus: { DEX: 2 } },
  { name: "Cloak of Protection", type: "cloak", defense: 1, value: 700, effect: "+1 AC, +1 to saves", rarity: "uncommon", weight: 1, magical: true },
  
  // Helmets
  { name: "Iron Helmet", type: "helmet", defense: 1, value: 50, effect: "+1 AC", rarity: "common", weight: 2 },
  { name: "Helmet of Brilliance", type: "helmet", defense: 2, value: 1200, effect: "+2 AC, +1 INT, +1 WIS", rarity: "rare", weight: 2, magical: true, statBonus: { INT: 1, WIS: 1 } },
  
  // Boots
  { name: "Leather Boots", type: "boots", value: 20, effect: "Basic footwear", rarity: "common", weight: 1 },
  { name: "Boots of Speed", type: "boots", value: 800, effect: "+1 DEX, double movement speed", rarity: "uncommon", weight: 1, magical: true, statBonus: { DEX: 1 } },
  { name: "Boots of Elvenkind", type: "boots", value: 600, effect: "Silent movement, +1 DEX", rarity: "uncommon", weight: 1, magical: true, statBonus: { DEX: 1 } }
]

export const CONSUMABLES: Item[] = [
  // Healing Potions
  { name: "Minor Healing Potion", type: "consumable", healing: 8, value: 25, effect: "Restores 1d4+4 HP", rarity: "common", weight: 0 },
  { name: "Healing Potion", type: "consumable", healing: 15, value: 50, effect: "Restores 2d4+7 HP", rarity: "common", weight: 0 },
  { name: "Greater Healing Potion", type: "consumable", healing: 25, value: 150, effect: "Restores 4d4+9 HP", rarity: "uncommon", weight: 0 },
  { name: "Superior Healing Potion", type: "consumable", healing: 40, value: 300, effect: "Restores 8d4+8 HP", rarity: "rare", weight: 0 },
  
  // Mana Potions
  { name: "Mana Potion", type: "consumable", value: 60, effect: "Restores 1 spell slot", rarity: "common", weight: 0, restoresMana: 1 },
  { name: "Greater Mana Potion", type: "consumable", value: 200, effect: "Restores 2 spell slots", rarity: "uncommon", weight: 0, restoresMana: 2 },
  
  // Stat Enhancing Potions
  { name: "Potion of Giant Strength", type: "consumable", value: 400, effect: "+4 STR for 1 hour", rarity: "uncommon", weight: 0, temporaryStatBonus: { STR: 4, duration: 10 } },
  { name: "Potion of Eagle's Splendor", type: "consumable", value: 300, effect: "+4 CHA for 1 hour", rarity: "uncommon", weight: 0, temporaryStatBonus: { CHA: 4, duration: 10 } },
  
  // Scrolls
  { name: "Scroll of Cure Light Wounds", type: "consumable", healing: 12, value: 100, effect: "Casts Cure Light Wounds", rarity: "common", weight: 0 },
  { name: "Scroll of Magic Missile", type: "consumable", value: 150, effect: "Casts Magic Missile (3 missiles)", rarity: "common", weight: 0, spell: "magic_missile" },
  { name: "Scroll of Fireball", type: "consumable", value: 500, effect: "Casts Fireball (8d6 damage)", rarity: "uncommon", weight: 0, spell: "fireball" }
]

export const TOOLS: Item[] = [
  { name: "Thieves' Tools", type: "tool", value: 50, effect: "Required for lock picking", rarity: "common", weight: 1 },
  { name: "Rope (50 ft)", type: "tool", value: 15, effect: "Useful for climbing", rarity: "common", weight: 2 },
  { name: "Torch", type: "tool", value: 5, effect: "Provides light", rarity: "common", weight: 1 },
  { name: "Lantern", type: "tool", value: 25, effect: "Bright light source", rarity: "common", weight: 2 },
  { name: "Grappling Hook", type: "tool", value: 30, effect: "For climbing walls", rarity: "common", weight: 2 },
  { name: "Crowbar", type: "tool", value: 20, effect: "For prying open doors", rarity: "common", weight: 3 }
]

export const ALL_ITEMS: Item[] = [
  ...WEAPONS,
  ...ARMOR,
  ...ACCESSORIES,
  ...CONSUMABLES,
  ...TOOLS
]

export const getItemsByType = (type: string): Item[] => {
  return ALL_ITEMS.filter(item => item.type === type)
}

export const getItemsByRarity = (rarity: string): Item[] => {
  return ALL_ITEMS.filter(item => (item as any).rarity === rarity)
}

export const getRandomItemByRarity = (rarity: "common" | "uncommon" | "rare"): Item => {
  const items = getItemsByRarity(rarity)
  return items[Math.floor(Math.random() * items.length)]
}
