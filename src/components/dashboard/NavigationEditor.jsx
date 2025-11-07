import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { GripVertical, LayoutDashboard, CreditCard, TrendingUp, BarChart3, Bell, DollarSign, Save, RotateCcw } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const defaultNavigation = [
  { title: "Dashboard", page: "Dashboard", icon: "LayoutDashboard", visible: true },
  { title: "My Debts", page: "Debts", icon: "CreditCard", visible: true },
  { title: "Payoff Strategy", page: "Strategy", icon: "TrendingUp", visible: true },
  { title: "Statistics", page: "Statistics", icon: "BarChart3", visible: true },
  { title: "Notifications", page: "Notifications", icon: "Bell", visible: true },
  { title: "Profile", page: "Profile", icon: "DollarSign", visible: true },
];

const iconMap = {
  LayoutDashboard,
  CreditCard,
  TrendingUp,
  BarChart3,
  Bell,
  DollarSign,
};

export default function NavigationEditor({ open, onOpenChange, user }) {
  const [navItems, setNavItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.custom_navigation && user.custom_navigation.length > 0) {
      setNavItems(user.custom_navigation);
    } else {
      setNavItems(defaultNavigation);
    }
  }, [user]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(navItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setNavItems(items);
  };

  const toggleVisibility = (index) => {
    const updated = [...navItems];
    updated[index].visible = !updated[index].visible;
    setNavItems(updated);
  };

  const updateTitle = (index, newTitle) => {
    const updated = [...navItems];
    updated[index].title = newTitle;
    setNavItems(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe({
        custom_navigation: navItems,
      });
      toast.success("Navigation updated successfully!");
      onOpenChange(false);
      window.location.reload(); // Reload to apply changes
    } catch (error) {
      toast.error("Failed to update navigation");
    }
    setIsSaving(false);
  };

  const handleReset = async () => {
    if (confirm("Reset navigation to default?")) {
      setIsSaving(true);
      try {
        await base44.auth.updateMe({
          custom_navigation: null,
        });
        setNavItems(defaultNavigation);
        toast.success("Navigation reset to default!");
        onOpenChange(false);
        window.location.reload();
      } catch (error) {
        toast.error("Failed to reset navigation");
      }
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Navigation</DialogTitle>
          <DialogDescription>
            Reorder, rename, or hide navigation items to personalize your experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="navigation">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {navItems.map((item, index) => {
                    const Icon = iconMap[item.icon];
                    return (
                      <Draggable
                        key={item.page}
                        draggableId={item.page}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`${
                              snapshot.isDragging ? "shadow-lg" : ""
                            } ${!item.visible ? "opacity-50" : ""}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab active:cursor-grabbing"
                                >
                                  <GripVertical className="w-5 h-5 text-slate-400" />
                                </div>

                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                  {Icon && <Icon className="w-4 h-4 text-slate-600" />}
                                </div>

                                <div className="flex-1">
                                  <Label htmlFor={`title-${index}`} className="sr-only">
                                    Title
                                  </Label>
                                  <Input
                                    id={`title-${index}`}
                                    value={item.title}
                                    onChange={(e) => updateTitle(index, e.target.value)}
                                    className="h-9"
                                  />
                                </div>

                                <div className="flex items-center gap-2">
                                  <Label
                                    htmlFor={`visible-${index}`}
                                    className="text-sm text-slate-600"
                                  >
                                    {item.visible ? "Visible" : "Hidden"}
                                  </Label>
                                  <Switch
                                    id={`visible-${index}`}
                                    checked={item.visible}
                                    onCheckedChange={() => toggleVisibility(index)}
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="flex justify-between gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSaving}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Default
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}