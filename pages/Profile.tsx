import React from 'react';
import { UserIcon, BookOpenIcon, LayersIcon } from '../components/Icons';
import { useUser } from '../context/UserContext';

const Profile = () => {
  const { user, logout, savedGuides, savedFlashcards } = useUser();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Student Profile</h1>
      
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl mb-8 flex flex-col md:flex-row items-center gap-8 text-center md:text-left relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500 to-violet-500 opacity-10"></div>
        
        <div className="relative w-28 h-28 rounded-full p-1 bg-gradient-to-br from-blue-400 to-violet-400 shadow-lg">
            <div className="w-full h-full rounded-full overflow-hidden bg-white border-4 border-white">
                {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-4 text-slate-300" />}
            </div>
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        
        <div>
          <h2 className="text-3xl font-bold text-slate-900">{user.name}</h2>
          <p className="text-slate-500 font-medium">{user.email}</p>
          <div className="mt-4 inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide bg-gradient-to-r from-amber-100 to-orange-100 text-orange-600 border border-orange-200">
             ✨ Premium Scholar
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2 text-slate-400">
                  <BookOpenIcon className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Study Guides</span>
              </div>
              <div className="text-4xl font-black text-slate-900">{savedGuides.length}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
               <div className="flex items-center gap-3 mb-2 text-slate-400">
                  <LayersIcon className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Decks</span>
              </div>
              <div className="text-4xl font-black text-slate-900">{savedFlashcards.length}</div>
          </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-3xl mb-8 text-center">
          <h3 className="font-bold text-blue-900 mb-2">Keep Learning!</h3>
          <p className="text-blue-700/80 text-sm">StudySpark is completely free. Create as many guides, quizzes, and flashcards as you need to ace your exams.</p>
      </div>

      <button 
        onClick={logout} 
        className="w-full bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 font-bold py-4 rounded-2xl transition-colors border border-slate-200 hover:border-red-200"
      >
        Sign Out
      </button>
    </div>
  );
};

export default Profile;