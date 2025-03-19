"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBudget } from "@/lib/budget-context";

export function RecurringExpenses() {
  const { categories, recurringExpenses, addRecurringExpense, removeRecurringExpense } = useBudget();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    name: "",
    amount: "",
    categoryId: "",
    frequency: "monthly" as "monthly" | "weekly" | "yearly",
    nextDueDate: "",
  });

  const handleAddExpense = () => {
    addRecurringExpense({
      id: Date.now().toString(),
      name: newExpense.name,
      amount: Number(newExpense.amount),
      categoryId: newExpense.categoryId,
      frequency: newExpense.frequency,
      nextDueDate: new Date(newExpense.nextDueDate).toISOString(),
    });
    setShowAddExpense(false);
    setNewExpense({
      name: "",
      amount: "",
      categoryId: "",
      frequency: "monthly",
      nextDueDate: "",
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Recurring Expenses</h2>
        <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Recurring Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Recurring Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Expense Name</Label>
                <Input
                  id="name"
                  value={newExpense.name}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, name: e.target.value })
                  }
                  placeholder="Enter expense name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, amount: e.target.value })
                  }
                  placeholder="Enter amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newExpense.categoryId}
                  onValueChange={(value) =>
                    setNewExpense({ ...newExpense, categoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={newExpense.frequency}
                  onValueChange={(value: "monthly" | "weekly" | "yearly") =>
                    setNewExpense({ ...newExpense, frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextDueDate">Next Due Date</Label>
                <Input
                  id="nextDueDate"
                  type="date"
                  value={newExpense.nextDueDate}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, nextDueDate: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleAddExpense}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {recurringExpenses.map((expense) => {
          const category = categories.find((c) => c.id === expense.categoryId);
          return (
            <div
              key={expense.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <h3 className="font-medium">{expense.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {category?.name} - ${expense.amount.toLocaleString()} ({expense.frequency})
                </p>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Next due: {new Date(expense.nextDueDate).toLocaleDateString()}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeRecurringExpense(expense.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}