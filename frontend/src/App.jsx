import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import ToastNotification from './components/ToastNotification';
import LandingPage from './pages/LandingPage';
import StudentAuthPage from './pages/StudentAuthPage';
import IndustryAuthPage from './pages/IndustryAuthPage';
import ApplicationFormPage from './pages/ApplicationFormPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import IndustryDashboardPage from './pages/IndustryDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AIMatchesPage from './pages/AIMatchesPage';
import StudentProfilePage from './pages/StudentProfilePage';
import EnhancedStudentProfilePage from './pages/EnhancedStudentProfilePage';
import IndustryProfilePage from './pages/IndustryProfilePage';
import TopLoadingBar from './components/TopLoadingBar';
import Footer from './components/Footer';

import './index.css';

function App() {
  return (
    <Router>
      <AppProvider>
        <TopLoadingBar />
        <Navbar />
        <main className="min-h-[calc(100vh-64px)] flex-grow">
          <ToastNotification />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/student" element={<StudentAuthPage />} />
            <Route path="/auth/industry" element={<IndustryAuthPage />} />
            <Route path="/opportunities" element={<OpportunitiesPage />} />
            <Route path="/opportunities/:id/apply" element={<ApplicationFormPage />} />
            <Route path="/apply" element={<ApplicationFormPage />} />
            <Route path="/dashboard" element={<StudentDashboardPage />} />
            <Route path="/dashboard/industry" element={<IndustryDashboardPage />} />
            <Route path="/dashboard/admin" element={<AdminDashboardPage />} />
            <Route path="/ai-matches" element={<AIMatchesPage />} />
            <Route path="/profile/student" element={<StudentProfilePage />} />
            <Route path="/profile/enhanced" element={<EnhancedStudentProfilePage />} />
            <Route path="/profile/industry" element={<IndustryProfilePage />} />
          </Routes>
        </main>
        <Footer />
      </AppProvider>
    </Router>
  );
}

export default App;
