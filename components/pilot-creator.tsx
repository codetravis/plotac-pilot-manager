"use client"

import { useState } from "react"
import { useGame } from "@/lib/game-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"
import type { CareerType } from "@/lib/types"

interface PilotCreatorProps {
  onClose: () => void
}

const CAREERS: CareerType[] = [
  "Organizer",
  "Professional",
  "Gambler",
  "Slicer",
  "Gearhead",
  "Demolitions",
  "Cyborg",
  "Miner",
]

export function PilotCreator({ onClose }: PilotCreatorProps) {
  const { createPilot } = useGame()
  const [name, setName] = useState("")
  const [career, setCareer] = useState<CareerType>(CAREERS[0])

  const handleCreate = () => {
    if (name.trim()) {
      createPilot(name.trim(), career)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-slate-100">Create New Pilot</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-200">
                Pilot Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter pilot name"
                className="bg-slate-950 border-slate-700 text-slate-100"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="career" className="text-slate-200">
                Career
              </Label>
              <select
                id="career"
                value={career}
                onChange={(e) => setCareer(e.target.value as CareerType)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-slate-100"
              >
                {CAREERS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 space-y-2">
              <p className="text-sm text-slate-400">Starting Resources:</p>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Level 1</li>
                <li>• 2,000 Credits</li>
                <li>• 0 XP</li>
                <li>• 1 Ability Slot</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent text-white">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!name.trim()} className="flex-1">
              Create Pilot
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
