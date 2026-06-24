import { Task, FlashcardDeck, Note } from "./types";

// Get tomorrow's date for a deadline
const getRelativeDate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Revise Physics Ch. 4: Thermodynamics",
    description: "Go through first-law formulas, heat engine efficiency problems, and entropy definitions.",
    category: "Exam Prep",
    priority: "High",
    deadline: getRelativeDate(1), // Tomorrow
    completed: false,
    estimatedPomodoros: 3,
    completedPomodoros: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: "task-2",
    title: "Draft Outline for History Essay",
    description: "Write structural section headlines regarding the social impacts of the Industrial Revolution.",
    category: "Research",
    priority: "Medium",
    deadline: getRelativeDate(3),
    completed: false,
    estimatedPomodoros: 2,
    completedPomodoros: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: "task-3",
    title: "Complete Calculus Problem Set 5",
    description: "Solve questions 1 through 15 on double integration and polar coordinate areas.",
    category: "Homework",
    priority: "High",
    deadline: getRelativeDate(2),
    completed: false,
    estimatedPomodoros: 4,
    completedPomodoros: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: "task-4",
    title: "Review Biology Flashcards",
    description: "Active recall on respiratory system structures and gas exchange mechanisms.",
    category: "Study",
    priority: "Low",
    deadline: getRelativeDate(5),
    completed: true,
    estimatedPomodoros: 1,
    completedPomodoros: 1,
    createdAt: new Date().toISOString()
  }
];

export const initialDecks: FlashcardDeck[] = [
  {
    id: "deck-1",
    title: "Javascript Core Concepts",
    description: "Essential terms regarding scopes, closures, async event loops, and prototypes.",
    createdAt: new Date().toISOString(),
    cards: [
      {
        id: "card-1-1",
        front: "What is a Closure in JavaScript?",
        back: "A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment). It allows an inner function to access the scope of an outer function even after the outer function has returned.",
        lastReviewed: null,
        box: 1
      },
      {
        id: "card-1-2",
        front: "What is the difference between '==' and '==='?",
        back: "'==' compares values for equality after performing implicit type conversion (coercion). '===' compares both the values AND the types without type conversion (strict equality).",
        lastReviewed: null,
        box: 1
      },
      {
        id: "card-1-3",
        front: "Explain Promise.all()",
        back: "Promise.all() takes an iterable of promises and returns a single Promise that resolves when all of the inputs have resolved, or rejects immediately if any input promise rejects.",
        lastReviewed: null,
        box: 1
      }
    ]
  },
  {
    id: "deck-2",
    title: "Cognitive Psychology Mnemonics",
    description: "Study of memory structures, sensory registers, and cognitive biases.",
    createdAt: new Date().toISOString(),
    cards: [
      {
        id: "card-2-1",
        front: "What is Spaced Repetition?",
        back: "An active recall learning technique where card reviews are spaced out at increasing intervals (e.g. 1 day, 3 days, 10 days) to leverage the psychological spacing effect for better long-term memory consolidation.",
        lastReviewed: null,
        box: 1
      },
      {
        id: "card-2-2",
        front: "Define 'Zeigarnik Effect'",
        back: "The psychological phenomenon where people remember uncompleted or interrupted tasks better than completed ones. This creates a cognitive tension that makes you want to return and finish a task.",
        lastReviewed: null,
        box: 1
      }
    ]
  }
];

export const initialNotes: Note[] = [
  {
    id: "note-1",
    title: "Anatomy Study Session: Neurons",
    content: `# Structure of a Neuron

Notes from biology textbook chapter 8:
- **Dendrites**: Receive incoming chemical signals from other neurons.
- **Soma (Cell Body)**: Contains nucleus and aggregates signals.
- **Axon**: Long fiber that carries electrical impulses (Action Potentials) away from cell body.
- **Myelin Sheath**: Fatty insulation layer that increases signal velocity.

## Key Study Action Items:
1. Draw and label a diagram of axon synaptic transmission.
2. Formulate 5 quick self-test flashcards on myelin sheath nodes of Ranvier.
3. Complete practice quiz questions on sodium-potassium pumps.`,
    updatedAt: new Date().toISOString()
  },
  {
    id: "note-2",
    title: "Productivity Principles checklist",
    content: `# Key Takeaways from Deep Work

- Focus on the wildly important goals.
- Act on lead measures (e.g., hours spent in deep focus vs. final grade).
- Keep a compelling scoreboard of daily Pomodoro blocks.
- Create a shutdown ritual to clear working memory space.`,
    updatedAt: new Date().toISOString()
  }
];
