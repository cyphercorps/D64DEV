
import { PartyMember, Enemy, CombatTurn, Party } from "../types/game"
import { rollDice } from "../utils/dice"
import { calculateStatModifier } from "../utils/gameUtils"
import { generateAICombatNarrative } from "../actions"

export interface NPCBehavior {
  id: string
  name: string
  aggression: number // 0-10, how likely to attack
  intelligence: number // 0-10, how smart their decisions are
  teamwork: number // 0-10, how much they coordinate with allies
  survival: number // 0-10, how likely to flee or defend when low HP
  preferredActions: string[]
  targetPriority: "weakest" | "strongest" | "random" | "healer" | "caster"
}

export interface EnemyAI extends NPCBehavior {
  combatPatterns: {
    openingMove?: string
    lowHealthThreshold: number
    lowHealthAction: "flee" | "berserk" | "defensive"
    specialAbilities?: string[]
  }
}

export class NPCService {
  private static enemyBehaviors: Map<string, EnemyAI> = new Map()

  static registerEnemyBehavior(enemyType: string, behavior: EnemyAI): void {
    this.enemyBehaviors.set(enemyType, behavior)
  }

  static getEnemyBehavior(enemyType: string): EnemyAI | null {
    return this.enemyBehaviors.get(enemyType) || null
  }

  static initializeDefaultBehaviors(): void {
    // Goblin behavior
    this.registerEnemyBehavior("goblin", {
      id: "goblin",
      name: "Goblin",
      aggression: 7,
      intelligence: 4,
      teamwork: 6,
      survival: 8,
      preferredActions: ["attack", "flee"],
      targetPriority: "weakest",
      combatPatterns: {
        openingMove: "attack",
        lowHealthThreshold: 0.3,
        lowHealthAction: "flee"
      }
    })

    // Orc behavior
    this.registerEnemyBehavior("orc", {
      id: "orc",
      name: "Orc",
      aggression: 9,
      intelligence: 3,
      teamwork: 4,
      survival: 5,
      preferredActions: ["attack", "berserk"],
      targetPriority: "strongest",
      combatPatterns: {
        openingMove: "attack",
        lowHealthThreshold: 0.2,
        lowHealthAction: "berserk"
      }
    })

    // Skeleton behavior
    this.registerEnemyBehavior("skeleton", {
      id: "skeleton",
      name: "Skeleton",
      aggression: 6,
      intelligence: 2,
      teamwork: 8,
      survival: 2,
      preferredActions: ["attack", "defend"],
      targetPriority: "random",
      combatPatterns: {
        openingMove: "attack",
        lowHealthThreshold: 0.1,
        lowHealthAction: "defensive"
      }
    })

    // Wizard behavior
    this.registerEnemyBehavior("wizard", {
      id: "wizard",
      name: "Wizard",
      aggression: 5,
      intelligence: 9,
      teamwork: 7,
      survival: 9,
      preferredActions: ["cast_spell", "defend"],
      targetPriority: "caster",
      combatPatterns: {
        openingMove: "cast_spell",
        lowHealthThreshold: 0.4,
        lowHealthAction: "defensive",
        specialAbilities: ["fireball", "shield", "teleport"]
      }
    })
  }

  static determineEnemyAction(
    enemy: Enemy,
    party: Party,
    turnCount: number,
    addLogEntry: (text: string, type?: string) => void
  ): { action: string; target?: PartyMember; damage?: number } {
    // Get enemy type from name (simplified)
    const enemyType = enemy.name.toLowerCase().split(' ')[0]
    const behavior = this.getEnemyBehavior(enemyType)
    
    if (!behavior) {
      return this.defaultEnemyAction(enemy, party, addLogEntry)
    }

    const aliveMembersInParty = party.members.filter(m => m.hp > 0)
    if (aliveMembersInParty.length === 0) {
      return { action: "wait" }
    }

    // Check if enemy should flee or go defensive
    const healthPercentage = enemy.hp / enemy.maxHp
    if (healthPercentage <= behavior.combatPatterns.lowHealthThreshold) {
      return this.handleLowHealthBehavior(enemy, behavior, party, addLogEntry)
    }

    // Determine target based on behavior
    const target = this.selectTarget(aliveMembersInParty, behavior.targetPriority)
    
    // Choose action based on behavior and intelligence
    const action = this.chooseAction(enemy, behavior, turnCount, target)
    
    return this.executeEnemyAction(enemy, action, target, addLogEntry)
  }

