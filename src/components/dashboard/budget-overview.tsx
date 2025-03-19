"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBudget } from "@/lib/budget-context";

export function BudgetOverview() {
  const { income, expenses, currency, updateIncome } = useBudget();
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [newIncome, setNewIncome] = useState("");

  const progress = (expenses / income) * 100;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Monthly Overview</h2>
        <Dialog open={showAddIncome} onOpenChange={setShowAddIncome}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Income
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Monthly Income</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="income">Amount ({currency})</Label>
                <Input
                  id="income"
                  type="number"
                  value={newIncome}
                  onChange={(e) => setNewIncome(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <Button
                onClick={() => {
                  updateIncome(Number(newIncome));
                  setShowAddIncome(false);
                }}
              >
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Monthly Income</p>
          <p className="text-2xl font-bold">{currency} {income.toLocaleString()}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Total Expenses</p>
          <p className="text-2xl font-bold">{currency} {expenses.toLocaleString()}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Remaining</p>
          <p className="text-2xl font-bold">{currency} {(income - expenses).toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Budget Usage</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </Card>
  );
}