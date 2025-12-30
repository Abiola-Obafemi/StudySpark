
import React from 'react';
import { UserIcon, BookOpenIcon, LayersIcon, ZapIcon } from '../components/Icons';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {
  const { user, logout, savedGuides, savedFlashcards } = useUser();
  const { theme, setTheme } = useTheme();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Student Profile</h1>
      
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl mb-8 flex flex-col md:flex-row items-center gap-8 text-center md:text-left relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500 to-violet-500 opacity-10"></div>
        
        <div className="relative w-28 h-28 rounded-full p-1 bg-gradient-to-br from-blue-400 to-violet-400 shadow-lg">
            <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-700">
                {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-4 text-slate-300 dark:text-slate-600" />}
            </div>
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
        </div>
        
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{user.email}</p>
          <div className="mt-4 inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50">
             ✨ Premium Scholar
          </div>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8 transition-colors duration-300">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            🎨 App Theme
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`py-3 px-4 rounded-xl border-2 font-bold capitalize transition-all ${
                theme === t 
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                  : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-2 text-slate-400 dark:text-slate-500">
                  <BookOpenIcon className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Study Guides</span>
              </div>
              <div className="text-4xl font-black text-slate-900 dark:text-white">{savedGuides.length}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
               <div className="flex items-center gap-3 mb-2 text-slate-400 dark:text-slate-500">
                  <LayersIcon className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Decks</span>
              </div>
              <div className="text-4xl font-black text-slate-900 dark:text-white">{savedFlashcards.length}</div>
          </div>
      </div>

      <button 
        onClick={logout} 
        className="w-full bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-900/10 text-slate-400 hover:text-red-500 font-bold py-4 rounded-2xl transition-colors border border-slate-200 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900"
      >
        Sign Out
      </button>
    </div>
  );
};

export default Profile;
