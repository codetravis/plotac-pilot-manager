"use client"

import { useState } from "react"
import { useGame } from "@/lib/game-context"
import { SHIPS, UPGRADES } from "@/lib/game-data"
import type { Pilot } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Coins, X, Plus, Trash2, AlertCircle, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ShipUpgradeManagerProps {
  pilot: Pilot
  shipId: string
  onClose: () => void
}

export function ShipUpgradeManager({ pilot, shipId, onClose }: ShipUpgradeManagerProps) {
  const { getAvailableSlots, installUpgrade, removeUpgrade } = useGame()
  const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null)
  const [selectedSlots, setSelectedSlots] = useState<number[]>([])

  const pilotShip = pilot.ships.find((s) => s.id === shipId)
  const ship = SHIPS.find((s) => s.id === pilotShip?.shipId)
  const availableSlots = getAvailableSlots(pilot.id, shipId)

  if (!pilotShip || !ship) return null

  const installedUpgrades = pilotShip.upgrades.map((u) => {
    const upgrade = UPGRADES.find((up) => up.id === u.upgradeId)
    return { ...u, upgrade }
  })

  const handleSlotClick = (slotIndex: number) => {
    const slot = availableSlots.find((s) => s.index === slotIndex)
    if (!slot || slot.filled) return

    if (!selectedUpgrade) return

    const upgrade = UPGRADES.find((u) => u.id === selectedUpgrade)
    if (!upgrade) return

    // Check if slot type matches
    if (slot.type !== upgrade.type) return

    // Toggle slot selection
    if (selectedSlots.includes(slotIndex)) {
      setSelectedSlots(selectedSlots.filter((i) => i !== slotIndex))
    } else {
      if (selectedSlots.length < upgrade.slotsRequired) {
        setSelectedSlots([...selectedSlots, slotIndex])
      }
    }
  }

  const handleInstall = () => {
    if (!selectedUpgrade || selectedSlots.length === 0) return

    const upgrade = UPGRADES.find((u) => u.id === selectedUpgrade)
    if (!upgrade) return

    // Validate all selected slots are the correct type and adjacent if multi-slot
    const allCorrectType = selectedSlots.every((idx) => {
      const slot = availableSlots.find((s) => s.index === idx)
      return slot && slot.type === upgrade.type && !slot.filled
    })

    if (!allCorrectType) return

    if (installUpgrade(pilot.id, shipId, selectedUpgrade, selectedSlots)) {
      setSelectedUpgrade(null)
      setSelectedSlots([])
    }
  }

  const handleRemove = (upgradeId: string) => {
    removeUpgrade(pilot.id, shipId, upgradeId)
  }

  const selectedUpgradeData = selectedUpgrade ? UPGRADES.find((u) => u.id === selectedUpgrade) : null

  // Group slots by type for better visualization
  const slotsByType = availableSlots.reduce(
    (acc, slot) => {
      if (!acc[slot.type]) acc[slot.type] = []
      acc[slot.type].push(slot)
      return acc
    },
    {} as Record<string, typeof availableSlots>,
  )

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-5xl bg-card border-border max-h-[90vh] flex flex-col">
        <div className="p-4 sm:p-6 border-b border-border shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold truncate">{pilotShip.name}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{ship.name} - Upgrade Management</p>
            </div>
            <Button variant="secondary" size="icon" onClick={onClose} className="shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Credits Display */}
          <div className="flex items-center gap-2 mt-4">
            <Coins className="h-5 w-5 text-amber-400" />
            <span className="font-semibold">{pilot.credits} Credits Available</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Left: Installed Upgrades & Slots */}
            <div className="space-y-6">
              {/* Installed Upgrades */}
              <div className="space-y-3">
                <h3 className="font-semibold">Installed Upgrades</h3>
                {installedUpgrades.length === 0 ? (
                  <Card className="p-4 bg-muted/50 border-border text-center">
                    <p className="text-sm text-muted-foreground">No upgrades installed</p>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {installedUpgrades.map((installed) => {
                      if (!installed.upgrade) return null
                      return (
                        <Card key={installed.upgradeId} className="p-3 bg-muted/50 border-border">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{installed.upgrade.name}</h4>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {installed.upgrade.type}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{installed.upgrade.description}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>Threat: {installed.upgrade.threatValue}</span>
                                <span>Slots: {installed.slotIndices.join(", ")}</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemove(installed.upgradeId)}
                              className="text-destructive hover:text-destructive/90"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Slot Visualization */}
              <div className="space-y-3">
                <h3 className="font-semibold">Available Slots</h3>
                {availableSlots.length === 0 ? (
                  <Card className="p-4 bg-muted/50 border-border text-center">
                    <p className="text-sm text-muted-foreground">No slots available</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(slotsByType).map(([type, slots]) => (
                      <div key={type} className="space-y-2">
                        <p className="text-sm text-muted-foreground capitalize">{type} Slots</p>
                        <div className="flex flex-wrap gap-2">
                          {slots.map((slot) => {
                            const isSelected = selectedSlots.includes(slot.index)
                            const canClick =
                              selectedUpgradeData &&
                              slot.type === selectedUpgradeData.type &&
                              !slot.filled &&
                              (isSelected || selectedSlots.length < selectedUpgradeData.slotsRequired)

                            return (
                              <button
                                key={slot.index}
                                onClick={() => handleSlotClick(slot.index)}
                                disabled={!canClick && !slot.filled}
                                className={`
                                px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all
                                ${
                                  slot.filled
                                    ? "bg-muted border-border text-muted-foreground cursor-not-allowed opacity-50"
                                    : isSelected
                                      ? "bg-primary/20 border-primary text-primary-foreground cursor-pointer hover:bg-primary/30"
                                      : canClick
                                        ? "bg-card border-border hover:border-primary/50 cursor-pointer"
                                        : "bg-card border-border text-muted-foreground cursor-not-allowed opacity-50"
                                }
                              `}
                              >
                                #{slot.index}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Install Button */}
              {selectedUpgradeData && (
                <Card className="p-4 bg-primary/10 border-primary/30">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{selectedUpgradeData.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Select {selectedUpgradeData.slotsRequired} {selectedUpgradeData.type} slot
                          {selectedUpgradeData.slotsRequired > 1 ? "s" : ""}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-amber-400/50 bg-amber-950/30 text-amber-300 whitespace-nowrap"
                      >
                        {selectedUpgradeData.cost} CR
                      </Badge>
                    </div>
                    <Button
                      onClick={handleInstall}
                      disabled={
                        selectedSlots.length !== selectedUpgradeData.slotsRequired ||
                        pilot.credits < selectedUpgradeData.cost
                      }
                      className="w-full gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Install Upgrade ({selectedSlots.length}/{selectedUpgradeData.slotsRequired} slots)
                    </Button>
                    {pilot.credits < selectedUpgradeData.cost && (
                      <p className="text-xs text-destructive text-center">Insufficient credits</p>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* Right: Available Upgrades */}
            <div className="space-y-3">
              <h3 className="font-semibold">Available Upgrades</h3>

              {selectedUpgrade && (
                <Alert className="bg-primary/10 border-primary/30">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Select {selectedUpgradeData?.slotsRequired} matching slot(s) to install this upgrade
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                {UPGRADES.filter((upgrade) => availableSlots.some((s) => s.type === upgrade.type)).map((upgrade) => {
                  const isSelected = selectedUpgrade === upgrade.id
                  const canAfford = pilot.credits >= upgrade.cost
                  const hasMatchingSlots = availableSlots.some((s) => s.type === upgrade.type && !s.filled)

                  return (
                    <Card
                      key={upgrade.id}
                      className={`p-4 cursor-pointer transition-all ${
                        isSelected ? "bg-primary/20 border-primary" : "bg-card border-border hover:border-primary/50"
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedUpgrade(null)
                          setSelectedSlots([])
                        } else {
                          setSelectedUpgrade(upgrade.id)
                          setSelectedSlots([])
                        }
                      }}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{upgrade.name}</h4>
                              <Badge variant="outline" className="text-xs capitalize">
                                {upgrade.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{upgrade.description}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-amber-400/50 bg-amber-950/30 text-amber-300 whitespace-nowrap"
                          >
                            {upgrade.cost} CR
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <span>Threat: {upgrade.threatValue}</span>
                            <span>
                              Slots: {upgrade.slotsRequired} {upgrade.type}
                            </span>
                          </div>
                          {!canAfford && <span className="text-destructive">Can't afford</span>}
                          {!hasMatchingSlots && canAfford && <span className="text-orange-400">No matching slots</span>}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-border shrink-0">
          <Button onClick={onClose} className="w-full gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Hangar
          </Button>
        </div>
      </Card>
    </div>
  )
}
