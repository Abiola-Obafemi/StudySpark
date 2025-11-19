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
      alert("Deck saved!");
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
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <LayersIcon className="text-violet-500 w-8 h-8" />
            Flashcards
          </h1>
          <p className="text-slate-500 mt-1">Create unlimited study decks for free.</p>
        </div>
        
        <form onSubmit={handleGenerate} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic (e.g., Spanish Verbs)"
            className="flex-1 md:w-64 px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-violet-500 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-violet-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading && <LoaderIcon className="animate-spin w-4 h-4" />}
            Generate
          </button>
        </form>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
           {[1,2,3,4,5].map(i => (
             <div key={i} className="aspect-[3/2] bg-slate-100 rounded-xl animate-pulse"></div>
           ))}
        </div>
      )}

      {currentSet && (
        <div className="mb-12 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-slate-800">{currentSet.topic}</h2>
                 <button onClick={handleSave} className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg transition-colors">Save Deck</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {currentSet.cards.map((card, index) => (
                <div 
                    key={index} 
                    className={`aspect-[3/2] cursor-pointer group flip-card ${flippedIndices.has(index) ? 'flipped' : ''}`}
                    onClick={() => toggleFlip(index)}
                >
                    <div className="flip-card-inner shadow-sm group-hover:shadow-md transition-all duration-300">
                    {/* Front */}
                    <div className="flip-card-front bg-white border border-slate-200 p-6 flex flex-col justify-center items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Question</span>
                        <p className="text-xl font-semibold text-slate-800 text-center leading-tight">
                        {card.front}
                        </p>
                        <p className="absolute bottom-4 text-xs text-slate-400">Click to flip</p>
                    </div>
                    
                    {/* Back */}
                    <div className="flip-card-back bg-violet-50 border border-violet-100 p-6 flex flex-col justify-center items-center">
                        <span className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-2">Answer</span>
                        <p className="text-lg text-slate-800 text-center">
                        {card.back}
                        </p>
                    </div>
                    </div>
                </div>
                ))}
            </div>
        </div>
      )}
      
      {/* Saved Decks */}
      {savedFlashcards.length > 0 && (
        <div className="pt-8 border-t border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Saved Decks</h2>
            <div className="grid md:grid-cols-3 gap-4">
                {savedFlashcards.map(set => (
                    <div key={set.id} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-violet-500 transition-colors cursor-pointer group relative" onClick={() => loadSet(set)}>
                        <div className="font-bold text-slate-800 mb-1">{set.topic}</div>
                        <div className="text-sm text-slate-500">{set.cards.length} Cards • {set.dateCreated}</div>
                         <button 
                            onClick={(e) => { e.stopPropagation(); deleteFlashcards(set.id); }}
                            className="absolute top-4 right-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
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
