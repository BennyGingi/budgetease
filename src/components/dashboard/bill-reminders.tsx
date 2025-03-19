// src/components/dashboard/bill-reminders.tsx

"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, Plus, Trash2 } from "lucide-react";
import { useBudget, Reminder } from "@/lib/budget-context";  // Import Reminder type
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

export function BillReminders() {
  const { reminders, addReminder, removeReminder } = useBudget();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminder, setNewReminder] = useState({
    name: "",
    amount: "",
    dueDate: "",
    note: "",
  });

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const handleAddReminder = () => {
    const dueDate = new Date(newReminder.dueDate);
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - 3); // Set reminder 3 days before

    const reminder: Reminder = {
      id: Date.now().toString(),
      expenseId: Date.now().toString(),
      expenseName: `${newReminder.name}${newReminder.note ? ` - ${newReminder.note}` : ''}`,
      amount: Number(newReminder.amount),
      dueDate: dueDate.toISOString(),
      reminderDate: reminderDate.toISOString(),
      notified: false,
    };

    addReminder(reminder);
    setShowAddReminder(false);
    setNewReminder({
      name: "",
      amount: "",
      dueDate: "",
      note: "",
    });

    // Show immediate notification for testing if permission is granted
    if (Notification.permission === 'granted') {
      new Notification('Reminder Set', {
        body: `Reminder set for ${reminder.expenseName} - $${reminder.amount} due on ${format(dueDate, 'PPP')}`,
        icon: '/favicon.ico',
      });
    }
  };

  const sortedReminders = [...reminders].sort((a, b) =>
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Bill Reminders</h2>
        <div className="flex gap-2">
          {notificationPermission !== 'granted' && (
            <Button onClick={requestNotificationPermission}>
              <Bell className="mr-2 h-4 w-4" />
              Enable Notifications
            </Button>
          )}
          <Dialog open={showAddReminder} onOpenChange={setShowAddReminder}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Reminder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Reminder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Reminder Name</Label>
                  <Input
                    id="name"
                    value={newReminder.name}
                    onChange={(e) =>
                      setNewReminder({ ...newReminder, name: e.target.value })
                    }
                    placeholder="Enter reminder name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newReminder.amount}
                    onChange={(e) =>
                      setNewReminder({ ...newReminder, amount: e.target.value })
                    }
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={newReminder.dueDate}
                    onChange={(e) =>
                      setNewReminder({ ...newReminder, dueDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Note (Optional)</Label>
                  <Input
                    id="note"
                    value={newReminder.note}
                    onChange={(e) =>
                      setNewReminder({ ...newReminder, note: e.target.value })
                    }
                    placeholder="Add a note"
                  />
                </div>
                <Button
                  onClick={handleAddReminder}
                  disabled={!newReminder.name || !newReminder.amount || !newReminder.dueDate}
                >
                  Save Reminder
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        {sortedReminders.length === 0 ? (
          <div className="text-center p-6 border-2 border-dashed rounded-lg">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">No Reminders Set</p>
            <p className="text-sm text-muted-foreground">
              Click &quot;Add Reminder&quot; to create your first reminder
            </p>
          </div>
        ) : (
          sortedReminders.map((reminder) => (
            <div
              key={reminder.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <h3 className="font-medium">{reminder.expenseName}</h3>
                <p className="text-sm text-muted-foreground">
                  ${reminder.amount.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {format(new Date(reminder.dueDate), 'PPP')}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeReminder(reminder.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
