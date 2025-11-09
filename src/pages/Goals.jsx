import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Target, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import GoalCard from "../components/goals/GoalCard";
import GoalForm from "../components/goals/GoalForm";
import GoalStats from "../components/goals/GoalStats";
import GoalAllocationModal from "../components/goals/GoalAllocationModal";
import CelebrationModal from "../components/goals/GoalCelebrationModal";

export default function Goals() {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [allocationGoal, setAllocationGoal] = useState(null);
  const [user, setUser] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedGoalInfo, setCompletedGoalInfo] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list('-created_date'),
    initialData: [],
  });

  const createGoalMutation = useMutation({
    mutationFn: (data) => base44.entities.Goal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success("Goal created successfully!");
      setShowForm(false);
      setEditingGoal(null);
    },
    onError: () => {
      toast.error("Failed to create goal");
    }
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Goal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success("Goal updated successfully!");
      setShowForm(false);
      setEditingGoal(null);
    },
    onError: () => {
      toast.error("Failed to update goal");
    }
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (goalId) => base44.entities.Goal.delete(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success("Goal deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete goal");
    }
  });

  const allocateFundsMutation = useMutation({
    mutationFn: async ({ goal, amount, action }) => {
      const newAmount = action === "add" 
        ? goal.current_amount + amount 
        : Math.max(0, goal.current_amount - amount);
      
      const isCompleted = newAmount >= goal.target_amount;
      
      await base44.entities.Goal.update(goal.id, {
        current_amount: newAmount,
        status: isCompleted ? "completed" : goal.status,
      });

      if (action === "add") {
        const currentSavings = parseFloat(user?.monthly_income) || 0;
        await base44.auth.updateMe({ monthly_income: Math.max(0, currentSavings - amount) });
      } else {
        const currentSavings = parseFloat(user?.monthly_income) || 0;
        await base44.auth.updateMe({ monthly_income: currentSavings + amount });
      }

      if (isCompleted && action === "add") {
        setCompletedGoalInfo({
          name: goal.name,
          amount: goal.target_amount,
        });
        setShowCelebration(true);

        await base44.entities.Notification.create({
          title: "🎉 Goal Achieved!",
          message: `Congratulations! You've achieved your goal: ${goal.name}. You saved $${goal.target_amount.toLocaleString()}!`,
          type: "debt_paid_off",
          user_email: user.email,
          is_read: false,
        });
      }
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      toast.success("Funds allocated successfully!");
      setAllocationGoal(null);
    },
    onError: () => {
      toast.error("Failed to allocate funds");
    }
  });

  const handleSubmit = (data) => {
    if (editingGoal) {
      updateGoalMutation.mutate({ id: editingGoal.id, data });
    } else {
      createGoalMutation.mutate(data);
    }
  };

  const handleDelete = (goal) => {
    if (confirm(`Are you sure you want to delete "${goal.name}"? This action cannot be undone.`)) {
      deleteGoalMutation.mutate(goal.id);
    }
  };

  const handleAllocate = (amount, action) => {
    allocateFundsMutation.mutate({ goal: allocationGoal, amount, action });
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const shortTermGoals = activeGoals.filter(g => g.category === 'short_term');
  const longTermGoals = activeGoals.filter(g => g.category === 'long_term');

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Financial Goals</h1>
            <p className="text-slate-600 mt-2">Set, track, and achieve your financial dreams</p>
          </div>
          <Button 
            onClick={() => {
              setEditingGoal(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        </div>

        <GoalStats 
          goals={goals} 
          activeGoals={activeGoals}
          completedGoals={completedGoals}
          userSavings={user?.monthly_income || 0}
        />

        {showForm && (
          <div className="mb-8">
            <GoalForm
              goal={editingGoal}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingGoal(null);
              }}
            />
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600" />
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-dashed border-slate-200">
            <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No goals yet</h3>
            <p className="text-slate-600 mb-6">Start setting financial goals to track your progress</p>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-cyan-600 to-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </div>
        ) : (
          <>
            {shortTermGoals.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-cyan-600" />
                  Short-term Goals
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shortTermGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={(goal) => {
                        setEditingGoal(goal);
                        setShowForm(true);
                      }}
                      onDelete={handleDelete}
                      onAllocate={(goal) => setAllocationGoal(goal)}
                    />
                  ))}
                </div>
              </div>
            )}

            {longTermGoals.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-blue-600" />
                  Long-term Goals
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {longTermGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={(goal) => {
                        setEditingGoal(goal);
                        setShowForm(true);
                      }}
                      onDelete={handleDelete}
                      onAllocate={(goal) => setAllocationGoal(goal)}
                    />
                  ))}
                </div>
              </div>
            )}

            {completedGoals.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎉</span>
                  Completed Goals
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={(goal) => {
                        setEditingGoal(goal);
                        setShowForm(true);
                      }}
                      onDelete={handleDelete}
                      onAllocate={(goal) => setAllocationGoal(goal)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <GoalAllocationModal
        open={!!allocationGoal}
        onOpenChange={(open) => !open && setAllocationGoal(null)}
        goal={allocationGoal}
        userSavings={user?.monthly_income || 0}
        onSubmit={handleAllocate}
      />

      <CelebrationModal
        open={showCelebration}
        onOpenChange={setShowCelebration}
        goalName={completedGoalInfo?.name || ""}
        goalAmount={completedGoalInfo?.amount || 0}
      />
    </div>
  );
}