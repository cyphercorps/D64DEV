"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Package, Backpack, Eye, ArrowRight, ArrowLeft } from "lucide-react"
import { Item, PartyMember, Party } from "../types/game"

interface InventoryPanelProps {
  party: Party
  activePartyMember: string
  onTransferItemToShared?: (memberId: string, itemIndex: number) => void
  onTransferItemFromShared?: (memberId: string, itemIndex: number) => void
  onUseItem?: (memberId: string, itemIndex: number, isSharedItem?: boolean) => void
  gamePhase: string
}

export default function InventoryPanel({
  party,
  activePartyMember,
  onTransferItemToShared,
  onTransferItemFromShared,
  onUseItem,
  gamePhase,
}: InventoryPanelProps) {
  const [sharedInventoryOpen, setSharedInventoryOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [itemDetailsOpen, setItemDetailsOpen] = useState(false)

  const activeMember = party.members.find(m => m.id === activePartyMember)
  if (!activeMember) return null

  const handleItemClick = (item: Item) => {
    setSelectedItem(item)
    setItemDetailsOpen(true)
  }

  const renderItemActions = (item: Item, itemIndex: number, isSharedItem: boolean = false) => {
    const canUseHealing = item.type === "consumable" && (item.healing && item.healing > 0)
    const canUseAncientTome = item.name.includes("Ancient Tome") && (activeMember.class === "Mage" || activeMember.class === "Cleric")
    const canUseScroll = item.spell && item.type === "consumable" && !item.name.includes("Ancient Tome")
    const canUse = canUseHealing || canUseAncientTome || canUseScroll

    return (
      <div className="flex gap-1 mt-1">
        <Button
          size="sm"
          variant="outline"
          className="h-6 px-2 text-xs bg-blue-900 text-blue-400 hover:bg-blue-800 border-blue-400"
          onClick={() => handleItemClick(item)}
        >
          <Eye className="w-3 h-3" />
        </Button>

        {canUse && onUseItem && (
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs bg-green-900 text-green-400 hover:bg-green-800 border-green-400"
            onClick={() => onUseItem(activeMember.id, itemIndex, isSharedItem)}
            disabled={
              canUseAncientTome && item.spell && activeMember.knownSpells.includes(item.spell)
            }
            title={
              canUseAncientTome && item.spell && activeMember.knownSpells.includes(item.spell)
                ? "You already know this spell"
                : canUseAncientTome
                  ? "Learn this spell"
                  : "Use item"
            }
          >
            Use
          </Button>
        )}

        {!isSharedItem && onTransferItemToShared && (
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs bg-purple-900 text-purple-400 hover:bg-purple-800 border-purple-400"
            onClick={() => onTransferItemToShared(activeMember.id, itemIndex)}
          >
            <ArrowRight className="w-3 h-3" />
          </Button>
        )}

        {isSharedItem && onTransferItemFromShared && (
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs bg-orange-900 text-orange-400 hover:bg-orange-800 border-orange-400"
            onClick={() => onTransferItemFromShared(activeMember.id, itemIndex)}
          >
            <ArrowLeft className="w-3 h-3" />
          </Button>
        )}
      </div>
    )
  }

  const renderItemCard = (item: Item, itemIndex: number, isSharedItem: boolean = false) => (
    <div 
      key={`${isSharedItem ? 'shared' : 'personal'}-${itemIndex}`}
      className="bg-gray-800 border border-gray-600 rounded p-2 hover:border-gray-500 transition-colors cursor-pointer"
      onClick={() => handleItemClick(item)}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-yellow-400 break-words truncate">
            {item.name}
          </div>
          <div className="text-xs text-gray-400 capitalize">
            {item.type}
          </div>
        </div>
        <div className="text-xs text-yellow-400 ml-2 flex-shrink-0">
          {item.value}g
        </div>
      </div>

      {item.effect && (
        <div className="text-xs text-cyan-400 mb-2 break-words line-clamp-2">
          {item.effect}
        </div>
      )}

      {(item.damage || item.healing) && (
        <div className="flex gap-2 text-xs mb-1">
          {item.damage && (
            <span className="text-red-400">DMG: {item.damage}</span>
          )}
          {item.healing && (
            <span className="text-green-400">HEAL: {item.healing}</span>
          )}
        </div>
      )}

      {renderItemActions(item, itemIndex, isSharedItem)}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Personal Inventory */}
      <Card className="bg-gray-900 border-cyan-400 border-2 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Backpack className="w-5 h-5 text-cyan-400" />
          <h3 className="text-cyan-400 text-lg font-bold">
            {activeMember.name}'s Inventory ({activeMember.inventory.length})
          </h3>
        </div>

        <ScrollArea className="h-64">
          {activeMember.inventory.length === 0 ? (
            <div className="text-center text-gray-500 italic py-8">
              No items in inventory
            </div>
          ) : (
            <div className="grid gap-2">
              {activeMember.inventory.map((item, index) => 
                renderItemCard(item, index, false)
              )}
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Shared Inventory - Collapsible */}
      <Collapsible open={sharedInventoryOpen} onOpenChange={setSharedInventoryOpen}>
        <CollapsibleTrigger asChild>
          <Card className="bg-gray-900 border-purple-400 border-2 p-4 cursor-pointer hover:bg-gray-800 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                <h3 className="text-purple-400 text-lg font-bold">
                  Shared Inventory ({party.sharedInventory.length})
                </h3>
              </div>
              {sharedInventoryOpen ? (
                <ChevronDown className="w-5 h-5 text-purple-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-purple-400" />
              )}
            </div>
          </Card>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Card className="bg-gray-900 border-purple-400 border-2 border-t-0 p-4">
            <ScrollArea className="h-64">
              {party.sharedInventory.length === 0 ? (
                <div className="text-center text-gray-500 italic py-8">
                  No shared items
                </div>
              ) : (
                <div className="grid gap-2">
                  {party.sharedInventory.map((item, index) => 
                    renderItemCard(item, index, true)
                  )}
                </div>
              )}
            </ScrollArea>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Item Details Modal */}
      {itemDetailsOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setItemDetailsOpen(false)}>
          <Card className="bg-gray-900 border-yellow-400 border-2 p-6 max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-yellow-400 text-xl font-bold break-words">
                {selectedItem.name}
              </h3>
              <Button
                size="sm"
                variant="outline"
                className="text-gray-400 border-gray-400 hover:bg-gray-700"
                onClick={() => setItemDetailsOpen(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-cyan-400 font-semibold">Type: </span>
                <span className="text-white capitalize">{selectedItem.type}</span>
              </div>

              <div>
                <span className="text-yellow-400 font-semibold">Value: </span>
                <span className="text-white">{selectedItem.value} gold</span>
              </div>

              {selectedItem.damage && (
                <div>
                  <span className="text-red-400 font-semibold">Damage: </span>
                  <span className="text-white">{selectedItem.damage}</span>
                </div>
              )}

              {selectedItem.healing && (
                <div>
                  <span className="text-green-400 font-semibold">Healing: </span>
                  <span className="text-white">{selectedItem.healing} HP</span>
                </div>
              )}

              {selectedItem.effect && (
                <div>
                  <span className="text-cyan-400 font-semibold">Effect: </span>
                  <span className="text-white break-words">{selectedItem.effect}</span>
                </div>
              )}

              {selectedItem.aiGenerated && (
                <div className="text-purple-400 text-sm italic">
                  🤖 AI Generated Item
                </div>
              )}

              {selectedItem.symbolic && (
                <div className="text-cyan-400 text-sm italic break-words">
                  {selectedItem.symbolic}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}