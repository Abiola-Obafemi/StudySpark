import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Logo, CameraIcon } from '../components/Icons';
import { User } from '../types';

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Aneka&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Milo&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Sora&backgroundColor=ffd5dc",
  "https://api.dicebear.com/7.x/bottts/svg?seed=StudyBot&backgroundColor=e5e7eb",
];

const Login = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newUser: User = {
      name: name.trim(),
      email: 'student@studyspark.app', // Placeholder ID
      avatar: selectedAvatar,
      provider: 'email'
    };

    login(newUser);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100 text-center">
        
        <div className="flex flex-col items-center justify-center mb-8">
          <Logo className="w-20 h-20 mb-4" />
          <h1 className="text-3xl font-extrabold text-slate-900">StudySpark</h1>
        </div>

        <h2 className="text-xl font-bold text-slate-700 mb-2">Get Started</h2>
        <p className="text-slate-500 mb-8">Create your profile to start studying.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Avatar Selection */}
          <div>
            <div className="flex justify-center mb-4">
              <div className="relative">
                <img 
                  src={selectedAvatar} 
                  alt="Selected Avatar" 
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-slate-100 object-cover"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-slate-900 text-white p-2 rounded-full hover:bg-slate-700 transition-colors shadow-md"
                >
                  <CameraIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex justify-center gap-3">
              {PRESET_AVATARS.map((avatar, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                    selectedAvatar === avatar ? 'border-blue-600 scale-110' : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  <img src={avatar} alt={`Avatar ${i}`} className="w-full h-full bg-slate-50" />
                </button>
              ))}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {/* Name Input */}
          <div className="text-left">
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-all text-lg"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-blue-200"
          >
            Start Studying
          </button>
        </form>

        <p className="mt-8 text-xs text-slate-400 font-medium">
           Made by Abiola Obafemi for other students 🎓
        </p>
      </div>
    </div>
  );
};

export default Login;