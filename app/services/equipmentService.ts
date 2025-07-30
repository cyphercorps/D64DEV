
import { PartyMember, Item, Equipment, Stats } from "../types/game"
import { EQUIPMENT_SLOTS } from "../data/itemsDatabase"

export class EquipmentService {
  static canEquipItem(item: Item, slot: string): boolean {
    const equipmentSlot = EQUIPMENT_SLOTS.find(s => s.name === slot)
    if (!equipmentSlot) return false
    
    return equipmentSlot.allowedTypes.includes(item.type)
  }

  static equipItem(member: PartyMember, item: Item, slot: string): { success: boolean, message: string, unequippedItem?: Item } {
    if (!this.canEquipItem(item, slot)) {
      return { success: false, message: `Cannot equip ${item.name} in ${slot} slot` }
    }

    // Check if slot is occupied
    const currentItem = (member.equipment as any)[slot]
    let unequippedItem: Item | undefined

    if (currentItem) {
      // Unequip current item
      unequippedItem = currentItem
      member.inventory.push(currentItem)
    }

    // Equip new item
    (member.equipment as any)[slot] = item
    
    // Remove from inventory
    const itemIndex = member.inventory.findIndex(i => i.name === item.name)
    if (itemIndex !== -1) {
      member.inventory.splice(itemIndex, 1)
    }

    // Recalculate stats
    this.updateMemberStats(member)

    return { 
      success: true, 
      message: `Equipped ${item.name}`, 
      unequippedItem 
    }
  }

  static unequipItem(member: PartyMember, slot: string): { success: boolean, message: string, item?: Item } {
    const item = (member.equipment as any)[slot]
    
    if (!item) {
      return { success: false, message: `No item equipped in ${slot} slot` }
    }

    // Remove from equipment
    (member.equipment as any)[slot] = undefined
    
    // Add to inventory
    member.inventory.push(item)

    // Recalculate stats
    this.updateMemberStats(member)

    return { success: true, message: `Unequipped ${item.name}`, item }
  }

  static calculateArmorClass(member: PartyMember): number {
    let baseAC = 10 + this.getStatModifier(member.stats.DEX)
    let armorBonus = 0
    let shieldBonus = 0
    let naturalBonus = 0
    let deflectionBonus = 0

    // Check armor
    if (member.equipment.body) {
      armorBonus = member.equipment.body.defense || 0
      // Heavy armor might limit DEX bonus
      if (member.equipment.body.type === "armor" && armorBonus >= 6) {
        baseAC = 10 // Heavy armor ignores DEX
      }
    }

    // Check shield
    if (member.equipment.offHand?.type === "shield") {
      shieldBonus = member.equipment.offHand.defense || 0
    }

    // Check other equipment for AC bonuses
    Object.values(member.equipment).forEach(item => {
      if (item && item.defense && item.type !== "armor" && item.type !== "shield") {
        if (item.effect?.includes("natural")) {
          naturalBonus += item.defense
        } else {
          deflectionBonus += item.defense
        }
      }
    })

    return baseAC + armorBonus + shieldBonus + naturalBonus + deflectionBonus
  }

  static updateMemberStats(member: PartyMember): void {
    // Reset stats to base
    member.stats = { ...member.baseStats }

    // Apply equipment bonuses
    Object.values(member.equipment).forEach(item => {
      if (item?.statBonus) {
        Object.entries(item.statBonus).forEach(([stat, bonus]) => {
          if (bonus) {
            (member.stats as any)[stat] += bonus
          }
        })
      }
    })

    // Recalculate AC
    member.armorClass = this.calculateArmorClass(member)

    // Recalculate max HP based on CON
    const conBonus = this.getStatModifier(member.stats.CON)
    const baseHP = member.level * 8 // Assuming d8 hit die
    const newMaxHP = baseHP + (conBonus * member.level)
    
    // Adjust current HP proportionally if max HP changed
    if (newMaxHP !== member.maxHp) {
      const hpRatio = member.hp / member.maxHp
      member.maxHp = newMaxHP
      member.hp = Math.floor(newMaxHP * hpRatio)
    }
  }

  static getStatModifier(statValue: number): number {
    return Math.floor((statValue - 10) / 2)
  }

  static getEquippedItemsDescription(member: PartyMember): string {
    const descriptions: string[] = []
    
    Object.entries(member.equipment).forEach(([slot, item]) => {
      if (item) {
        descriptions.push(`${slot}: ${item.name}`)
      }
    })

    return descriptions.join(", ") || "No equipment"
  }

  static getTotalEquipmentValue(member: PartyMember): number {
    return Object.values(member.equipment).reduce((total, item) => {
      return total + (item?.value || 0)
    }, 0)
  }

  static getEquipmentWeight(member: PartyMember): number {
    return Object.values(member.equipment).reduce((total, item) => {
      return total + (item?.weight || 0)
    }, 0)
  }
}
