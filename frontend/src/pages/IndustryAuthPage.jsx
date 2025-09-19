import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAppContext } from '../context/AppContext';

const IndustryAuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    companyInfo: '',
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
      if (!formData.name) newErrors.name = 'Contact Name is required';
      if (!formData.companyName) newErrors.companyName = 'Company Name is required';
      if (!formData.companyInfo) newErrors.companyInfo = 'Company Info is required';
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
        response = await api.post('/auth/login/industry', {
          email: formData.email,
          password: formData.password,
        });
      } else {
        response = await api.post('/auth/signup/industry', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
          companyInfo: formData.companyInfo,
        });
      }
      appLogin(response.data.user, response.data.token);
      showToast("Authentication successful! Redirecting...", "success");
      navigate('/dashboard/industry');
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
          {isLogin ? 'Industry Login' : 'Industry Signup'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Contact Name</label>
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
                <label htmlFor="companyName">Company Name</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  aria-invalid={errors.companyName ? "true" : "false"}
                  aria-describedby={errors.companyName ? "companyName-error" : null}
                  className="form-group-input"
                />
                {errors.companyName && <p id="companyName-error" className="mt-1 text-sm text-red-600">{errors.companyName}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="companyInfo">Company Info</label>
                <textarea
                  id="companyInfo"
                  name="companyInfo"
                  value={formData.companyInfo}
                  onChange={handleChange}
                  rows="4"
                  aria-invalid={errors.companyInfo ? "true" : "false"}
                  aria-describedby={errors.companyInfo ? "companyInfo-error" : null}
                  className="form-group-input"
                ></textarea>
                {errors.companyInfo && <p id="companyInfo-error" className="mt-1 text-sm text-red-600">{errors.companyInfo}</p>}
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
                companyName: '',
                companyInfo: '',
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

export default IndustryAuthPage;
