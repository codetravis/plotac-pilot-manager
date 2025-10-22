// Core game data types
export type SlotType =
  | "astromech"
  | "cannon"
  | "configuration"
  | "crew"
  | "gunner"
  | "illicit"
  | "missile"
  | "modification"
  | "payload"
  | "sensor"
  | "tech"
  | "title"
  | "torpedo"
  | "turret"

export interface Pilot {
  id: string
  name: string
  career: string
  level: number
  xp: number
  credits: number
  ships: PilotShip[]
  unlockedAbilities: string[] // ability IDs
}

export interface PilotShip {
  id: string
  shipId: string // reference to Ship
  name: string // custom name for this instance
  upgrades: InstalledUpgrade[]
}

export interface InstalledUpgrade {
  upgradeId: string
  slotIndices: number[] // which slots this upgrade occupies
}

export interface Ship {
  id: string
  name: string
  manufacturer: string
  baseSlots: ShipSlot[]
  threatValue: number
  cost: number
  description: string
}

export interface ShipSlot {
  type: SlotType
  filled: boolean
}

export interface Upgrade {
  id: string
  name: string
  type: SlotType
  slotsRequired: number
  threatValue: number
  cost: number
  description: string
}

export interface Ability {
  id: string
  name: string
  xpCost: number
  threatValue: number
  description: string
  requiredLevel: number
  careers: CareerType[] // which careers can use this ability
}

export interface ShipDealer {
  id: string
  name: string
  description: string
  shipIds: string[] // ships this dealer sells
}

export type CareerType =
  | "Organizer"
  | "Professional"
  | "Gambler"
  | "Slicer"
  | "Gearhead"
  | "Demolitions"
  | "Cyborg"
  | "Miner"

export interface CareerProgression {
  career: CareerType
  levels: LevelProgression[]
}

export interface LevelProgression {
  level: number
  xpRequired: number
  abilitySlots: number
  bonusUpgradeSlots: SlotType[]
  threatValue: number
  initiative?: number // Added initiative field for career-specific initiative values
}

// Game state
export interface GameState {
  pilots: Pilot[]
  selectedPilotId: string | null
}
