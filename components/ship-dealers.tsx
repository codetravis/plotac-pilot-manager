"use client"

import { useState } from "react"
import { useGame } from "@/lib/game-context"
import { SHIP_DEALERS, SHIPS } from "@/lib/game-data"
import type { Pilot } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Coins, ShoppingCart, X, AlertCircle, Dices } from "lucide-react"

interface ShipDealersProps {
  pilot: Pilot
}

export function ShipDealers({ pilot }: ShipDealersProps) {
  const { purchaseShip } = useGame()
  const [selectedDealer, setSelectedDealer] = useState(SHIP_DEALERS[0].id)
  const [purchasingShip, setPurchasingShip] = useState<string | null>(null)
  const [customName, setCustomName] = useState("")
  const [junkyardRoll, setJunkyardRoll] = useState<{
    shipId: string
    upgradesRoll: number
  } | null>(null)

  const dealer = SHIP_DEALERS.find((d) => d.id === selectedDealer)
  const availableShips = SHIPS.filter((s) => dealer?.shipIds.includes(s.id))
  const hasReachedShipLimit = pilot.ships.length >= 2
  const isJunkyard = selectedDealer === "junkyard"

  const rollForSalvage = () => {
    // Roll 1d8 for ship type
    const shipRoll = Math.floor(Math.random() * 8) + 1
    let shipId: string

    if (shipRoll <= 2) {
      shipId = "salvage1"
    } else if (shipRoll <= 4) {
      shipId = "salvage2"
    } else if (shipRoll <= 7) {
      shipId = "salvage3"
    } else {
      shipId = "salvage4"
    }

    // Roll 1d6 for upgrades
    const upgradesRoll = Math.floor(Math.random() * 6) + 1

    setJunkyardRoll({ shipId, upgradesRoll })
    setPurchasingShip(shipId)
  }

  const handlePurchase = (shipId: string) => {
    const ship = SHIPS.find((s) => s.id === shipId)
    if (!ship) return

    if (purchaseShip(pilot.id, shipId, customName || ship.name)) {
      setPurchasingShip(null)
      setCustomName("")
      setJunkyardRoll(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Dealer Selection */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {SHIP_DEALERS.map((d) => (
          <Button
            key={d.id}
            variant={selectedDealer === d.id ? "default" : "outline"}
            onClick={() => setSelectedDealer(d.id)}
            className="whitespace-nowrap"
          >
            {d.name}
          </Button>
        ))}
      </div>

      {hasReachedShipLimit && (
        <Card className="p-4 bg-amber-950/20 border-amber-900/50">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-300">Ship Limit Reached</h3>
              <p className="text-sm text-amber-200/80">
                You have reached the maximum of 2 ships per pilot. Sell or remove a ship to purchase another.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Dealer Info */}
      {dealer && (
        <Card className="p-4 bg-slate-900/50 border-slate-800">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-blue-950/50 rounded-lg">
              {isJunkyard ? (
                <Dices className="h-6 w-6 text-blue-400" />
              ) : (
                <ShoppingCart className="h-6 w-6 text-blue-400" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-slate-100">{dealer.name}</h3>
              <p className="text-sm text-slate-400">{dealer.description}</p>
            </div>
          </div>
        </Card>
      )}

      {isJunkyard ? (
        <Card className="p-8 bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-slate-700">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-100">Salvage Roll</h3>
              <p className="text-slate-400">
                Take a chance on a mystery ship from the scrapyard. Could be a gem, could be junk!
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={rollForSalvage}
                disabled={hasReachedShipLimit}
                className="gap-3 text-lg px-8 py-6"
              >
                <Dices className="h-6 w-6" />
                Roll for Salvage
              </Button>
            </div>
            {hasReachedShipLimit && <p className="text-sm text-amber-400">Ship limit reached - sell a ship first</p>}
          </div>
        </Card>
      ) : (
        /* Regular dealer ship grid */
        <div className="grid md:grid-cols-2 gap-4">
          {availableShips.map((ship) => {
            const canAfford = pilot.credits >= ship.cost
            const canPurchase = canAfford && !hasReachedShipLimit

            return (
              <Card
                key={ship.id}
                className="p-5 bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-slate-100">{ship.name}</h4>
                      <p className="text-sm text-slate-400">{ship.manufacturer}</p>
                    </div>
                    <Badge variant="outline" className="border-amber-400/50 bg-amber-950/30 text-amber-300">
                      {ship.cost} CR
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-300">{ship.description}</p>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-400">Base Slots:</p>
                    <div className="flex flex-wrap gap-1">
                      {ship.baseSlots.map((slot, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs capitalize">
                          {slot.type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div className="text-sm">
                      <span className="text-slate-400">Threat: </span>
                      <span className="font-semibold text-slate-100">{ship.threatValue}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setPurchasingShip(ship.id)}
                      disabled={!canPurchase}
                      className="gap-2"
                    >
                      <Coins className="h-4 w-4" />
                      Purchase
                    </Button>
                  </div>

                  {hasReachedShipLimit && <p className="text-xs text-amber-400">Ship limit reached (2/2)</p>}
                  {!canAfford && !hasReachedShipLimit && <p className="text-xs text-red-400">Insufficient credits</p>}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Purchase Modal */}
      {purchasingShip && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-slate-900 border-slate-800">
            <div className="p-6 space-y-6">
              {(() => {
                const ship = SHIPS.find((s) => s.id === purchasingShip)
                if (!ship) return null

                return (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-slate-100">
                        {isJunkyard ? "Salvage Result" : "Purchase Ship"}
                      </h2>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setPurchasingShip(null)
                          setJunkyardRoll(null)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {isJunkyard && junkyardRoll && (
                      <div className="p-4 bg-blue-950/20 border border-blue-900/50 rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                          <Dices className="h-5 w-5 text-blue-400" />
                          <span className="font-semibold text-blue-300">Roll Results</span>
                        </div>
                        <div className="text-sm text-slate-300 space-y-1">
                          <p>
                            Ship Roll: <span className="font-semibold text-slate-100">1d8</span>
                          </p>
                          <p>
                            Upgrades Roll:{" "}
                            <span className="font-semibold text-slate-100">{junkyardRoll.upgradesRoll}</span>
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="p-4 bg-slate-950/50 rounded-lg space-y-2">
                        <h3 className="font-semibold text-slate-100">{ship.name}</h3>
                        <p className="text-sm text-slate-400">{ship.description}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                          <span className="text-sm text-slate-400">Cost:</span>
                          <span className="font-semibold text-amber-400">{ship.cost} Credits</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="shipName" className="text-slate-200">
                          Custom Ship Name (Optional)
                        </Label>
                        <Input
                          id="shipName"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder={ship.name}
                          className="bg-slate-950 border-slate-700 text-slate-100"
                        />
                        <p className="text-xs text-slate-500">Leave blank to use default name</p>
                      </div>

                      <div className="p-3 bg-blue-950/20 border border-blue-900/50 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-300">Your Credits:</span>
                          <span className="font-semibold text-slate-100">{pilot.credits}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-slate-300">After Purchase:</span>
                          <span className="font-semibold text-slate-100">{pilot.credits - ship.cost}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setPurchasingShip(null)
                          setJunkyardRoll(null)
                        }}
                        className="flex-1"
                      >
                        {isJunkyard ? "Pass" : "Cancel"}
                      </Button>
                      <Button
                        onClick={() => handlePurchase(ship.id)}
                        disabled={pilot.credits < ship.cost}
                        className="flex-1 gap-2"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {isJunkyard ? "Take It" : "Confirm Purchase"}
                      </Button>
                    </div>
                  </>
                )
              })()}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
