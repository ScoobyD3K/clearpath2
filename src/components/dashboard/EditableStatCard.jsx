import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Edit, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EditableStatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  bgGradient, 
  iconColor, 
  editable = false,
  onSave,
  inputType = "number"
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleEdit = () => {
    // Extract numeric value from formatted string (e.g., "$5,000" -> "5000")
    const numericValue = value.replace(/[^0-9.]/g, '');
    setEditValue(numericValue);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave(parseFloat(editValue) || 0);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  return (
    <Card className={cn(
      "relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300",
      bgGradient,
      editable && !isEditing && "cursor-pointer group"
    )}
    onClick={editable && !isEditing ? handleEdit : undefined}
    >
      <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 bg-white/10 rounded-full" />
      
      {editable && !isEditing && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5">
            <Edit className="w-3 h-3 text-white" />
          </div>
        </div>
      )}

      <CardContent className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={cn("p-3 rounded-xl bg-white/20 backdrop-blur-sm", iconColor)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-white/90">
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-xs font-medium">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        
        <div>
          <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
          
          {isEditing ? (
            <div className="space-y-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white font-bold text-xl">$</span>
                <Input
                  type={inputType}
                  step="0.01"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="bg-white/20 border-white/30 text-white text-2xl font-bold pl-8 placeholder:text-white/50"
                  placeholder="0"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') handleCancel();
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white"
                >
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-white text-3xl font-bold tracking-tight">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}