  private static handleLowHealthBehavior(
    enemy: Enemy,
    behavior: EnemyAI,
    party: Party,
    addLogEntry: (text: string, type?: string) => void
  ): { action: string; target?: PartyMember; damage?: number } {
    switch (behavior.combatPatterns.lowHealthAction) {
      case "flee":
        addLogEntry(`The ${enemy.name} attempts to flee!`, "combat")
        // 50% chance to actually escape
        if (Math.random() < 0.5) {
          addLogEntry(`The ${enemy.name} escapes into the shadows!`, "narrative")
          return { action: "flee" }
        } else {
          addLogEntry(`The ${enemy.name} fails to escape!`, "combat")
          return this.defaultEnemyAction(enemy, party, addLogEntry)
        }
        
      case "berserk":
        addLogEntry(`The ${enemy.name} enters a berserker rage!`, "combat")
        const target = this.selectTarget(party.members.filter(m => m.hp > 0), "random")
        return this.executeEnemyAction(enemy, "berserk_attack", target, addLogEntry)
        
      case "defensive":
        addLogEntry(`The ${enemy.name} takes a defensive stance!`, "combat")
        return { action: "defend" }
        
      default:
        return this.defaultEnemyAction(enemy, party, addLogEntry)
    }
  }

  private static selectTarget(aliveMembersInParty: PartyMember[], priority: string): PartyMember {
    switch (priority) {
      case "weakest":
        return aliveMembersInParty.reduce((weakest, current) => 
          current.hp < weakest.hp ? current : weakest
        )
        
      case "strongest":
        return aliveMembersInParty.reduce((strongest, current) => 
          current.hp > strongest.hp ? current : strongest
        )
        
      case "healer":
        const healer = aliveMembersInParty.find(m => 
          m.class.toLowerCase().includes("cleric") || 
          m.class.toLowerCase().includes("priest") ||
          m.inventory.some(item => item.healing)
        )
        return healer || aliveMembersInParty[Math.floor(Math.random() * aliveMembersInParty.length)]
        
      case "caster":
        const caster = aliveMembersInParty.find(m => 
          m.class.toLowerCase().includes("wizard") || 
          m.class.toLowerCase().includes("mage") ||
          m.stats.INT > 14
        )
        return caster || aliveMembersInParty[Math.floor(Math.random() * aliveMembersInParty.length)]
        
      case "random":
      default:
        return aliveMembersInParty[Math.floor(Math.random() * aliveMembersInParty.length)]
    }
  }

  private static chooseAction(
    enemy: Enemy,
    behavior: EnemyAI,
    turnCount: number,
    target: PartyMember
  ): string {
    // Opening move
    if (turnCount === 1 && behavior.combatPatterns.openingMove) {
      return behavior.combatPatterns.openingMove
    }

    // Intelligence-based decision making
    const intelligenceRoll = rollDice() + behavior.intelligence
    
    if (intelligenceRoll >= 15 && behavior.combatPatterns.specialAbilities) {
      const specialAbility = behavior.combatPatterns.specialAbilities[
        Math.floor(Math.random() * behavior.combatPatterns.specialAbilities.length)
      ]
      return specialAbility
    }

    // Default to preferred actions
    const preferredAction = behavior.preferredActions[
      Math.floor(Math.random() * behavior.preferredActions.length)
    ]
    
    return preferredAction
  }

  private static executeEnemyAction(
    enemy: Enemy,
    action: string,
    target: PartyMember,
    addLogEntry: (text: string, type?: string) => void
  ): { action: string; target?: PartyMember; damage?: number } {
    switch (action) {
      case "berserk_attack":
        const berserkDamage = this.calculateAttackDamage(enemy, target, 1.5) // 50% damage bonus
        addLogEntry(`The ${enemy.name}'s berserk attack deals devastating damage!`, "combat")
        return { action: "attack", target, damage: berserkDamage }
        
      case "cast_spell":
        const spellDamage = this.calculateSpellDamage(enemy, target)
        addLogEntry(`The ${enemy.name} casts a spell at ${target.name}!`, "combat")
        return { action: "spell", target, damage: spellDamage }
        
      case "defend":
        return { action: "defend" }
        
      case "flee":
        return { action: "flee" }
        
      case "attack":
      default:
        const damage = this.calculateAttackDamage(enemy, target)
        return { action: "attack", target, damage }
    }
  }

