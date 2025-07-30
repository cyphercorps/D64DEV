
"use client"

import { useState } from "react"
import { Character } from "../types/game"

type CreationStep = "stats" | "class" | "background" | "name" | "preview"
type StatMethod = "roll" | "pointbuy" | "array"

export const useCharacterCreation = () => {
  const [rolledStats, setRolledStats] = useState<Character["stats"] | null>(null)
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [characterName, setCharacterName] = useState("")
  const [creationStep, setCreationStep] = useState<CreationStep>("stats")
  const [statMethod, setStatMethod] = useState<StatMethod>("roll")
  const [pointsRemaining, setPointsRemaining] = useState(27)
  const [selectedBackground, setSelectedBackground] = useState<string>("")
  const [characterPortrait, setCharacterPortrait] = useState<string>("")

  const resetCharacterCreation = () => {
    setRolledStats(null)
    setSelectedClass("")
    setCharacterName("")
    setCreationStep("stats")
    setStatMethod("roll")
    setPointsRemaining(27)
    setSelectedBackground("")
    setCharacterPortrait("")
  }

  return {
    // State
    rolledStats,
    selectedClass,
    characterName,
    creationStep,
    statMethod,
    pointsRemaining,
    selectedBackground,
    characterPortrait,
    
    // Setters
    setRolledStats,
    setSelectedClass,
    setCharacterName,
    setCreationStep,
    setStatMethod,
    setPointsRemaining,
    setSelectedBackground,
    setCharacterPortrait,
    
    // Utilities
    resetCharacterCreation,
  }
}
