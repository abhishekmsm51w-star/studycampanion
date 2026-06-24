import React, { useState } from 'react';
import { FlashcardDeck, Flashcard } from '../types';
import { 
  Sparkles, 
  Plus, 
  RotateCw, 
  ChevronRight, 
  ChevronLeft, 
  Layers, 
  Trash2, 
  Check, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FlashcardStudyProps {
  decks: FlashcardDeck[];
  onAddDeck: (title: string, description: string) => void;
  onAddCardToDeck: (deckId: string, front: string, back: string) => void;
  onDeleteDeck: (deckId: string) => void;
  onGenerateAIDeck: (topic: string) => Promise<void>;
  isGeneratingAI: boolean;
}

export default function FlashcardStudy({
  decks,
  onAddDeck,
  onAddCardToDeck,
  onDeleteDeck,
  onGenerateAIDeck,
  isGeneratingAI,
}: FlashcardStudyProps) {
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(decks[0]?.id || null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddDeck, setShowAddDeck] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);

  // Form states
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');

  const activeDeck = decks.find((d) => d.id === selectedDeckId) || decks[0] || null;

  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckTitle.trim()) return;
    onAddDeck(newDeckTitle, newDeckDesc);
    setNewDeckTitle('');
    setNewDeckDesc('');
    setShowAddDeck(false);
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDeck || !newCardFront.trim() || !newCardBack.trim()) return;
    onAddCardToDeck(activeDeck.id, newCardFront, newCardBack);
    setNewCardFront('');
    setNewCardBack('');
    setShowAddCard(false);
  };

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;
    await onGenerateAIDeck(aiTopic);
    setAiTopic('');
    // Automatically select the latest deck if added
    if (decks.length > 0) {
      setSelectedDeckId(decks[decks.length - 1].id);
    }
  };

  const nextCard = () => {
    if (!activeDeck) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % activeDeck.cards.length);
    }, 150);
  };

  const prevCard = () => {
    if (!activeDeck) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev - 1 + activeDeck.cards.length) % activeDeck.cards.length);
    }, 150);
  };

  return (
    <div className="bg-white rounded-[32px] border border-[#E5E0D8] p-6 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#F0EDE8] gap-4">
        <div>
          <h2 className="font-serif text-xl text-[#5A5A40] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#889681]" />
            Active Study Decks
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Create custom terms or use Gemini to auto-generate decks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setShowAddDeck(!showAddDeck);
              setShowAddCard(false);
            }}
            className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-[#E5E0D8] rounded-full hover:bg-[#FBF9F6] transition cursor-pointer text-gray-700"
          >
            + Custom Deck
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 flex-1 min-h-0">
        {/* Decks selection sidebar (Left) */}
        <div className="lg:col-span-4 border-r border-[#F0EDE8] pr-0 lg:pr-4 flex flex-col gap-4 overflow-y-auto max-h-[400px] lg:max-h-[500px]">
          {/* AI Generator Box */}
          <div className="p-4 rounded-2xl bg-[#FAF3E0] border border-[#EEDDBB]">
            <h3 className="text-xs font-bold text-[#8B734B] uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              AI Deck Generator
            </h3>
            <form onSubmit={handleAIGenerate} className="space-y-2">
              <input
                type="text"
                placeholder="Topic: e.g. Mitochondria, French Verbs"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                disabled={isGeneratingAI}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#E5E0D8] bg-white focus:outline-none focus:border-[#889681]"
              />
              <button
                type="submit"
                disabled={isGeneratingAI || !aiTopic.trim()}
                className="w-full py-1.5 text-xs font-semibold text-white bg-[#889681] hover:bg-[#778570] rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                {isGeneratingAI ? 'Generating Cards...' : 'Generate 5 Flashcards'}
              </button>
            </form>
          </div>

          {/* Custom Deck creation form drawer */}
          <AnimatePresence>
            {showAddDeck && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreateDeck}
                className="p-4 rounded-2xl bg-[#FBF9F6] border border-[#F0EDE8] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#5A5A40]">New Deck Form</span>
                  <button type="button" onClick={() => setShowAddDeck(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Deck Title"
                  value={newDeckTitle}
                  onChange={(e) => setNewDeckTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#E5E0D8] bg-white focus:outline-none focus:border-[#889681]"
                />
                <input
                  type="text"
                  placeholder="Short Description"
                  value={newDeckDesc}
                  onChange={(e) => setNewDeckDesc(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#E5E0D8] bg-white focus:outline-none focus:border-[#889681]"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 text-xs font-semibold text-white bg-[#5A5A40] hover:bg-[#494932] rounded-xl transition cursor-pointer"
                >
                  Create Deck
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* List of Decks */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Available Decks</h4>
            {decks.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-2">No flashcard decks yet.</p>
            ) : (
              decks.map((deck) => {
                const isActive = activeDeck?.id === deck.id;
                return (
                  <div
                    key={deck.id}
                    onClick={() => {
                      setSelectedDeckId(deck.id);
                      setCurrentCardIndex(0);
                      setIsFlipped(false);
                    }}
                    className={`p-3 rounded-2xl border transition duration-150 cursor-pointer flex items-center justify-between group ${
                      isActive 
                        ? 'bg-[#FBF9F6] border-[#889681] text-[#5A5A40]' 
                        : 'bg-white border-[#F0EDE8] hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold truncate">{deck.title}</p>
                      <p className="text-[10px] text-gray-400 truncate">{deck.cards.length} cards • {deck.description || "No description"}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDeck(deck.id);
                        if (isActive) setSelectedDeckId(decks[0]?.id || null);
                      }}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 p-1 transition rounded-lg"
                      title="Delete deck"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Study view area (Right) */}
        <div className="lg:col-span-8 flex flex-col justify-between h-full min-h-[300px]">
          {activeDeck ? (
            <div className="flex-1 flex flex-col justify-between gap-4">
              {/* Deck Info Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#5A5A40]">{activeDeck.title}</h3>
                  <p className="text-xs text-gray-400">{activeDeck.description}</p>
                </div>

                <button
                  onClick={() => setShowAddCard(!showAddCard)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-[#889681] hover:text-[#5A5A40] border border-[#E5E0D8] rounded-lg hover:bg-slate-50 transition cursor-pointer"
                >
                  {showAddCard ? 'Close Input' : '+ Add Card'}
                </button>
              </div>

              {/* Add Card to current active deck drawer */}
              <AnimatePresence>
                {showAddCard && (
                  <motion.form
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onSubmit={handleCreateCard}
                    className="p-4 bg-[#FBF9F6] border border-[#F0EDE8] rounded-2xl space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Front Question</label>
                        <textarea
                          required
                          rows={2}
                          placeholder="e.g. What is gravity?"
                          value={newCardFront}
                          onChange={(e) => setNewCardFront(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#E5E0D8] bg-white focus:outline-none resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Back Answer</label>
                        <textarea
                          required
                          rows={2}
                          placeholder="e.g. Fundamental force pulling matter together..."
                          value={newCardBack}
                          onChange={(e) => setNewCardBack(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#E5E0D8] bg-white focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddCard(false)}
                        className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1 text-xs font-semibold text-white bg-[#889681] hover:bg-[#778570] rounded-xl transition cursor-pointer"
                      >
                        Add Card
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Flashcard Flip Display */}
              {activeDeck.cards.length > 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-4">
                  {/* Flip Container */}
                  <div 
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="w-full max-w-md h-44 cursor-pointer relative perspective-1000 group"
                  >
                    <div className={`w-full h-full duration-500 preserve-3d absolute rounded-3xl transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
                      {/* Front Side */}
                      <div className="absolute w-full h-full backface-hidden bg-[#FAF3E0] border border-[#EEDDBB] rounded-3xl p-6 flex flex-col justify-between shadow-xs">
                        <span className="text-[10px] uppercase font-bold text-[#8B734B] tracking-wider">FRONT</span>
                        <div className="flex-1 flex items-center justify-center text-center">
                          <p className="font-serif italic text-base text-[#5A5A40]">
                            {activeDeck.cards[currentCardIndex]?.front}
                          </p>
                        </div>
                        <div className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
                          <RotateCw className="w-3 h-3 text-gray-400" /> Click to reveal answer
                        </div>
                      </div>

                      {/* Back Side */}
                      <div className="absolute w-full h-full backface-hidden bg-white border border-[#E5E0D8] rounded-3xl p-6 flex flex-col justify-between rotate-y-180 shadow-xs">
                        <span className="text-[10px] uppercase font-bold text-[#889681] tracking-wider">BACK EXPLANATION</span>
                        <div className="flex-1 flex items-center justify-center text-center overflow-y-auto px-2">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {activeDeck.cards[currentCardIndex]?.back}
                          </p>
                        </div>
                        <div className="text-[10px] text-gray-400 text-center">
                          Click card to flip back
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation & Stats bar */}
                  <div className="flex items-center justify-between w-full max-w-md mt-4 px-2">
                    <button
                      onClick={prevCard}
                      className="p-2 border border-[#E5E0D8] text-gray-600 hover:text-[#5A5A40] hover:bg-[#FBF9F6] rounded-xl transition cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="text-xs font-mono text-gray-400">
                      Card {currentCardIndex + 1} of {activeDeck.cards.length}
                    </span>

                    <button
                      onClick={nextCard}
                      className="p-2 border border-[#E5E0D8] text-gray-600 hover:text-[#5A5A40] hover:bg-[#FBF9F6] rounded-xl transition cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#FBF9F6] border border-dashed border-[#E5E0D8] rounded-3xl">
                  <HelpCircle className="w-8 h-8 text-gray-300 stroke-1 mb-2" />
                  <p className="text-xs text-gray-500">This deck is empty.</p>
                  <button
                    onClick={() => setShowAddCard(true)}
                    className="text-xs font-bold text-[#889681] hover:underline mt-1 cursor-pointer"
                  >
                    Add your first card now!
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#FBF9F6] border border-[#F0EDE8] rounded-3xl">
              <Layers className="w-10 h-10 text-gray-300 stroke-1 mb-2" />
              <p className="text-sm font-semibold text-gray-500">No active study decks</p>
              <p className="text-xs text-gray-400 mt-1">Generate a deck using AI to instantly start studying.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
