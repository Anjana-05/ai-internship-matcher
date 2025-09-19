import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from '../src/components/Navbar';
import { AppContext } from '../src/context/AppContext';
import { describe, it, expect } from 'vitest';

// Mock the useAppContext hook
const mockUseAppContext = (isAuthenticated, user) => ({
  isAuthenticated,
  user,
  logout: () => {},
  showToast: () => {},
});

describe('Navbar', () => {
  it('renders navigation links for unauthenticated user', () => {
    render(
      <AppContext.Provider value={mockUseAppContext(false, null)}>
        <Router>
          <Navbar />
        </Router>
      </AppContext.Provider>
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Apply')).toBeInTheDocument();
    expect(screen.getByText('Opportunities')).toBeInTheDocument();
    expect(screen.getByText('Student Login')).toBeInTheDocument();
    expect(screen.getByText('Industry Login')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).toBeNull();
    expect(screen.queryByText('AI Matches')).toBeNull();
  });

  it('renders navigation links for authenticated student', () => {
    const studentUser = { id: 1, role: 'student', name: 'Test Student' };
    render(
      <AppContext.Provider value={mockUseAppContext(true, studentUser)}>
        <Router>
          <Navbar />
        </Router>
      </AppContext.Provider>
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Apply')).toBeInTheDocument();
    expect(screen.getByText('Opportunities')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Student Login')).toBeNull();
    expect(screen.queryByText('Industry Login')).toBeNull();
    expect(screen.queryByText('AI Matches')).toBeNull();
  });

  it('renders navigation links for authenticated industry', () => {
    const industryUser = { id: 1, role: 'industry', name: 'Test Industry' };
    render(
      <AppContext.Provider value={mockUseAppContext(true, industryUser)}>
        <Router>
          <Navbar />
        </Router>
      </AppContext.Provider>
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Apply')).toBeInTheDocument();
    expect(screen.getByText('Opportunities')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Student Login')).toBeNull();
    expect(screen.queryByText('Industry Login')).toBeNull();
    expect(screen.queryByText('AI Matches')).toBeNull();
  });

  it('renders navigation links for authenticated admin', () => {
    const adminUser = { id: 1, role: 'admin', name: 'Test Admin' };
    render(
      <AppContext.Provider value={mockUseAppContext(true, adminUser)}>
        <Router>
          <Navbar />
        </Router>
      </AppContext.Provider>
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Apply')).toBeInTheDocument();
    expect(screen.getByText('Opportunities')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('AI Matches')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Student Login')).toBeNull();
    expect(screen.queryByText('Industry Login')).toBeNull();
    // Admin doesn't have a direct /profile route in the current navbar setup
    expect(screen.queryByText('Profile')).toBeNull();
  });
});
