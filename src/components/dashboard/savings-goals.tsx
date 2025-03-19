"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Target, Trash2, PlusCircle, Calendar } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useBudget } from "@/lib/budget-context"
import { format, addMonths } from "date-fns"

// Define the SavingsContribution type to match what's in budget-context
interface SavingsContribution {
  id: string
  amount: number
  date: string
  type: "one-time" | "recurring"
}

// Define the RecurringContribution type
interface RecurringContribution {
  id: string
  amount: number
  frequency: "weekly" | "monthly"
  startDate: string
  nextContributionDate: string
}

// Define the SavingsGoal type to match what's in budget-context
interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  createdAt: string
  contributions: SavingsContribution[]
  recurringContributions: RecurringContribution[]
}

export function SavingsGoals() {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, removeSavingsGoal, addSavingsContribution, currency } =
    useBudget()
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [showAddContribution, setShowAddContribution] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    targetDate: "",
  })
  const [newContribution, setNewContribution] = useState({
    amount: "",
    type: "one-time" as "one-time" | "recurring",
    frequency: "monthly" as "weekly" | "monthly",
  })

  const handleAddGoal = () => {
    const goal: SavingsGoal = {
      id: Date.now().toString(),
      name: newGoal.name,
      targetAmount: Number(newGoal.targetAmount),
      currentAmount: 0,
      targetDate: new Date(newGoal.targetDate).toISOString(),
      createdAt: new Date().toISOString(),
      contributions: [],
      recurringContributions: [],
    }

    addSavingsGoal(goal)
    setShowAddGoal(false)
    setNewGoal({ name: "", targetAmount: "", targetDate: "" })
  }

  const handleAddContribution = () => {
    if (!selectedGoal) return

    const amount = Number(newContribution.amount)
    addSavingsContribution(selectedGoal, amount, newContribution.type)

    setShowAddContribution(false)
    setNewContribution({
      amount: "",
      type: "one-time",
      frequency: "monthly",
    })
  }

  const calculateTimeToGoal = (goal: SavingsGoal) => {
    const remaining = goal.targetAmount - goal.currentAmount
    const monthlyRate = goal.recurringContributions.reduce((sum: number, contrib: RecurringContribution) => {
      if (contrib.frequency === "monthly") return sum + contrib.amount
      return sum + (contrib.amount * 52) / 12 // Convert weekly to monthly
    }, 0)

    if (monthlyRate <= 0) return "No recurring contributions"

    const months = Math.ceil(remaining / monthlyRate)
    const targetDate = addMonths(new Date(), months)
    return `Expected by ${format(targetDate, "MMM yyyy")}`
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Savings Goals</h2>
        <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Savings Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Goal Name</Label>
                <Input
                  id="name"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder="Enter goal name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount ({currency})</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  placeholder="Enter target amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Date</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                />
              </div>
              <Button onClick={handleAddGoal} disabled={!newGoal.name || !newGoal.targetAmount || !newGoal.targetDate}>
                Save Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {savingsGoals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100
          return (
            <div key={goal.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">{goal.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog
                    open={showAddContribution && selectedGoal === goal.id}
                    onOpenChange={(open) => {
                      setShowAddContribution(open)
                      if (open) setSelectedGoal(goal.id)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Contribution
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Contribution</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount ({currency})</Label>
                          <Input
                            id="amount"
                            type="number"
                            value={newContribution.amount}
                            onChange={(e) =>
                              setNewContribution({
                                ...newContribution,
                                amount: e.target.value,
                              })
                            }
                            placeholder="Enter amount"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Contribution Type</Label>
                          <div className="flex gap-2">
                            <Button
                              variant={newContribution.type === "one-time" ? "default" : "outline"}
                              onClick={() =>
                                setNewContribution({
                                  ...newContribution,
                                  type: "one-time",
                                })
                              }
                            >
                              One-time
                            </Button>
                            <Button
                              variant={newContribution.type === "recurring" ? "default" : "outline"}
                              onClick={() =>
                                setNewContribution({
                                  ...newContribution,
                                  type: "recurring",
                                })
                              }
                            >
                              Recurring
                            </Button>
                          </div>
                        </div>
                        {newContribution.type === "recurring" && (
                          <div className="space-y-2">
                            <Label>Frequency</Label>
                            <div className="flex gap-2">
                              <Button
                                variant={newContribution.frequency === "weekly" ? "default" : "outline"}
                                onClick={() =>
                                  setNewContribution({
                                    ...newContribution,
                                    frequency: "weekly",
                                  })
                                }
                              >
                                Weekly
                              </Button>
                              <Button
                                variant={newContribution.frequency === "monthly" ? "default" : "outline"}
                                onClick={() =>
                                  setNewContribution({
                                    ...newContribution,
                                    frequency: "monthly",
                                  })
                                }
                              >
                                Monthly
                              </Button>
                            </div>
                          </div>
                        )}
                        <Button onClick={handleAddContribution}>Add Contribution</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="sm" onClick={() => removeSavingsGoal(goal.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    {currency} {goal.currentAmount.toLocaleString()} of {currency} {goal.targetAmount.toLocaleString()}
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Target: {format(new Date(goal.targetDate), "PP")}
                  </span>
                  <span>{calculateTimeToGoal(goal)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

