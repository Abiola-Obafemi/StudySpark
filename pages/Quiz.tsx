import React, { useState } from 'react';
import { CheckSquareIcon, LoaderIcon, ZapIcon, CameraIcon } from '../components/Icons';
import { generateQuiz, generateVisual } from '../services/gemini';
import { QuizQuestion } from '../types';

const Quiz = () => {
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: number}>({});
  const [showResults, setShowResults] = useState(false);
  
  // Manage images for questions
  const [questionImages, setQuestionImages] = useState<{[key: number]: string}>({});
  const [loadingImages, setLoadingImages] = useState<{[key: number]: boolean}>({});

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setLoading(true);
    setShowResults(false);
    setSelectedAnswers({});
    setQuestions([]);
    setQuestionImages({});
    setLoadingImages({});
    
    try {
      const result = await generateQuiz(topic);
      setQuestions(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionImage = async (index: number, prompt: string) => {
    if (questionImages[index] || loadingImages[index]) return;
    
    setLoadingImages(prev => ({...prev, [index]: true}));
    try {
        const url = await generateVisual(prompt);
        if (url) {
            setQuestionImages(prev => ({...prev, [index]: url}));
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoadingImages(prev => ({...prev, [index]: false}));
    }
  };

  const handleOptionSelect = (qIndex: number, optIndex: number) => {
    if (showResults) return;
    setSelectedAnswers(prev => ({...prev, [qIndex]: optIndex}));
  };

  const checkResults = () => {
    setShowResults(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getScore = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctAnswerIndex) correct++;
    });
    return correct;
  };

  return (
    <div className="max-w-3xl mx-auto pb-10">
       <div className="text-center mb-8 animate-fade-in-up">
         <div className="inline-flex items-center justify-center p-3 bg-amber-100 rounded-2xl text-amber-600 mb-4">
            <CheckSquareIcon className="w-8 h-8" />
         </div>
         <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Quiz Master</h1>
         <p className="text-slate-500 text-lg">Challenge yourself on any topic.</p>
       </div>

       <form onSubmit={handleGenerate} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 flex flex-col sm:flex-row gap-3 mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
         <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter topic (e.g. Algebra, Space, Grammar)"
            className="flex-1 p-4 bg-slate-50 rounded-xl border border-transparent focus:bg-white focus:border-amber-400 outline-none transition-all text-slate-900 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-amber-600 disabled:opacity-50 transition-all shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap"
          >
            {loading ? <LoaderIcon className="animate-spin w-5 h-5" /> : 'Create Quiz'}
          </button>
       </form>

        {showResults && (
         <div className="mb-8 p-8 bg-slate-900 text-white rounded-3xl text-center animate-pop-in shadow-2xl">
           <div className="text-6xl font-black mb-2 text-amber-400">{Math.round((getScore() / questions.length) * 100)}%</div>
           <h2 className="text-2xl font-bold mb-2">You scored {getScore()} out of {questions.length}</h2>
           <p className="text-slate-400">Keep practicing to reach 100%!</p>
           <button onClick={() => { setShowResults(false); setQuestions([]); setTopic(''); }} className="mt-6 bg-white text-slate-900 px-6 py-2 rounded-full font-bold hover:bg-slate-200 transition-colors">
               Try Another Topic
           </button>
         </div>
       )}

       <div className="space-y-6">
         {questions.map((q, qIdx) => (
           <div key={qIdx} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm animate-fade-in-up" style={{ animationDelay: `${0.1 * qIdx}s` }}>
             <h3 className="text-xl font-bold text-slate-900 mb-6 flex gap-4">
               <span className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 text-sm">{qIdx + 1}</span>
               {q.question}
             </h3>

             {/* Visual Aid Section */}
             {q.visualDescription && (
                 <div className="mb-6">
                     {questionImages[qIdx] ? (
                         <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                             <img src={questionImages[qIdx]} alt="Question Diagram" className="w-full h-auto max-h-64 object-contain bg-slate-50" />
                         </div>
                     ) : (
                         <button 
                            onClick={() => loadQuestionImage(qIdx, q.visualDescription!)}
                            disabled={loadingImages[qIdx]}
                            className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-3 rounded-xl transition-colors w-full justify-center border border-blue-100 border-dashed"
                         >
                             {loadingImages[qIdx] ? <LoaderIcon className="animate-spin w-4 h-4" /> : <CameraIcon className="w-4 h-4" />}
                             {loadingImages[qIdx] ? "Generating Graph/Diagram..." : "Show Graph / Diagram Helper"}
                         </button>
                     )}
                 </div>
             )}

             <div className="space-y-3">
               {q.options.map((opt, oIdx) => {
                 let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium relative overflow-hidden ";
                 
                 if (showResults) {
                   if (oIdx === q.correctAnswerIndex) {
                     btnClass += "bg-green-50 border-green-500 text-green-800 shadow-[0_0_15px_rgba(34,197,94,0.2)]";
                   } else if (selectedAnswers[qIdx] === oIdx) {
                     btnClass += "bg-red-50 border-red-400 text-red-800";
                   } else {
                     btnClass += "bg-slate-50 border-transparent opacity-50";
                   }
                 } else {
                   if (selectedAnswers[qIdx] === oIdx) {
                     btnClass += "bg-amber-50 border-amber-400 text-amber-900 shadow-sm scale-[1.01]";
                   } else {
                     btnClass += "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-700";
                   }
                 }

                 return (
                   <button
                    key={oIdx}
                    onClick={() => handleOptionSelect(qIdx, oIdx)}
                    className={btnClass}
                   >
                     {opt}
                     {showResults && oIdx === q.correctAnswerIndex && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600 font-bold">✓</span>
                     )}
                   </button>
                 )
               })}
             </div>
             {showResults && (
               <div className="mt-6 p-4 bg-blue-50 text-blue-800 text-sm rounded-xl border border-blue-100 animate-fade-in-up">
                 <strong>Explanation: </strong> {q.explanation}
               </div>
             )}
           </div>
         ))}
       </div>

       {questions.length > 0 && !showResults && (
         <div className="mt-10 text-center pb-10">
           <button 
            onClick={checkResults}
            className="bg-slate-900 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-800 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0"
           >
             Check My Answers
           </button>
         </div>
       )}
    </div>
  );
};

export default Quiz;