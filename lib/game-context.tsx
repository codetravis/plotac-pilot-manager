"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { GameState, Pilot, PilotShip, CareerType } from "./types"
import { SHIPS, UPGRADES, ABILITIES, getCareerProgression } from "./game-data"

interface GameContextType {
  gameState: GameState
  createPilot: (name: string, career: string) => void
  deletePilot: (pilotId: string) => void
  selectPilot: (pilotId: string | null) => void
  addXP: (pilotId: string, amount: number) => void
  addCredits: (pilotId: string, amount: number) => void
  spendCredits: (pilotId: string, amount: number) => boolean
  levelUpPilot: (pilotId: string) => boolean
  unlockAbility: (pilotId: string, abilityId: string) => boolean
  purchaseShip: (pilotId: string, shipId: string, customName: string) => boolean
  sellShip: (pilotId: string, shipId: string, offerAmount: number) => boolean
  installUpgrade: (pilotId: string, shipId: string, upgradeId: string, slotIndices: number[]) => boolean
  removeUpgrade: (pilotId: string, shipId: string, upgradeId: string) => void
  calculateThreatLevel: (pilotId: string, shipId?: string) => number
  getAvailableSlots: (pilotId: string, shipId: string) => { index: number; type: string; filled: boolean }[]
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>({
    pilots: [],
    selectedPilotId: null,
  })

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("xwing-game-state")
    if (saved) {
      try {
        setGameState(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to load game state:", e)
      }
    }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("xwing-game-state", JSON.stringify(gameState))
  }, [gameState])

  const createPilot = (name: string, career: string) => {
    const newPilot: Pilot = {
      id: `pilot-${Date.now()}`,
      name,
      career,
      level: 1,
      xp: 0,
      credits: 2000, // Starting credits
      ships: [],
      unlockedAbilities: [],
    }
    setGameState((prev) => ({
      ...prev,
      pilots: [...prev.pilots, newPilot],
      selectedPilotId: newPilot.id,
    }))
  }

  const deletePilot = (pilotId: string) => {
    setGameState((prev) => {
      const remainingPilots = prev.pilots.filter((p) => p.id !== pilotId)
      return {
        pilots: remainingPilots,
        // If deleted pilot was selected, select the first remaining pilot or null
        selectedPilotId:
          prev.selectedPilotId === pilotId
            ? remainingPilots.length > 0
              ? remainingPilots[0].id
              : null
            : prev.selectedPilotId,
      }
    })
  }

  const selectPilot = (pilotId: string | null) => {
    setGameState((prev) => ({ ...prev, selectedPilotId: pilotId }))
  }

  const addXP = (pilotId: string, amount: number) => {
    setGameState((prev) => ({
      ...prev,
      pilots: prev.pilots.map((p) => (p.id === pilotId ? { ...p, xp: p.xp + amount } : p)),
    }))
  }

  const addCredits = (pilotId: string, amount: number) => {
    setGameState((prev) => ({
      ...prev,
      pilots: prev.pilots.map((p) => (p.id === pilotId ? { ...p, credits: p.credits + amount } : p)),
    }))
  }

  const spendCredits = (pilotId: string, amount: number): boolean => {
    const pilot = gameState.pilots.find((p) => p.id === pilotId)
    if (!pilot || pilot.credits < amount) return false

    setGameState((prev) => ({
      ...prev,
      pilots: prev.pilots.map((p) => (p.id === pilotId ? { ...p, credits: p.credits - amount } : p)),
    }))
    return true
  }

  const levelUpPilot = (pilotId: string): boolean => {
    const pilot = gameState.pilots.find((p) => p.id === pilotId)
    if (!pilot) return false

    const careerLevels = getCareerProgression(pilot.career as CareerType)
    const nextLevel = careerLevels.find((l) => l.level === pilot.level + 1)
    if (!nextLevel || pilot.xp < nextLevel.xpRequired) return false

    setGameState((prev) => ({
      ...prev,
      pilots: prev.pilots.map((p) => (p.id === pilotId ? { ...p, level: p.level + 1 } : p)),
    }))
    return true
  }

  const unlockAbility = (pilotId: string, abilityId: string): boolean => {
    const pilot = gameState.pilots.find((p) => p.id === pilotId)
    const ability = ABILITIES.find((a) => a.id === abilityId)

    if (!pilot || !ability || pilot.xp < ability.xpCost || pilot.unlockedAbilities.includes(abilityId)) {
      return false
    }

    setGameState((prev) => ({
      ...prev,
      pilots: prev.pilots.map((p) =>
        p.id === pilotId
          ? { ...p, xp: p.xp - ability.xpCost, unlockedAbilities: [...p.unlockedAbilities, abilityId] }
          : p,
      ),
    }))
    return true
  }

  const purchaseShip = (pilotId: string, shipId: string, customName: string): boolean => {
    const pilot = gameState.pilots.find((p) => p.id === pilotId)
    const ship = SHIPS.find((s) => s.id === shipId)

    if (!pilot || !ship || pilot.credits < ship.cost || pilot.ships.length >= 2) return false

    const newShip: PilotShip = {
      id: `ship-${Date.now()}`,
      shipId,
      name: customName || ship.name,
      upgrades: [],
    }

    setGameState((prev) => ({
      ...prev,
      pilots: prev.pilots.map((p) =>
        p.id === pilotId ? { ...p, credits: p.credits - ship.cost, ships: [...p.ships, newShip] } : p,
      ),
    }))
    return true
  }

  const sellShip = (pilotId: string, shipId: string, offerAmount: number): boolean => {
    const pilot = gameState.pilots.find((p) => p.id === pilotId)
    const pilotShip = pilot?.ships.find((s) => s.id === shipId)

    if (!pilot || !pilotShip) return false

    setGameState((prev) => ({
      ...prev,
      pilots: prev.pilots.map((p) =>
        p.id === pilotId
          ? {
              ...p,
              credits: p.credits + offerAmount,
              ships: p.ships.filter((s) => s.id !== shipId),
            }
          : p,
      ),
    }))
    return true
  }

  const getAvailableSlots = (pilotId: string, shipId: string) => {
    const pilot = gameState.pilots.find((p) => p.id === pilotId)
    const pilotShip = pilot?.ships.find((s) => s.id === shipId)
    const ship = SHIPS.find((s) => s.id === pilotShip?.shipId)

    if (!pilot || !pilotShip || !ship) return []

    // Get base ship slots
    const slots = [...ship.baseSlots]

    const careerLevels = getCareerProgression(pilot.career as CareerType)
    const levelData = careerLevels.find((l) => l.level === pilot.level)
    if (levelData) {
      levelData.bonusUpgradeSlots.forEach((slotType) => {
        slots.push({ type: slotType, filled: false })
      })
    }

    // Mark filled slots
    pilotShip.upgrades.forEach((upgrade) => {
      upgrade.slotIndices.forEach((idx) => {
        if (slots[idx]) {
          slots[idx] = { ...slots[idx], filled: true }
        }
      })
    })

    return slots.map((slot, index) => ({ index, ...slot }))
  }

  const installUpgrade = (pilotId: string, shipId: string, upgradeId: string, slotIndices: number[]): boolean => {
    const pilot = gameState.pilots.find((p) => p.id === pilotId)
    const upgrade = UPGRADES.find((u) => u.id === upgradeId)

    if (!pilot || !upgrade || pilot.credits < upgrade.cost) return false

    const slots = getAvailableSlots(pilotId, shipId)

    // Validate slots
    if (slotIndices.length !== upgrade.slotsRequired) return false
    for (const idx of slotIndices) {
      const slot = slots.find((s) => s.index === idx)
      if (!slot || slot.filled || slot.type !== upgrade.type) return false
    }

    setGameState((prev) => ({
      ...prev,
      pilots: prev.pilots.map((p) =>
        p.id === pilotId
          ? {
              ...p,
              credits: p.credits - upgrade.cost,
              ships: p.ships.map((s) =>
                s.id === shipId ? { ...s, upgrades: [...s.upgrades, { upgradeId, slotIndices }] } : s,
              ),
            }
          : p,
      ),
    }))
    return true
  }

  const removeUpgrade = (pilotId: string, shipId: string, upgradeId: string) => {
    setGameState((prev) => ({
      ...prev,
      pilots: prev.pilots.map((p) =>
        p.id === pilotId
          ? {
              ...p,
              ships: p.ships.map((s) =>
                s.id === shipId ? { ...s, upgrades: s.upgrades.filter((u) => u.upgradeId !== upgradeId) } : s,
              ),
            }
          : p,
      ),
    }))
  }

  const calculateThreatLevel = (pilotId: string, shipId?: string): number => {
    const pilot = gameState.pilots.find((p) => p.id === pilotId)
    if (!pilot) return 0

    // If no shipId provided, return 0 (no ship selected)
    if (!shipId) return 0

    const pilotShip = pilot.ships.find((s) => s.id === shipId)
    if (!pilotShip) return 0

    let totalThreat = 0

    // Pilot level threat (shared across all ships)
    const careerLevels = getCareerProgression(pilot.career as CareerType)
    const levelData = careerLevels.find((l) => l.level === pilot.level)
    if (levelData) totalThreat += levelData.threatValue

    // Abilities threat (shared across all ships)
    pilot.unlockedAbilities.forEach((abilityId) => {
      const ability = ABILITIES.find((a) => a.id === abilityId)
      if (ability) totalThreat += ability.threatValue
    })

    // This specific ship's threat
    const ship = SHIPS.find((s) => s.id === pilotShip.shipId)
    if (ship) totalThreat += ship.threatValue

    // This specific ship's upgrades threat
    pilotShip.upgrades.forEach((installedUpgrade) => {
      const upgrade = UPGRADES.find((u) => u.id === installedUpgrade.upgradeId)
      if (upgrade) totalThreat += upgrade.threatValue
    })

    return Math.floor(totalThreat / 25)
  }

  return (
    <GameContext.Provider
      value={{
        gameState,
        createPilot,
        deletePilot,
        selectPilot,
        addXP,
        addCredits,
        spendCredits,
        levelUpPilot,
        unlockAbility,
        purchaseShip,
        sellShip,
        installUpgrade,
        removeUpgrade,
        calculateThreatLevel,
        getAvailableSlots,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGame must be used within GameProvider")
  }
  return context
}
