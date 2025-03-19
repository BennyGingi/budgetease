"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, UserPlus, Trash2, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useBudget } from "@/lib/budget-context";

export function SharedBudget() {
  const { sharedUsers, addSharedUser, removeSharedUser, updateSharedUser } = useBudget();
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    sharePercentage: "",
  });

  const handleAddUser = () => {
    addSharedUser({
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      sharePercentage: Number(newUser.sharePercentage),
    });
    setShowAddUser(false);
    setNewUser({ name: "", email: "", sharePercentage: "" });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Shared Budget</h2>
        <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Budget Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  placeholder="Enter name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder="Enter email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="share">Share Percentage</Label>
                <Input
                  id="share"
                  type="number"
                  min="0"
                  max="100"
                  value={newUser.sharePercentage}
                  onChange={(e) =>
                    setNewUser({ ...newUser, sharePercentage: e.target.value })
                  }
                  placeholder="Enter share percentage"
                />
              </div>
              <Button
                onClick={handleAddUser}
                disabled={!newUser.name || !newUser.email || !newUser.sharePercentage}
              >
                Add Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {sharedUsers.length === 0 ? (
          <div className="text-center p-6 border-2 border-dashed rounded-lg">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">No Shared Members</p>
            <p className="text-sm text-muted-foreground">
              Add members to start sharing your budget
            </p>
          </div>
        ) : (
          sharedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <h3 className="font-medium">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-sm font-medium mt-1">
                  Share: {user.sharePercentage}%
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newPercentage = prompt(
                      "Enter new share percentage",
                      user.sharePercentage.toString()
                    );
                    if (newPercentage) {
                      updateSharedUser(user.id, {
                        sharePercentage: Number(newPercentage),
                      });
                    }
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSharedUser(user.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}