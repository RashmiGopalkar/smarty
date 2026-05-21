import React, { useState } from "react";
import { Plus, Trash, Calendar, Clock, BookOpen, AlertTriangle, RefreshCw } from "lucide-react";
import { TimetableItem, TimetableCategory } from "../types";

interface TimetableCalendarProps {
  items: TimetableItem[];
  onAddItem: (item: Omit<TimetableItem, "id">) => void;
  onDeleteItem: (id: string) => void;
  onResetDefaults: () => void;
}

const CATEGORY_STYLES: Record<TimetableCategory, { bg: string; label: string; border: string }> = {
  study: {
    bg: "bg-amber-100 hover:bg-amber-200 text-amber-900",
    border: "border-l-4 border-amber-500",
    label: "Study Mode",
  },
  school: {
    bg: "bg-sky-100 hover:bg-sky-200 text-sky-900",
    border: "border-l-4 border-sky-500",
    label: "School Session",
  },
  homework: {
    bg: "bg-rose-100 hover:bg-rose-200 text-rose-900",
    border: "border-l-4 border-rose-500",
    label: "Homework Task",
  },
  special: {
    bg: "bg-emerald-100 hover:bg-emerald-200 text-emerald-900",
    border: "border-l-4 border-emerald-500",
    label: "Special Event",
  },
};

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function TimetableCalendar({
  items,
  onAddItem,
  onDeleteItem,
  onResetDefaults,
}: TimetableCalendarProps) {
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Form states matching user fields
  const [title, setTitle] = useState("");
  const [day, setDay] = useState("Monday");
  const [startTime, setStartTime] = useState("16:00");
  const [endTime, setEndTime] = useState("17:30");
  const [category, setCategory] = useState<TimetableCategory>("study");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddItem({
      title,
      day,
      startTime,
      endTime,
      category,
    });

    setTitle("");
    setShowAddForm(false);
  };

  // Filter items based on toggled inputs
  const filteredItems = items.filter((item) => {
    const matchesDay = selectedDayFilter === "All" || item.day === selectedDayFilter;
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesDay && matchesCategory;
  });

  return (
    <div className="p-6 bg-white rounded-3xl shadow-lg border border-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-violet-600" />
            Smart Timetable & Weekly Calendar
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Fill your sessions below! A default 1.5-hour study block is scheduled daily.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            id="open-event-form-btn"
            className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-2xl text-sm transition-all shadow-md hover:shadow-violet-600/15 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? "Close Form" : "Custom Event"}
          </button>
          
          <button
            onClick={onResetDefaults}
            id="reset-timetable-defaults-btn"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl text-sm transition-all cursor-pointer"
            title="Reset default 1.5 hour sessions"
          >
            <RefreshCw className="w-4 h-4" />
            Defaults
          </button>
        </div>
      </div>

      {/* Quick Category Legend Info Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 bg-slate-50 p-3 rounded-2xl text-xs font-semibold">
        <div className="flex items-center gap-2 text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Study Mode (Warm Amber)</span>
        </div>
        <div className="flex items-center gap-2 text-sky-800 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
          <span>School Time (Sky Blue)</span>
        </div>
        <div className="flex items-center gap-2 text-rose-800 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Homework (Rose Red)</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Special Event (Emerald)</span>
        </div>
      </div>

      {/* Interactive Form for New custom item */}
      {showAddForm && (
        <form onSubmit={handleSubmit} id="timetable-add-form" className="bg-slate-50 p-5 rounded-2xl mb-6 border border-slate-100 transition-all">
          <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-violet-500" />
            Add To Your Customized Calendar
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Event Name/Title</label>
              <input
                type="text"
                placeholder="e.g. Science Labs, Math HW, Violin Class"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Weekday</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Category Color Group</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TimetableCategory)}
                className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="study">Study Session (Amber)</option>
                <option value="school">School Classes (Blue)</option>
                <option value="homework">Homework Block (Rose)</option>
                <option value="special">Special/Interests (Green)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Starts At</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ends At</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold cursor-pointer shadow-md"
            >
              Confirm and Add Box
            </button>
          </div>
        </form>
      )}

      {/* FILTER CONTROLS */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 items-start md:items-center justify-between border-b border-slate-50 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">Day:</span>
          <button
            onClick={() => setSelectedDayFilter("All")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedDayFilter === "All" ? "bg-slate-900 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            All Days
          </button>
          {DAYS_OF_WEEK.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDayFilter(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedDayFilter === d ? "bg-violet-600 text-white" : "bg-slate-50 hover:bg-slate-100 text-slate-600"
              }`}
            >
              {d.slice(0, 3)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Classify:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 font-bold focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="study">Study</option>
            <option value="school">School</option>
            <option value="homework">Homework</option>
            <option value="special">Special</option>
          </select>
        </div>
      </div>

      {/* SECTOR CALENDAR LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {DAYS_OF_WEEK.map((dayName) => {
          // Get events matching this specific day
          const dayItems = filteredItems.filter((i) => i.day === dayName).sort((a,b) => a.startTime.localeCompare(b.startTime));
          const isFilterActiveForThisDay = selectedDayFilter === "All" || selectedDayFilter === dayName;

          if (!isFilterActiveForThisDay) return null;

          return (
            <div key={dayName} className="flex flex-col bg-slate-50/55 rounded-2xl p-3 border border-slate-100/50 min-h-[180px]">
              <div className="text-sm font-bold border-b border-slate-200/50 pb-2 mb-2 text-slate-700 flex justify-between items-center px-1">
                <span>{dayName}</span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-100/80 px-1.5 rounded-md">{dayItems.length} events</span>
              </div>

              <div className="flex-1 flex flex-col gap-2">
                {dayItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-6 text-[11px] text-slate-400 italic">
                    Chill day!
                  </div>
                ) : (
                  dayItems.map((item) => {
                    const style = CATEGORY_STYLES[item.category];
                    return (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-xl border-l-[3.5px] transition-all flex flex-col justify-between group ${style.bg} ${style.border}`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <p className="font-bold text-xs line-clamp-2 leading-tight">
                            {item.title}
                          </p>
                          <button
                            onClick={() => onDeleteItem(item.id)}
                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                            title="Delete slot"
                          >
                            <Trash className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-1 mt-2 text-[10px] font-semibold text-slate-500/90 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{item.startTime} - {item.endTime}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
