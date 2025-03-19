"use client";

import { useState, useCallback, ReactElement } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBudget } from "@/lib/budget-context";
import { format } from "date-fns";

interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  timestamp: string;
}

interface Category {
  id: string;
  name: string;
  budget: number;
  spent: number;
  items: ExpenseItem[];
  isExpanded?: boolean;
  timestamp: string;
}

// Define the SmartCategory interface that matches what's actually being used
interface SmartCategory {
  id: string;
  name: string;
  budget: number;
  spent: number;
  items: ExpenseItem[];
  isExpanded?: boolean;
  timestamp: string | ReactElement;
}

// This is to handle both types
type CategoryOrSmartCategory = Category | SmartCategory;

export function CategoryList() {
  const { categories, updateCategories, currency } = useBudget();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedItem, setSelectedItem] = useState<ExpenseItem | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", budget: "" });
  const [newItem, setNewItem] = useState({ name: "", amount: "" });

  // Helper function to ensure category conforms to Category type
  const ensureCategory = (cat: CategoryOrSmartCategory): Category => {
    // If timestamp is not a string, convert it to a string
    if (typeof cat.timestamp !== 'string') {
      return {
        ...cat,
        timestamp: new Date().toISOString(), // Default fallback
      } as Category;
    }
    return cat as Category;
  };

  const handleAddCategory = () => {
    const updatedCategories = [
      ...categories,
      {
        id: Date.now().toString(),
        name: newCategory.name,
        budget: Number(newCategory.budget),
        spent: 0,
        items: [],
        timestamp: new Date().toISOString(),
      },
    ];
    updateCategories(updatedCategories);
    setShowAddCategory(false);
    setNewCategory({ name: "", budget: "" });
  };

  const handleEditCategory = () => {
    if (!selectedCategory) return;
    const updatedCategories = categories.map((cat) =>
      cat.id === selectedCategory.id
        ? {
            ...cat,
            name: newCategory.name || cat.name,
            budget: Number(newCategory.budget) || cat.budget,
            timestamp: new Date().toISOString(),
          }
        : cat
    );
    updateCategories(updatedCategories);
    setShowEditCategory(false);
    setNewCategory({ name: "", budget: "" });
  };

  const handleDeleteCategory = () => {
    if (!selectedCategory) return;
    const updatedCategories = categories.filter((cat) => cat.id !== selectedCategory.id);
    updateCategories(updatedCategories);
    setShowDeleteDialog(false);
    setSelectedCategory(null);
  };

  const handleAddItem = (categoryId: string) => {
    const updatedCategories = categories.map((cat) =>
      cat.id === categoryId
        ? {
            ...cat,
            items: [
              ...cat.items,
              {
                id: Date.now().toString(),
                name: newItem.name,
                amount: Number(newItem.amount),
                timestamp: new Date().toISOString(),
              },
            ],
            spent: cat.spent + Number(newItem.amount),
          }
        : cat
    );
    updateCategories(updatedCategories);
    setShowAddItem(false);
    setNewItem({ name: "", amount: "" });
  };

  const handleEditItem = (categoryId: string) => {
    if (!selectedItem) return;
    const updatedCategories = categories.map((cat) =>
      cat.id === categoryId
        ? {
            ...cat,
            items: cat.items.map((item) =>
              item.id === selectedItem.id
                ? {
                    ...item,
                    name: newItem.name || item.name,
                    amount: Number(newItem.amount) || item.amount,
                    timestamp: new Date().toISOString(),
                  }
                : item
            ),
            spent:
              cat.spent -
              selectedItem.amount +
              (Number(newItem.amount) || selectedItem.amount),
          }
        : cat
    );
    updateCategories(updatedCategories);
    setShowEditItem(false);
    setNewItem({ name: "", amount: "" });
  };

  const handleDeleteItem = (categoryId: string, itemId: string, amount: number) => {
    const updatedCategories = categories.map((cat) =>
      cat.id === categoryId
        ? {
            ...cat,
            items: cat.items.filter((item) => item.id !== itemId),
            spent: cat.spent - amount,
          }
        : cat
    );
    updateCategories(updatedCategories);
  };

  const toggleCategoryExpansion = useCallback((categoryId: string) => {
    const updatedCategories = categories.map((cat) =>
      cat.id === categoryId ? { ...cat, isExpanded: !cat.isExpanded } : cat
    );
    updateCategories(updatedCategories);
  }, [categories, updateCategories]);

  const formatTimestamp = useCallback((timestamp: string | ReactElement) => {
    try {
      if (typeof timestamp === 'string') {
        return format(new Date(timestamp), "MMM d, yyyy HH:mm");
      }
      return "Invalid date";
    } catch (error) {
      return "Invalid date";
    }
  }, []);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Categories</h2>
        <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  placeholder="Enter category name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget Amount</Label>
                <Input
                  id="budget"
                  type="number"
                  value={newCategory.budget}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, budget: e.target.value })
                  }
                  placeholder="Enter budget amount"
                />
              </div>
              <Button onClick={handleAddCategory}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="rounded-lg border">
            <div className="flex items-center justify-between p-4">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currency} {category.spent.toLocaleString()} of {currency} {category.budget.toLocaleString()}
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCategoryExpansion(category.id)}
                  >
                    {category.isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <span className="ml-2 text-sm">
                      {category.items.length} items
                    </span>
                  </Button>
                  {category.timestamp && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(category.timestamp)}
                    </span>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCategory(ensureCategory(category));
                        setNewCategory({
                          name: category.name,
                          budget: category.budget.toString(),
                        });
                        setShowEditCategory(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCategory(ensureCategory(category));
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {category.isExpanded && (
              <div className="border-t p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Expenses</h4>
                  <Dialog
                    open={showAddItem && selectedCategory?.id === category.id}
                    onOpenChange={(open) => {
                      setShowAddItem(open);
                      if (open) {
                        setSelectedCategory(ensureCategory(category));
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Expense Item</DialogTitle>
                        <DialogDescription>
                          Add a new expense item to {category.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="itemName">Item Name</Label>
                          <Input
                            id="itemName"
                            value={newItem.name}
                            onChange={(e) =>
                              setNewItem({ ...newItem, name: e.target.value })
                            }
                            placeholder="Enter item name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="itemAmount">Amount ({currency})</Label>
                          <Input
                            id="itemAmount"
                            type="number"
                            value={newItem.amount}
                            onChange={(e) =>
                              setNewItem({ ...newItem, amount: e.target.value })
                            }
                            placeholder="Enter amount"
                          />
                        </div>
                        <Button onClick={() => handleAddItem(category.id)}>
                          Save
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-2">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="space-y-1">
                        <span className="text-sm">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(item.timestamp)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">
                          {currency} {item.amount.toLocaleString()}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCategory(ensureCategory(category));
                              setSelectedItem(item);
                              setNewItem({
                                name: item.name,
                                amount: item.amount.toString(),
                              });
                              setShowEditItem(true);
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteItem(category.id, item.id, item.amount)
                            }
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={showEditCategory} onOpenChange={setShowEditCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Category Name</Label>
              <Input
                id="editName"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                placeholder="Enter category name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editBudget">Budget Amount</Label>
              <Input
                id="editBudget"
                type="number"
                value={newCategory.budget}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, budget: e.target.value })
                }
                placeholder="Enter budget amount"
              />
            </div>
            <Button onClick={handleEditCategory}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditItem} onOpenChange={setShowEditItem}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editItemName">Item Name</Label>
              <Input
                id="editItemName"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                placeholder="Enter item name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editItemAmount">Amount</Label>
              <Input
                id="editItemAmount"
                type="number"
                value={newItem.amount}
                onChange={(e) =>
                  setNewItem({ ...newItem, amount: e.target.value })
                }
                placeholder="Enter amount"
              />
            </div>
            <Button
              onClick={() =>
                selectedCategory && handleEditItem(selectedCategory.id)
              }
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category and all its items. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}