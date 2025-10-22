"use client"

import type { Pilot, CareerType } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { useGame } from "@/lib/game-context"
import { getCareerProgression } from "@/lib/game-data"
import { Button } from "@/components/ui/button"
import { Trophy, Zap, Coins, Shield, ArrowUp, Lock, Unlock, Gift } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShipDealers } from "./ship-dealers"
import { PilotHangar } from "./pilot-hangar"
import { ShipUpgradeManager } from "./ship-upgrade-manager"
import { AbilityManager } from "./ability-manager"
import { ThreatBreakdown } from "./threat-breakdown"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PilotDashboardProps {
  pilot: Pilot
}

export function PilotDashboard({ pilot }: PilotDashboardProps) {
  const { calculateThreatLevel, addXP, addCredits, levelUpPilot } = useGame()
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [showRewards, setShowRewards] = useState(false)
  const [rewardXP, setRewardXP] = useState("")
  const [rewardCredits, setRewardCredits] = useState("")
  const [managingShipId, setManagingShipId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("hangar")

  const ship1 = pilot.ships[0]
  const ship2 = pilot.ships[1]
  const threatLevel1 = ship1 ? calculateThreatLevel(pilot.id, ship1.id) : 0
  const threatLevel2 = ship2 ? calculateThreatLevel(pilot.id, ship2.id) : 0

  const careerLevels = getCareerProgression(pilot.career as CareerType)
  const currentLevel = careerLevels.find((l) => l.level === pilot.level)
  const nextLevel = careerLevels.find((l) => l.level === pilot.level + 1)
  const canLevelUp = nextLevel && pilot.xp >= nextLevel.xpRequired

  const handleLevelUp = () => {
    if (levelUpPilot(pilot.id)) {
      setShowLevelUp(false)
    }
  }

  const handleAddRewards = () => {
    const xp = Number.parseInt(rewardXP) || 0
    const credits = Number.parseInt(rewardCredits) || 0

    if (xp > 0) addXP(pilot.id, xp)
    if (credits > 0) addCredits(pilot.id, credits)

    setShowRewards(false)
    setRewardXP("")
    setRewardCredits("")
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Pilot Header */}
      <Card className="p-4 sm:p-6 bg-slate-900/50 border-slate-800">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">{pilot.name}</h2>
            <p className="text-base sm:text-lg text-slate-400">{pilot.career}</p>
          </div>
          <div className="text-left sm:text-right space-y-2">
            <div className="flex items-center gap-2 text-lg sm:text-xl font-bold text-amber-400">
              <Shield className="h-5 w-5" />
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                <span>Ship 1: TL {threatLevel1}</span>
                <span className="hidden sm:inline text-slate-600">|</span>
                <span>Ship 2: TL {threatLevel2}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">Threat levels per ship</p>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 bg-slate-900/50 border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-950/50 rounded-lg">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-400">Level</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-100">{pilot.level}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/50 border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-950/50 rounded-lg">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-400">Experience</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-100">{pilot.xp} XP</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/50 border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-950/50 rounded-lg">
              <Coins className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-400">Credits</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-100">{pilot.credits}</p>
            </div>
          </div>
        </Card>
      </div>

      {canLevelUp && (
        <Card className="p-4 bg-gradient-to-r from-blue-950/50 to-purple-950/50 border-blue-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <ArrowUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-100">Level Up Available!</p>
                <p className="text-sm text-slate-300">You have enough XP to reach level {nextLevel.level}</p>
              </div>
            </div>
            <Button onClick={() => setShowLevelUp(true)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              Level Up
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-4 bg-gradient-to-r from-green-950/50 to-emerald-950/50 border-green-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Gift className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-100">Mission Complete</p>
              <p className="text-sm text-slate-300">Add XP and credits earned from your mission</p>
            </div>
          </div>
          <Button onClick={() => setShowRewards(true)} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            Add Rewards
          </Button>
        </div>
      </Card>

      <Card className="p-4 sm:p-6 bg-slate-900/50 border-slate-800">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-100 mb-4">Level Progress</h3>
            {nextLevel ? (
              <span className="text-xs sm:text-sm text-slate-400">
                {pilot.xp} / {nextLevel.xpRequired} XP
              </span>
            ) : (
              <Badge variant="secondary">Max Level</Badge>
            )}
          </div>

          {nextLevel && (
            <>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                  style={{ width: `${Math.min((pilot.xp / nextLevel.xpRequired) * 100, 100)}%` }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-300">Next Level Unlocks:</p>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• {nextLevel.abilitySlots} Ability Slots</li>
                    <li>• {nextLevel.bonusUpgradeSlots.length} Bonus Upgrade Slots</li>
                    <li>• +{nextLevel.threatValue - (currentLevel?.threatValue || 0)} Threat Value</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-300">Bonus Slots:</p>
                  <div className="flex flex-wrap gap-1">
                    {nextLevel.bonusUpgradeSlots.map((slot, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs capitalize text-white">
                        {slot}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      <Card className="p-4 sm:p-6 bg-slate-900/50 border-slate-800">
        <h3 className="font-semibold text-slate-100 mb-4">Current Level Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Ability Slots</span>
              <span className="font-semibold text-slate-100">
                {pilot.unlockedAbilities.length} / {currentLevel?.abilitySlots || 0}
              </span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: currentLevel?.abilitySlots || 0 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-8 flex-1 rounded border-2 flex items-center justify-center ${
                    idx < pilot.unlockedAbilities.length
                      ? "bg-purple-950/50 border-purple-700"
                      : "bg-slate-800 border-slate-700"
                  }`}
                >
                  {idx < pilot.unlockedAbilities.length ? (
                    <Unlock className="h-4 w-4 text-purple-400" />
                  ) : (
                    <Lock className="h-4 w-4 text-slate-600" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Bonus Upgrade Slots</span>
              <span className="font-semibold text-slate-100">{currentLevel?.bonusUpgradeSlots.length || 0}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentLevel?.bonusUpgradeSlots.map((slot, idx) => (
                <Badge key={idx} variant="secondary" className="capitalize">
                  {slot}
                </Badge>
              ))}
              {(!currentLevel?.bonusUpgradeSlots || currentLevel.bonusUpgradeSlots.length === 0) && (
                <span className="text-sm text-slate-500">None yet</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {showRewards && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-slate-900 border-slate-800">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex p-4 bg-green-950/50 rounded-full">
                  <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Mission Rewards</h2>
                <p className="text-sm sm:text-base text-slate-400">Add XP and credits earned from your mission</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reward-xp" className="text-slate-300">
                    Experience Points (XP)
                  </Label>
                  <Input
                    id="reward-xp"
                    type="number"
                    min="0"
                    placeholder="Enter XP amount"
                    value={rewardXP}
                    onChange={(e) => setRewardXP(e.target.value)}
                    className="bg-slate-950 border-slate-700 text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reward-credits" className="text-slate-300">
                    Credits
                  </Label>
                  <Input
                    id="reward-credits"
                    type="number"
                    min="0"
                    placeholder="Enter credits amount"
                    value={rewardCredits}
                    onChange={(e) => setRewardCredits(e.target.value)}
                    className="bg-slate-950 border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRewards(false)
                    setRewardXP("")
                    setRewardCredits("")
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddRewards}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={!rewardXP && !rewardCredits}
                >
                  Add Rewards
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-muted">
          <TabsTrigger value="hangar" className="text-xs sm:text-sm">
            Hangar ({pilot.ships.length})
          </TabsTrigger>
          <TabsTrigger value="dealers" className="text-xs sm:text-sm">
            Dealers
          </TabsTrigger>
          <TabsTrigger value="abilities" className="text-xs sm:text-sm">
            Abilities ({pilot.unlockedAbilities.length})
          </TabsTrigger>
          <TabsTrigger value="threat" className="text-xs sm:text-sm">
            Threat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hangar">
          <PilotHangar
            pilot={pilot}
            onManageShip={setManagingShipId}
            onNavigateToDealers={() => setActiveTab("dealers")}
          />
        </TabsContent>

        <TabsContent value="dealers">
          <ShipDealers pilot={pilot} />
        </TabsContent>

        <TabsContent value="abilities">
          <AbilityManager pilot={pilot} />
        </TabsContent>

        <TabsContent value="threat">
          <ThreatBreakdown pilot={pilot} />
        </TabsContent>
      </Tabs>

      {managingShipId && (
        <ShipUpgradeManager pilot={pilot} shipId={managingShipId} onClose={() => setManagingShipId(null)} />
      )}
    </div>
  )
}
