import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import ToastContainer from './components/ToastContainer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import CareerProfile from './pages/CareerProfile';
import CareerHub from './pages/CareerHub';
import AIMentor from './pages/AIMentor';
import InterviewLab from './pages/InterviewLab';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import About from './pages/About';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { isAuthenticated, profile } = useApp();

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to={profile ? '/dashboard' : '/onboarding'} replace /> : <Signup />}
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              {profile?.onboardingComplete ? <Navigate to="/career-profile" replace /> : <Onboarding />}
            </ProtectedRoute>
          }
        />
        <Route
          path="/career-profile"
          element={
            <ProtectedRoute>
              <CareerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/career-hub"
          element={
            <ProtectedRoute>
              <CareerHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-mentor"
          element={
            <ProtectedRoute>
              <AIMentor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <InterviewLab />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