  private static calculateAttackDamage(enemy: Enemy, target: PartyMember, modifier: number = 1): number {
    const enemyAttackRoll = rollDice() + enemy.attack
    const playerDefense = 10 + calculateStatModifier(target.stats.DEX)

    if (enemyAttackRoll >= playerDefense) {
      const baseDamage = rollDice(6) + Math.floor(enemy.attack / 2)
      return Math.floor(baseDamage * modifier)
    }
    
    return 0
  }

  private static calculateSpellDamage(enemy: Enemy, target: PartyMember): number {
    const spellAttackRoll = rollDice() + Math.floor(enemy.attack / 2) + 2
    const playerDefense = 10 + calculateStatModifier(target.stats.WIS)

    if (spellAttackRoll >= playerDefense) {
      return rollDice(8) + 2 // Magic damage is typically higher but less reliable
    }
    
    return 0
  }

  private static defaultEnemyAction(
    enemy: Enemy,
    party: Party,
    addLogEntry: (text: string, type?: string) => void
  ): { action: string; target?: PartyMember; damage?: number } {
    const aliveMembersInParty = party.members.filter(m => m.hp > 0)
    const randomTarget = aliveMembersInParty[Math.floor(Math.random() * aliveMembersInParty.length)]
    const damage = this.calculateAttackDamage(enemy, randomTarget)
    
    return { action: "attack", target: randomTarget, damage }
  }

  // Ally NPC behavior for party members
  static executeAllyAI(
    member: PartyMember,
    enemy: Enemy,
    party: Party,
    addLogEntry: (text: string, type?: string) => void
  ): CombatTurn {
    let action: CombatTurn["action"] = "attack"
    let target = "enemy"

    // Enhanced AI based on member's combat AI setting
    switch (member.combatAI) {
      case "support":
        const criticallyInjured = party.members.find(m => m.hp < m.maxHp * 0.25 && m.hp > 0)
        const injured = party.members.find(m => m.hp < m.maxHp * 0.5 && m.hp > 0)
        const healingItem = member.inventory.find(item => item.healing)
        
        if (criticallyInjured && healingItem) {
          action = "use_item"
          target = criticallyInjured.id
          addLogEntry(`${member.name} rushes to help ${criticallyInjured.name}!`, "combat")
        } else if (injured && healingItem) {
          action = "use_item"
          target = injured.id
          addLogEntry(`${member.name} assists ${injured.name}!`, "combat")
        } else {
          addLogEntry(`${member.name} looks for someone to help but finds none in immediate danger.`, "combat")
        }
        break

      case "defensive":
        if (member.hp < member.maxHp * 0.4) {
          action = "defend"
          addLogEntry(`${member.name} takes a cautious defensive stance.`, "combat")
        } else {
          addLogEntry(`${member.name} attacks while maintaining guard.`, "combat")
        }
        break

      case "aggressive":
        action = "attack"
        addLogEntry(`${member.name} charges forward aggressively!`, "combat")
        break

      case "balanced":
        if (member.hp < member.maxHp * 0.3) {
          action = "defend"
          addLogEntry(`${member.name} prioritizes survival.`, "combat")
        } else if (party.members.some(m => m.hp < m.maxHp * 0.25)) {
          const healingItem = member.inventory.find(item => item.healing)
          if (healingItem) {
            action = "use_item"
            target = party.members.find(m => m.hp < m.maxHp * 0.25)?.id || "enemy"
            addLogEntry(`${member.name} balances offense with care for allies.`, "combat")
          }
        } else {
          addLogEntry(`${member.name} takes a measured approach.`, "combat")
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

// Initialize default behaviors
NPCService.initializeDefaultBehaviors()
