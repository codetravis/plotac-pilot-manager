"use client"

import { useGame } from "@/lib/game-context"
import { getCareerProgression, SHIPS, UPGRADES, ABILITIES } from "@/lib/game-data"
import type { Pilot, CareerType } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, User, Plane, Wrench, Zap } from "lucide-react"

interface ThreatBreakdownProps {
  pilot: Pilot
}

export function ThreatBreakdown({ pilot }: ThreatBreakdownProps) {
  const { calculateThreatLevel } = useGame()

  const ship1 = pilot.ships[0]
  const ship2 = pilot.ships[1]

  const threatLevel1 = ship1 ? calculateThreatLevel(pilot.id, ship1.id) : 0
  const threatLevel2 = ship2 ? calculateThreatLevel(pilot.id, ship2.id) : 0

  // Calculate shared threat components (pilot level + abilities)
  const careerLevels = getCareerProgression(pilot.career as CareerType)
  const levelData = careerLevels.find((l) => l.level === pilot.level)
  const pilotThreat = levelData?.threatValue || 0

  const abilitiesThreat = pilot.unlockedAbilities.reduce((total, abilityId) => {
    const ability = ABILITIES.find((a) => a.id === abilityId)
    return total + (ability?.threatValue || 0)
  }, 0)

  // Helper function to calculate threat for a specific ship
  const getShipThreatBreakdown = (pilotShip: typeof ship1) => {
    if (!pilotShip) {
      return { shipThreat: 0, upgradesThreat: 0, totalThreat: 0 }
    }

    const ship = SHIPS.find((s) => s.id === pilotShip.shipId)
    const shipThreat = ship?.threatValue || 0

    const upgradesThreat = pilotShip.upgrades.reduce((total, installed) => {
      const upgrade = UPGRADES.find((u) => u.id === installed.upgradeId)
      return total + (upgrade?.threatValue || 0)
    }, 0)

    const totalThreat = pilotThreat + abilitiesThreat + shipThreat + upgradesThreat

    return { shipThreat, upgradesThreat, totalThreat }
  }

  const ship1Breakdown = getShipThreatBreakdown(ship1)
  const ship2Breakdown = getShipThreatBreakdown(ship2)

  const renderShipThreat = (
    shipData: typeof ship1,
    breakdown: ReturnType<typeof getShipThreatBreakdown>,
    threatLevel: number,
    shipNumber: number,
  ) => {
    const components = [
      { label: "Pilot Level", value: pilotThreat, icon: User, color: "text-blue-400" },
      { label: "Abilities", value: abilitiesThreat, icon: Zap, color: "text-purple-400" },
      { label: "Ship", value: breakdown.shipThreat, icon: Plane, color: "text-green-400" },
      { label: "Upgrades", value: breakdown.upgradesThreat, icon: Wrench, color: "text-amber-400" },
    ]

    return (
      <Card className="p-6 bg-card border-border">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-4 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">{shipData ? `${shipData.name}` : `Ship Slot ${shipNumber}`}</h3>
            <div className="text-3xl font-bold text-primary">Threat Level {threatLevel}</div>
            {shipData ? (
              <p className="text-sm text-muted-foreground">
                Total Threat: {breakdown.totalThreat} / 25 = {threatLevel}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">No ship in this slot</p>
            )}
          </div>

          {shipData && (
            <>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Threat Breakdown</h4>
                {components.map((component) => {
                  const Icon = component.icon
                  const percentage = breakdown.totalThreat > 0 ? (component.value / breakdown.totalThreat) * 100 : 0

                  return (
                    <div key={component.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${component.color}`} />
                          <span>{component.label}</span>
                        </div>
                        <span className="font-semibold">{component.value}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${component.color.replace("text-", "bg-")} transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Threat Value:</span>
                  <span className="font-bold">{breakdown.totalThreat}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Divided by 25:</span>
                  <Badge variant="outline">Threat Level {threatLevel}</Badge>
                </div>
              </div>
            </>
          )}

          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {shipData
                ? "Threat Level represents the power of this specific ship loadout. Pilot level and abilities are shared across all ships."
                : "Purchase a ship to calculate threat level for this slot."}
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {renderShipThreat(ship1, ship1Breakdown, threatLevel1, 1)}
        {renderShipThreat(ship2, ship2Breakdown, threatLevel2, 2)}
      </div>
    </div>
  )
}
