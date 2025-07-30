
import { PartyMember, Enemy, CombatTurn, Party } from "../types/game"
import { rollDice } from "../utils/dice"
import { calculateStatModifier } from "../utils/gameUtils"
import { generateAICombatNarrative } from "../actions"
import { NPCService } from "./npcService"

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

  static executeEnemyTurn(
    enemy: Enemy,
    party: Party,
    turnCount: number,
    addLogEntry: (text: string, type?: string) => void
  ): { damage: number; hit: boolean; target?: PartyMember; action: string } {
    const enemyAction = NPCService.determineEnemyAction(enemy, party, turnCount, addLogEntry)
    
    if (enemyAction.action === "flee") {
      return { damage: 0, hit: false, action: "flee" }
    }
    
    if (enemyAction.action === "defend") {
      addLogEntry(`The ${enemy.name} takes a defensive stance!`, "combat")
      return { damage: 0, hit: false, action: "defend" }
    }
    
    if (!enemyAction.target) {
      addLogEntry(`The ${enemy.name} looks around confused!`, "combat")
      return { damage: 0, hit: false, action: "wait" }
    }
    
    const damage = enemyAction.damage || 0
    
    if (damage > 0) {
      addLogEntry(`The ${enemy.name} hits ${enemyAction.target.name} for ${damage} damage!`, "combat")
      return { damage, hit: true, target: enemyAction.target, action: enemyAction.action }
    } else {
      addLogEntry(`The ${enemy.name} misses ${enemyAction.target.name}!`, "combat")
      return { damage: 0, hit: false, target: enemyAction.target, action: enemyAction.action }
    }
  }

  // Keep the old method for backwards compatibility but mark as deprecated
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

  static executePartyMemberAI(
    member: PartyMember, 
    enemy: Enemy, 
    party: Party,
    addLogEntry: (text: string, type?: string) => void
  ): CombatTurn {
    return NPCService.executeAllyAI(member, enemy, party, addLogEntry)
  }
}
