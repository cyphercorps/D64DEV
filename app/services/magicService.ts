
import { PartyMember, Spell, SpellSlot } from "../types/game"
import { getSpell, getSpellsByClass } from "../data/spellsDatabase"

export class MagicService {
  static canCastSpell(caster: PartyMember, spellName: string): { canCast: boolean, reason?: string } {
    const spell = getSpell(spellName)
    if (!spell) return { canCast: false, reason: "Spell not found" }

    // Check if class can cast this spell
    if (!spell.classes.includes(caster.class)) {
      return { canCast: false, reason: "Class cannot cast this spell" }
    }

    // Check if caster knows the spell
    if (!caster.knownSpells.includes(spellName)) {
      return { canCast: false, reason: "Spell not known" }
    }

    // Check spell slot availability (cantrips don't need slots)
    if (spell.level > 0) {
      const availableSlot = caster.spellSlots.find(slot => 
        slot.level >= spell.level && slot.used < slot.total
      )
      if (!availableSlot) {
        return { canCast: false, reason: "No spell slots available" }
      }
    }

    return { canCast: true }
  }

  static castSpell(caster: PartyMember, spellName: string, target?: PartyMember): {
    success: boolean,
    message: string,
    damage?: number,
    healing?: number,
    effect?: string
  } {
    const canCast = this.canCastSpell(caster, spellName)
    if (!canCast.canCast) {
      return { success: false, message: canCast.reason || "Cannot cast spell" }
    }

    const spell = getSpell(spellName)!

    // Use spell slot if not a cantrip
    if (spell.level > 0) {
      const slotToUse = caster.spellSlots.find(slot => 
        slot.level >= spell.level && slot.used < slot.total
      )
      if (slotToUse) {
        slotToUse.used++
      }
    }

    // Calculate spell effects
    let damage = 0
    let healing = 0
    let message = `${caster.name} casts ${spell.name}!`

    if (spell.damage) {
      damage = this.rollDamage(spell.damage)
      message += ` Deals ${damage} damage.`
    }

    if (spell.healing) {
      healing = this.rollHealing(spell.healing)
      message += ` Heals ${healing} HP.`
      if (target) {
        target.hp = Math.min(target.maxHp, target.hp + healing)
      }
    }

    if (spell.effect) {
      message += ` ${spell.effect}`
    }

    return {
      success: true,
      message,
      damage,
      healing,
      effect: spell.effect
    }
  }

  static rollDamage(damageString: string): number {
    // Simple damage calculation - in real implementation you'd parse dice notation
    if (damageString.includes("d4")) {
      const count = parseInt(damageString.split("d")[0]) || 1
      const bonus = damageString.includes("+") ? parseInt(damageString.split("+")[1]) || 0 : 0
      return this.rollDice(count, 4) + bonus
    } else if (damageString.includes("d6")) {
      const count = parseInt(damageString.split("d")[0]) || 1
      const bonus = damageString.includes("+") ? parseInt(damageString.split("+")[1]) || 0 : 0
      return this.rollDice(count, 6) + bonus
    } else if (damageString.includes("d8")) {
      const count = parseInt(damageString.split("d")[0]) || 1
      const bonus = damageString.includes("+") ? parseInt(damageString.split("+")[1]) || 0 : 0
      return this.rollDice(count, 8) + bonus
    } else if (damageString.includes("d10")) {
      const count = parseInt(damageString.split("d")[0]) || 1
      const bonus = damageString.includes("+") ? parseInt(damageString.split("+")[1]) || 0 : 0
      return this.rollDice(count, 10) + bonus
    }
    return 8 // Default damage
  }

  static rollHealing(healingString: string): number {
    // Similar to damage calculation
    if (healingString.includes("d8")) {
      const count = parseInt(healingString.split("d")[0]) || 1
      const bonus = healingString.includes("+") ? parseInt(healingString.split("+")[1]) || 0 : 0
      return this.rollDice(count, 8) + bonus
    }
    return 8 // Default healing
  }

  static rollDice(count: number, sides: number): number {
    let total = 0
    for (let i = 0; i < count; i++) {
      total += Math.floor(Math.random() * sides) + 1
    }
    return total
  }

  static restoreSpellSlots(caster: PartyMember, amount: number = 1): void {
    // Restore lowest level slots first
    caster.spellSlots.forEach(slot => {
      if (amount > 0 && slot.used > 0) {
        const restore = Math.min(amount, slot.used)
        slot.used -= restore
        amount -= restore
      }
    })
  }

  static longRest(caster: PartyMember): void {
    // Restore all spell slots
    caster.spellSlots.forEach(slot => {
      slot.used = 0
    })
  }

  static getAvailableSpells(caster: PartyMember): Spell[] {
    const classSpells = getSpellsByClass(caster.class)
    return classSpells.filter(spell => caster.knownSpells.includes(spell.name))
  }

  static learnSpell(caster: PartyMember, spellName: string): boolean {
    const spell = getSpell(spellName)
    if (!spell) return false

    if (!spell.classes.includes(caster.class)) return false

    if (caster.knownSpells.includes(spellName)) return false

    caster.knownSpells.push(spellName)
    return true
  }
}
