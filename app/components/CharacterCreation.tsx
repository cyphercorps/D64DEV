"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useCharacterCreation } from "../hooks/useCharacterCreation"
import { rollStats } from "../utils/dice"
import { CLASSES, BACKGROUNDS, STAT_ARRAYS, PORTRAITS } from "../data/gameData"

interface CharacterCreationProps {
  onCharacterCreated: (characterData: any) => void
  addLogEntry: (text: string, type?: string) => void
}

export default function CharacterCreation({ onCharacterCreated, addLogEntry }: CharacterCreationProps) {
  const {
    rolledStats,
    selectedClass,
    characterName,
    creationStep,
    statMethod,
    pointsRemaining,
    selectedBackground,
    characterPortrait,
    setRolledStats,
    setSelectedClass,
    setCharacterName,
    setCreationStep,
    setStatMethod,
    setPointsRemaining,
    setSelectedBackground,
    setCharacterPortrait,
  } = useCharacterCreation()

  const handleRollStats = () => {
    const stats = rollStats()
    setRolledStats(stats)
    addLogEntry(
      `Rolled stats: STR ${stats.STR}, DEX ${stats.DEX}, CON ${stats.CON}, INT ${stats.INT}, WIS ${stats.WIS}, CHA ${stats.CHA}`,
      "dice"
    )
  }

  const handleCreateCharacter = () => {
    if (!rolledStats || !selectedClass || !characterName.trim() || !selectedBackground) return

    const classData = CLASSES.find((c) => c.name === selectedClass)!
    const backgroundData = BACKGROUNDS.find((b) => b.name === selectedBackground)!

    onCharacterCreated({
      rolledStats,
      selectedClass,
      characterName: characterName.trim(),
      selectedBackground,
      characterPortrait,
      classData,
      backgroundData,
    })
  }

  

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4">
      <Card className="bg-gray-900 border-green-400 border-2 p-3 sm:p-4 lg:p-6 w-full">
        <h2 className="text-green-400 text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-center border-b border-green-400 pb-3 sm:pb-4 break-words">
          CHARACTER CREATION
        </h2>

        {/* Step Indicator */}
        <div className="flex justify-center mb-6 sm:mb-8 overflow-x-auto">
          <div className="flex space-x-2 sm:space-x-4 min-w-max">
            {["stats", "class", "background", "name", "preview"].map((step, index) => (
              <div
                key={step}
                className={`px-2 sm:px-3 py-1 rounded text-xs whitespace-nowrap ${
                  creationStep === step
                    ? "bg-green-900 text-green-400"
                    : index < ["stats", "class", "background", "name", "preview"].indexOf(creationStep)
                      ? "bg-blue-900 text-blue-400"
                      : "bg-gray-800 text-gray-400"
                }`}
              >
                {step.toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        {/* Stats Step */}
        {creationStep === "stats" && (
          <div className="space-y-4 sm:space-y-6 w-full">
            <div className="text-center">
              <h3 className="text-green-400 text-lg sm:text-xl font-bold mb-3 sm:mb-4 break-words">
                CHOOSE STAT GENERATION METHOD
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
                <Button
                  onClick={() => setStatMethod("roll")}
                  variant={statMethod === "roll" ? "default" : "outline"}
                  className={`p-3 sm:p-4 h-auto w-full ${
                    statMethod === "roll"
                      ? "bg-green-900 text-green-400"
                      : "bg-black border-green-400 text-green-400 hover:bg-green-900"
                  }`}
                >
                  <div className="w-full">
                    <div className="font-bold text-sm sm:text-lg break-words">🎲 ROLL DICE</div>
                    <div className="text-xs mt-2 break-words">Roll 3d6+3 for each stat</div>
                  </div>
                </Button>
                <Button
                  onClick={() => setStatMethod("array")}
                  variant={statMethod === "array" ? "default" : "outline"}
                  className={`p-3 sm:p-4 h-auto w-full ${
                    statMethod === "array"
                      ? "bg-green-900 text-green-400"
                      : "bg-black border-green-400 text-green-400 hover:bg-green-900"
                  }`}
                >
                  <div className="w-full">
                    <div className="font-bold text-sm sm:text-lg break-words">📊 STANDARD ARRAY</div>
                    <div className="text-xs mt-2 break-words">Choose from a preset</div>
                  </div>
                </Button>
                <Button
                  onClick={() => {
                    setStatMethod("pointbuy")
                    setRolledStats({ STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 })
                    setPointsRemaining(27)
                  }}
                  variant={statMethod === "pointbuy" ? "default" : "outline"}
                  className={`p-3 sm:p-4 h-auto w-full ${
                    statMethod === "pointbuy"
                      ? "bg-green-900 text-green-400"
                      : "bg-black border-green-400 text-green-400 hover:bg-green-900"
                  }`}
                >
                  <div className="w-full">
                    <div className="font-bold text-sm sm:text-lg break-words">🎯 POINT BUY</div>
                    <div className="text-xs mt-2 break-words">Spend 27 points</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Stat Generation Interface */}
            {statMethod === "roll" && (
              <div className="text-center w-full">
                {!rolledStats ? (
                  <Button
                    onClick={handleRollStats}
                    className="bg-black border-green-400 text-green-400 hover:bg-green-900 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
                  >
                    🎲 ROLL YOUR DESTINY
                  </Button>
                ) : (
                  <div className="space-y-4 w-full">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto">
                      {Object.entries(rolledStats).map(([stat, value]) => (
                        <div key={stat} className="bg-black border border-green-400 p-2 sm:p-3 rounded">
                          <div className="text-green-400 font-bold text-sm break-words">{stat}</div>
                          <div className="text-white text-lg sm:text-xl">{value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
                      <Button
                        onClick={handleRollStats}
                        variant="outline"
                        className="bg-black border-yellow-400 text-yellow-400 hover:bg-yellow-900"
                      >
                        🎲 REROLL
                      </Button>
                      <Button
                        onClick={() => setCreationStep("class")}
                        className="bg-green-900 text-green-400 hover:bg-green-800"
                      >
                        CONTINUE →
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {statMethod === "array" && (
              <div className="space-y-4 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-4xl mx-auto">
                  {STAT_ARRAYS.map((array) => (
                    <Button
                      key={array.name}
                      onClick={() => {
                        setRolledStats(array.stats)
                        setCreationStep("class")
                      }}
                      className="p-3 sm:p-4 h-auto bg-black border-green-400 text-green-400 hover:bg-green-900 w-full"
                    >
                      <div className="w-full">
                        <div className="font-bold text-base sm:text-lg break-words">{array.name}</div>
                        <div className="text-xs mt-2 grid grid-cols-3 gap-1">
                          {Object.entries(array.stats).map(([stat, value]) => (
                            <div key={stat} className="break-words">
                              {stat}: {value}
                            </div>
                          ))}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {statMethod === "pointbuy" && rolledStats && (
              <div className="space-y-4 w-full">
                <div className="text-center">
                  <div className="text-green-400 text-base sm:text-lg break-words">
                    Points Remaining: <span className="text-white font-bold">{pointsRemaining}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
                  {Object.entries(rolledStats).map(([stat, value]) => (
                    <div key={stat} className="bg-black border border-green-400 p-2 sm:p-3 rounded">
                      <div className="text-green-400 font-bold mb-2 text-sm break-words">{stat}</div>
                      <div className="flex items-center justify-between">
                        <Button
                          size="sm"
                          onClick={() => {
                            if (value > 8) {
                              const cost = value <= 13 ? 1 : 2
                              setRolledStats((prev) => ({ ...prev!, [stat]: value - 1 }))
                              setPointsRemaining((prev) => prev + cost)
                            }
                          }}
                          disabled={value <= 8}
                          className="w-6 h-6 sm:w-8 sm:h-8 p-0 bg-red-900 text-red-400 hover:bg-red-800 text-xs"
                        >
                          -
                        </Button>
                        <span className="text-white text-lg sm:text-xl font-bold mx-2">{value}</span>
                        <Button
                          size="sm"
                          onClick={() => {
                            const cost = value >= 13 ? 2 : 1
                            if (pointsRemaining >= cost && value < 15) {
                              setRolledStats((prev) => ({ ...prev!, [stat]: value + 1 }))
                              setPointsRemaining((prev) => prev - cost)
                            }
                          }}
                          disabled={pointsRemaining < (value >= 13 ? 2 : 1) || value >= 15}
                          className="w-6 h-6 sm:w-8 sm:h-8 p-0 bg-green-900 text-green-400 hover:bg-green-800 text-xs"
                        >
                          +
                        </Button>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 break-words">Cost: {value >= 13 ? 2 : 1} pts</div>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <Button
                    onClick={() => setCreationStep("class")}
                    disabled={pointsRemaining > 0}
                    className="bg-green-900 text-green-400 hover:bg-green-800"
                  >
                    CONTINUE →
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Class Selection */}
        {creationStep === "class" && (
          <div className="space-y-4 sm:space-y-6 w-full">
            <h3 className="text-green-400 text-lg sm:text-xl font-bold text-center mb-4 sm:mb-6 break-words">
              CHOOSE YOUR CLASS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {CLASSES.map((cls) => (
                <Button
                  key={cls.name}
                  onClick={() => setSelectedClass(cls.name)}
                  variant={selectedClass === cls.name ? "default" : "outline"}
                  className={`p-4 sm:p-6 h-auto text-left w-full ${
                    selectedClass === cls.name
                      ? "bg-green-900 text-green-400 border-green-400"
                      : "bg-black border-green-400 text-green-400 hover:bg-green-900"
                  }`}
                >
                  <div className="space-y-2 w-full">
                    <div className="font-bold text-base sm:text-lg break-words">{cls.name}</div>
                    <div className="text-sm opacity-75 break-words">{cls.description}</div>
                    <div className="text-xs">
                      <div className="mb-1 break-words">
                        Bonuses:{" "}
                        {Object.entries(cls.bonuses)
                          .map(([stat, bonus]) => `${stat} +${bonus}`)
                          .join(", ")}
                      </div>
                      <div className="mb-1 break-words">
                        Starting Items: {cls.startingItems.map((item) => item.name).join(", ")}
                      </div>
                      <div className="break-words">Tags: {cls.tags.join(", ")}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            <div className="text-center flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
              <Button
                onClick={() => setCreationStep("stats")}
                variant="outline"
                className="bg-black border-gray-400 text-gray-400 hover:bg-gray-800"
              >
                ← BACK
              </Button>
              <Button
                onClick={() => setCreationStep("background")}
                disabled={!selectedClass}
                className="bg-green-900 text-green-400 hover:bg-green-800"
              >
                CONTINUE →
              </Button>
            </div>
          </div>
        )}

        {/* Background Selection */}
        {creationStep === "background" && (
          <div className="space-y-4 sm:space-y-6 w-full">
            <h3 className="text-green-400 text-lg sm:text-xl font-bold text-center mb-4 sm:mb-6 break-words">
              CHOOSE YOUR BACKGROUND
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 max-w-4xl mx-auto">
              {BACKGROUNDS.map((bg) => (
                <Button
                  key={bg.name}
                  onClick={() => setSelectedBackground(bg.name)}
                  variant={selectedBackground === bg.name ? "default" : "outline"}
                  className={`p-3 sm:p-4 h-auto text-left w-full ${
                    selectedBackground === bg.name
                      ? "bg-green-900 text-green-400 border-green-400"
                      : "bg-black border-green-400 text-green-400 hover:bg-green-900"
                  }`}
                >
                  <div className="space-y-2 w-full">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-base sm:text-lg break-words">{bg.name}</div>
                        <div className="text-sm opacity-75 break-words">{bg.description}</div>
                      </div>
                      <div className="text-xs text-right flex-shrink-0">
                        <div>+{bg.bonuses.gold || 0} Gold</div>
                        {bg.bonuses.hp && <div>+{bg.bonuses.hp} HP</div>}
                        {bg.bonuses.xp && <div>+{bg.bonuses.xp} XP</div>}
                      </div>
                    </div>
                    <div className="text-xs italic text-cyan-400 break-words whitespace-pre-wrap">
                      "{bg.startingLore}"
                    </div>
                    <div className="text-xs">
                      <div className="break-words">Items: {bg.bonuses.items.join(", ")}</div>
                      <div className="break-words">
                        Tags: {bg.tags.join(", ")} • Traits: {bg.traits.join(", ")}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            <div className="text-center flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
              <Button
                onClick={() => setCreationStep("class")}
                variant="outline"
                className="bg-black border-gray-400 text-gray-400 hover:bg-gray-800"
              >
                ← BACK
              </Button>
              <Button
                onClick={() => setCreationStep("name")}
                disabled={!selectedBackground}
                className="bg-green-900 text-green-400 hover:bg-green-800"
              >
                CONTINUE →
              </Button>
            </div>
          </div>
        )}

        {/* Name and Portrait */}
        {creationStep === "name" && (
          <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto w-full">
            <h3 className="text-green-400 text-lg sm:text-xl font-bold text-center mb-4 sm:mb-6 break-words">
              NAME YOUR CHARACTER
            </h3>

            <div className="space-y-4 w-full">
              <div>
                <label className="text-green-400 font-bold mb-2 block break-words">CHARACTER NAME</label>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="Enter your character's name..."
                  className="w-full bg-black border border-green-400 text-green-400 p-3 rounded font-mono text-base sm:text-lg"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="text-green-400 font-bold mb-2 block break-words">CHOOSE PORTRAIT</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {PORTRAITS.map((portrait) => (
                    <Button
                      key={portrait}
                      onClick={() => setCharacterPortrait(portrait)}
                      variant={characterPortrait === portrait ? "default" : "outline"}
                      className={`aspect-square text-xl sm:text-2xl ${
                        characterPortrait === portrait
                          ? "bg-green-900 text-green-400"
                          : "bg-black border-green-400 text-green-400 hover:bg-green-900"
                      }`}
                    >
                      {portrait}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
              <Button
                onClick={() => setCreationStep("background")}
                variant="outline"
                className="bg-black border-gray-400 text-gray-400 hover:bg-gray-800"
              >
                ← BACK
              </Button>
              <Button
                onClick={() => setCreationStep("preview")}
                disabled={!characterName.trim() || !characterPortrait}
                className="bg-green-900 text-green-400 hover:bg-green-800"
              >
                CONTINUE →
              </Button>
            </div>
          </div>
        )}

        {/* Character Preview */}
        {creationStep === "preview" && rolledStats && selectedClass && selectedBackground && (
          <div className="space-y-4 sm:space-y-6 w-full">
            <h3 className="text-green-400 text-lg sm:text-xl font-bold text-center mb-4 sm:mb-6 break-words">
              CHARACTER PREVIEW
            </h3>

            <div className="max-w-4xl mx-auto bg-black border border-green-400 p-4 sm:p-6 rounded w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl sm:text-6xl mb-2">{characterPortrait}</div>
                    <div className="text-yellow-400 font-bold text-lg sm:text-xl break-words">{characterName}</div>
                    <div className="text-green-400 break-words">
                      {selectedClass} • {selectedBackground}
                    </div>
                  </div>

                  <div>
                    <div className="text-green-400 font-bold mb-2 break-words">FINAL STATS</div>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(rolledStats).map(([stat, value]) => {
                        const classData = CLASSES.find((c) => c.name === selectedClass)!
                        const bonus = classData.bonuses[stat as keyof typeof classData.bonuses] || 0
                        const finalValue = value + bonus
                        return (
                          <div key={stat} className="bg-gray-800 p-2 rounded text-center">
                            <div className="text-green-400 text-xs break-words">{stat}</div>
                            <div className="text-white font-bold">
                              {finalValue}
                              {bonus > 0 && <span className="text-green-400 text-xs"> (+{bonus})</span>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-green-400 font-bold mb-2 break-words">STARTING EQUIPMENT</div>
                    <div className="text-sm space-y-1">
                      {CLASSES.find((c) => c.name === selectedClass)!.startingItems.map((item, index) => (
                        <div key={index} className="text-yellow-400 break-words">
                          • {item.name}
                        </div>
                      ))}
                      {BACKGROUNDS.find((b) => b.name === selectedBackground)!.bonuses.items.map((item, index) => (
                        <div key={index} className="text-cyan-400 break-words">
                          • {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-green-400 font-bold mb-2 break-words">TAGS & TRAITS</div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {[
                        ...CLASSES.find((c) => c.name === selectedClass)!.tags,
                        ...BACKGROUNDS.find((b) => b.name === selectedBackground)!.tags,
                      ].map((tag, index) => (
                        <span key={index} className="text-xs bg-red-900 text-red-400 px-2 py-1 rounded break-words">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {[
                        ...CLASSES.find((c) => c.name === selectedClass)!.traits,
                        ...BACKGROUNDS.find((b) => b.name === selectedBackground)!.traits,
                      ].map((trait, index) => (
                        <span key={index} className="text-xs bg-blue-900 text-blue-400 px-2 py-1 rounded break-words">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-green-400 font-bold mb-2 break-words">STARTING LORE</div>
                    <div className="text-cyan-400 text-sm italic break-words whitespace-pre-wrap">
                      "{BACKGROUNDS.find((b) => b.name === selectedBackground)!.startingLore}"
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
              <Button
                onClick={() => setCreationStep("name")}
                variant="outline"
                className="bg-black border-gray-400 text-gray-400 hover:bg-gray-800"
              >
                ← BACK
              </Button>
              <Button
                onClick={handleCreateCharacter}
                className="bg-green-900 text-green-400 hover:bg-green-800 px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg"
              >
                🗡️ ENTER THE DUNGEON
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}