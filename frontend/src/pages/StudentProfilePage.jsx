import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';

const StudentProfilePage = () => {
  const { user, setUser, showToast } = useAppContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    skills: '',
    education: '',
    locationPreferences: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && user.role === 'student') {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        category: user.category || '',
        skills: user.skills || '',
        education: user.education || '',
        locationPreferences: user.locationPreferences || '',
      });
      setLoading(false);
    } else if (user) {
      showToast("You are not authorized to view this page.", "error");
      navigate('/dashboard');
    } else {
      setLoading(false);
      showToast("Please log in to view your profile.", "info");
      navigate('/auth/student');
    }
  }, [user, navigate, showToast]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (formData.email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.skills) newErrors.skills = 'Skills are required';
    if (!formData.education) newErrors.education = 'Education is required';
    if (!formData.locationPreferences) newErrors.locationPreferences = 'Location preferences are required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const response = await api.put(`/users/${user._id}`, formData);
      setUser(response.data);
      showToast("Profile updated successfully!", "success");
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
      console.error('Update profile error:', error.response?.data || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 text-xl text-gray-700">
        <svg className="animate-spin h-8 w-8 text-blue-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading profile...
      </div>
    );
  }

  if (!user || user.role !== 'student') {
    return null;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl p-6 md:p-10 space-y-8 border border-gray-200">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center">Student Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              aria-invalid={errors.name ? "true" : "false"}
              aria-describedby={errors.name ? "name-error" : null}
              className="form-group-input"
            />
            {errors.name && <p id="name-error" className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : null}
              className="form-group-input"
            />
            {errors.email && <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              aria-invalid={errors.category ? "true" : "false"}
              aria-describedby={errors.category ? "category-error" : null}
              className="form-group-input"
            >
              <option value="">Select Category</option>
              <option value="General">General</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="OBC">OBC</option>
              <option value="PWD">PWD</option>
            </select>
            {errors.category && <p id="category-error" className="mt-1 text-sm text-red-600">{errors.category}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="skills">Skills (comma-separated)</label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              aria-invalid={errors.skills ? "true" : "false"}
              aria-describedby={errors.skills ? "skills-error" : null}
              className="form-group-input"
            />
            {errors.skills && <p id="skills-error" className="mt-1 text-sm text-red-600">{errors.skills}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="education">Education</label>
            <input
              type="text"
              id="education"
              name="education"
              value={formData.education}
              onChange={handleChange}
              aria-invalid={errors.education ? "true" : "false"}
              aria-describedby={errors.education ? "education-error" : null}
              className="form-group-input"
            />
            {errors.education && <p id="education-error" className="mt-1 text-sm text-red-600">{errors.education}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="locationPreferences">Location Preferences (comma-separated)</label>
            <input
              type="text"
              id="locationPreferences"
              name="locationPreferences"
              value={formData.locationPreferences}
              onChange={handleChange}
              aria-invalid={errors.locationPreferences ? "true" : "false"}
              aria-describedby={errors.locationPreferences ? "locationPreferences-error" : null}
              className="form-group-input"
            />
            {errors.locationPreferences && <p id="locationPreferences-error" className="mt-1 text-sm text-red-600">{errors.locationPreferences}</p>}
          </div>

          <button
            type="submit"
            className="btn-primary bg-green-600 hover:bg-green-700 focus:ring-green-500 flex items-center justify-center"
            disabled={submitting}
          >
            {submitting ? (
              <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {submitting ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentProfilePage;
