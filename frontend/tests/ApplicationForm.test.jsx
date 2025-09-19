import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import ApplicationFormPage from '../src/pages/ApplicationFormPage';
import { AppContext } from '../src/context/AppContext';
import api from '../src/services/api';

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the API service
vi.mock('../src/services/api');

// Mock the useAppContext hook for authentication status
const mockUseAppContext = (isAuthenticated, user) => ({
  isAuthenticated,
  user,
  showToast: vi.fn(),
});

describe('ApplicationFormPage - Form Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows error messages for empty required fields on submit for authenticated student', async () => {
    const studentUser = { id: 1, role: 'student', name: 'John Doe', email: 'john@example.com' };
    render(
      <AppContext.Provider value={mockUseAppContext(true, studentUser)}>
        <Router>
          <ApplicationFormPage />
        </Router>
      </AppContext.Provider>
    );

    // Ensure form fields are empty initially (simulate new application)
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/Education/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/Skills \(comma-separated\)/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/Sector Interests \(comma-separated\)/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/Location Preferences \(comma-separated\)/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: '' } });

    fireEvent.click(screen.getByRole('button', { name: /Update Profile/i }));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Education is required')).toBeInTheDocument();
      expect(screen.getByText('Skills are required (comma-separated)')).toBeInTheDocument();
      expect(screen.getByText('Sector interests are required')).toBeInTheDocument();
      expect(screen.getByText('Location preferences are required')).toBeInTheDocument();
      expect(screen.getByText('Category is required')).toBeInTheDocument();
    });
  });

  it('shows an error for invalid email format', async () => {
    const studentUser = { id: 1, role: 'student', name: 'John Doe', email: 'john@example.com' };
    render(
      <AppContext.Provider value={mockUseAppContext(true, studentUser)}>
        <Router>
          <ApplicationFormPage />
        </Router>
      </AppContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'invalid-email' } });
    fireEvent.click(screen.getByRole('button', { name: /Update Profile/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
  });

  it('allows authenticated student to submit valid form data', async () => {
    const studentUser = { id: 1, role: 'student', name: 'John Doe', email: 'john@example.com' };
    api.put.mockResolvedValue({ data: { ...studentUser, name: 'Updated Name' } });

    render(
      <AppContext.Provider value={mockUseAppContext(true, studentUser)}>
        <Router>
          <ApplicationFormPage />
        </Router>
      </AppContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/Education/i), { target: { value: 'M.Tech' } });
    fireEvent.change(screen.getByLabelText(/Skills \(comma-separated\)/i), { target: { value: 'python,java' } });
    fireEvent.change(screen.getByLabelText(/Sector Interests \(comma-separated\)/i), { target: { value: 'tech' } });
    fireEvent.change(screen.getByLabelText(/Location Preferences \(comma-separated\)/i), { target: { value: 'remote' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'General' } });

    fireEvent.click(screen.getByRole('button', { name: /Update Profile/i }));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        `/users/${studentUser.id}`,
        {
          name: 'Jane Doe',
          email: 'jane@example.com',
          education: 'M.Tech',
          skills: 'python,java',
          category: 'General',
          location_preferences: 'remote',
        }
      );
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
      expect(mockUseAppContext(true, studentUser).showToast).toHaveBeenCalledWith("Profile updated successfully!", "success");
    });
  });

  it('shows an access denied message if not authenticated as a student', () => {
    render(
      <AppContext.Provider value={mockUseAppContext(false, null)}>
        <Router>
          <ApplicationFormPage />
        </Router>
      </AppContext.Provider>
    );

    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
    expect(screen.getByText(/Please log in as a student to access the application form./i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Student Login/i })).toBeInTheDocument();
  });
});
