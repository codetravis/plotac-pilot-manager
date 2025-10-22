"use client"

import { useGame } from "@/lib/game-context"
import { ABILITIES, LEVEL_PROGRESSION } from "@/lib/game-data"
import type { Pilot } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Lock, CheckCircle2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AbilityManagerProps {
  pilot: Pilot
}

export function AbilityManager({ pilot }: AbilityManagerProps) {
  const { unlockAbility } = useGame()
  const currentLevel = LEVEL_PROGRESSION.find((l) => l.level === pilot.level)
  const maxAbilitySlots = currentLevel?.abilitySlots || 0
  const usedSlots = pilot.unlockedAbilities.length
  const availableSlots = maxAbilitySlots - usedSlots

  const handleUnlock = (abilityId: string) => {
    unlockAbility(pilot.id, abilityId)
  }

  // Separate abilities into categories, filtered by career
  const unlockedAbilities = ABILITIES.filter(
    (a) => pilot.unlockedAbilities.includes(a.id) && a.careers.includes(pilot.career as any),
  )
  const availableAbilities = ABILITIES.filter(
    (a) =>
      !pilot.unlockedAbilities.includes(a.id) &&
      a.requiredLevel <= pilot.level &&
      a.careers.includes(pilot.career as any),
  )
  const lockedAbilities = ABILITIES.filter(
    (a) => a.requiredLevel > pilot.level && a.careers.includes(pilot.career as any),
  )

  return (
    <div className="space-y-6">
      {/* Ability Slots Overview */}
      <Card className="p-6 bg-card border-border">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-card-foreground">Ability Slots</h3>
            <div className="text-right">
              <p className="text-2xl font-bold text-card-foreground">
                {usedSlots} / {maxAbilitySlots}
              </p>
              <p className="text-xs text-muted-foreground">Slots Used</p>
            </div>
          </div>

          <div className="flex gap-2">
            {Array.from({ length: maxAbilitySlots }).map((_, idx) => (
              <div
                key={idx}
                className={`h-12 flex-1 rounded-lg border-2 flex items-center justify-center transition-all ${
                  idx < usedSlots ? "bg-primary/10 border-primary" : "bg-muted border-muted-foreground/20 border-dashed"
                }`}
              >
                {idx < usedSlots ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>

          {availableSlots === 0 && availableAbilities.length > 0 && (
            <Alert className="bg-destructive/10 border-destructive/50">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-sm text-card-foreground">
                All ability slots are full. Level up to unlock more slots.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Available XP:</span>
            <span className="font-semibold text-primary">{pilot.xp} XP</span>
          </div>
        </div>
      </Card>

      {/* Unlocked Abilities */}
      {unlockedAbilities.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-card-foreground">Unlocked Abilities</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {unlockedAbilities.map((ability) => (
              <Card key={ability.id} className="p-4 bg-gradient-to-br from-primary/10 to-card/10 border-primary">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold text-card-foreground">{ability.name}</h4>
                      </div>
                      <p className="text-sm text-card-foreground">{ability.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-primary/10">
                    <span className="text-card-foreground">Threat Value: {ability.threatValue}</span>
                    <Badge variant="outline" className="text-primary border-primary/10">
                      Active
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Abilities */}
      {availableAbilities.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-card-foreground">Available Abilities</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {availableAbilities.map((ability) => {
              const canAfford = pilot.xp >= ability.xpCost
              const hasSlot = availableSlots > 0

              return (
                <Card
                  key={ability.id}
                  className="p-4 bg-card/10 border-border hover:border-border-foreground transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold text-card-foreground">{ability.name}</h4>
                        </div>
                        <p className="text-sm text-card-foreground">{ability.description}</p>
                      </div>
                      <Badge variant="outline" className="text-primary border-primary/10 whitespace-nowrap">
                        {ability.xpCost} XP
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-card-foreground">
                      <span>Threat: {ability.threatValue}</span>
                      <span>Required Level: {ability.requiredLevel}</span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleUnlock(ability.id)}
                      disabled={!canAfford || !hasSlot}
                      className="w-full gap-2"
                    >
                      <Zap className="h-4 w-4" />
                      Unlock Ability
                    </Button>

                    {!canAfford && (
                      <p className="text-xs text-destructive text-center">Need {ability.xpCost - pilot.xp} more XP</p>
                    )}
                    {!hasSlot && canAfford && (
                      <p className="text-xs text-warning text-center">No ability slots available</p>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Locked Abilities */}
      {lockedAbilities.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-card-foreground">Locked Abilities</h3>
          <p className="text-sm text-muted-foreground">Level up to unlock these abilities</p>
          <div className="grid md:grid-cols-2 gap-3">
            {lockedAbilities.map((ability) => (
              <Card key={ability.id} className="p-4 bg-card/10 border-border opacity-60">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold text-muted-foreground">{ability.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{ability.description}</p>
                    </div>
                    <Badge variant="outline" className="text-muted-foreground border-border whitespace-nowrap">
                      {ability.xpCost} XP
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Threat: {ability.threatValue}</span>
                    <span className="text-warning">Requires Level {ability.requiredLevel}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
