"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Save, Download, Trash2 } from "lucide-react";
import { useBudget, BudgetTemplate } from "@/lib/budget-context";
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

export function BudgetTemplates() {
  const { income, categories, recurringExpenses, templates, saveTemplate, loadTemplate, removeTemplate } = useBudget();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState<{
    name: string;
    description: string;
    type: "custom" | "seasonal" | "lifestyle";
  }>({
    name: "",
    description: "",
    type: "custom",
  });

  const handleSaveTemplate = () => {
    const template: BudgetTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      description: newTemplate.description,
      type: newTemplate.type,
      income,
      categories,
      recurringExpenses,
      createdAt: new Date().toISOString(),
    };

    saveTemplate(template);
    setShowSaveDialog(false);
    setNewTemplate({
      name: "",
      description: "",
      type: "custom",
    });
  };

  const handleLoadTemplate = (templateId: string) => {
    loadTemplate(templateId);
  };

  const handleDeleteTemplate = () => {
    if (selectedTemplate) {
      removeTemplate(selectedTemplate);
      setShowDeleteDialog(false);
      setSelectedTemplate(null);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Budget Templates</h2>
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Save Current Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save as Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={newTemplate.name}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, name: e.target.value })
                  }
                  placeholder="Enter template name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newTemplate.description}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, description: e.target.value })
                  }
                  placeholder="Enter template description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Template Type</Label>
                <Select
                  value={newTemplate.type}
                  onValueChange={(value: "custom" | "seasonal" | "lifestyle") =>
                    setNewTemplate({ ...newTemplate, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleSaveTemplate}
                disabled={!newTemplate.name || !newTemplate.description}
              >
                Save Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="p-4 space-y-4">
            <div>
              <h3 className="font-medium">{template.name}</h3>
              <p className="text-sm text-muted-foreground">{template.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                  {template.type}
                </span>
                <span className="text-xs text-muted-foreground">
                  Income: ${template.income.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleLoadTemplate(template.id)}
              >
                <Download className="mr-2 h-4 w-4" />
                Load
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTemplate(template.id);
                  setShowDeleteDialog(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}