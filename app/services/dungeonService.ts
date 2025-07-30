
import { Room, Dungeon, Item, Enemy, PartyMember } from "../types/game"
import { generateRoomId } from "../utils/gameUtils"
import { ROOM_TEMPLATES, LOOT_ITEMS } from "../data/gameData"
import { generateAIRoomDescription, generateAIEnemyEncounter } from "../actions"

export class DungeonService {
  static async generateRoom(depth: number, index: number, party?: { members: PartyMember[] }): Promise<Room> {
    const templateIndex = (depth + index) % ROOM_TEMPLATES.length
    const template = ROOM_TEMPLATES[templateIndex]
    const hasLoot = ((depth + index) % 10) < (3 + depth)
    const hasTrap = ((depth + index * 2) % 10) < (2 + Math.floor(depth * 0.5))
    const hasEnemy = ((depth + index * 3) % 10) < (4 + depth)

    const loot: Item[] = []
    if (hasLoot) {
      const lootCount = ((depth + index) % 10) < 7 ? 1 : 2
      for (let i = 0; i < lootCount; i++) {
        const itemIndex = (depth + index + i) % LOOT_ITEMS.length
        const baseItem = LOOT_ITEMS[itemIndex]
        const item = { ...baseItem }
        loot.push(item)
      }
    }

    let enemy: Enemy | undefined
    if (hasEnemy && party) {
      try {
        const playerMember = party.members.find(m => m.isPlayer)
        if (playerMember) {
          enemy = await generateAIEnemyEncounter(template.type, depth, playerMember)
        }
      } catch (error) {
        console.error("Failed to generate enemy:", error)
        enemy = {
          name: "Shadow Wraith",
          hp: 8 + depth * 2,
          maxHp: 8 + depth * 2,
          attack: 3 + depth,
          defense: Math.floor(depth / 2),
          xpReward: 20 + depth * 15,
          symbolic: "A fragment of darkness given malevolent form.",
        }
      }
    }

    const room: Room = {
      id: generateRoomId(depth, index),
      ascii: template.ascii,
      exits: [...template.exits],
      description: "A chamber awaiting description...",
      symbolicText: "The narrator prepares to speak...",
      explored: false,
      hasLoot,
      hasTrap,
      hasEnemy,
      loot,
      enemy,
      depth,
      roomType: template.type,
    }

    if (party && party.members.length > 0) {
      try {
        const aiDescriptions = await generateAIRoomDescription(room, party.members[0])
        room.description = aiDescriptions.description
        room.symbolicText = aiDescriptions.symbolic
      } catch (error) {
        console.error("Failed to generate room description:", error)
        room.description = "A chamber carved from living stone, its walls bearing the weight of ages."
        room.symbolicText = "The darkness watches and remembers."
      }
    }

    return room
  }

  static async generateDungeon(party?: { members: PartyMember[] }): Promise<Dungeon> {
    const rooms = new Map<string, Room>()
    const startingRoom = await this.generateRoom(1, 0, party)
    startingRoom.explored = true
    rooms.set(startingRoom.id, startingRoom)

    return {
      rooms,
      currentRoomId: startingRoom.id,
      depth: 1,
      maxDepth: 10,
      theme: "Ancient Catacombs",
      aiNarrator: {
        tone: "mythic",
        focus: ["character_growth", "symbolic_meaning"],
        memoryEvents: [],
      },
    }
  }
}
