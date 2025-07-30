"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useGameState } from "./hooks/useGameState"
import { DungeonService } from "./services/dungeonService"
import { CombatService } from "./services/combatService"
import { NPCService } from "./services/npcService"
import { calculateBaseHp } from "./utils/gameUtils"
import { LOOT_ITEMS, RECRUITABLE_NPCS } from "./data/gameData"
import CharacterCreation from "./components/CharacterCreation"
import PartyPanel from "./components/PartyPanel"
import InventoryPanel from "./components/InventoryPanel"
import { PartyMember, Party, Room, CombatTurn } from "./types/game"

export default function Dungeon64() {
  const {
    gamePhase,
    party,
    activePartyMember,
    dungeon,
    currentEnemy,
    log,
    isProcessing,
    aiAvailable,
    combatTurnOrder,
    currentTurnIndex,
    setGamePhase,
    setParty,
    setActivePartyMember,
    setDungeon,
    setCurrentEnemy,
    setIsProcessing,
    setCombatTurnOrder,
    setCurrentTurnIndex,
    addLogEntry,
    getPartyMember,
    getPlayerMember,
    updatePartyMember,
    addPartyMember,
    resetGame,
  } = useGameState()

  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [log])

  // Auto-execute enemy turns
  useEffect(() => {
    if (gamePhase === "combat" && currentEnemy && currentEnemy.hp > 0 && 
        combatTurnOrder.length > 0 && combatTurnOrder[currentTurnIndex] === "enemy" && 
        !isProcessing) {

      const executeEnemyTurn = async () => {
        if (!party) return

        setIsProcessing(true)

        // Check if party is already dead before enemy acts
        const aliveMembersInParty = party.members.filter(m => m.hp > 0)
        if (aliveMembersInParty.length === 0) {
          setGamePhase("death")
          setIsProcessing(false)
          return
        }

        // Small delay for dramatic effect
        await new Promise(resolve => setTimeout(resolve, 1500))

        const randomTarget = aliveMembersInParty[Math.floor(Math.random() * aliveMembersInParty.length)]

        // Use the new NPC service for intelligent enemy behavior
        const enemyResult = CombatService.executeEnemyTurn(
          currentEnemy, 
          party, 
          currentTurnIndex + 1, 
          addLogEntry
        )

        if (enemyResult.action === "flee") {
          addLogEntry(`The ${currentEnemy.name} has fled the battle!`, "narrative")
          setCurrentEnemy(null)
          setCombatTurnOrder([])
          setCurrentTurnIndex(0)
          setGamePhase("dungeon")
          setIsProcessing(false)
          return
        }

        if (enemyResult.hit && enemyResult.target && enemyResult.damage > 0) {
          const newHp = Math.max(0, enemyResult.target.hp - enemyResult.damage)
          updatePartyMember(enemyResult.target.id, { hp: newHp })

          if (newHp <= 0) {
            addLogEntry(`${enemyResult.target.name} has fallen!`, "death")

            // Check if all party members are dead after this damage
            const remainingAliveMembers = party.members.filter(m => 
              m.id === enemyResult.target.id ? newHp > 0 : m.hp > 0
            )
            
            if (remainingAliveMembers.length === 0) {
              addLogEntry("Your party has been defeated...", "death")
              setGamePhase("death")
              setIsProcessing(false)
              return
            }
          }
        }

        // Move to next turn
        setCurrentTurnIndex((prev) => (prev + 1) % combatTurnOrder.length)
        setIsProcessing(false)
      }

      executeEnemyTurn()
    }
  }, [gamePhase, currentEnemy, combatTurnOrder, currentTurnIndex, isProcessing, party, updatePartyMember, addLogEntry])

  // Check for party death at the start of each turn
  useEffect(() => {
    if (gamePhase === "combat" && party) {
      const aliveMembersInParty = party.members.filter(m => m.hp > 0)
      if (aliveMembersInParty.length === 0) {
        setGamePhase("death")
      }
    }
  }, [gamePhase, party, combatTurnOrder, currentTurnIndex])

  const handleCreateCharacter = async (characterData: any) => {
    const { rolledStats, selectedClass, characterName, selectedBackground, characterPortrait, classData, backgroundData } = characterData

    const baseStats = {
      STR: rolledStats.STR + (classData.bonuses.STR || 0),
      DEX: rolledStats.DEX + (classData.bonuses.DEX || 0),
      CON: rolledStats.CON + (classData.bonuses.CON || 0),
      INT: rolledStats.INT + (classData.bonuses.INT || 0),
      WIS: rolledStats.WIS + (classData.bonuses.WIS || 0),
      CHA: rolledStats.CHA + (classData.bonuses.CHA || 0),
    }

    const playerMember: PartyMember = {
      id: "player",
      name: characterName,
      class: selectedClass,
      level: 1,
      hp: 20 + Math.floor((baseStats.CON - 10) / 2),
      maxHp: 20 + Math.floor((baseStats.CON - 10) / 2),
      xp: 0,
      xpToNext: 100,
      stats: { ...baseStats },
      baseStats: { ...baseStats },
      inventory: [
        ...classData.startingItems.map((item: any) => ({ ...item })),
        ...backgroundData.bonuses.items.map((itemName: string) => {
          const baseItem = LOOT_ITEMS.find((item) => item.name === itemName) || {
            name: itemName,
            type: "tool" as const,
            value: 10,
            effect: "Background item",
          }
          return { ...baseItem }
        }),
      ],
      equipment: {
        mainHand: undefined,
        offHand: undefined,
        head: undefined,
        body: undefined,
        legs: undefined,
        feet: undefined,
        ring1: undefined,
        ring2: undefined,
        neck: undefined,
        cloak: undefined,
      },
      armorClass: 10 + Math.floor((baseStats.DEX - 10) / 2),
      spellSlots: selectedClass === "Mage" || selectedClass === "Cleric" ? 
        [{ level: 1, total: 2, used: 0 }] : [],
      knownSpells: selectedClass === "Mage" ? 
        ["Light", "Mage Hand", "Magic Missile", "Shield"] : 
        selectedClass === "Cleric" ? 
        ["Light", "Sacred Flame", "Cure Light Wounds", "Bless"] : [],
      tags: [...classData.tags, ...backgroundData.tags],
      statusEffects: [],
      personalityTraits: [...classData.traits, ...backgroundData.traits],
      isPlayer: true,
      loyalty: 100,
      relationships: {},
      combatAI: "balanced",
      portrait: characterPortrait,
      joinedAt: Date.now(),
      backstory: backgroundData.startingLore,
      storyEvents: [`Born as ${selectedClass}`, `Background: ${selectedBackground}`],
    }

    // Add random symbolic tag
    const symbolicTags = ["Cursed", "Blessed", "Witness", "Marked", "Chosen", "Forsaken", "Haunted"]
    playerMember.tags.push(symbolicTags[Math.floor(Math.random() * symbolicTags.length)])

    const newParty: Party = {
      members: [playerMember],
      sharedGold: 100 + (backgroundData.bonuses.gold || 0),
      sharedInventory: [],
      formation: ["player"],
      morale: 75,
      reputation: 0,
    }

    setParty(newParty)
    setActivePartyMember("player")

    const newDungeon = await DungeonService.generateDungeon(newParty)
    setDungeon(newDungeon)
    setGamePhase("dungeon")

    addLogEntry(`${playerMember.name} the ${playerMember.class} enters the dungeon...`, "narrative")
    addLogEntry(backgroundData.startingLore, "ai")
    addLogEntry("The narrator awakens, ready to weave your tale...", "ai")
  }

  const transferItemToShared = (fromMemberId: string, itemIndex: number) => {
    if (!party) return

    const member = party.members.find(m => m.id === fromMemberId)
    if (!member || itemIndex >= member.inventory.length) return

    const item = member.inventory[itemIndex]

    // Remove from member inventory
    updatePartyMember(fromMemberId, {
      inventory: member.inventory.filter((_, index) => index !== itemIndex)
    })

    // Add to shared inventory
    setParty(prev => ({
      ...prev!,
      sharedInventory: [...prev!.sharedInventory, item]
    }))

    addLogEntry(`${member.name} moved ${item.name} to shared inventory.`, "system")
  }

  const transferItemFromShared = (toMemberId: string, itemIndex: number) => {
    if (!party || itemIndex >= party.sharedInventory.length) return

    const member = party.members.find(m => m.id === toMemberId)
    if (!member) return

    const item = party.sharedInventory[itemIndex]

    // Remove from shared inventory
    setParty(prev => ({
      ...prev!,
      sharedInventory: prev!.sharedInventory.filter((_, index) => index !== itemIndex)
    }))

    // Add to member inventory
    updatePartyMember(toMemberId, {
      inventory: [...member.inventory, item]
    })

    addLogEntry(`${member.name} took ${item.name} from shared inventory.`, "system")
  }

  const useItem = (memberId: string, itemIndex: number, isSharedItem: boolean = false) => {
    if (!party) return

    const member = party.members.find(m => m.id === memberId)
    if (!member) return

    let item: any
    let sourceInventory: any[]

    if (isSharedItem) {
      if (itemIndex >= party.sharedInventory.length) return
      item = party.sharedInventory[itemIndex]
      sourceInventory = party.sharedInventory
    } else {
      if (itemIndex >= member.inventory.length) return
      item = member.inventory[itemIndex]
      sourceInventory = member.inventory
    }

    // Handle different item types
    if (item.name.includes("Ancient Tome") && (member.class === "Mage" || member.class === "Cleric")) {
      // Learn spell from ancient tome
      const spellToLearn = item.spell
      if (spellToLearn && !member.knownSpells.includes(spellToLearn)) {
        updatePartyMember(memberId, {
          knownSpells: [...member.knownSpells, spellToLearn]
        })
        addLogEntry(`${member.name} studies the ${item.name} and learns ${spellToLearn}!`, "system")
        
        // Remove item from inventory
        if (isSharedItem) {
          setParty(prev => ({
            ...prev!,
            sharedInventory: prev!.sharedInventory.filter((_, index) => index !== itemIndex)
          }))
        } else {
          updatePartyMember(memberId, {
            inventory: member.inventory.filter((_, index) => index !== itemIndex)
          })
        }
      } else if (member.class !== "Mage" && member.class !== "Cleric") {
        addLogEntry(`${member.name} cannot comprehend the arcane text.`, "system")
        return
      } else {
        addLogEntry(`${member.name} already knows this spell.`, "system")
        return
      }
    } else if (item.healing) {
      // Apply healing
      const healAmount = item.healing
      const newHp = Math.min(member.maxHp, member.hp + healAmount)

      updatePartyMember(memberId, { hp: newHp })
      addLogEntry(`${member.name} uses ${item.name} and recovers ${healAmount} HP!`, "system")
      
      // Remove item from inventory
      if (isSharedItem) {
        setParty(prev => ({
          ...prev!,
          sharedInventory: prev!.sharedInventory.filter((_, index) => index !== itemIndex)
        }))
      } else {
        updatePartyMember(memberId, {
          inventory: member.inventory.filter((_, index) => index !== itemIndex)
        })
      }
    } else if (item.type === "consumable" && !item.name.includes("Ancient Tome")) {
      // Generic consumable effect
      if (item.effect) {
        addLogEntry(`${member.name} uses ${item.name}. ${item.effect}`, "system")
      }
      
      // Remove item from inventory
      if (isSharedItem) {
        setParty(prev => ({
          ...prev!,
          sharedInventory: prev!.sharedInventory.filter((_, index) => index !== itemIndex)
        }))
      } else {
        updatePartyMember(memberId, {
          inventory: member.inventory.filter((_, index) => index !== itemIndex)
        })
      }
    } else {
      addLogEntry(`${item.name} cannot be used directly.`, "system")
      return
    }

    // Update character story
    updatePartyMember(memberId, {
      storyEvents: [...member.storyEvents, `Used ${item.name}`]
    })
  }

  const handleRecruitment = (npcData: typeof RECRUITABLE_NPCS[0]) => {
    if (!party || party.sharedGold < npcData.recruitmentCost) {
      addLogEntry("You lack the gold to recruit this companion.", "system")
      return
    }

    if (party.reputation < npcData.loyaltyRequirement) {
      addLogEntry(`${npcData.name} doesn't trust you enough to join your party.`, "system")
      return
    }

    if (party.members.length >= 4) {
      addLogEntry("Your party is already full.", "system")
      return
    }

    const baseHp = calculateBaseHp(npcData.stats.CON)

    const newMember: PartyMember = {
      id: `npc_${Date.now()}`,
      name: npcData.name,
      class: npcData.class,
      level: 1,
      hp: baseHp,
      maxHp: baseHp,
      xp: 0,
      xpToNext: 100,
      stats: npcData.stats,
      inventory: [],
      tags: npcData.tags,
      statusEffects: [],
      personalityTraits: npcData.traits,
      isPlayer: false,
      loyalty: 60,
      relationships: {},
      combatAI: npcData.combatAI,
      portrait: npcData.portrait,
      joinedAt: Date.now(),
      backstory: npcData.backstory,
      storyEvents: [],
    }

    addPartyMember(newMember)

    setParty((prev) => ({
      ...prev!,
      sharedGold: prev!.sharedGold - npcData.recruitmentCost,
      morale: Math.min(100, prev!.morale + 10),
    }))

    addLogEntry(`${npcData.name} joins your party!`, "system")
    addLogEntry(`"${npcData.backstory}"`, "ai")
  }

  const handleMove = async (direction: string) => {
    if (!dungeon || !party) return

    const currentRoom = dungeon.rooms.get(dungeon.currentRoomId)!
    if (!currentRoom.exits.includes(direction)) {
      addLogEntry(`You cannot go ${direction} from here.`, "system")
      return
    }

    setIsProcessing(true)

    try {
      const newDepth =
        direction === "N" ? dungeon.depth + 1 : direction === "S" ? Math.max(1, dungeon.depth - 1) : dungeon.depth
      const newRoom = await DungeonService.generateRoom(newDepth, Math.floor(Math.random() * 1000), party)

      newRoom.explored = true
      dungeon.rooms.set(newRoom.id, newRoom)

      setDungeon((prev) => ({
        ...prev!,
        currentRoomId: newRoom.id,
        depth: newDepth,
      }))

      addLogEntry(`You move ${direction}...`, "system")
      addLogEntry(newRoom.description, "narrative")
      addLogEntry(newRoom.symbolicText, "ai")

      // Update character story
      party.members.forEach((member) => {
        updatePartyMember(member.id, {
          storyEvents: [...member.storyEvents, `Moved ${direction} to ${newRoom.roomType} at depth ${newDepth}`],
        })
      })

      if (newRoom.hasEnemy && newRoom.enemy) {
        addLogEntry(`A ${newRoom.enemy.name} blocks your party's path!`, "combat")
        addLogEntry(newRoom.enemy.symbolic, "ai")
        setCurrentEnemy({ ...newRoom.enemy })
        const turnOrder = CombatService.initiateCombat(party, newRoom.enemy)
        setCombatTurnOrder(turnOrder)
        setCurrentTurnIndex(0)
        setGamePhase("combat")
      }
    } catch (error) {
      console.error("Failed to generate room:", error)
      addLogEntry("The dungeon shifts strangely around you...", "narrative")
    }

    setIsProcessing(false)
  }

  const handleSearch = async () => {
    if (!dungeon || !party || isProcessing) return

    const currentRoom = dungeon.rooms.get(dungeon.currentRoomId)!
    setIsProcessing(true)

    addLogEntry("You search the room carefully...", "system")

    // Simulate search time
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check for loot
    if (currentRoom.hasLoot && currentRoom.loot && currentRoom.loot.length > 0) {
      const foundLoot = currentRoom.loot.splice(0, 1)[0] // Take one item

      // Add to party shared inventory
      setParty(prev => ({
        ...prev!,
        sharedInventory: [...prev!.sharedInventory, foundLoot]
      }))

      addLogEntry(`You found: ${foundLoot.name}!`, "system")
      addLogEntry(foundLoot.effect || "A mysterious item of unknown purpose.", "narrative")

      // If no more loot, mark as searched
      if (currentRoom.loot.length === 0) {
        currentRoom.hasLoot = false
      }
    } else if (currentRoom.hasTrap) {
      // Trap encounter
      const trapDamage = Math.floor(Math.random() * 6) + 1
      const playerMember = getPlayerMember()

      if (playerMember) {
        const newHp = Math.max(0, playerMember.hp - trapDamage)
        updatePartyMember(playerMember.id, { hp: newHp })

        addLogEntry(`You triggered a trap! ${playerMember.name} takes ${trapDamage} damage!`, "combat")

        if (newHp <= 0) {
          addLogEntry(`${playerMember.name} has fallen!`, "death")
          // Check if party is dead
          const aliveMember = party.members.find(m => m.hp > 0)
          if (!aliveMember) {
            setGamePhase("death")
          }
        }
      }

      currentRoom.hasTrap = false // Trap is now disarmed
    } else {
      // Nothing found
      const searchResults = [
        "You find nothing of interest.",
        "The shadows yield no secrets.",
        "Your search reveals only dust and echoes.",
        "The room holds no hidden treasures.",
        "You discover only the marks of those who came before."
      ]

      const randomResult = searchResults[Math.floor(Math.random() * searchResults.length)]
      addLogEntry(randomResult, "narrative")

      // Small chance to find gold
      if (Math.random() < 0.3) {
        const goldFound = Math.floor(Math.random() * 10) + 1
        setParty(prev => ({
          ...prev!,
          sharedGold: prev!.sharedGold + goldFound
        }))
        addLogEntry(`You found ${goldFound} gold pieces hidden in a crevice.`, "system")
      }
    }

    // Update character story
    party.members.forEach((member) => {
      updatePartyMember(member.id, {
        storyEvents: [...member.storyEvents, `Searched ${currentRoom.roomType} at depth ${dungeon.depth}`],
      })
    })

    setIsProcessing(false)
  }

  const getCurrentRoom = (): Room | undefined => {
    return dungeon?.rooms.get(dungeon.currentRoomId)
  }

  const handleCombatAction = async (action: string, target?: string, item?: any, spellName?: string) => {
    if (!currentEnemy || !party || isProcessing) return

    const currentMember = getPartyMember(combatTurnOrder[currentTurnIndex])
    if (!currentMember) return

    setIsProcessing(true)

    try {
      if (action === "attack") {
        const result = await CombatService.executeAttack(currentMember, currentEnemy, addLogEntry)

        if (result.combatEnded) {
          // Victory - award XP and loot
          const xpGained = currentEnemy.xpReward
          party.members.forEach((member) => {
            const newXp = member.xp + Math.floor(xpGained / party.members.length)
            const newLevel = Math.floor(newXp / 100) + 1

            updatePartyMember(member.id, {
              xp: newXp,
              level: newLevel,
              storyEvents: [...member.storyEvents, `Defeated ${currentEnemy.name} in combat`],
            })

            if (newLevel > member.level) {
              addLogEntry(`${member.name} reached level ${newLevel}!`, "level")
            }
          })

          // Add enemy loot to shared inventory
          if (currentEnemy.loot) {
            setParty(prev => ({
              ...prev!,
              sharedInventory: [...prev!.sharedInventory, ...currentEnemy.loot!]
            }))
            addLogEntry(`Found: ${currentEnemy.loot.map(item => item.name).join(", ")}`, "system")
          }

          setCurrentEnemy(null)
          setCombatTurnOrder([])
          setCurrentTurnIndex(0)
          setGamePhase("dungeon")
        } else {
          setCurrentEnemy(prev => ({ ...prev!, hp: result.enemyHp }))
          // Move to next turn
          setCurrentTurnIndex((prev) => (prev + 1) % combatTurnOrder.length)
        }
      } else if (action === "defend") {
        addLogEntry(`${currentMember.name} takes a defensive stance.`, "combat")
        // TODO: Add defense bonus logic
        setCurrentTurnIndex((prev) => (prev + 1) % combatTurnOrder.length)
      } else if (action === "cast_spell" && spellName) {
        const { MagicService } = await import("./services/magicService")
        const spellResult = MagicService.castSpell(currentMember, spellName, currentMember)
        
        if (spellResult.success) {
          addLogEntry(spellResult.message, "combat")
          
          // Update caster with used spell slot
          updatePartyMember(currentMember.id, {
            spellSlots: [...currentMember.spellSlots]
          })
          
          // Apply spell damage to enemy if applicable
          if (spellResult.damage && spellResult.damage > 0) {
            const newEnemyHp = Math.max(0, currentEnemy.hp - spellResult.damage)
            setCurrentEnemy(prev => ({ ...prev!, hp: newEnemyHp }))
            
            if (newEnemyHp <= 0) {
              addLogEntry(`The ${currentEnemy.name} is defeated by magic!`, "combat")
              addLogEntry("Victory belongs to your party!", "narrative")
              
              // Victory logic same as attack
              const xpGained = currentEnemy.xpReward
              party.members.forEach((member) => {
                const newXp = member.xp + Math.floor(xpGained / party.members.length)
                const newLevel = Math.floor(newXp / 100) + 1

                updatePartyMember(member.id, {
                  xp: newXp,
                  level: newLevel,
                  storyEvents: [...member.storyEvents, `Defeated ${currentEnemy.name} with magic`],
                })

                if (newLevel > member.level) {
                  addLogEntry(`${member.name} reached level ${newLevel}!`, "level")
                }
              })

              if (currentEnemy.loot) {
                setParty(prev => ({
                  ...prev!,
                  sharedInventory: [...prev!.sharedInventory, ...currentEnemy.loot!]
                }))
                addLogEntry(`Found: ${currentEnemy.loot.map(item => item.name).join(", ")}`, "system")
              }

              setCurrentEnemy(null)
              setCombatTurnOrder([])
              setCurrentTurnIndex(0)
              setGamePhase("dungeon")
              setIsProcessing(false)
              return
            }
          }
        } else {
          addLogEntry(spellResult.message, "system")
        }
        
        setCurrentTurnIndex((prev) => (prev + 1) % combatTurnOrder.length)
      } else if (action === "use_item" && item) {
        // Handle spell scrolls as spells
        if (item.type === "consumable" && item.spell) {
          const { MagicService } = await import("./services/magicService")
          const spellResult = MagicService.castSpell(currentMember, item.spell, currentMember)
          
          if (spellResult.success) {
            addLogEntry(`${currentMember.name} reads the ${item.name}!`, "system")
            addLogEntry(spellResult.message, "combat")
            
            // Remove scroll from inventory
            updatePartyMember(currentMember.id, {
              inventory: currentMember.inventory.filter(i => i !== item)
            })
            
            // Apply spell damage to enemy if applicable
            if (spellResult.damage && spellResult.damage > 0) {
              const newEnemyHp = Math.max(0, currentEnemy.hp - spellResult.damage)
              setCurrentEnemy(prev => ({ ...prev!, hp: newEnemyHp }))
              
              if (newEnemyHp <= 0) {
                addLogEntry(`The ${currentEnemy.name} is defeated by the scroll's magic!`, "combat")
                // Handle victory same as spell casting above
                setCurrentEnemy(null)
                setCombatTurnOrder([])
                setCurrentTurnIndex(0)
                setGamePhase("dungeon")
                setIsProcessing(false)
                return
              }
            }
          } else {
            addLogEntry(`The scroll crumbles uselessly...`, "system")
          }
        } else if (item.healing) {
          // Regular healing item
          const healAmount = item.healing
          const newHp = Math.min(currentMember.maxHp, currentMember.hp + healAmount)

          updatePartyMember(currentMember.id, {
            hp: newHp,
            inventory: currentMember.inventory.filter(i => i !== item)
          })

          addLogEntry(`${currentMember.name} uses ${item.name} and recovers ${healAmount} HP!`, "system")
        } else if (item.name.includes("Ancient Tome") && (currentMember.class === "Mage" || currentMember.class === "Cleric")) {
          // Learn spell from ancient tome
          const spellToLearn = item.spell
          if (spellToLearn && !currentMember.knownSpells.includes(spellToLearn)) {
            updatePartyMember(currentMember.id, {
              knownSpells: [...currentMember.knownSpells, spellToLearn],
              inventory: currentMember.inventory.filter(i => i !== item)
            })
            addLogEntry(`${currentMember.name} learns ${spellToLearn} from the ${item.name}!`, "system")
          } else {
            addLogEntry(`${currentMember.name} already knows this spell or cannot learn it.`, "system")
          }
        }
        setCurrentTurnIndex((prev) => (prev + 1) % combatTurnOrder.length)
      }
    } catch (error) {
      console.error("Combat error:", error)
      addLogEntry("Something went wrong during combat...", "system")
    }

    setIsProcessing(false)
  }

  const renderDeathScreen = () => (
    <div className="max-w-4xl mx-auto px-4">
      <Card className="bg-gray-900 border-red-400 border-2 p-4 sm:p-6">
        <h2 className="text-red-400 text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center border-b border-red-400 pb-3 sm:pb-4 break-words">
          ☠ YOUR PARTY HAS FALLEN ☠
        </h2>
        <div className="text-center space-y-4">
          <p className="text-red-400 text-base sm:text-lg break-words">
            The dungeon has claimed another group of heroes.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
            <Button onClick={resetGame} className="bg-red-900 text-red-400 hover:bg-red-800">
              NEW ADVENTURE
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )

  // Main Render
  if (gamePhase === "character-creation") {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono p-2 sm:p-4">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-400 mb-2 tracking-wider break-words">
            ░▒▓ DUNGEON64 ▓▒░
          </h1>
          <p className="text-xs sm:text-sm text-green-300 opacity-75 break-words px-2">
            SYMBOLIC AI-NARRATED DUNGEON CRAWLER v2.0
          </p>
        </div>
        <CharacterCreation onCharacterCreated={handleCreateCharacter} addLogEntry={addLogEntry} />
      </div>
    )
  }

  if (gamePhase === "death") {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono p-2 sm:p-4">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-400 mb-2 tracking-wider break-words">
            ░▒▓ DUNGEON64 ▓▒░
          </h1>
          <p className="text-xs sm:text-sm text-red-300 opacity-75 break-words px-2">
            THE NARRATOR WEEPS FOR YOUR LOSS
          </p>
        </div>
        {renderDeathScreen()}
      </div>
    )
  }

  const currentRoom = getCurrentRoom()

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-2 lg:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 lg:mb-6">
          <h1 className="text-2xl lg:text-4xl font-bold text-green-400 mb-2 tracking-wider break-words">
            ░▒▓ DUNGEON64 ▓▒░
          </h1>
          <p className="text-xs lg:text-sm text-green-300 opacity-75 break-words px-2">
            {gamePhase === "combat"
              ? aiAvailable
                ? "AI NARRATOR: COMBAT ENGAGED"
                : "FALLBACK NARRATOR: COMBAT ENGAGED"
              : aiAvailable
                ? "AI-POWERED SYMBOLIC DUNGEON CRAWLER v2.0"
                : "SYMBOLIC DUNGEON CRAWLER v2.0 (FALLBACK MODE)"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[calc(100vh-200px)]">
          {/* Party Panel - Left */}
          <div className="lg:col-span-3">
            {party && (
              <PartyPanel
                party={party}
                activePartyMember={activePartyMember}
                setActivePartyMember={setActivePartyMember}
                onRecruitment={handleRecruitment}
                gamePhase={gamePhase}
              />
            )}
          </div>

          {/* Main Game View - Center */}
          <div className="lg:col-span-6">
            <Card className="bg-gray-900 border-green-400 border-2 h-full p-4">
              <h2 className="text-green-400 text-lg font-bold mb-4 text-center border-b border-green-400 pb-2 break-words">
                {gamePhase === "combat" ? "COMBAT" : "DUNGEON VIEW"}
              </h2>

              <div className="flex flex-col items-center space-y-4">
                {/* ASCII Room Display */}
                {currentRoom && (
                  <div className="bg-black border border-green-400 p-4 rounded w-full max-w-full overflow-x-auto">
                    <pre className="text-green-400 text-sm leading-tight whitespace-pre overflow-x-auto min-w-0">
                      {currentRoom.ascii.join("\n")}
                    </pre>
                  </div>
                )}

                {/* Combat Display */}
                {gamePhase === "combat" && currentEnemy && (
                  <div className="text-center space-y-2 border border-red-400 p-4 rounded w-full max-w-full">
                    <div className="text-red-400 font-bold text-lg break-words">
                      {currentEnemy.name} {currentEnemy.aiGenerated && "🤖"}
                    </div>
                    <div className="text-red-400 break-words">
                      HP: {currentEnemy.hp}/{currentEnemy.maxHp}
                    </div>
                    <div className="text-yellow-400 text-sm italic break-words whitespace-pre-wrap px-2">
                      {currentEnemy.symbolic}
                    </div>
                  </div>
                )}

                {/* Room Description */}
                {currentRoom && gamePhase !== "combat" && (
                  <div className="text-center space-y-2 max-w-full">
                    <p className="text-green-300 text-sm break-words whitespace-pre-wrap px-2">
                      {currentRoom.description}
                    </p>
                    <p className="text-cyan-400 text-sm italic break-words whitespace-pre-wrap px-2">
                      🤖 {currentRoom.symbolicText}
                    </p>
                  </div>
                )}

                {/* Available Exits */}
                {currentRoom && gamePhase !== "combat" && (
                  <div className="text-center">
                    <div className="text-xs text-green-300 mb-2 break-words">EXITS</div>
                    <div className="flex space-x-2 justify-center flex-wrap">
                      {currentRoom.exits.map((exit) => (
                        <span key={exit} className="text-white bg-green-900 px-2 py-1 rounded text-xs break-words">
                          [{exit}]
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Room Status Indicators */}
                {currentRoom && gamePhase !== "combat" && (
                  <div className="text-center space-y-1">
                    {currentRoom.hasLoot && (
                      <div className="text-yellow-400 text-xs break-words">✦ Treasure detected</div>
                    )}
                    {currentRoom.hasTrap && <div className="text-red-400 text-xs break-words">⚠ Danger sensed</div>}
                    {currentRoom.hasEnemy && (
                      <div className="text-red-400 text-xs break-words">👹 Hostile presence</div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Panel - Actions and Inventory */}
          <div className="lg:col-span-3 space-y-4">
            {/* Action Panel */}
            <Card className="bg-gray-900 border-green-400 border-2 p-4">
              <h2 className="text-green-400 text-lg font-bold mb-4 text-center border-b border-green-400 pb-2 break-words">
                ACTIONS
              </h2>

              <div className="space-y-3">
                {gamePhase === "combat" ? (
                  <>
                    {/* Combat Actions */}
                    <div>
                      <div className="text-xs text-red-300 mb-2 break-words">
                        COMBAT TURN: {(() => {
                          const currentTurnMember = getPartyMember(combatTurnOrder[currentTurnIndex])
                          return currentTurnMember ? currentTurnMember.name : "ENEMY"
                        })()}
                      </div>

                      {(() => {
                        const currentTurnMember = getPartyMember(combatTurnOrder[currentTurnIndex])
                        if (!currentTurnMember) {
                          return (
                            <div className="text-red-400 text-xs break-words">
                              Enemy is thinking...
                            </div>
                          )
                        }

                        return (
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full bg-black border-red-400 text-red-400 hover:bg-red-900 text-xs"
                              onClick={() => handleCombatAction("attack")}
                              disabled={isProcessing}
                            >
                              {isProcessing ? "ATTACKING..." : "ATTACK"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full bg-black border-blue-400 text-blue-400 hover:bg-blue-900 text-xs"
                              onClick={() => handleCombatAction("defend")}
                              disabled={isProcessing}
                            >
                              DEFEND
                            </Button>

                            {/* Cast Spell Button */}
                            {(currentTurnMember.class === "Mage" || currentTurnMember.class === "Cleric") && 
                             currentTurnMember.knownSpells.length > 0 && (
                              <div className="border-t border-purple-400 pt-2">
                                <div className="text-xs text-purple-300 mb-1 break-words">CAST SPELL</div>
                                {currentTurnMember.knownSpells.slice(0, 3).map((spellName, index) => {
                                  const { MagicService } = require("./services/magicService")
                                  const canCast = MagicService.canCastSpell(currentTurnMember, spellName)
                                  return (
                                    <Button
                                      key={index}
                                      variant="outline"
                                      size="sm"
                                      className="w-full bg-black border-purple-400 text-purple-400 hover:bg-purple-900 text-xs mb-1"
                                      onClick={() => handleCombatAction("cast_spell", undefined, undefined, spellName)}
                                      disabled={isProcessing || !canCast.canCast}
                                      title={!canCast.canCast ? canCast.reason : undefined}
                                    >
                                      {spellName}
                                    </Button>
                                  )
                                })}
                              </div>
                            )}

                            {/* Spell Scrolls */}
                            {currentTurnMember.inventory.filter(item => item.spell && item.type === "consumable").length > 0 && (
                              <div className="border-t border-cyan-400 pt-2">
                                <div className="text-xs text-cyan-300 mb-1 break-words">SPELL SCROLLS</div>
                                {currentTurnMember.inventory.filter(item => item.spell && item.type === "consumable").slice(0, 2).map((item, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    className="w-full bg-black border-cyan-400 text-cyan-400 hover:bg-cyan-900 text-xs mb-1"
                                    onClick={() => handleCombatAction("use_item", undefined, item)}
                                    disabled={isProcessing}
                                  >
                                    {item.name}
                                  </Button>
                                ))}
                              </div>
                            )}

                            {/* Healing Items */}
                            {currentTurnMember.inventory.filter(item => item.healing).length > 0 && (
                              <div className="border-t border-green-400 pt-2">
                                <div className="text-xs text-green-300 mb-1 break-words">HEALING</div>
                                {currentTurnMember.inventory.filter(item => item.healing).slice(0, 2).map((item, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    className="w-full bg-black border-green-400 text-green-400 hover:bg-green-900 text-xs mb-1"
                                    onClick={() => handleCombatAction("use_item", undefined, item)}
                                    disabled={isProcessing}
                                  >
                                    {item.name} (+{item.healing} HP)
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Movement Buttons */}
                    <div>
                      <div className="text-xs text-green-300 mb-2 break-words">MOVEMENT</div>
                      <div className="grid grid-cols-3 gap-1">
                        <div></div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-black border-green-400 text-green-400 hover:bg-green-900 textxs"
                          onClick={() => handleMove("N")}
                          disabled={!currentRoom?.exits.includes("N") || isProcessing}
                        >
                          N
                        </Button>
                        <div></div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-black border-green-400 text-green-400 hover:bg-green-900 text-xs"
                          onClick={() => handleMove("W")}
                          disabled={!currentRoom?.exits.includes("W") || isProcessing}
                        >
                          W
                        </Button>
                        <div></div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-black border-green-400 text-green-400 hover:bg-green-900 text-xs"
                          onClick={() => handleMove("E")}
                          disabled={!currentRoom?.exits.includes("E") || isProcessing}
                        >
                          E
                        </Button>
                        <div></div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-black border-green-400 text-green-400 hover:bg-green-900 text-xs"
                          onClick={() => handleMove("S")}
                          disabled={!currentRoom?.exits.includes("S") || isProcessing}
                        >
                          S
                        </Button>
                        <div></div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="border-t border-green-400 pt-3">
                      <div className="text-xs text-green-300 mb-2 break-words">ACTIONS</div>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-black border-yellow-400 text-yellow-400 hover:bg-yellow-900 text-xs"
                          disabled={isProcessing}
                          onClick={handleSearch}
                        >
                          {isProcessing ? "SEARCHING..." : "SEARCH"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-black border-purple-400 text-purple-400 hover:bg-purple-900 text-xs"
                          disabled={isProcessing}
                        >
                          REST
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {/* AI Status */}
                <div className="border-t border-green-400 pt-3">
                  <div className="text-xs text-green-300 mb-2 break-words">AI NARRATOR</div>
                  <div className="text-xs space-y-1">
                    <div className={`text-xs break-words ${aiAvailable ? "text-cyan-400" : "text-yellow-400"}`}>
                      MODE: {aiAvailable ? "AI ACTIVE" : "FALLBACK"}
                    </div>
                    <div className="text-cyan-400 break-words">STATUS: {isProcessing ? "GENERATING..." : "READY"}</div>
                    <div className="text-green-400 break-words">DEPTH: {dungeon?.depth || 1}</div>
                  </div>
                </div>

                {/* System Actions */}
                <div className="border-t border-green-400 pt-3">
                  <Button
                    onClick={resetGame}
                    size="sm"
                    className="w-full bg-black border-red-400 text-red-400 hover:bg-red-900 text-xs"
                  >
                    NEW GAME
                  </Button>
                </div>
              </div>
            </Card>

            {/* Inventory Panel */}
            {party && activePartyMember && (
              <InventoryPanel
                party={party}
                activePartyMember={activePartyMember}
                onTransferItemToShared={transferItemToShared}
                onTransferItemFromShared={transferItemFromShared}
                onUseItem={useItem}
                gamePhase={gamePhase}
              />
            )}
          </div>
        </div>

        {/* Event Log - Bottom Panel */}
        <div className="mt-4">
          <Card className="bg-gray-900 border-green-400 border-2 p-4">
            <h2 className="text-green-400 text-lg font-bold mb-4 text-center border-b border-green-400 pb-2 break-words">
              EVENT LOG
            </h2>

            <ScrollArea className="h-32 lg:h-40 w-full">
              <div className="space-y-1 pr-2">
                {log.map((entry, index) => (
                  <div
                    key={index}
                    className={`text-xs break-words whitespace-pre-wrap leading-relaxed ${
                      entry.type === "combat"
                        ? "text-red-400"
                        : entry.type === "narrative"
                          ? "text-yellow-400"
                          : entry.type === "dice"
                            ? "text-blue-400"
                            : entry.type === "death"
                              ? "text-red-500 font-bold"
                              : entry.type === "level"
                                ? "text-green-500 font-bold"
                                : entry.type === "ai"
                                  ? "text-cyan-400 italic"
                                  : "text-green-400"
                    } ${index === log.length - 1 ? "font-bold" : ""}`}
                  >
                    {entry.type === "ai" ? "🤖 " : ">"} {entry.text}
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  )
}