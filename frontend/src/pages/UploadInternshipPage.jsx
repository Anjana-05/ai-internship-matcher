import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';

const UploadInternshipPage = () => {
  const { user, isAuthenticated, showToast } = useAppContext();
  const navigate = useNavigate();

  const [newOpportunityData, setNewOpportunityData] = useState({
    title: '',
    location: '',
    sector: '',
    duration: '',
    capacity: '',
    description: '',
    affirmativeCategory: '',
  });
  const [postErrors, setPostErrors] = useState({});
  const [submittingOpportunity, setSubmittingOpportunity] = useState(false);

  if (!isAuthenticated || user?.role !== 'industry') {
    navigate('/auth/industry');
  }

  const handleOpportunityFormChange = (e) => {
    setNewOpportunityData({ ...newOpportunityData, [e.target.name]: e.target.value });
    if (postErrors[e.target.name]) {
      setPostErrors({ ...postErrors, [e.target.name]: '' });
    }
  };

  const validateOpportunityForm = () => {
    const newErrors = {};
    if (!newOpportunityData.title) newErrors.title = 'Title is required';
    if (!newOpportunityData.location) newErrors.location = 'Location is required';
    if (!newOpportunityData.sector) newErrors.sector = 'Sector is required';
    if (!newOpportunityData.duration) newErrors.duration = 'Duration is required';
    if (!newOpportunityData.capacity || Number(newOpportunityData.capacity) <= 0) newErrors.capacity = 'Capacity must be a positive number';
    if (!newOpportunityData.description) newErrors.description = 'Description is required';
    setPostErrors(newErrors);
    return newErrors;
  };

  const handlePostOpportunity = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || user?.role !== 'industry') {
      showToast('Please log in as an industry user to post opportunities.', 'error');
      navigate('/auth/industry');
      return;
    }

    const errs = validateOpportunityForm();
    const keys = Object.keys(errs);
    if (keys.length > 0) {
      const firstKey = keys[0];
      showToast(errs[firstKey] || 'Please fix errors in the form', 'error');
      const el = document.getElementById(firstKey);
      if (el && typeof el.focus === 'function') el.focus();
      if (el && typeof el.scrollIntoView === 'function') {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
      }
      return;
    }

    setSubmittingOpportunity(true);
    try {
      const payload = {
        title: newOpportunityData.title.trim(),
        location: newOpportunityData.location.trim(),
        sector: newOpportunityData.sector.trim(),
        duration: newOpportunityData.duration.trim(),
        capacity: Number(newOpportunityData.capacity),
        description: newOpportunityData.description.trim(),
        ...(newOpportunityData.affirmativeCategory ? { affirmativeCategory: newOpportunityData.affirmativeCategory } : {}),
      };
      const response = await api.post('/opportunities', payload);
      showToast('Internship uploaded successfully!', 'success');
      // After upload, go back to My Internships page
      navigate('/dashboard/industry');
    } catch (err) {
      const status = err.response?.status;
      const backend = err.response?.data;
      const message = backend?.message || backend?.error || err.message || 'Failed to post opportunity';
      showToast(`${message}${status ? ` (HTTP ${status})` : ''}`, 'error');
      console.error('[UPLOAD-INTERNSHIP] Error:', { status, backend, err: err.message });
    } finally {
      setSubmittingOpportunity(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-[calc(100vh-64px)] bg-gray-50">
      <PageHeader
        title="Upload Internship"
        subtitle="Fill in the details below to publish a new internship."
      />

      <section>
        <Card className="p-6">
          <form onSubmit={handlePostOpportunity} className="space-y-6">
            <div className="form-group">
              <label htmlFor="title">Title <span className="text-red-600" aria-hidden="true">*</span></label>
              <input
                type="text"
                id="title"
                name="title"
                value={newOpportunityData.title}
                onChange={handleOpportunityFormChange}
                aria-invalid={postErrors.title ? 'true' : 'false'}
                aria-describedby={postErrors.title ? 'title-error' : null}
                placeholder="e.g., Software Engineering Intern"
                className="form-group-input"
              />
              {postErrors.title && <p id="title-error" className="mt-1 text-sm text-red-600">{postErrors.title}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={newOpportunityData.location}
                  onChange={handleOpportunityFormChange}
                  aria-invalid={postErrors.location ? 'true' : 'false'}
                  aria-describedby={postErrors.location ? 'location-error' : null}
                  className="form-group-input"
                />
                {postErrors.location && <p id="location-error" className="mt-1 text-sm text-red-600">{postErrors.location}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="sector">Sector (comma-separated)</label>
                <input
                  type="text"
                  id="sector"
                  name="sector"
                  value={newOpportunityData.sector}
                  onChange={handleOpportunityFormChange}
                  aria-invalid={postErrors.sector ? 'true' : 'false'}
                  aria-describedby={postErrors.sector ? 'sector-error' : null}
                  className="form-group-input"
                />
                {postErrors.sector && <p id="sector-error" className="mt-1 text-sm text-red-600">{postErrors.sector}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="form-group">
                <label htmlFor="duration">Duration</label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={newOpportunityData.duration}
                  onChange={handleOpportunityFormChange}
                  aria-invalid={postErrors.duration ? 'true' : 'false'}
                  aria-describedby={postErrors.duration ? 'duration-error' : null}
                  className="form-group-input"
                />
                {postErrors.duration && <p id="duration-error" className="mt-1 text-sm text-red-600">{postErrors.duration}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="capacity">Capacity</label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={newOpportunityData.capacity}
                  onChange={handleOpportunityFormChange}
                  aria-invalid={postErrors.capacity ? 'true' : 'false'}
                  aria-describedby={postErrors.capacity ? 'capacity-error' : null}
                  className="form-group-input"
                />
                {postErrors.capacity && <p id="capacity-error" className="mt-1 text-sm text-red-600">{postErrors.capacity}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="affirmativeCategory">Affirmative Category (Optional)</label>
                <select
                  id="affirmativeCategory"
                  name="affirmativeCategory"
                  value={newOpportunityData.affirmativeCategory}
                  onChange={handleOpportunityFormChange}
                  className="form-group-input"
                >
                  <option value="">None</option>
                  <option value="General">General</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="OBC">OBC</option>
                  <option value="PWD">PWD</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newOpportunityData.description}
                onChange={handleOpportunityFormChange}
                rows="4"
                aria-invalid={postErrors.description ? 'true' : 'false'}
                aria-describedby={postErrors.description ? 'description-error' : null}
                className="form-group-input"
              ></textarea>
              {postErrors.description && <p id="description-error" className="mt-1 text-sm text-red-600">{postErrors.description}</p>}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="btn-primary bg-green-600 hover:bg-green-700 focus:ring-green-500"
                disabled={submittingOpportunity}
              >
                {submittingOpportunity ? 'Uploading...' : 'Upload Internship'}
              </button>
            </div>
          </form>
        </Card>
      </section>
    </div>
  );
};

export default UploadInternshipPage;
