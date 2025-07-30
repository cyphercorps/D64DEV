
import { Character, PartyMember } from "../types/game"

export const generateRoomId = (depth: number, index: number): string => {
  return `room_${depth}_${index}`
}

export const getHpColor = (member: PartyMember): string => {
  const hpPercent = member.hp / member.maxHp
  if (hpPercent > 0.6) return "text-green-400"
  if (hpPercent > 0.3) return "text-yellow-400"
  return "text-red-400"
}

export const calculateStatModifier = (statValue: number): number => {
  return Math.floor((statValue - 10) / 2)
}

export const calculateBaseHp = (constitution: number, level: number = 1): number => {
  return 10 + calculateStatModifier(constitution) + (level - 1) * 6
}

export const calculateXpToNext = (level: number): number => {
  return 100 + (level - 1) * 50
}
