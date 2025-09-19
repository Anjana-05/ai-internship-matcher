import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';

const ApplicationFormPage = () => {
  const { user, showToast } = useAppContext();
  const navigate = useNavigate();
  const { id: opportunityIdFromParams } = useParams();

  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [locations, setLocations] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    locationPreference: '',
    educationLevel: '',
    degreeMajor: '',
    yearOfStudy: '',
    cgpa: '',
    skills: [],
    sectorInterests: [],
    pastInternship: '',
    isRuralOrAspirational: false,
    socialCategory: '',
    hasDisability: false,
    resume: null,
  });

  const educationLevels = ['Diploma', 'UG', 'PG', 'Other'];
  const years = ['1st', '2nd', '3rd', 'Final'];
  const socialCategories = ['General', 'OBC', 'SC', 'ST', 'EWS'];
  const skillsList = ['React', 'Node.js', 'Python', 'Data Science', 'Machine Learning', 'AI', 'NLP', 'Computer Vision', 'SQL'];
  const sectors = ['IT', 'Healthcare', 'Manufacturing', 'FinTech', 'EduTech', 'E-Commerce'];

  useEffect(() => {
    const init = async () => {
      if (!user || user.role !== 'student') {
        showToast('Please log in as a student to apply.', 'info');
        navigate('/auth/student');
        return;
      }
      try {
        // Load opportunity details if id provided
        if (opportunityIdFromParams) {
          const opp = await api.get(`/opportunities/${opportunityIdFromParams}`);
          setOpportunity(opp.data);
        }
        // Load dynamic locations
        try {
          const res = await api.get('/meta/locations');
          setLocations(Array.isArray(res.data) ? res.data : []);
        } catch {}
        // Prefill from user profile
        const me = await api.get(`/users/${user._id}`);
        const u = me.data;
        setForm((f) => ({
          ...f,
          fullName: u.name || '',
          email: u.email || '',
          phone: '',
          locationPreference: u.locationPreferences || '',
          educationLevel: '',
          degreeMajor: u.education || '',
          yearOfStudy: '',
          cgpa: '',
          skills: (u.skills ? String(u.skills).split(',').map(s=>s.trim()).filter(Boolean) : []),
        }));
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to load form', 'error');
        navigate('/opportunities');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user, navigate, opportunityIdFromParams, showToast]);

  const update = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const toggleMulti = (name, value) => {
    setForm((f) => {
      const exists = f[name].includes(value);
      const next = exists ? f[name].filter((v) => v !== value) : [...f[name], value];
      return { ...f, [name]: next };
    });
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const requiredMessages = {
    fullName: 'Full Name is required',
    email: 'Email is required',
    phone: 'Phone Number is required',
    locationPreference: 'Location Preference is required',
    educationLevel: 'Education Level is required',
    degreeMajor: 'Degree / Major is required',
    yearOfStudy: 'Year of Study is required',
    cgpa: 'CGPA / Percentage is required',
    skills: 'Please select at least one skill',
    resume: 'Resume is required',
  };

  const validate = () => {
    const e = {};
    Object.entries(requiredMessages).forEach(([k, msg]) => {
      if (k === 'skills') {
        if (!form.skills || form.skills.length === 0) e[k] = msg;
      } else if (k === 'resume') {
        if (!form.resume) e[k] = msg;
      } else if (!form[k]) {
        e[k] = msg;
      }
    });
    setErrors(e);
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eMap = validate();
    if (Object.keys(eMap).length) return;
    setShowReview(true);
  };

  const confirmSubmission = async () => {
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append('opportunityId', opportunityIdFromParams || (opportunity?._id || ''));
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'resume') return;
        if (Array.isArray(v)) fd.append(k, v.join(',')); else fd.append(k, v);
      });
      if (form.resume) fd.append('resume', form.resume);
      await api.post('/applications', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast('Application submitted successfully!', 'success');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to submit application';
      showToast(message, 'error');
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
        Loading application form...
      </div>
    );
  }

  if (user.role !== 'student') {
    return null;
  }

  if (showReview) {
    return (
      <div className="container mx-auto p-4 md:p-8 min-h-[calc(100vh-64px)] bg-gray-50">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-6 md:p-10">
          <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Review Your Application</h1>
          
          {opportunity && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-blue-700 rounded-md mb-8">
              <h2 className="font-bold text-lg mb-2">Opportunity: {opportunity.title}</h2>
              <p><strong>Company:</strong> {opportunity.company?.companyName}</p>
              <p><strong>Location:</strong> {opportunity.location}</p>
              <p><strong>Sector:</strong> {opportunity.sector}</p>
            </div>
          )}
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><strong>Full Name:</strong> {form.fullName}</div>
              <div><strong>Email:</strong> {form.email}</div>
              <div><strong>Phone:</strong> {form.phone}</div>
              <div><strong>Location Preference:</strong> {form.locationPreference}</div>
              <div><strong>Education Level:</strong> {form.educationLevel}</div>
              <div><strong>Degree/Major:</strong> {form.degreeMajor}</div>
              <div><strong>Year of Study:</strong> {form.yearOfStudy}</div>
              <div><strong>CGPA:</strong> {form.cgpa}</div>
            </div>
            
            <div>
              <strong>Skills:</strong>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{skill}</span>
                ))}
              </div>
            </div>
            
            {form.sectorInterests.length > 0 && (
              <div>
                <strong>Sector Interests:</strong>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.sectorInterests.map(sector => (
                    <span key={sector} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">{sector}</span>
                  ))}
                </div>
              </div>
            )}
            
            {form.pastInternship && (
              <div>
                <strong>Past Internship Experience:</strong>
                <p className="text-gray-700 mt-2 p-3 bg-gray-50 rounded">{form.pastInternship}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div><strong>Rural/Aspirational:</strong> {form.isRuralOrAspirational ? 'Yes' : 'No'}</div>
              <div><strong>Social Category:</strong> {form.socialCategory || 'Not specified'}</div>
              <div><strong>Disability:</strong> {form.hasDisability ? 'Yes' : 'No'}</div>
            </div>
            
            {form.resume && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <strong>Resume:</strong> {form.resume.name}
                <span className="text-sm text-gray-500 ml-3">({(form.resume.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between space-x-4 pt-8 mt-8 border-t">
            <button type="button" onClick={() => setShowReview(false)} className="btn-secondary py-3 px-6">
              ← Back to Edit
            </button>
            <button 
              type="button" 
              onClick={confirmSubmission} 
              disabled={submitting} 
              className="btn-primary bg-green-600 hover:bg-green-700 focus:ring-green-500 py-3 px-6"
            >
              {submitting ? 'Submitting...' : 'Confirm & Submit Application'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl p-6 md:p-10 space-y-8 border border-gray-200">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center">
          {isNewApplication ? 'Apply for Opportunity' : 'Update Student Profile'}
        </h1>
        {isNewApplication && opportunity && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-blue-700 rounded-md">
            <h2 className="font-bold text-lg mb-2">Opportunity: {opportunity.title}</h2>
            <p><strong>Company:</strong> {opportunity.company?.companyName}</p>
            <p><strong>Location:</strong> {opportunity.location}</p>
            <p><strong>Sector:</strong> {opportunity.sector}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
            className="btn-primary bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
          >
            Review Application →
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplicationFormPage;
