import React, { useState } from 'react';
import { Task, TaskCategory, TaskPriority } from '../types';
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Tag, 
  Calendar, 
  AlertTriangle, 
  Check, 
  Bookmark, 
  X,
  Zap,
  Sparkles,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaskPlannerProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'completedPomodoros'>) => void;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSelectFocusTask: (task: Task | null) => void;
  activeFocusTaskId: string | null;
}

export default function TaskPlanner({
  tasks,
  onAddTask,
  onToggleComplete,
  onDeleteTask,
  onSelectFocusTask,
  activeFocusTaskId,
}: TaskPlannerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Study');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(2);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Completed'>('All');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask({
      title,
      description,
      category,
      priority,
      deadline,
      estimatedPomodoros,
    });
    setTitle('');
    setDescription('');
    setCategory('Study');
    setPriority('Medium');
    setDeadline(new Date().toISOString().split('T')[0]);
    setEstimatedPomodoros(2);
    setShowAddForm(false);
  };

  const getDaysRemaining = (deadlineStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadDate = new Date(deadlineStr);
    deadDate.setHours(0, 0, 0, 0);
    const diffTime = deadDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineBadge = (deadlineStr: string, completed: boolean) => {
    if (completed) return null;
    const days = getDaysRemaining(deadlineStr);
    if (days < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 bg-rose-50 text-rose-700 rounded-full border border-rose-100">
          <AlertTriangle className="w-2.5 h-2.5" /> Overdue ({Math.abs(days)}d)
        </span>
      );
    }
    if (days === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100 animate-pulse">
          <Clock className="w-2.5 h-2.5" /> Due Today
        </span>
      );
    }
    if (days === 1) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 bg-[#FAF3E0] text-[#8B734B] rounded-full border border-[#EEDDBB]">
          <Clock className="w-2.5 h-2.5" /> Tomorrow
        </span>
      );
    }
    if (days <= 3) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 bg-slate-50 text-slate-600 rounded-full border border-slate-100">
          <Calendar className="w-2.5 h-2.5" /> In {days} days
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 font-semibold bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
        <Calendar className="w-2.5 h-2.5 text-gray-300" /> {deadlineStr}
      </span>
    );
  };

  const categories: TaskCategory[] = ['Study', 'Homework', 'Research', 'Exam Prep', 'Other'];

  const filteredTasks = tasks.filter((t) => {
    const matchCat = filterCategory === 'All' || t.category === filterCategory;
    const matchStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Active' && !t.completed) ||
      (filterStatus === 'Completed' && t.completed);
    return matchCat && matchStatus;
  });

  return (
    <div className="bg-white rounded-[32px] border border-[#E5E0D8] p-6 shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="pb-5 border-b border-[#F0EDE8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#5A5A40] tracking-tight flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#889681]" />
            Productivity Planner
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Organise, prioritize, and set study focus targets
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#889681] hover:bg-[#778570] text-white rounded-full transition duration-150 cursor-pointer shadow-sm"
        >
          {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showAddForm ? 'Cancel' : 'New Task'}
        </button>
      </div>

      {/* Add Task Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-[#F0EDE8] bg-[#FBF9F6] overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Task Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Study Chemistry chapter 3"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E0D8] bg-white focus:outline-none focus:border-[#889681]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E0D8] bg-white focus:outline-none focus:border-[#889681]"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Description / Study details</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Include focus resources, page numbers, or key problems..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E0D8] bg-white focus:outline-none focus:border-[#889681] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Priority</label>
                  <div className="flex gap-2">
                    {(['Low', 'Medium', 'High'] as TaskPriority[]).map((p) => {
                      const colors = {
                        Low: 'border-[#E5E0D8] text-gray-600 hover:bg-[#FBF9F6]',
                        Medium: 'border-[#EEDDBB] text-[#8B734B] hover:bg-[#FAF3E0]',
                        High: 'border-rose-200 text-rose-700 hover:bg-rose-50',
                      };
                      const activeColors = {
                        Low: 'bg-[#F5F2ED] border-gray-400 text-[#5A5A40] font-bold',
                        Medium: 'bg-[#FAF3E0] border-[#8B734B] text-[#8B734B] font-bold',
                        High: 'bg-rose-50 border-rose-400 text-rose-800 font-bold',
                      };
                      const isActive = priority === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`flex-1 text-[11px] py-1.5 px-2 border rounded-xl transition duration-150 cursor-pointer text-center ${
                            isActive ? activeColors[p] : colors[p]
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Deadline</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#E5E0D8] bg-white focus:outline-none focus:border-[#889681]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Est. Pomodoros</span>
                    <span className="font-mono text-[#889681]">{estimatedPomodoros} blocks</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={estimatedPomodoros}
                    onChange={(e) => setEstimatedPomodoros(parseInt(e.target.value))}
                    className="w-full h-1 bg-[#F5F2ED] rounded-lg appearance-none cursor-pointer accent-[#889681] mt-2.5"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-[#5A5A40] hover:bg-[#494932] text-white rounded-full transition duration-150"
                >
                  Create Task
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Controls */}
      <div className="py-3 border-b border-[#F0EDE8] flex flex-wrap gap-2 items-center">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-2">Filters:</span>
        <div className="flex bg-[#F5F2ED] p-0.5 rounded-full text-[11px]">
          {(['All', 'Active', 'Completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1 rounded-full font-medium cursor-pointer transition ${
                filterStatus === st ? 'bg-white text-[#5A5A40] shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="text-xs px-2.5 py-1 rounded-xl border border-[#E5E0D8] bg-white text-gray-600 focus:outline-none focus:border-[#889681] cursor-pointer ml-auto"
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto pt-4 space-y-3 max-h-[500px]">
        <AnimatePresence initial={false}>
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-400"
            >
              <CheckCircle className="w-10 h-10 mx-auto text-gray-300 stroke-1 mb-2" />
              <p className="text-sm font-medium">No tasks found</p>
              <p className="text-xs mt-1">Get started by creating a new task or study goal!</p>
            </motion.div>
          ) : (
            filteredTasks.map((task) => {
              const isSelectedFocus = activeFocusTaskId === task.id;
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`p-4 rounded-3xl border transition duration-200 group flex items-start gap-3 ${
                    task.completed
                      ? 'bg-[#FBF9F6]/50 border-[#F0EDE8] opacity-70'
                      : isSelectedFocus
                      ? 'bg-[#FBF9F6] border-[#889681] ring-1 ring-[#889681] shadow-sm'
                      : 'bg-white border-[#E5E0D8] hover:border-gray-300 shadow-xs'
                  }`}
                >
                  {/* Custom Checkbox */}
                  <button
                    onClick={() => onToggleComplete(task.id)}
                    className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition duration-150 cursor-pointer focus:outline-none ${
                      task.completed
                        ? 'bg-[#889681] border-[#889681] text-[#F5F2ED]'
                        : 'border-[#E5E0D8] hover:border-[#889681] text-transparent hover:bg-[#FBF9F6]'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={`font-semibold text-xs sm:text-sm leading-snug truncate ${
                          task.completed ? 'line-through text-gray-400' : 'text-gray-800'
                        }`}
                      >
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Priority tag */}
                        <span
                          className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            task.priority === 'High'
                              ? 'bg-rose-50 text-rose-600 border border-rose-100'
                              : task.priority === 'Medium'
                              ? 'bg-[#FAF3E0] text-[#8B734B] border border-[#EEDDBB]'
                              : 'bg-[#F5F2ED] text-gray-600 border border-gray-100'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2 italic font-serif">
                        {task.description}
                      </p>
                    )}

                    {/* Meta badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {/* Category Badge */}
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#5A5A40] bg-[#FAF3E0]/70 px-2.5 py-0.5 rounded-full border border-[#EEDDBB]/40">
                        <Tag className="w-2.5 h-2.5 text-[#889681]" />
                        {task.category}
                      </span>

                      {/* Effort Indicator */}
                      <span className="inline-flex items-center gap-1 text-[9px] font-medium text-gray-500 bg-[#FBF9F6] px-2.5 py-0.5 rounded-full border border-[#F0EDE8]">
                        <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                        {task.completedPomodoros}/{task.estimatedPomodoros} Pomos
                      </span>

                      {/* Dynamic Proactive Deadline Indicator */}
                      {getDeadlineBadge(task.deadline, task.completed)}
                    </div>
                  </div>

                  {/* Focus Selection & Delete Button */}
                  <div className="flex flex-col gap-2 shrink-0 self-center">
                    {!task.completed && (
                      <button
                        onClick={() => onSelectFocusTask(isSelectedFocus ? null : task)}
                        title={isSelectedFocus ? "Clear Focus Task" : "Set as Focus Task for Pomodoro"}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold cursor-pointer transition flex items-center justify-center gap-1 ${
                          isSelectedFocus
                            ? 'bg-[#889681] text-white hover:bg-[#778570]'
                            : 'bg-white hover:bg-[#FBF9F6] text-[#889681] border border-[#E5E0D8] hover:border-[#889681]'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{isSelectedFocus ? 'Focusing' : 'Focus'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-rose-50 rounded-lg cursor-pointer transition self-end opacity-0 group-hover:opacity-100"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
