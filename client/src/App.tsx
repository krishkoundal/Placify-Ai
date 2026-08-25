import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import GithubLeetcode from './pages/GithubLeetcode';
import InterviewRoom from './pages/InterviewRoom';
import CareerMentor from './pages/CareerMentor';
import RoadmapGenerator from './pages/RoadmapGenerator';
import PlacementPredictor from './pages/PlacementPredictor';
import PublicShowcase from './pages/PublicShowcase';

const App: React.FC = () => {
  const { user, loading, error, login, register, logout } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page with Auth modal */}
        <Route 
          path="/" 
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LandingPage 
                onLogin={login} 
                onRegister={register} 
                authError={error} 
              />
            )
          } 
        />

        {/* Public Shareable Profile Card Route */}
        <Route path="/share/profile/:userId" element={<PublicShowcase />} />

        {/* Dashboard Shell with Nested Views */}
        <Route 
          element={
            <DashboardLayout 
              user={user} 
              loading={loading} 
              onLogout={logout} 
            />
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/resume" element={<ResumeAnalyzer />} />
          <Route path="/github-leetcode" element={<GithubLeetcode />} />
          <Route path="/interview" element={<InterviewRoom />} />
          <Route path="/mentor" element={<CareerMentor />} />
          <Route path="/roadmap" element={<RoadmapGenerator />} />
          <Route path="/predictor" element={<PlacementPredictor />} />
          
          {/* Catch all internal routes and redirect to home */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
