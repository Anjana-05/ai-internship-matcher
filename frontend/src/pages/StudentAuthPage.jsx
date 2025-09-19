import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAppContext } from '../context/AppContext';

const StudentAuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    category: '',
    skills: '',
    education: '',
    locationPreferences: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: appLogin, showToast } = useAppContext();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) newErrors.email = 'Invalid email format';

    if (!isLogin) {
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.category) newErrors.category = 'Category is required';
      if (!formData.skills) newErrors.skills = 'Skills are required (comma-separated)';
      if (!formData.education) newErrors.education = 'Education is required';
      if (!formData.locationPreferences) newErrors.locationPreferences = 'Location preferences are required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      let response;
      if (isLogin) {
        response = await api.post('/auth/login/student', {
          email: formData.email,
          password: formData.password,
        });
      } else {
        response = await api.post('/auth/signup/student', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          category: formData.category,
          skills: formData.skills,
          education: formData.education,
          locationPreferences: formData.locationPreferences,
        });
      }
      appLogin(response.data.user, response.data.token);
      showToast("Authentication successful! Redirecting...", "success");
      navigate('/dashboard');
    } catch (error) {
      showToast(error.response?.data?.message || 'Authentication failed', 'error');
      console.error('Auth error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] py-10 bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 space-y-6 border border-gray-200">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center">
          {isLogin ? 'Student Login' : 'Student Signup'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
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
          )}
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
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby={errors.password ? "password-error" : null}
              className="form-group-input"
            />
            {errors.password && <p id="password-error" className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>
          {!isLogin && (
            <>
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
            </>
          )}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="btn-primary bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {loading ? (isLogin ? 'Logging in...' : 'Signing up...') : (isLogin ? 'Login' : 'Signup')}
            </button>
          </div>
        </form>
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
              setFormData({
                name: '',
                email: '',
                password: '',
                category: '',
                skills: '',
                education: '',
                locationPreferences: '',
              });
            }}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {isLogin ? 'Need an account? Signup' : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentAuthPage;
