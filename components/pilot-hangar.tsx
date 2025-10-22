"use client"

import { useState } from "react"
import type { Pilot } from "@/lib/types"
import { SHIPS, UPGRADES } from "@/lib/game-data"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plane, Settings, DollarSign } from "lucide-react"
import { useGame } from "@/lib/game-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PilotHangarProps {
  pilot: Pilot
  onManageShip?: (shipId: string) => void
  onNavigateToDealers?: () => void
}

export function PilotHangar({ pilot, onManageShip, onNavigateToDealers }: PilotHangarProps) {
  const { getAvailableSlots, sellShip } = useGame()
  const [sellDialogOpen, setSellDialogOpen] = useState(false)
  const [selectedShipForSale, setSelectedShipForSale] = useState<string | null>(null)
  const [sellOffer, setSellOffer] = useState<number>(0)

  const generateSellOffer = (shipId: string) => {
    const pilotShip = pilot.ships.find((s) => s.id === shipId)
    const ship = SHIPS.find((s) => s.id === pilotShip?.shipId)
    if (!ship || !pilotShip) return 0

    const isSalvageShip = ship.id.startsWith("salvage")

    if (isSalvageShip) {
      // Salvage ships have a simpler sell calculation
      const roll = Math.floor(Math.random() * 6) + 1
      return roll === 6 ? 2000 : 1000
    }

    // Roll 1d6
    const roll = Math.floor(Math.random() * 6) + 1

    // Calculate base offer based on roll
    let baseOffer = 0
    if (roll <= 2) {
      baseOffer = ship.cost / 3
    } else if (roll <= 5) {
      baseOffer = ship.cost / 2
    } else {
      baseOffer = (ship.cost * 3) / 4
    }

    // Round up to next thousand
    baseOffer = Math.ceil(baseOffer / 1000) * 1000

    // Add half the value of all attached upgrades
    let upgradesValue = 0
    pilotShip.upgrades.forEach((installed) => {
      const upgrade = UPGRADES.find((u) => u.id === installed.upgradeId)
      if (upgrade) upgradesValue += upgrade.cost
    })
    baseOffer += Math.floor(upgradesValue / 2)

    return baseOffer
  }

  const handleSellClick = (shipId: string) => {
    const offer = generateSellOffer(shipId)
    setSellOffer(offer)
    setSelectedShipForSale(shipId)
    setSellDialogOpen(true)
  }

  const handleAcceptOffer = () => {
    if (selectedShipForSale) {
      sellShip(pilot.id, selectedShipForSale, sellOffer)
      setSellDialogOpen(false)
      setSelectedShipForSale(null)
      setSellOffer(0)
    }
  }

  const handleRejectOffer = () => {
    setSellDialogOpen(false)
    setSelectedShipForSale(null)
    setSellOffer(0)
  }

  if (pilot.ships.length === 0) {
    return (
      <Card className="p-12 text-center bg-card border-border">
        <div className="max-w-md mx-auto space-y-4">
          <div className="inline-flex p-4 bg-muted rounded-full">
            <Plane className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">No Ships Yet</h3>
          <p className="text-muted-foreground">Visit the ship dealers to purchase your first ship</p>
          {onNavigateToDealers && (
            <Button onClick={onNavigateToDealers} className="mt-4">
              Browse Ship Dealers
            </Button>
          )}
        </div>
      </Card>
    )
  }

  return (
    <>
      <div className="grid md:grid-cols-2 gap-4">
        {pilot.ships.map((pilotShip) => {
          const ship = SHIPS.find((s) => s.id === pilotShip.shipId)
          if (!ship) return null

          const availableSlots = getAvailableSlots(pilot.id, pilotShip.id)
          const filledSlots = availableSlots.filter((s) => s.filled).length
          const totalSlots = availableSlots.length

          // Calculate total threat for this ship
          let shipThreat = ship.threatValue
          pilotShip.upgrades.forEach((installed) => {
            const upgrade = UPGRADES.find((u) => u.id === installed.upgradeId)
            if (upgrade) shipThreat += upgrade.threatValue
          })

          return (
            <Card key={pilotShip.id} className="p-5 bg-card border-border">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-foreground">{pilotShip.name}</h4>
                    <p className="text-sm text-muted-foreground">{ship.manufacturer}</p>
                  </div>
                  <Badge variant="outline" className="border-blue-400/50 bg-blue-950/30 text-blue-300">
                    {ship.name}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Threat:</span>
                    <span className="font-semibold text-foreground">{shipThreat}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Upgrades Installed:</span>
                    <span className="font-semibold text-foreground">{pilotShip.upgrades.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Slots Used:</span>
                    <span className="font-semibold text-foreground">
                      {filledSlots} / {totalSlots}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Installed Upgrades:</p>
                  {pilotShip.upgrades.length === 0 ? (
                    <p className="text-xs text-slate-500">None</p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {pilotShip.upgrades.map((installed) => {
                        const upgrade = UPGRADES.find((u) => u.id === installed.upgradeId)
                        if (!upgrade) return null
                        return (
                          <Badge key={installed.upgradeId} variant="secondary" className="text-xs">
                            {upgrade.name}
                          </Badge>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {onManageShip && (
                    <Button size="sm" variant="outline" onClick={() => onManageShip(pilotShip.id)} className="gap-2">
                      <Settings className="h-4 w-4" />
                      Manage
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSellClick(pilotShip.id)}
                    className="gap-2 border-amber-400/50 bg-amber-950/30 text-amber-300 hover:bg-amber-950/50"
                  >
                    <DollarSign className="h-4 w-4" />
                    Sell Ship
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <AlertDialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Sell Ship Offer</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {selectedShipForSale && (
                <>
                  A buyer has made an offer for{" "}
                  <span className="font-semibold text-foreground">
                    {pilot.ships.find((s) => s.id === selectedShipForSale)?.name}
                  </span>
                  .
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Offer Amount:</p>
              <p className="text-3xl font-bold text-amber-400">{sellOffer.toLocaleString()} Credits</p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleRejectOffer}>Reject Offer</AlertDialogCancel>
            <AlertDialogAction onClick={handleAcceptOffer} className="bg-primary text-primary-foreground">
              Accept Offer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
