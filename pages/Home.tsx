import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircleIcon, BookOpenIcon, LayersIcon, CheckSquareIcon, ZapIcon } from '../components/Icons';
import { useUser } from '../context/UserContext';

const Home = () => {
  const { user, savedGuides, savedFlashcards, savedQuizzes } = useUser();

  const features = [
    {
      title: "Homework Helper",
      desc: "Solve problems with AI",
      icon: MessageCircleIcon,
      link: "/explain",
      gradient: "from-blue-500 to-cyan-500",
      shadow: "shadow-blue-200"
    },
    {
      title: "Study Guides",
      desc: "Auto-generate notes",
      icon: BookOpenIcon,
      link: "/study",
      gradient: "from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-200"
    },
    {
      title: "Flashcards",
      desc: "Create decks instantly",
      icon: LayersIcon,
      link: "/flashcards",
      gradient: "from-violet-500 to-purple-500",
      shadow: "shadow-violet-200"
    },
    {
      title: "Practice Quiz",
      desc: "Test your skills",
      icon: CheckSquareIcon,
      link: "/quiz",
      gradient: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-200"
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">{user?.name.split(' ')[0]}</span>! 🚀
        </h1>
        <p className="text-slate-500 mt-3 text-lg">Ready to supercharge your brain today?</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
             <ZapIcon className="w-5 h-5 fill-current" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">100%</div>
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Brain Power</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300">
           <div className="text-3xl font-extrabold text-slate-900 mt-2">{savedGuides.length}</div>
           <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Guides</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300">
           <div className="text-3xl font-extrabold text-slate-900 mt-2">{savedFlashcards.length}</div>
           <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Decks</div>
        </div>
         <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300">
           <div className="text-3xl font-extrabold text-slate-900 mt-2">{savedQuizzes.length}</div>
           <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Quizzes Ace'd</div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        {features.map((f) => (
          <Link 
            to={f.link} 
            key={f.title} 
            className="group relative overflow-hidden bg-white p-8 rounded-3xl border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${f.gradient} opacity-10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700 ease-out`}></div>
            
            <div className="relative z-10 flex items-center gap-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${f.gradient} text-white shadow-lg ${f.shadow} group-hover:rotate-6 transition-transform duration-300`}>
                <f.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{f.title}</h3>
                <p className="text-slate-500 font-medium">{f.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity Section (Mock) */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Daily Tip 💡</h2>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">Free Forever</span>
        </div>
        <p className="text-indigo-100 text-lg leading-relaxed max-w-2xl">
            "The best way to learn is to teach. Try creating a quiz for a friend using the Quiz Builder!"
        </p>
      </div>
    </div>
  );
};

export default Home;