import React, { useState } from 'react';
import { BookOpenIcon, LoaderIcon, UploadIcon, DownloadIcon, FileTextIcon, ZapIcon } from '../components/Icons';
import { generateStudyGuide, generateVisual } from '../services/gemini';
import { SimpleMarkdown } from '../components/Markdown';
import { useUser } from '../context/UserContext';
import { StudyGuide } from '../types';

const Study = () => {
  const [topic, setTopic] = useState('');
  const [isVisualMode, setIsVisualMode] = useState(false);
  const [currentGuide, setCurrentGuide] = useState<StudyGuide | null>(null);
  const [loading, setLoading] = useState(false);
  const [visualLoading, setVisualLoading] = useState(false);
  
  const { savedGuides, saveGuide, deleteGuide } = useUser();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setLoading(true);
    setCurrentGuide(null);

    try {
      const content = await generateStudyGuide(topic);
      let visualUrl = undefined;

      // If Visual Mode is on, automatically generate the visual
      if (isVisualMode) {
         visualUrl = await generateVisual(`Educational infographic summary about: ${topic}. Clean, colorful, easy to read diagram.`);
      }

      const newGuide: StudyGuide = {
        id: Date.now().toString(),
        topic: topic,
        content: content,
        dateCreated: new Date().toLocaleDateString(),
        visualUrl: visualUrl || undefined
      };
      setCurrentGuide(newGuide);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVisual = async () => {
    if(!currentGuide || visualLoading) return;
    setVisualLoading(true);
    try {
        const visualUrl = await generateVisual(`Educational diagram or infographic for: ${currentGuide.topic}. ${currentGuide.content.substring(0, 100)}`);
        if(visualUrl) {
            setCurrentGuide(prev => prev ? ({...prev, visualUrl}) : null);
        }
    } catch(e) {
        console.error(e);
    } finally {
        setVisualLoading(false);
    }
  }

  const handleSave = () => {
    if (currentGuide) {
      saveGuide(currentGuide);
      // Simple feedback
      const btn = document.getElementById('saveBtn');
      if(btn) {
          const ogText = btn.innerText;
          btn.innerText = "Saved!";
          setTimeout(() => btn.innerText = ogText, 2000);
      }
    }
  };

  const downloadGuide = (format: 'md' | 'txt') => {
    if (!currentGuide) return;
    
    const content = currentGuide.content;
    const filename = `${currentGuide.topic.replace(/\s+/g, '_')}_StudyGuide.${format}`;
    const mimeType = format === 'md' ? 'text/markdown' : 'text/plain';
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadGuide = (guide: StudyGuide) => {
      setCurrentGuide(guide);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="max-w-4xl mx-auto print:w-full print:max-w-none">
      <div className="bg-white rounded-3xl p-8 mb-8 shadow-xl border border-slate-100 relative overflow-hidden print:hidden animate-fade-in-up">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
        
        <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600">
                <BookOpenIcon className="w-8 h-8" />
            </div>
            <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Super Study Guide</h1>
                <p className="text-slate-500">Turn any topic into perfect notes instantly.</p>
            </div>
        </div>
        
        <form onSubmit={handleGenerate} className="mt-8 flex flex-col gap-4">
          <div className="flex gap-3">
            <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What do you want to learn? (e.g., Photosynthesis, WW2...)"
                className="flex-1 px-6 py-4 rounded-xl text-lg text-slate-800 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
            />
            <button
                type="submit"
                disabled={loading}
                className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 active:scale-95"
            >
                {loading ? <LoaderIcon className="animate-spin w-6 h-6" /> : 'Create'}
            </button>
          </div>
          
          <label className="flex items-center gap-3 cursor-pointer group w-fit">
              <div className={`w-12 h-7 rounded-full p-1 transition-colors ${isVisualMode ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                  <div className={`bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${isVisualMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
              <input type="checkbox" className="hidden" checked={isVisualMode} onChange={(e) => setIsVisualMode(e.target.checked)} />
              <span className="font-medium text-slate-600 group-hover:text-emerald-600 transition-colors flex items-center gap-2">
                  Visual Mode 🖼️ <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">New</span>
              </span>
          </label>
        </form>
      </div>

      {/* Main Display Area */}
      {loading && (
        <div className="text-center py-24 print:hidden animate-pulse">
          <div className="inline-block relative">
             <BookOpenIcon className="w-16 h-16 text-slate-200" />
             <LoaderIcon className="w-8 h-8 text-emerald-500 animate-spin absolute -bottom-2 -right-2" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mt-6">Crafting your guide...</h3>
          <p className="text-slate-400 mt-2">{isVisualMode ? 'Generating visuals and text...' : 'Organizing key concepts...'}</p>
        </div>
      )}

      {currentGuide && (
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in-up mb-12 print:shadow-none print:border-none">
           {/* Notebook Header */}
           <div className="bg-yellow-50 border-b border-yellow-100 p-8 print:hidden">
              <div className="flex justify-between items-start">
                  <div>
                      <h2 className="text-3xl font-bold text-slate-900 mb-2 font-serif">{currentGuide.topic}</h2>
                      <p className="text-slate-500 font-mono text-sm">Created: {currentGuide.dateCreated}</p>
                  </div>
                  <div className="flex gap-2">
                      <button onClick={handleSave} id="saveBtn" className="bg-white/50 hover:bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-yellow-200">
                          Save
                      </button>
                  </div>
              </div>
           </div>

           <div className="p-8 md:p-12 min-h-[500px] bg-[linear-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:100%_2rem]">
             {currentGuide.visualUrl && (
               <div className="mb-8 rounded-2xl overflow-hidden border-4 border-white shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-500 print:border-none">
                   <img src={currentGuide.visualUrl} alt="Topic Visual" className="w-full h-auto max-h-96 object-cover bg-slate-100" />
               </div>
             )}
             
             <div className="prose prose-slate max-w-none print:prose-sm">
                <SimpleMarkdown text={currentGuide.content} />
             </div>
           </div>
           
           <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center print:hidden">
             <div className="flex items-center gap-2">
                <button 
                    onClick={() => window.print()}
                    className="p-2 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                    title="Print / Save PDF"
                >
                    <DownloadIcon className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => downloadGuide('md')}
                    className="p-2 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                    title="Download Markdown"
                >
                    <FileTextIcon className="w-5 h-5" />
                </button>
             </div>

             {!currentGuide.visualUrl && (
                 <button
                    onClick={handleGenerateVisual}
                    disabled={visualLoading}
                    className="text-emerald-600 text-sm font-bold hover:bg-emerald-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                    {visualLoading ? <LoaderIcon className="animate-spin w-4 h-4" /> : <ZapIcon className="w-4 h-4" />}
                    Add Visual
                </button>
             )}
           </div>
        </div>
      )}

      {/* Saved Guides List */}
      {savedGuides.length > 0 && (
        <div className="print:hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <BookOpenIcon className="w-6 h-6 text-emerald-500" />
                Library
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
                {savedGuides.map(guide => (
                    <div key={guide.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all cursor-pointer group relative" onClick={() => loadGuide(guide)}>
                        <div className="font-bold text-slate-800 text-lg mb-2">{guide.topic}</div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span>{guide.dateCreated}</span>
                            {guide.visualUrl && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Visual</span>}
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); deleteGuide(guide.id); }}
                            className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors p-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default Study;