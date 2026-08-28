import React, { useEffect, useState } from 'react';
import { getCalendarData } from '../../api/analytics.api';
import { ChevronLeft, ChevronRight, CheckCircle, Circle } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendarData = async () => {
      setLoading(true);
      try {
        const result = await getCalendarData(currentDate.getFullYear(), currentDate.getMonth());
        if (result.success) {
          setTasks(result.data.tasks);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendarData();
  }, [currentDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-snap-card border border-snap-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-1 hover:bg-white/5 text-white-muted hover:text-white rounded">
            <ChevronLeft size={16} />
          </button>
          <button onClick={nextMonth} className="p-1 hover:bg-white/5 text-white-muted hover:text-white rounded">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const dayTasks = tasks.filter(t => isSameDay(new Date(t.dueDate), day));
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());

          return (
            <div 
              key={day.toString()} 
              className={`min-h-[60px] p-1 border rounded-md ${
                isCurrentMonth 
                  ? 'border-snap-border bg-snap-card' 
                  : 'border-transparent bg-white/5 text-gray-600'
              } ${isToday ? 'ring-1 ring-snap-accent ring-inset' : ''}`}
            >
              <div className="text-right text-xs mb-1 pr-1 font-medium">
                <span className={isToday ? 'bg-snap-accent text-white w-5 h-5 inline-flex items-center justify-center rounded-full' : ''}>
                  {format(day, dateFormat)}
                </span>
              </div>
              <div className="space-y-1 overflow-y-auto max-h-[40px] hide-scrollbar">
                {!loading && dayTasks.map(t => (
                  <div key={t._id} className="flex items-center gap-1 text-[9px] truncate bg-white/5 rounded px-1 py-0.5">
                    {t.completed ? (
                      <CheckCircle size={8} className="text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle size={8} className="text-gray-500 flex-shrink-0" />
                    )}
                    <span className={`truncate ${t.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                      {t.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
