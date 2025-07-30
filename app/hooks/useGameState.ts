
"use client"

import { useState, useCallback } from "react"
import { GamePhase, Party, Dungeon, Enemy, LogEntry, PartyMember } from "../types/game"

export const useGameState = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>("character-creation")
  const [party, setParty] = useState<Party | null>(null)
  const [activePartyMember, setActivePartyMember] = useState<string>("")
  const [dungeon, setDungeon] = useState<Dungeon | null>(null)
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null)
  const [log, setLog] = useState<LogEntry[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiAvailable, setAiAvailable] = useState(true)
  const [combatTurnOrder, setCombatTurnOrder] = useState<string[]>([])
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0)
  const addLogEntry = useCallback((text: string, type: LogEntry["type"] = "system") => {
    const newEntry: LogEntry = {
      text,
      type,
      timestamp: Date.now(),
    }
    setLog((prev) => [...prev, newEntry])
  }, [])

  const getPartyMember = useCallback((id: string): PartyMember | undefined => {
    return party?.members.find((m) => m.id === id)
  }, [party])

  const getPlayerMember = useCallback((): PartyMember | undefined => {
    return party?.members.find((m) => m.isPlayer)
  }, [party])

  const updatePartyMember = useCallback((id: string, updates: Partial<PartyMember>) => {
    setParty((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        members: prev.members.map((member) => (member.id === id ? { ...member, ...updates } : member)),
      }
    })
  }, [])

  const addPartyMember = useCallback((newMember: PartyMember) => {
    setParty((prev) => {
      if (!prev) return prev

      const relationships: { [id: string]: number } = {}
      prev.members.forEach((member) => {
        relationships[member.id] = 0
        updatePartyMember(member.id, {
          relationships: { ...member.relationships, [newMember.id]: 0 },
        })
      })

      const memberWithRelationships = { ...newMember, relationships }

      return {
        ...prev,
        members: [...prev.members, memberWithRelationships],
        formation: [...prev.formation, newMember.id],
      }
    })
  }, [updatePartyMember])

  const removePartyMember = useCallback((id: string) => {
    setParty((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        members: prev.members.filter((m) => m.id !== id),
        formation: prev.formation.filter((fId) => fId !== id),
      }
    })
  }, [])

  const resetGame = useCallback(() => {
    setParty(null)
    setDungeon(null)
    setCurrentEnemy(null)
    setLog([])
    setActivePartyMember("")
    setCombatTurnOrder([])
    setCurrentTurnIndex(0)
    setGamePhase("character-creation")
    setIsProcessing(false)
  }, [])

  return {
    // State
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
    
    // Setters
    setGamePhase,
    setParty,
    setActivePartyMember,
    setDungeon,
    setCurrentEnemy,
    setIsProcessing,
    setAiAvailable,
    setCombatTurnOrder,
    setCurrentTurnIndex,
    
    // Helper functions
    addLogEntry,
    getPartyMember,
    getPlayerMember,
    updatePartyMember,
    addPartyMember,
    removePartyMember,
    resetGame,
  }
}
