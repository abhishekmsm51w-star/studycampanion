import React, { useState } from 'react';
import { Note, Task, TaskCategory, TaskPriority } from '../types';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Sparkles, 
  Save, 
  CheckSquare, 
  Download, 
  Eye, 
  Edit3,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotepadProps {
  notes: Note[];
  onAddNote: (title: string, content: string) => void;
  onUpdateNote: (id: string, title: string, content: string) => void;
  onDeleteNote: (id: string) => void;
  onExtractTasks: (tasks: Omit<Task, 'id' | 'createdAt' | 'completed' | 'completedPomodoros'>[]) => void;
  onShowNotification: (msg: string) => void;
}

export default function Notepad({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onExtractTasks,
  onShowNotification,
}: NotepadProps) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [isEditing, setIsEditing] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    summary: string;
    extractedTasks: Array<{ title: string; description: string; estimatedPomodoros: number }>;
  } | null>(null);

  const activeNote = notes.find((n) => n.id === selectedNoteId) || notes[0] || null;

  // Form edit values
  const [editTitle, setEditTitle] = useState(activeNote?.title || '');
  const [editContent, setEditContent] = useState(activeNote?.content || '');

  // Synchronise selected note with edit forms
  React.useEffect(() => {
    if (activeNote) {
      setEditTitle(activeNote.title);
      setEditContent(activeNote.content);
      setAiAnalysisResult(null);
    }
  }, [selectedNoteId, activeNote]);

  const handleSaveNote = () => {
    if (!activeNote) return;
    onUpdateNote(activeNote.id, editTitle, editContent);
    onShowNotification("Study Note saved successfully");
  };

  const handleNewNote = () => {
    const title = `Untitled Notes ${notes.length + 1}`;
    const content = `# ${title}\n\nType your notes, research data, or key course actions here...`;
    onAddNote(title, content);
    // Select the new note
    setTimeout(() => {
      if (notes.length > 0) {
        setSelectedNoteId(notes[notes.length - 1].id);
      }
    }, 50);
  };

  const handleAIAnalyze = async () => {
    if (!activeNote || !editContent.trim()) return;
    setIsAnalyzing(true);
    setAiAnalysisResult(null);
    try {
      const response = await fetch('/api/ai/analyze-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteText: editContent }),
      });
      if (!response.ok) {
        throw new Error('Failed to analyze note content.');
      }
      const data = await response.json();
      setAiAnalysisResult(data);
      onShowNotification("Gemini analyzed notes! Review the summary and tasks below.");
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error occurred while analyzing notes.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyExtractedTasks = () => {
    if (!aiAnalysisResult || aiAnalysisResult.extractedTasks.length === 0) return;
    
    const formattedTasks = aiAnalysisResult.extractedTasks.map((t) => ({
      title: t.title,
      description: t.description,
      category: 'Research' as TaskCategory,
      priority: 'Medium' as TaskPriority,
      deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days deadline standard
      estimatedPomodoros: t.estimatedPomodoros || 2,
    }));

    onExtractTasks(formattedTasks);
    setAiAnalysisResult(null);
    onShowNotification("Extracted study tasks imported to your Planner!");
  };

  return (
    <div className="bg-white rounded-[32px] border border-[#E5E0D8] p-6 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#F0EDE8]">
        <div>
          <h2 className="font-serif text-xl text-[#5A5A40] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#889681]" />
            Smart Study Notepad
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Jot down key points, then leverage AI to extract action steps
          </p>
        </div>

        <button
          onClick={handleNewNote}
          className="p-2 border border-[#E5E0D8] text-gray-600 hover:text-[#5A5A40] hover:bg-[#FBF9F6] rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 flex-1 min-h-0">
        {/* Notes list sidebar (Left) */}
        <div className="lg:col-span-4 border-r border-[#F0EDE8] pr-0 lg:pr-4 flex flex-col gap-3 overflow-y-auto max-h-[350px] lg:max-h-[500px]">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Your Notebooks</h4>
          {notes.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-2">No notes created yet.</p>
          ) : (
            notes.map((note) => {
              const isActive = activeNote?.id === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`p-3 rounded-2xl border transition duration-150 cursor-pointer flex items-center justify-between group ${
                    isActive 
                      ? 'bg-[#FBF9F6] border-[#889681] text-[#5A5A40]' 
                      : 'bg-white border-[#F0EDE8] hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold truncate">{note.title}</p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {note.content.substring(0, 45).replace(/[#*`\n]/g, '') || "No content"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote(note.id);
                      if (isActive) setSelectedNoteId(notes[0]?.id || null);
                    }}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 p-1 transition rounded-lg"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Content & AI analysis panel (Right) */}
        <div className="lg:col-span-8 flex flex-col justify-between h-full min-h-[350px]">
          {activeNote ? (
            <div className="flex-1 flex flex-col justify-between gap-4">
              {/* Note Edit Inputs */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-base font-serif font-bold text-[#5A5A40] border-b border-dashed border-[#E5E0D8] focus:outline-none focus:border-[#889681] pb-1"
                  />
                  
                  {/* Action Buttons */}
                  <div className="flex gap-1">
                    <button
                      onClick={handleSaveNote}
                      className="p-1.5 hover:bg-[#F5F2ED] text-[#889681] hover:text-[#5A5A40] border border-[#E5E0D8] rounded-xl transition cursor-pointer"
                      title="Save notes"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleAIAnalyze}
                      disabled={isAnalyzing}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#889681] hover:bg-[#778570] rounded-xl transition cursor-pointer disabled:opacity-50"
                      title="Gemini analyzes note and extracts tasks"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isAnalyzing ? 'Analyzing...' : 'AI Analyze'}</span>
                    </button>
                  </div>
                </div>

                {/* Main Text Area */}
                <div className="relative">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={8}
                    placeholder="Take class notes or paste textbook reading content here..."
                    className="w-full font-serif text-sm leading-relaxed text-gray-700 bg-[#FBF9F6] border border-[#F0EDE8] p-4 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#889681] resize-none min-h-[220px]"
                  />
                  <div className="absolute bottom-2 right-3 text-[10px] text-gray-400 italic">
                    Word count: {editContent.trim().split(/\s+/).filter(Boolean).length}
                  </div>
                </div>
              </div>

              {/* AI Analysis Drawer results */}
              <AnimatePresence>
                {aiAnalysisResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="p-4 border border-[#EEDDBB] bg-[#FAF3E0] rounded-2xl space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-[#EEDDBB] pb-2">
                      <span className="text-xs font-bold text-[#8B734B] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> AI Notes Breakdown Summary
                      </span>
                      <button 
                        onClick={() => setAiAnalysisResult(null)}
                        className="text-xs text-[#8B734B] hover:underline"
                      >
                        Hide
                      </button>
                    </div>

                    {/* Extracted Markdown Summary */}
                    <div className="text-xs text-gray-700 space-y-1 overflow-y-auto max-h-32 leading-relaxed">
                      <p className="font-semibold text-[#8B734B]">Extracted Study Core:</p>
                      <div className="whitespace-pre-wrap italic">
                        {aiAnalysisResult.summary}
                      </div>
                    </div>

                    {/* Extracted Tasks check list */}
                    {aiAnalysisResult.extractedTasks && aiAnalysisResult.extractedTasks.length > 0 && (
                      <div className="pt-2 border-t border-[#EEDDBB] space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-[#8B734B] flex items-center gap-1">
                            <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                            Extracted Deadlines & Tasks ({aiAnalysisResult.extractedTasks.length}):
                          </p>
                          <button
                            onClick={handleApplyExtractedTasks}
                            className="px-2 py-1 text-[10px] font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition cursor-pointer flex items-center gap-1"
                          >
                            Add to Planner
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {aiAnalysisResult.extractedTasks.map((t, idx) => (
                            <div key={idx} className="p-2.5 bg-white/70 border border-[#F0EDE8] rounded-xl text-[11px] leading-snug">
                              <p className="font-semibold text-slate-800">{t.title}</p>
                              <p className="text-gray-500 text-[10px] truncate">{t.description}</p>
                              <span className="inline-block mt-1 text-[9px] font-bold text-[#8B734B] bg-[#FAF3E0] px-1.5 py-0.5 rounded-full border border-[#EEDDBB]/60">
                                Est: {t.estimatedPomodoros} Pomos
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#FBF9F6] border border-[#F0EDE8] rounded-3xl">
              <FileText className="w-10 h-10 text-gray-300 stroke-1 mb-2" />
              <p className="text-sm font-semibold text-gray-500">No active notes selected</p>
              <p className="text-xs text-gray-400 mt-1">Create a note on the left or select an existing one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
