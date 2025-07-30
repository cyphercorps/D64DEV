
import { PartyMember, Enemy, CombatTurn } from "../types/game"
import { rollDice } from "../utils/dice"
import { calculateStatModifier } from "../utils/gameUtils"
import { generateAICombatNarrative } from "../actions"

export class CombatService {
  static initiateCombat(party: { formation: string[] }, enemy: Enemy): string[] {
    return [...party.formation, "enemy"]
  }

  static async executeAttack(
    attacker: PartyMember,
    enemy: Enemy,
    addLogEntry: (text: string, type?: string) => void
  ): Promise<{ combatEnded: boolean; enemyHp: number }> {
    const attackRoll = rollDice() + calculateStatModifier(attacker.stats.STR)
    addLogEntry(`${attacker.name} rolled ${attackRoll} to attack.`, "dice")

    const hit = attackRoll >= 10 + enemy.defense
    let damage = 0
    let critical = false

    if (hit) {
      const weapon = attacker.inventory.find((item) => item.type === "weapon")
      const baseDamage = weapon?.damage || 4
      damage = rollDice(baseDamage) + calculateStatModifier(attacker.stats.STR)
      critical = attackRoll >= 20

      if (critical) {
        damage *= 2
        addLogEntry("Critical hit!", "combat")
      }

      try {
        const combatNarrative = await generateAICombatNarrative("player attack", attacker, enemy, {
          hit,
          damage,
          critical,
        })
        addLogEntry(combatNarrative, "ai")
      } catch (error) {
        addLogEntry(`${attacker.name}'s strike finds its mark for ${damage} damage!`, "combat")
      }

      const newEnemyHp = Math.max(0, enemy.hp - damage)
      
      if (newEnemyHp <= 0) {
        addLogEntry(`The ${enemy.name} is defeated!`, "combat")
        addLogEntry("Victory belongs to your party!", "narrative")
        return { combatEnded: true, enemyHp: newEnemyHp }
      }

      return { combatEnded: false, enemyHp: newEnemyHp }
    } else {
      addLogEntry(`${attacker.name}'s attack misses!`, "combat")
      return { combatEnded: false, enemyHp: enemy.hp }
    }
  }

  static executeEnemyAttack(
    enemy: Enemy,
    target: PartyMember,
    addLogEntry: (text: string, type?: string) => void
  ): { damage: number; hit: boolean } {
    const enemyAttackRoll = rollDice() + enemy.attack
    const playerDefense = 10 + calculateStatModifier(target.stats.DEX)

    if (enemyAttackRoll >= playerDefense) {
      const enemyDamage = rollDice(6) + Math.floor(enemy.attack / 2)
      addLogEntry(`The ${enemy.name} hits ${target.name} for ${enemyDamage} damage!`, "combat")
      return { damage: enemyDamage, hit: true }
    } else {
      addLogEntry(`The ${enemy.name} misses ${target.name}!`, "combat")
      return { damage: 0, hit: false }
    }
  }

  static executePartyMemberAI(member: PartyMember, enemy: Enemy, party: { members: PartyMember[] }): CombatTurn {
    let action: CombatTurn["action"] = "attack"
    let target = "enemy"

    switch (member.combatAI) {
      case "support":
        const injuredMember = party.members.find((m) => m.hp < m.maxHp * 0.5)
        if (injuredMember && member.inventory.some((item) => item.healing)) {
          action = "use_item"
          target = injuredMember.id
        }
        break

      case "defensive":
        if (member.hp < member.maxHp * 0.3) {
          action = "defend"
        }
        break

      case "aggressive":
        action = "attack"
        break

      case "balanced":
        if (member.hp < member.maxHp * 0.2) {
          action = "defend"
        } else if (party.members.some((m) => m.hp < m.maxHp * 0.3)) {
          const healingItem = member.inventory.find((item) => item.healing)
          if (healingItem) {
            action = "use_item"
            target = party.members.find((m) => m.hp < m.maxHp * 0.3)?.id || "enemy"
          }
        }
        break
    }

    return {
      memberId: member.id,
      action,
      target,
    }
  }
}
