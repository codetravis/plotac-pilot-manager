"use client"

import { useGame } from "@/lib/game-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { PilotCreator } from "@/components/pilot-creator"
import { PilotDashboard } from "@/components/pilot-dashboard"
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

export default function Home() {
  const { gameState, selectPilot, deletePilot } = useGame()
  const [showCreator, setShowCreator] = useState(false)
  const [pilotToDelete, setPilotToDelete] = useState<{ id: string; name: string } | null>(null)

  const selectedPilot = gameState.pilots.find((p) => p.id === gameState.selectedPilotId)

  const handleDeletePilot = () => {
    if (pilotToDelete) {
      deletePilot(pilotToDelete.id)
      setPilotToDelete(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-slate-100 truncate">X-wing Squadron Manager</h1>
              <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">Manage your pilots and their ships</p>
            </div>
            <Button onClick={() => setShowCreator(true)} className="gap-2 shrink-0" size="sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Pilot</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-8">
        {gameState.pilots.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center bg-slate-900/50 border-slate-800">
            <div className="max-w-md mx-auto space-y-4">
              <div className="text-5xl sm:text-6xl">🚀</div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100">No Pilots Yet</h2>
              <p className="text-sm sm:text-base text-slate-400">
                Create your first pilot to start building your squadron
              </p>
              <Button onClick={() => setShowCreator(true)} size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Create First Pilot
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Pilot List Sidebar */}
            <div className="lg:col-span-1 space-y-3">
              <h2 className="text-base sm:text-lg font-semibold text-slate-100 px-2">Squadron Roster</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {gameState.pilots.map((pilot) => (
                  <Card
                    key={pilot.id}
                    className={`p-3 sm:p-4 transition-colors ${
                      pilot.id === gameState.selectedPilotId
                        ? "bg-blue-950/50 border-blue-700"
                        : "bg-slate-900/50 border-slate-800 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 cursor-pointer min-w-0" onClick={() => selectPilot(pilot.id)}>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-slate-100 text-sm sm:text-base truncate">{pilot.name}</h3>
                          <p className="text-xs sm:text-sm text-slate-400">{pilot.career}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>Level {pilot.level}</span>
                            <span>•</span>
                            <span>{pilot.ships.length} ships</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-slate-400 hover:text-red-400 hover:bg-red-950/50"
                        onClick={(e) => {
                          e.stopPropagation()
                          setPilotToDelete({ id: pilot.id, name: pilot.name })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {selectedPilot ? (
                <PilotDashboard pilot={selectedPilot} />
              ) : (
                <Card className="p-8 sm:p-12 text-center bg-slate-900/50 border-slate-800">
                  <p className="text-sm sm:text-base text-slate-400">Select a pilot to view details</p>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Pilot Creator Modal */}
      {showCreator && <PilotCreator onClose={() => setShowCreator(false)} />}

      <AlertDialog open={!!pilotToDelete} onOpenChange={(open) => !open && setPilotToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pilot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">{pilotToDelete?.name}</span>? This will permanently remove
              the pilot and all their ships, upgrades, and abilities. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePilot} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
