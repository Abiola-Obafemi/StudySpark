
import React, { useRef } from 'react';
import { UserIcon, BookOpenIcon, LayersIcon, DownloadIcon, UploadIcon } from '../components/Icons';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {
  const { user, logout, savedGuides, savedFlashcards, exportData, importData } = useUser();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        importData(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up pb-20">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Student Profile</h1>
      
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl mb-8 flex flex-col md:flex-row items-center gap-8 text-center md:text-left relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500 to-violet-500 opacity-10"></div>
        
        <div className="relative w-28 h-28 rounded-full p-1 bg-gradient-to-br from-blue-400 to-violet-400 shadow-lg">
            <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-700">
                {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-4 text-slate-300 dark:text-slate-600" />}
            </div>
            {user.isVerified && (
                <div className="absolute bottom-1 right-1 w-7 h-7 bg-blue-600 border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
            )}
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col md:flex-row items-center gap-3 mb-1">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
            <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
               Verified Student
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{user.schoolEmail || user.email}</p>
          <div className="mt-4 inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50">
             ✨ Premium Scholar
          </div>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8 transition-colors duration-300">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wider opacity-60">
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

      {/* Data Persistence Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8 transition-colors duration-300">
        <h3 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2 text-sm uppercase tracking-wider opacity-60">
            💾 Data Management
        </h3>
        <p className="text-xs text-slate-500 mb-4 font-medium italic">Save your study history to use across different browsers or deployments.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={exportData}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500 dark:hover:border-blue-400 transition-all font-bold"
          >
            <DownloadIcon className="w-4 h-4 text-blue-500" />
            Backup My Data
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 dark:hover:border-emerald-400 transition-all font-bold"
          >
            <UploadIcon className="w-4 h-4 text-emerald-500" />
            Restore Data
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="application/json" 
            onChange={handleFileImport} 
          />
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
