"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Party, PartyMember } from "../types/game"
import { RECRUITABLE_NPCS } from "../data/gameData"

interface PartyPanelProps {
  party: Party
  activePartyMember: string
  setActivePartyMember: (id: string) => void
  onRecruitment: (npcData: any) => void
  gamePhase: string
  onTransferItemToShared?: (memberId: string, itemIndex: number) => void
}

export default function PartyPanel({
  party,
  activePartyMember,
  setActivePartyMember,
  onRecruitment,
  gamePhase,
  onTransferItemToShared,
}: PartyPanelProps) {
  return (
    <Card className="bg-gray-900 border-green-400 border-2 h-full p-4">
      <h2 className="text-green-400 text-lg font-bold mb-4 text-center border-b border-green-400 pb-2 break-words">
        PARTY ({party.members.length}/4)
      </h2>

      <ScrollArea className="h-full">
        <div className="space-y-3">
          {/* Party Stats */}
          <div className="border-b border-green-400 pb-2">
            <div className="text-sm text-yellow-400 break-words">Gold: {party.sharedGold}</div>
            <div className="text-sm text-blue-400 break-words">Morale: {party.morale}/100</div>
            <div className="text-sm text-purple-400 break-words">Reputation: {party.reputation}</div>
          </div>

          {/* Party Members */}
          {party.members.map((member) => (
            <div
              key={member.id}
              className={`border rounded p-2 cursor-pointer ${
                activePartyMember === member.id
                  ? "border-yellow-400 bg-yellow-900/20"
                  : member.hp <= 0
                    ? "border-red-400 bg-red-900/20"
                    : "border-green-400"
              }`}
              onClick={() => setActivePartyMember(member.id)}
            >
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">{member.portrait}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-yellow-400 font-bold text-sm break-words">
                    {member.name} {member.isPlayer && "👑"}
                  </div>
                  <div className="text-xs text-green-300 break-words">
                    {member.class} • Level {member.level}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div
                  className={`break-words ${
                    member.hp <= 0
                      ? "text-red-400"
                      : member.hp < member.maxHp * 0.3
                        ? "text-yellow-400"
                        : "text-green-400"
                  }`}
                >
                  HP: {member.hp}/{member.maxHp}
                </div>
                <div className="text-blue-400 break-words">
                  XP: {member.xp}/{member.xpToNext}
                </div>
                {!member.isPlayer && (
                  <div className="text-purple-400 break-words">Loyalty: {member.loyalty}/100</div>
                )}

                {/* Individual Inventory */}
                <div className="mt-2 pt-2 border-t border-gray-600">
                  <div className="text-xs text-cyan-400 font-bold mb-1 break-words">
                    INVENTORY ({member.inventory.length})
                  </div>
                  {member.inventory.length > 0 ? (
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {member.inventory.map((item, index) => (
                        <div key={index} className="text-xs text-gray-300 break-words">
                          <div className="flex justify-between items-center">
                            <span className="truncate">{item.name}</span>
                            <span className="text-yellow-400 ml-1">{item.value}g</span>
                          </div>
                          {onTransferItemToShared && activePartyMember === member.id && (
                            <Button
                              onClick={() => onTransferItemToShared(member.id, index)}
                              size="sm"
                              className="h-4 px-1 text-xs mt-1 bg-green-900 text-green-400 hover:bg-green-800"
                            >
                              Share
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic">Empty</div>
                  )}
                </div>
              </div>

              {/* Status Effects */}
              {member.statusEffects.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {member.statusEffects.map((effect, index) => (
                    <span key={index} className="text-xs bg-purple-900 text-purple-400 px-1 rounded break-words">
                      {effect.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-1">
                {member.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="text-xs bg-red-900 text-red-400 px-1 rounded break-words">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* Active Member Details */}
          {activePartyMember &&
            (() => {
              const activeMember = party.members.find((m) => m.id === activePartyMember)
              return activeMember ? (
                <div className="border-t border-green-400 pt-3">
                  <div className="text-green-400 font-bold mb-2 break-words">{activeMember.name} DETAILS</div>

                  <div className="text-xs space-y-2">
                    <div>
                      <div className="text-green-300 mb-1 break-words">STATS</div>
                      <div className="grid grid-cols-3 gap-1">
                        {Object.entries(activeMember.stats).map(([stat, value]) => (
                          <div key={stat} className="flex justify-between">
                            <span className="text-green-300 break-words">{stat}:</span>
                            <span className="text-white">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-green-300 mb-1 break-words">
                        INVENTORY ({activeMember.inventory.length})
                      </div>
                      <div className="max-h-20 overflow-y-auto">
                        {activeMember.inventory.map((item, index) => (
                          <div key={index} className="text-yellow-400 text-xs break-words">
                            • {item.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    {!activeMember.isPlayer && (
                      <div>
                        <div className="text-green-300 mb-1 break-words">AI BEHAVIOR</div>
                        <div className="text-cyan-400 text-xs break-words">
                          {activeMember.combatAI.toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null
            })()}

          {/* Recruitment Section */}
          {party.members.length < 4 && gamePhase === "dungeon" && (
            <div className="border-t border-green-400 pt-3">
              <div className="text-green-400 font-bold mb-2 break-words">RECRUITMENT</div>
              <div className="space-y-2">
                {RECRUITABLE_NPCS.filter((npc) => !party.members.some((member) => member.name === npc.name))
                  .slice(0, 2)
                  .map((npc) => (
                    <div key={npc.name} className="border border-gray-600 p-2 rounded">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{npc.portrait}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-yellow-400 text-xs font-bold break-words">{npc.name}</div>
                          <div className="text-green-300 text-xs break-words">{npc.class}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mb-2 break-words whitespace-pre-wrap">
                        {npc.backstory}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-yellow-400 text-xs break-words">{npc.recruitmentCost}g</span>
                        <Button
                          onClick={() => onRecruitment(npc)}
                          disabled={
                            party.sharedGold < npc.recruitmentCost || party.reputation < npc.loyaltyRequirement
                          }
                          size="sm"
                          className="h-5 px-2 text-xs bg-green-900 text-green-400 hover:bg-green-800"
                        >
                          RECRUIT
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}