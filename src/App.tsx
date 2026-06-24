import React, { useState, useEffect } from 'react';
import { Task, FlashcardDeck, Note, AIRecommendResult } from './types';
import { initialTasks, initialDecks, initialNotes } from './data';
import TaskPlanner from './components/TaskPlanner';
import PomodoroTimer from './components/PomodoroTimer';
import FlashcardStudy from './components/FlashcardStudy';
import Notepad from './components/Notepad';
import { 
  Sparkles, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Award, 
  Volume2, 
  RefreshCw, 
  ListTodo, 
  BookOpen, 
  CheckSquare, 
  ChevronRight,
  TrendingUp,
  X,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // State Initialization from localStorage or Initial Data
  const [tasks, setTasks] = useState<Task[]>(() => {
    const local = localStorage.getItem('companion_tasks');
    return local ? JSON.parse(local) : initialTasks;
  });

  const [decks, setDecks] = useState<FlashcardDeck[]>(() => {
    const local = localStorage.getItem('companion_decks');
    return local ? JSON.parse(local) : initialDecks;
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const local = localStorage.getItem('companion_notes');
    return local ? JSON.parse(local) : initialNotes;
  });

  const [completedPomodorosCount, setCompletedPomodorosCount] = useState<number>(() => {
    const local = localStorage.getItem('companion_pomo_count');
    return local ? parseInt(local) : 3; // Start with a few pre-completed for stats visual rhythm
  });

  // UI state managers
  const [activeTab, setActiveTab] = useState<'planner' | 'flashcards' | 'notepad'>('planner');
  const [activeFocusTaskId, setActiveFocusTaskId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isRefreshingRecs, setIsRefreshingRecs] = useState(false);

  // AI Recommendations State
  const [aiRecs, setAiRecs] = useState<AIRecommendResult | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('companion_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('companion_decks', JSON.stringify(decks));
  }, [decks]);

  useEffect(() => {
    localStorage.setItem('companion_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('companion_pomo_count', completedPomodorosCount.toString());
  }, [completedPomodorosCount]);

  // Handle active focus task lookup
  const activeFocusTask = tasks.find((t) => t.id === activeFocusTaskId) || null;

  // Show toast notification
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Call Gemini AI Proactive Task Recommendations
  const fetchAIRecommendations = async (silent = false) => {
    if (!silent) setIsRefreshingRecs(true);
    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: tasks.filter(t => !t.completed).map(t => ({
            title: t.title,
            description: t.description,
            priority: t.priority,
            deadline: t.deadline,
            estimatedPomodoros: t.estimatedPomodoros,
            completedPomodoros: t.completedPomodoros
          })),
          completedCount: completedPomodorosCount
        })
      });

      if (!response.ok) throw new Error('AI Server responded with an error');
      const data = await response.json();
      setAiRecs(data);
      if (!silent) showNotification("Proactive study recommendations updated by Gemini!");
    } catch (e) {
      console.error("AI recommend fetch error:", e);
    } finally {
      setIsRefreshingRecs(false);
    }
  };

  // Fetch recommendations once on mount
  useEffect(() => {
    fetchAIRecommendations(true);
  }, []);

  // Recalculate AI recommendations occasionally when active task is completed or tasks list modifies
  const handleTaskCountChange = () => {
    // Throttled trigger to fetch updated recommendations
    fetchAIRecommendations(true);
  };

  // Task Events
  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'createdAt' | 'completed' | 'completedPomodoros'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      completed: false,
      completedPomodoros: 0,
      createdAt: new Date().toISOString()
    };
    setTasks((prev) => [newTask, ...prev]);
    showNotification(`Task "${newTask.title}" added to planner`);
    handleTaskCountChange();
  };

  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updatedState = !t.completed;
          if (updatedState && id === activeFocusTaskId) {
            setActiveFocusTaskId(null); // Clear active focus if task completes
          }
          return { ...t, completed: updatedState };
        }
        return t;
      })
    );
    showNotification("Task status updated");
    handleTaskCountChange();
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (id === activeFocusTaskId) {
      setActiveFocusTaskId(null);
    }
    showNotification("Task removed");
    handleTaskCountChange();
  };

  const handleSelectFocusTask = (task: Task | null) => {
    setActiveFocusTaskId(task ? task.id : null);
    if (task) {
      showNotification(`"${task.title}" is now set as active deep-study target.`);
    }
  };

  const handleIncrementPomodoro = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const completed = t.completedPomodoros + 1;
          const finished = completed >= t.estimatedPomodoros;
          return {
            ...t,
            completedPomodoros: completed,
            completed: finished ? true : t.completed
          };
        }
        return t;
      })
    );
    showNotification("Study focus Pomodoro logged against active task!");
  };

  // Flashcards Events
  const handleAddDeck = (title: string, description: string) => {
    const newDeck: FlashcardDeck = {
      id: `deck-${Date.now()}`,
      title,
      description,
      createdAt: new Date().toISOString(),
      cards: []
    };
    setDecks((prev) => [...prev, newDeck]);
    showNotification(`Flashcard deck "${title}" created successfully`);
  };

  const handleAddCardToDeck = (deckId: string, front: string, back: string) => {
    setDecks((prev) =>
      prev.map((d) => {
        if (d.id === deckId) {
          const newCard = {
            id: `card-${Date.now()}`,
            front,
            back,
            lastReviewed: null,
            box: 1
          };
          return { ...d, cards: [...d.cards, newCard] };
        }
        return d;
      })
    );
    showNotification("New Flashcard added to deck");
  };

  const handleDeleteDeck = (deckId: string) => {
    setDecks((prev) => prev.filter((d) => d.id !== deckId));
    showNotification("Flashcard deck deleted");
  };

  const handleGenerateAIDeck = async (topic: string) => {
    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api/ai/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      if (!response.ok) throw new Error('Failed to generate study deck with AI');
      const data = await response.json();

      if (data.flashcards && Array.isArray(data.flashcards)) {
        const newDeck: FlashcardDeck = {
          id: `deck-${Date.now()}`,
          title: `AI: ${topic}`,
          description: `Automatically created educational deck using Gemini to study ${topic}`,
          createdAt: new Date().toISOString(),
          cards: data.flashcards.map((c: any, idx: number) => ({
            id: `card-ai-${Date.now()}-${idx}`,
            front: c.front,
            back: c.back,
            lastReviewed: null,
            box: 1
          }))
        };
        setDecks((prev) => [...prev, newDeck]);
        showNotification(`AI successfully generated a 5-card study deck for "${topic}"!`);
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to generate flashcards.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Notepad Events
  const handleAddNote = (title: string, content: string) => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title,
      content,
      updatedAt: new Date().toISOString()
    };
    setNotes((prev) => [...prev, newNote]);
    showNotification(`Created study notebook draft: "${title}"`);
  };

  const handleUpdateNote = (id: string, title: string, content: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, title, content, updatedAt: new Date().toISOString() } : n))
    );
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    showNotification("Study notebook draft removed");
  };

  const handleExtractTasks = (extractedTasks: Omit<Task, 'id' | 'createdAt' | 'completed' | 'completedPomodoros'>[]) => {
    const formatted: Task[] = extractedTasks.map((t, idx) => ({
      ...t,
      id: `task-extracted-${Date.now()}-${idx}`,
      completed: false,
      completedPomodoros: 0,
      createdAt: new Date().toISOString()
    }));
    setTasks((prev) => [...formatted, ...prev]);
    showNotification(`Success! ${formatted.length} actionable deadlines imported to Planner.`);
    handleTaskCountChange();
  };

  // Helper stats calculator
  const activeTasksCount = tasks.filter((t) => !t.completed).length;
  const overdueTasksCount = tasks.filter((t) => {
    if (t.completed) return false;
    const diff = new Date(t.deadline).getTime() - new Date().setHours(0,0,0,0);
    return diff < 0;
  }).length;

  // Render Deadline timeline items
  const renderUpcomingDeadlines = () => {
    const sortedTasks = [...tasks]
      .filter((t) => !t.completed)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 3);

    return (
      <div className="space-y-4">
        {sortedTasks.length === 0 ? (
          <p className="text-xs text-[#DDE3D9] italic">No active deadlines pending!</p>
        ) : (
          sortedTasks.map((t) => {
            const today = new Date();
            today.setHours(0,0,0,0);
            const d = new Date(t.deadline);
            d.setHours(0,0,0,0);
            const daysDiff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            let label = `${t.deadline}`;
            if (daysDiff === 0) label = "TODAY";
            else if (daysDiff === 1) label = "TOMORROW";
            else if (daysDiff < 0) label = `OVERDUE (${Math.abs(daysDiff)}d)`;

            return (
              <div key={t.id} className="relative pl-4 border-l-2 border-[#A8B5A3]">
                <p className="text-[9px] uppercase font-bold text-[#DDE3D9] tracking-wider">{label}</p>
                <p className="text-sm font-medium leading-tight truncate text-white">{t.title}</p>
                <p className="text-[10px] text-[#DDE3D9] opacity-75 mt-0.5">{t.category} • {t.priority} Priority</p>
              </div>
            );
          })
        )}
      </div>
    );
  };

  // Render Study deck recommended ideas by AI
  const handleCreateAIDeckFromIdea = (topic: string) => {
    setActiveTab('flashcards');
    handleGenerateAIDeck(topic);
  };

  const renderRecommendedDecksList = () => {
    if (!aiRecs || !aiRecs.suggestedDecks || aiRecs.suggestedDecks.length === 0) {
      return (
        <div className="text-xs text-gray-500 italic p-3 bg-[#FBF9F6] rounded-xl border border-[#F0EDE8]">
          Type task details and study notes, then tap refresh above to generate deck topics!
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {aiRecs.suggestedDecks.map((deckTopic, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#FBF9F6] border border-[#F0EDE8] hover:border-[#889681] transition group"
          >
            <span className="text-xs font-medium text-gray-700 leading-snug line-clamp-2">{deckTopic}</span>
            <button
              onClick={() => handleCreateAIDeckFromIdea(deckTopic)}
              title="Generate this deck using Gemini"
              className="p-1 text-[#889681] hover:text-[#5A5A40] hover:bg-[#889681]/10 rounded-lg cursor-pointer transition shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  // Render prioritized task ideas by AI
  const handleQuickAdoptTask = (rec: any) => {
    handleAddTask({
      title: rec.taskTitle,
      description: `${rec.justification}\nNext step: ${rec.actionStep}`,
      category: 'Study',
      priority: rec.priorityScore as any,
      deadline: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
      estimatedPomodoros: 2,
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] font-sans text-gray-800 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      {/* Outer Application bounds configured perfectly for desktop immersion layout as specified */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Sidebar: AI Insight, Deadlines list, overall progress */}
        <div className="lg:col-span-3 flex flex-col gap-6 justify-between">
          {/* AI Advisor Badge Box */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E0D8] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#889681] flex items-center justify-center text-white text-lg font-serif">
                ✨
              </div>
              <div>
                <h1 className="font-serif text-lg leading-tight text-[#5A5A40] font-bold">Study Companion</h1>
                <p className="text-[10px] text-[#889681] font-semibold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  Gemini-powered Always Active
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-[#FBF9F6] border border-[#F0EDE8] relative overflow-hidden group">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-bold text-[#889681] uppercase tracking-wider">
                    AI PROACTIVE STRATEGY
                  </p>
                  <button
                    onClick={() => fetchAIRecommendations(false)}
                    disabled={isRefreshingRecs}
                    title="Refresh AI study planner advices"
                    className="p-1 hover:bg-[#FAF3E0] rounded-lg transition text-[#889681] disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingRecs ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                
                <p className="text-xs italic leading-relaxed text-gray-600 font-serif">
                  {aiRecs && aiRecs.recommendations && aiRecs.recommendations[0] ? (
                    `"${aiRecs.recommendations[0].justification}"`
                  ) : (
                    `"Add tasks or note insights, then tap the refresh icon to unlock your personalized cognitive roadmap."`
                  )}
                </p>

                {aiRecs && aiRecs.recommendations && aiRecs.recommendations[0] && (
                  <div className="mt-2 pt-2 border-t border-[#F0EDE8] flex items-center justify-between gap-1">
                    <span className="text-[9px] font-bold text-[#8B734B] uppercase bg-[#FAF3E0] px-1.5 py-0.5 rounded">
                      Action: {aiRecs.recommendations[0].taskTitle.substring(0, 18)}...
                    </span>
                    <button
                      onClick={() => handleQuickAdoptTask(aiRecs.recommendations[0])}
                      className="text-[9px] font-bold text-white bg-[#889681] hover:bg-[#778570] px-2 py-0.5 rounded transition cursor-pointer"
                    >
                      + Adopt Task
                    </button>
                  </div>
                )}
              </div>

              {/* Cognitive/Study Tips Card */}
              {aiRecs && aiRecs.studyTips && aiRecs.studyTips.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-[#FAF3E0] border border-[#EEDDBB] space-y-1">
                  <p className="text-[9px] font-bold text-[#8B734B] uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-amber-600" /> Focus Tip
                  </p>
                  <p className="text-[11px] leading-relaxed text-[#8B734B] italic">
                    {aiRecs.studyTips[0]}
                  </p>
                </div>
              )}

              {/* Numeric Mini Scoreboard */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 rounded-2xl bg-[#FBF9F6] border border-[#F0EDE8]">
                  <p className="text-lg font-serif font-bold text-[#5A5A40]">{activeTasksCount}</p>
                  <p className="text-[9px] text-gray-500 uppercase font-semibold">Active Goals</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#FBF9F6] border border-[#F0EDE8]">
                  <p className="text-lg font-serif font-bold text-[#5A5A40]">{completedPomodorosCount}</p>
                  <p className="text-[9px] text-gray-500 uppercase font-semibold">Focus Blocks</p>
                </div>
              </div>
            </div>
          </div>

          {/* Deep Forest-Sage Green Deadlines Card */}
          <div className="flex-1 bg-[#889681] rounded-3xl p-6 shadow-sm text-[#F5F2ED] relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-medium text-[#F5F2ED] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#DDE3D9]" />
                  Deadlines
                </h3>
                {overdueTasksCount > 0 && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 animate-pulse">
                    {overdueTasksCount} OVERDUE
                  </span>
                )}
              </div>
              {renderUpcomingDeadlines()}
            </div>
            
            <div className="mt-4 pt-4 border-t border-[#A8B5A3]/50 text-[10px] text-[#DDE3D9] flex items-center justify-between">
              <span>Date: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span className="font-mono">Pomo Log: #{completedPomodorosCount}</span>
            </div>
          </div>
        </div>

        {/* Center Main Module Area: Swappable Planner, Flashcards Study, Notepad insights */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Main Top Header Swappable Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#5A5A40] tracking-tight">
                {activeTab === 'planner' ? 'Focus & Prioritization' : activeTab === 'flashcards' ? 'Active Recall Study' : 'Notes & Course Outline'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {activeTab === 'planner' 
                  ? 'Plan high-importance study metrics to dodge last-minute panic.' 
                  : activeTab === 'flashcards' 
                  ? 'Engage active recall using customized smart flashcard decks.' 
                  : 'Synthesize research text content and generate bulleted insights with Gemini.'}
              </p>
            </div>

            {/* Aesthetic Selector Switch */}
            <div className="flex bg-white/80 p-1 border border-[#E5E0D8] rounded-full text-xs font-semibold self-stretch sm:self-auto shrink-0 shadow-xs">
              <button
                onClick={() => setActiveTab('planner')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-full cursor-pointer transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'planner' ? 'bg-[#5A5A40] text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <ListTodo className="w-3.5 h-3.5" />
                <span>Planner</span>
              </button>
              <button
                onClick={() => setActiveTab('flashcards')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-full cursor-pointer transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'flashcards' ? 'bg-[#5A5A40] text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Recall</span>
              </button>
              <button
                onClick={() => setActiveTab('notepad')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-full cursor-pointer transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'notepad' ? 'bg-[#5A5A40] text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Notepad</span>
              </button>
            </div>
          </div>

          {/* Core Modules rendering area */}
          <div className="flex-1 min-h-[500px]">
            <AnimatePresence mode="wait">
              {activeTab === 'planner' && (
                <motion.div
                  key="planner"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="h-full"
                >
                  <TaskPlanner
                    tasks={tasks}
                    onAddTask={handleAddTask}
                    onToggleComplete={handleToggleComplete}
                    onDeleteTask={handleDeleteTask}
                    onSelectFocusTask={handleSelectFocusTask}
                    activeFocusTaskId={activeFocusTaskId}
                  />
                </motion.div>
              )}

              {activeTab === 'flashcards' && (
                <motion.div
                  key="flashcards"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="h-full"
                >
                  <FlashcardStudy
                    decks={decks}
                    onAddDeck={handleAddDeck}
                    onAddCardToDeck={handleAddCardToDeck}
                    onDeleteDeck={handleDeleteDeck}
                    onGenerateAIDeck={handleGenerateAIDeck}
                    isGeneratingAI={isGeneratingAI}
                  />
                </motion.div>
              )}

              {activeTab === 'notepad' && (
                <motion.div
                  key="notepad"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="h-full"
                >
                  <Notepad
                    notes={notes}
                    onAddNote={handleAddNote}
                    onUpdateNote={handleUpdateNote}
                    onDeleteNote={handleDeleteNote}
                    onExtractTasks={handleExtractTasks}
                    onShowNotification={showNotification}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Sidebar: Focus timer, smart notepad extraction suggestion sidebar */}
        <div className="lg:col-span-3 flex flex-col gap-6 justify-between">
          {/* Pomodoro Focus Timer */}
          <div className="h-1/2 flex flex-col">
            <PomodoroTimer
              activeFocusTask={activeFocusTask}
              onIncrementPomodoro={handleIncrementPomodoro}
              onAddSessionStats={() => setCompletedPomodorosCount((prev) => prev + 1)}
            />
          </div>

          {/* AI Recommended Deck Topic Ideas Section */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E0D8] h-1/2 flex flex-col justify-between overflow-hidden">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#889681] mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Study Recommendations
              </h3>
              <p className="text-[11px] text-gray-500 leading-relaxed mb-4">
                These recall subjects reinforce your active syllabus tasks:
              </p>
              <div className="overflow-y-auto max-h-[160px] pr-1 space-y-2">
                {renderRecommendedDecksList()}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F0EDE8] flex items-center justify-between text-[10px] text-gray-400">
              <span className="italic">Click "+" to auto-create deck</span>
              <Award className="w-4 h-4 text-[#889681]" />
            </div>
          </div>
        </div>

      </div>

      {/* Elegant, clean bottom toast notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-[#5A5A40] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#E5E0D8]/20"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
            <span className="text-xs font-medium">{notification}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-white/60 hover:text-white cursor-pointer ml-2 p-1 rounded-lg"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
