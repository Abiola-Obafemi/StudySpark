
import React, { useState, useRef } from 'react';
import { BookOpenIcon, LoaderIcon, DownloadIcon, FileTextIcon, ZapIcon, CameraIcon } from '../components/Icons';
import { generateStudyGuide, generateVisual } from '../services/gemini';
import { SimpleMarkdown } from '../components/Markdown';
import { useUser } from '../context/UserContext';
import { StudyGuide } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const Study = () => {
  const [topic, setTopic] = useState('');
  const [isVisualMode, setIsVisualMode] = useState(false);
  const [currentGuide, setCurrentGuide] = useState<StudyGuide | null>(null);
  const [loading, setLoading] = useState(false);
  const [visualLoading, setVisualLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const guideRef = useRef<HTMLDivElement>(null);
  const { savedGuides, saveGuide, deleteGuide } = useUser();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setLoading(true);
    setCurrentGuide(null);

    try {
      const content = await generateStudyGuide(topic);
      let visualUrl = undefined;

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

  const handleSave = () => {
    if (currentGuide) {
      saveGuide(currentGuide);
      const btn = document.getElementById('saveBtn');
      if(btn) {
          const ogText = btn.innerText;
          btn.innerText = "Saved!";
          setTimeout(() => btn.innerText = ogText, 2000);
      }
    }
  };

  const exportAsImage = async () => {
    if (!guideRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(guideRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${currentGuide?.topic || 'StudyGuide'}.png`;
      link.click();
    } catch (err) {
      console.error('Export Image Error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    if (!guideRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(guideRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${currentGuide?.topic || 'StudyGuide'}.pdf`);
    } catch (err) {
      console.error('Export PDF Error:', err);
    } finally {
      setIsExporting(false);
    }
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
                <p className="text-slate-500">Transform complex topics into crystal-clear study notes.</p>
            </div>
        </div>
        
        <form onSubmit={handleGenerate} className="mt-8 flex flex-col gap-4">
          <div className="flex gap-3">
            <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What are we learning today?"
                className="flex-1 px-6 py-4 rounded-xl text-lg text-slate-900 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all placeholder:text-slate-400"
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
                  Visual Diagrams 🖼️
              </span>
          </label>
        </form>
      </div>

      {loading && (
        <div className="text-center py-24 print:hidden animate-pulse">
          <div className="inline-block relative">
             <BookOpenIcon className="w-16 h-16 text-slate-200" />
             <LoaderIcon className="w-8 h-8 text-emerald-500 animate-spin absolute -bottom-2 -right-2" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mt-6">Writing your guide...</h3>
          <p className="text-slate-400 mt-2">Connecting concepts and simplifying ideas...</p>
        </div>
      )}

      {currentGuide && (
        <div className="space-y-4 mb-12 animate-fade-in-up">
           <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden print:shadow-none print:border-none">
              <div ref={guideRef} className="bg-white">
                {/* Notebook Header */}
                <div className="bg-yellow-50/50 border-b border-yellow-100 p-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-2 font-serif">{currentGuide.topic}</h2>
                            <p className="text-slate-500 font-mono text-xs">Generated by StudySpark AI • {currentGuide.dateCreated}</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 md:p-12 min-h-[500px] bg-[linear-gradient(#e5e7eb_0.5px,transparent_0.5px)] bg-[length:100%_2rem]">
                  {currentGuide.visualUrl && (
                    <div className="mb-10 rounded-2xl overflow-hidden border-4 border-white shadow-lg transform rotate-1 print:rotate-0 print:shadow-none">
                        <img src={currentGuide.visualUrl} alt="Topic Visual" className="w-full h-auto max-h-[500px] object-contain bg-slate-50" />
                    </div>
                  )}
                  
                  <div className="prose prose-slate max-w-none print:prose-sm">
                      <SimpleMarkdown text={currentGuide.content} />
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-6 border-t border-slate-200 flex flex-wrap gap-4 justify-between items-center print:hidden">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={exportAsPDF}
                        disabled={isExporting}
                        className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl text-slate-700 font-bold border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm disabled:opacity-50"
                    >
                        {isExporting ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <DownloadIcon className="w-4 h-4 text-blue-600" />}
                        Download PDF
                    </button>
                    <button 
                        onClick={exportAsImage}
                        disabled={isExporting}
                        className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl text-slate-700 font-bold border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm disabled:opacity-50"
                    >
                        {isExporting ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <CameraIcon className="w-4 h-4 text-emerald-600" />}
                        Save as Image
                    </button>
                    <button 
                        onClick={() => {
                          const blob = new Blob([currentGuide.content], { type: 'text/markdown' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${currentGuide.topic}.md`;
                          a.click();
                        }}
                        className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl text-slate-700 font-bold border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                    >
                        <FileTextIcon className="w-4 h-4 text-violet-600" />
                        Markdown
                    </button>
                </div>

                <button
                    onClick={handleSave}
                    id="saveBtn"
                    className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                >
                    Save to Library
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Saved Guides List */}
      {savedGuides.length > 0 && (
        <div className="print:hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <BookOpenIcon className="w-6 h-6 text-emerald-500" />
                Your Library
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
