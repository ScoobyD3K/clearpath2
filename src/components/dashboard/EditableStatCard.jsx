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
  inputType = "number",
  green = false
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
      "relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-md",
      editable && !isEditing && "cursor-pointer group"
    )}
    style={green ? {
      backgroundColor: 'rgba(34, 197, 94, 0.85)',
      border: '2px solid transparent',
      backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.85), rgba(16, 185, 129, 0.85)), linear-gradient(135deg, #CDE7CF, #B9DFF5, #A2B7C8)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box'
    } : { 
      backgroundColor: 'rgba(185, 223, 245, 0.75)',
      border: '2px solid transparent',
      backgroundImage: 'linear-gradient(rgba(185, 223, 245, 0.75), rgba(185, 223, 245, 0.75)), linear-gradient(135deg, #CDE7CF, #B9DFF5, #A2B7C8)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box'
    }}
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

      <CardContent className="p-3 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", bgGradient || "bg-white/20")}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-xs font-medium text-white/90">
              {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        
        <div className="text-xs text-slate-600 mb-1">{title}</div>
        
        {isEditing ? (
          <div className="space-y-2">
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-sm">$</span>
              <Input
                type={inputType}
                step="0.01"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="text-sm font-bold pl-6 h-7"
                placeholder="0"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') handleCancel();
                }}
              />
            </div>
            <div className="flex gap-1">
              <Button size="sm" onClick={handleSave} className="flex-1 h-6 text-xs">
                <Save className="w-3 h-3 mr-1" />Save
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel} className="flex-1 h-6 text-xs">
                <X className="w-3 h-3 mr-1" />Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-xl font-bold text-slate-900">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}