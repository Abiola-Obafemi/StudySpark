
import React, { useState } from 'react';
import { LayersIcon, LoaderIcon } from '../components/Icons';
import { generateFlashcards } from '../services/gemini';
import { Flashcard, FlashcardSet } from '../types';
import { useUser } from '../context/UserContext';

const Flashcards = () => {
  const { savedFlashcards, saveFlashcards, deleteFlashcards } = useUser();
  const [topic, setTopic] = useState('');
  const [currentSet, setCurrentSet] = useState<FlashcardSet | null>(null);
  const [loading, setLoading] = useState(false);
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setCurrentSet(null);
    setFlippedIndices(new Set());

    try {
      const cards = await generateFlashcards(topic);
      const newSet: FlashcardSet = {
        id: Date.now().toString(),
        topic,
        cards,
        dateCreated: new Date().toLocaleDateString()
      };
      setCurrentSet(newSet);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlip = (index: number) => {
    const newSet = new Set(flippedIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setFlippedIndices(newSet);
  };

  const handleSave = () => {
    if(currentSet) {
      saveFlashcards(currentSet);
      alert("Deck saved to your library! 📚");
    }
  };
  
  const loadSet = (set: FlashcardSet) => {
      setCurrentSet(set);
      setFlippedIndices(new Set());
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <LayersIcon className="text-violet-500 w-8 h-8" />
            Flashcards
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Study smarter with AI-powered memory decks.</p>
        </div>
        
        <form onSubmit={handleGenerate} className="flex gap-2 w-full md:w-auto animate-fade-in-up">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic (e.g., Biology, SQL)"
            className="flex-1 md:w-64 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-violet-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-violet-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-violet-200 dark:shadow-none"
          >
            {loading ? <LoaderIcon className="animate-spin w-5 h-5" /> : 'Generate'}
          </button>
        </form>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
           {[1,2,3,4,5,6].map(i => (
             <div key={i} className="aspect-[4/3] bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse"></div>
           ))}
        </div>
      )}

      {currentSet && (
        <div className="mb-12">
            <div className="flex justify-between items-center mb-6 animate-fade-in-up">
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{currentSet.topic}</h2>
                 <button 
                  onClick={handleSave} 
                  className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-md"
                >
                  Save Deck
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {currentSet.cards.map((card, index) => (
                <div 
                    key={index} 
                    className={`aspect-[4/3] cursor-pointer group flip-card ${flippedIndices.has(index) ? 'flipped' : ''} animate-fade-in-up`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => toggleFlip(index)}
                >
                    <div className="flip-card-inner">
                    {/* Front */}
                    <div className="flip-card-front bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm group-hover:shadow-xl transition-all duration-300">
                        <div className="absolute top-6 left-8 flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question</span>
                        </div>
                        <p className="text-xl font-bold text-slate-800 dark:text-white text-center leading-relaxed">
                        {card.front}
                        </p>
                        <div className="absolute bottom-6 text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest group-hover:text-violet-400 transition-colors">
                            Click to reveal answer
                        </div>
                    </div>
                    
                    {/* Back */}
                    <div className="flip-card-back bg-violet-600 p-8 shadow-2xl">
                        <div className="absolute top-6 left-8 flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-white"></div>
                             <span className="text-[10px] font-black text-violet-200 uppercase tracking-widest">Answer</span>
                        </div>
                        <p className="text-lg font-medium text-white text-center leading-relaxed">
                        {card.back}
                        </p>
                        <div className="absolute bottom-6 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                            Got it? Click to flip back
                        </div>
                    </div>
                    </div>
                </div>
                ))}
            </div>
        </div>
      )}
      
      {/* Saved Decks */}
      {savedFlashcards.length > 0 && (
        <div className="pt-12 border-t border-slate-200 dark:border-slate-800 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Your Deck Library</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {savedFlashcards.map(set => (
                    <div key={set.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-violet-500 dark:hover:border-violet-500 transition-all cursor-pointer group relative shadow-sm hover:shadow-md" onClick={() => loadSet(set)}>
                        <div className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-violet-600 transition-colors">{set.topic}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{set.cards.length} Cards • {set.dateCreated}</div>
                         <button 
                            onClick={(e) => { e.stopPropagation(); deleteFlashcards(set.id); }}
                            className="absolute top-4 right-4 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors p-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default Flashcards;
