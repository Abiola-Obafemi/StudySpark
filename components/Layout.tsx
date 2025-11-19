import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon, MessageCircleIcon, BookOpenIcon, LayersIcon, CheckSquareIcon, UserIcon, Logo } from './Icons';
import { useUser } from '../context/UserContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();

  // HOOKS MUST BE CALLED BEFORE ANY RETURN STATEMENTS
  useEffect(() => {
    if (!user && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [user, navigate, location.pathname]);

  const navItems = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/explain', label: 'Explain', icon: MessageCircleIcon },
    { path: '/study', label: 'Study', icon: BookOpenIcon },
    { path: '/flashcards', label: 'Flashcards', icon: LayersIcon },
    { path: '/quiz', label: 'Quiz', icon: CheckSquareIcon },
  ];

  // If on login page, just render children (the login page itself)
  if (location.pathname === '/login') {
    return <>{children}</>;
  }

  // Guard for other protected pages
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 fixed h-full z-20 print:hidden shadow-[2px_0_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="p-8 flex items-center gap-3">
          <Logo className="w-10 h-10" />
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">StudySpark</span>
        </div>

        <nav className="flex-1 px-6 space-y-2 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span className={`font-medium text-base ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto space-y-4">
           <Link to="/profile" className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
             {user.avatar ? (
               <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full bg-white object-cover border-2 border-white shadow-sm" />
             ) : (
               <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                 {user.name.charAt(0)}
               </div>
             )}
             <div className="overflow-hidden">
               <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{user.name}</p>
               <p className="text-xs text-slate-500 truncate font-medium">Student Profile</p>
             </div>
             <div className="ml-auto">
                 <UserIcon className="w-4 h-4 text-slate-400" />
             </div>
           </Link>
           
           <div className="text-center px-2">
              <p className="text-[10px] text-slate-400 font-medium">
                Made by Abiola Obafemi<br/>for other students 🎓
              </p>
           </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md border border-slate-200/50 rounded-2xl shadow-2xl z-50 flex justify-between py-3 px-6 print:hidden">
        {navItems.map((item) => { 
             const isActive = location.pathname === item.path;
             return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                  isActive ? 'text-blue-600 scale-110' : 'text-slate-400'
                }`}
              >
                <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              </Link>
             )
        })}
         <Link
            to="/profile"
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              location.pathname === '/profile' ? 'text-blue-600 scale-110' : 'text-slate-400'
            }`}
          >
            <div className="w-6 h-6 rounded-full overflow-hidden border border-current">
                 {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <UserIcon />}
            </div>
          </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-4 pb-28 md:p-10 max-w-[1920px] mx-auto w-full print:ml-0 print:p-0 print:max-w-none flex flex-col min-h-screen">
        <div className="flex-1">
          {children}
        </div>
        
        {/* Mobile Footer Credit */}
        <div className="md:hidden text-center py-6 text-slate-400 text-xs font-medium">
           Made by Abiola Obafemi for other students 🎓
        </div>
      </main>
    </div>
  );
};

export default Layout;