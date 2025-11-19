import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Explain from './pages/Explain';
import Study from './pages/Study';
import Flashcards from './pages/Flashcards';
import Quiz from './pages/Quiz';
import Profile from './pages/Profile';

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/explain" element={<Explain />} />
            <Route path="/study" element={<Study />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Layout>
      </Router>
    </UserProvider>
  );
};

export default App;
