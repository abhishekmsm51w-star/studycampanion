export type TaskCategory = 'Study' | 'Homework' | 'Research' | 'Exam Prep' | 'Other';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  deadline: string; // YYYY-MM-DD
  completed: boolean;
  estimatedPomodoros: number;
  completedPomodoros: number;
  createdAt: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  lastReviewed: string | null;
  box: number; // For review status
}

export interface FlashcardDeck {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface PomodoroSettings {
  workTime: number; // in minutes
  shortBreak: number; // in minutes
  longBreak: number; // in minutes
  longBreakInterval: number; // count of work sessions before long break
}

export interface AIRecommendation {
  taskTitle: string;
  priorityScore: string;
  justification: string;
  actionStep: string;
}

export interface AIRecommendResult {
  recommendations: AIRecommendation[];
  studyTips: string[];
  suggestedDecks: string[];
}
