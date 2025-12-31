
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, StudyGuide, FlashcardSet, QuizData, ChatMessage } from '../types';

interface UserContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  
  savedGuides: StudyGuide[];
  saveGuide: (guide: StudyGuide) => void;
  deleteGuide: (id: string) => void;

  savedFlashcards: FlashcardSet[];
  saveFlashcards: (set: FlashcardSet) => void;
  deleteFlashcards: (id: string) => void;

  savedQuizzes: QuizData[];
  saveQuiz: (quiz: QuizData) => void;

  chatHistory: ChatMessage[];
  updateChatHistory: (messages: ChatMessage[]) => void;
  clearChatHistory: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [savedGuides, setSavedGuides] = useState<StudyGuide[]>([]);
  const [savedFlashcards, setSavedFlashcards] = useState<FlashcardSet[]>([]);
  const [savedQuizzes, setSavedQuizzes] = useState<QuizData[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('studyspark_user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const guides = localStorage.getItem('studyspark_guides');
    if (guides) setSavedGuides(JSON.parse(guides));

    const cards = localStorage.getItem('studyspark_flashcards');
    if (cards) setSavedFlashcards(JSON.parse(cards));
    
    const quizzes = localStorage.getItem('studyspark_quizzes');
    if (quizzes) setSavedQuizzes(JSON.parse(quizzes));

    const chat = localStorage.getItem('studyspark_chat_v1');
    if (chat) setChatHistory(JSON.parse(chat));
  }, []);

  // Persist to local storage whenever state changes
  useEffect(() => {
    if (user) localStorage.setItem('studyspark_user', JSON.stringify(user));
    else localStorage.removeItem('studyspark_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('studyspark_guides', JSON.stringify(savedGuides));
  }, [savedGuides]);

  useEffect(() => {
    localStorage.setItem('studyspark_flashcards', JSON.stringify(savedFlashcards));
  }, [savedFlashcards]);
  
  useEffect(() => {
    localStorage.setItem('studyspark_quizzes', JSON.stringify(savedQuizzes));
  }, [savedQuizzes]);

  useEffect(() => {
    localStorage.setItem('studyspark_chat_v1', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const login = (newUser: User) => {
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    setChatHistory([]);
    localStorage.removeItem('studyspark_user');
    localStorage.removeItem('studyspark_chat_v1');
  };

  const saveGuide = (guide: StudyGuide) => {
    setSavedGuides(prev => [guide, ...prev]);
  };
  
  const deleteGuide = (id: string) => {
    setSavedGuides(prev => prev.filter(g => g.id !== id));
  };

  const saveFlashcards = (set: FlashcardSet) => {
    setSavedFlashcards(prev => [set, ...prev]);
  };

  const deleteFlashcards = (id: string) => {
    setSavedFlashcards(prev => prev.filter(s => s.id !== id));
  };

  const saveQuiz = (quiz: QuizData) => {
    setSavedQuizzes(prev => [quiz, ...prev]);
  }

  const updateChatHistory = (messages: ChatMessage[]) => {
    setChatHistory(messages);
  };

  const clearChatHistory = () => {
    setChatHistory([{ role: 'model', text: 'History cleared. What should we tackle next? 🧠' }]);
  };

  return (
    <UserContext.Provider value={{ 
      user, login, logout, 
      savedGuides, saveGuide, deleteGuide,
      savedFlashcards, saveFlashcards, deleteFlashcards,
      savedQuizzes, saveQuiz,
      chatHistory, updateChatHistory, clearChatHistory
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
