import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { toast } from "sonner";
import CalendarEventModal from "../components/calendar/CalendarEventModal";
import CalendarLegend from "../components/calendar/CalendarLegend";
import CalendarDayView from "../components/calendar/CalendarDayView";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: debts } = useQuery({
    queryKey: ['debts'],
    queryFn: () => base44.entities.Debt.filter({ status: 'active' }),
    initialData: [],
  });

  const { data: goals } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.filter({ status: 'active' }),
    initialData: [],
  });

  const { data: payments } = useQuery({
    queryKey: ['payments'],
    queryFn: () => base44.entities.Payment.list('-payment_date', 1000),
    initialData: [],
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get events for a specific date
  const getEventsForDate = (date) => {
    const events = [];

    // Add debt due dates (recurring monthly)
    debts.forEach(debt => {
      if (debt.due_date && date.getDate() === debt.due_date) {
        events.push({
          type: 'debt_due',
          title: `${debt.name} Payment Due`,
          debt,
          color: 'bg-red-100 border-red-300 text-red-800',
          icon: '💳'
        });
      }
    });

    // Add goal deadlines
    goals.forEach(goal => {
      if (goal.deadline && isSameDay(new Date(goal.deadline), date)) {
        events.push({
          type: 'goal_deadline',
          title: `Goal: ${goal.name}`,
          goal,
          color: 'bg-blue-100 border-blue-300 text-blue-800',
          icon: '🎯'
        });
      }
    });

    // Add payment history
    payments.forEach(payment => {
      if (isSameDay(new Date(payment.payment_date), date)) {
        const debt = debts.find(d => d.id === payment.debt_id);
        events.push({
          type: 'payment_made',
          title: `Paid: ${debt?.name || 'Unknown'}`,
          payment,
          debt,
          color: 'bg-green-100 border-green-300 text-green-800',
          icon: '✓'
        });
      }
    });

    return events;
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setShowEventModal(true);
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Financial Calendar</h1>
            <p className="text-slate-600 mt-2">Track payments, goals, and plan ahead</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleToday}>
              Today
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="min-w-[200px] text-center">
                <h2 className="text-xl font-bold text-slate-900">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
              </div>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <CalendarLegend />

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-lg overflow-hidden mb-8">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-px bg-slate-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-slate-50 p-3 text-center">
                <span className="text-sm font-semibold text-slate-700">{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-slate-200">
            {calendarDays.map((day, idx) => {
              const events = getEventsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  className={`
                    min-h-[120px] bg-white p-2 cursor-pointer hover:bg-slate-50 transition-colors
                    ${!isCurrentMonth ? 'opacity-40' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`
                      text-sm font-medium
                      ${isToday ? 'w-7 h-7 rounded-full bg-cyan-600 text-white flex items-center justify-center' : 'text-slate-700'}
                      ${!isCurrentMonth ? 'text-slate-400' : ''}
                    `}>
                      {format(day, 'd')}
                    </span>
                    {events.length > 0 && (
                      <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                        {events.length}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {events.slice(0, 3).map((event, eventIdx) => (
                      <div
                        key={eventIdx}
                        className={`text-xs px-2 py-1 rounded border ${event.color} truncate`}
                      >
                        <span className="mr-1">{event.icon}</span>
                        {event.title}
                      </div>
                    ))}
                    {events.length > 3 && (
                      <div className="text-xs text-slate-500 px-2">
                        +{events.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedDate && (
          <CalendarDayView
            date={selectedDate}
            events={getEventsForDate(selectedDate)}
            debts={debts}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </div>

      <CalendarEventModal
        open={showEventModal}
        onOpenChange={setShowEventModal}
        date={selectedDate}
        events={selectedDate ? getEventsForDate(selectedDate) : []}
        debts={debts}
      />
    </div>
  );
}