import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';
import Card from '../components/Card';
import Modal from '../components/Modal';

const IndustryDashboardPage = () => {
  const { user, isAuthenticated, showToast } = useAppContext();
  const navigate = useNavigate();
  const [myOpportunities, setMyOpportunities] = useState([]);
  const [applicantCounts, setApplicantCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
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
  const [selectedOpportunityApplicants, setSelectedOpportunityApplicants] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [fetchingApplicants, setFetchingApplicants] = useState(false);
  const [applicantErrors, setApplicantErrors] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [updatingApplicationStatus, setUpdatingApplicationStatus] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'industry') {
      showToast("Please log in as an industry user to view your dashboard.", "info");
      navigate('/auth/industry');
      return;
    }

    const fetchMyOpportunities = async () => {
      try {
        console.log('[INDUSTRY] Fetching opportunities for user:', user._id);
        const response = await api.get('/opportunities');
        console.log('[INDUSTRY] All opportunities:', response.data);
        
        const ownedOpportunities = response.data.filter(opp => {
          console.log('[INDUSTRY] Checking opportunity:', opp.title, 'company:', opp.company);
          return opp.company && opp.company._id === user._id;
        });
        
        console.log('[INDUSTRY] Owned opportunities:', ownedOpportunities);
        setMyOpportunities(ownedOpportunities);
        
        // Fetch applicant counts for each opportunity
        const counts = {};
        for (const opp of ownedOpportunities) {
          try {
            const applicantsResponse = await api.get(`/applications/opportunity/${opp._id}`);
            counts[opp._id] = applicantsResponse.data.length;
          } catch (err) {
            console.log('[INDUSTRY] Could not fetch applicants for:', opp.title);
            counts[opp._id] = 0;
          }
        }
        setApplicantCounts(counts);
        
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch your opportunities');
        showToast(err.response?.data?.message || 'Failed to load opportunities', 'error');
        console.error('Error fetching industry opportunities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOpportunities();
  }, [isAuthenticated, user, navigate, showToast]);
  
  // Separate effect for listening to application events
  useEffect(() => {
    const handleApplicationSubmitted = (event) => {
      const { opportunityId } = event.detail;
      console.log('[INDUSTRY] New application received for opportunity:', opportunityId);
      
      // Check if this opportunity belongs to current user
      const isMyOpportunity = myOpportunities.some(opp => opp._id === opportunityId);
      if (isMyOpportunity) {
        console.log('[INDUSTRY] Refreshing applicant counts due to new application');
        refreshOpportunities();
      }
    };
    
    window.addEventListener('applicationSubmitted', handleApplicationSubmitted);
    
    return () => {
      window.removeEventListener('applicationSubmitted', handleApplicationSubmitted);
    };
  }, [myOpportunities]);

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
    // Debug: ensure handler is firing
    console.log('[POST-OPPORTUNITY] Submit clicked', newOpportunityData);
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
      // Attempt to focus the first invalid input
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
      console.log('[POST-OPPORTUNITY] Payload to API:', payload);
      const response = await api.post('/opportunities', payload);
      console.log('[INDUSTRY] New opportunity created:', response.data);
      // Refresh the opportunities list to show the new one
      const updatedResponse = await api.get('/opportunities');
      const ownedOpportunities = updatedResponse.data.filter(opp => opp.company && opp.company._id === user._id);
      setMyOpportunities(ownedOpportunities);
      
      showToast("Opportunity posted successfully!", "success");
      setShowPostModal(false);
      setNewOpportunityData({
        title: '',
        location: '',
        sector: '',
        duration: '',
        capacity: '',
        description: '',
        affirmativeCategory: '',
      });
    } catch (err) {
      const status = err.response?.status;
      const backend = err.response?.data;
      const message = backend?.message || backend?.error || err.message || 'Failed to post opportunity';
      showToast(`${message}${status ? ` (HTTP ${status})` : ''}`, 'error');
      console.error('[POST-OPPORTUNITY] Error:', { status, backend, err: err.message });
    } finally {
      setSubmittingOpportunity(false);
    }
  };

  const fetchApplicants = async (opportunityId) => {
    setFetchingApplicants(true);
    setApplicantErrors(null);
    try {
      const response = await api.get(`/applications/opportunity/${opportunityId}`);
      setApplicants(response.data);
    } catch (err) {
      setApplicantErrors(err.response?.data?.message || 'Failed to fetch applicants');
      showToast(err.response?.data?.message || 'Failed to load applicants', 'error');
      console.error('Fetch applicants error:', err.response?.data || err.message);
    } finally {
      setFetchingApplicants(false);
    }
  };

  const handleViewApplicants = (opportunity) => {
    setSelectedOpportunityApplicants(opportunity);
    fetchApplicants(opportunity._id);
  };

  const handleUpdateApplicationStatus = async (applicationId, status) => {
    setUpdatingApplicationStatus(true);
    try {
      const response = await api.put(`/applications/${applicationId}/status`, { status });
      setApplicants(applicants.map(app => (app._id === applicationId ? { ...app, status: response.data.status } : app)));
      showToast("Application status updated!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update application status', 'error');
      console.error('Update status error:', err.response?.data || err.message);
    } finally {
      setUpdatingApplicationStatus(false);
    }
  };

  const refreshOpportunities = async () => {
    try {
      const response = await api.get('/opportunities');
      const ownedOpportunities = response.data.filter(opp => opp.company && opp.company._id === user._id);
      setMyOpportunities(ownedOpportunities);
      
      // Refresh applicant counts
      const counts = {};
      for (const opp of ownedOpportunities) {
        try {
          const applicantsResponse = await api.get(`/applications/opportunity/${opp._id}`);
          counts[opp._id] = applicantsResponse.data.length;
        } catch (err) {
          counts[opp._id] = 0;
        }
      }
      setApplicantCounts(counts);
    } catch (err) {
      console.error('Error refreshing opportunities:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 text-xl text-gray-700">
        <svg className="animate-spin h-8 w-8 text-blue-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading industry dashboard...
      </div>
    );
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-64px)] text-red-500 text-xl">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-[calc(100vh-64px)] bg-gray-50">
      <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8">Industry Dashboard</h1>

      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Posted Opportunities</h2>
          <div className="flex space-x-3">
            <button
              onClick={refreshOpportunities}
              className="btn-secondary py-2 px-4"
              title="Refresh opportunities and applicant counts"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => setShowPostModal(true)}
              className="btn-primary bg-green-600 hover:bg-green-700 focus:ring-green-500"
            >
              Post New Opportunity
            </button>
          </div>
        </div>

        {myOpportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myOpportunities.map((opportunity) => (
              <Card key={opportunity._id} className="p-6 space-y-3 transform transition duration-300 hover:scale-105 hover:shadow-xl">
                <h3 className="text-xl font-semibold text-gray-800">{opportunity.title}</h3>
                <p className="text-gray-600 text-sm"><strong>Location:</strong> {opportunity.location}</p>
                <p className="text-gray-600 text-sm"><strong>Sector:</strong> {opportunity.sector}</p>
                <p className="text-gray-600 text-sm"><strong>Capacity:</strong> {opportunity.capacity}</p>
                <div className="flex justify-between items-center mt-3">
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {applicantCounts[opportunity._id] || 0} Applicants
                  </div>
                  <span className="text-xs text-gray-500">
                    {opportunity.capacity - (applicantCounts[opportunity._id] || 0)} spots left
                  </span>
                </div>
                <button
                  onClick={() => handleViewApplicants(opportunity)}
                  className="btn-primary bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 w-full mt-4"
                >
                  View Applicants ({applicantCounts[opportunity._id] || 0})
                </button>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-lg">You haven't posted any opportunities yet. Click "Post New Opportunity" to get started!</p>
        )}
      </section>

      <Modal isOpen={showPostModal} onClose={() => setShowPostModal(false)} title="Post New Opportunity">
        <form onSubmit={handlePostOpportunity} className="space-y-6">
          <div className="form-group">
            <label htmlFor="title">Title <span className="text-red-600" aria-hidden="true">*</span></label>
            <input
              type="text"
              id="title"
              name="title"
              value={newOpportunityData.title}
              onChange={handleOpportunityFormChange}
              aria-invalid={postErrors.title ? "true" : "false"}
              aria-describedby={postErrors.title ? "title-error" : null}
              placeholder="e.g., Software Engineering Intern"
              autoFocus
              className="form-group-input"
            />
            {postErrors.title && <p id="title-error" className="mt-1 text-sm text-red-600">{postErrors.title}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={newOpportunityData.location}
              onChange={handleOpportunityFormChange}
              aria-invalid={postErrors.location ? "true" : "false"}
              aria-describedby={postErrors.location ? "location-error" : null}
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
              aria-invalid={postErrors.sector ? "true" : "false"}
              aria-describedby={postErrors.sector ? "sector-error" : null}
              className="form-group-input"
            />
            {postErrors.sector && <p id="sector-error" className="mt-1 text-sm text-red-600">{postErrors.sector}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="duration">Duration</label>
            <input
              type="text"
              id="duration"
              name="duration"
              value={newOpportunityData.duration}
              onChange={handleOpportunityFormChange}
              aria-invalid={postErrors.duration ? "true" : "false"}
              aria-describedby={postErrors.duration ? "duration-error" : null}
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
              aria-invalid={postErrors.capacity ? "true" : "false"}
              aria-describedby={postErrors.capacity ? "capacity-error" : null}
              className="form-group-input"
            />
            {postErrors.capacity && <p id="capacity-error" className="mt-1 text-sm text-red-600">{postErrors.capacity}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={newOpportunityData.description}
              onChange={handleOpportunityFormChange}
              rows="4"
              aria-invalid={postErrors.description ? "true" : "false"}
              aria-describedby={postErrors.description ? "description-error" : null}
              className="form-group-input"
            ></textarea>
            {postErrors.description && <p id="description-error" className="mt-1 text-sm text-red-600">{postErrors.description}</p>}
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
          <button
            type="submit"
            className="btn-primary bg-green-600 hover:bg-green-700 focus:ring-green-500"
            disabled={submittingOpportunity}
          >
            {submittingOpportunity ? 'Posting...' : 'Post Opportunity'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={!!selectedOpportunityApplicants} onClose={() => setSelectedOpportunityApplicants(null)} title={`Applicants for ${selectedOpportunityApplicants?.title || ''}`}>
        {fetchingApplicants ? (
          <div className="flex flex-col items-center justify-center py-4">
            <svg className="animate-spin h-6 w-6 text-blue-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading applicants...
          </div>
        ) : applicantErrors ? (
          <div className="text-red-500 text-center py-4">Error: {applicantErrors}</div>
        ) : applicants.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {applicants.map((applicant) => (
              <Card key={applicant._id} className="p-4 border border-gray-200 rounded-md">
                <h4 className="text-lg font-semibold text-gray-800">{applicant.student?.name}</h4>
                <p className="text-gray-600 text-sm"><strong>Email:</strong> {applicant.student?.email}</p>
                <p className="text-gray-600 text-sm"><strong>Skills:</strong> {applicant.student?.skills}</p>
                <p className="text-gray-600 text-sm"><strong>Category:</strong> {applicant.student?.category}</p>
                <p className="text-gray-600 text-sm"><strong>Location Preferences:</strong> {applicant.student?.locationPreferences}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(applicant.status)}`}>
                    Status: {applicant.status}
                  </span>
                </div>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => handleUpdateApplicationStatus(applicant._id, 'selected')}
                    className="py-1 px-3 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 disabled:opacity-50"
                    disabled={updatingApplicationStatus || applicant.status === 'selected'}
                  >
                    Select
                  </button>
                  <button
                    onClick={() => handleUpdateApplicationStatus(applicant._id, 'rejected')}
                    className="py-1 px-3 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 disabled:opacity-50"
                    disabled={updatingApplicationStatus || applicant.status === 'rejected'}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setSelectedApplicant(applicant)}
                    className="py-1 px-3 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                  >
                    View Full Profile
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-4">No applicants for this opportunity yet.</p>
        )}
      </Modal>

      <Modal isOpen={!!selectedApplicant} onClose={() => setSelectedApplicant(null)} title={`Applicant Profile: ${selectedApplicant?.student?.name || ''}`}>
        <div className="space-y-3 text-gray-700">
          <p><strong>Name:</strong> {selectedApplicant?.student?.name}</p>
          <p><strong>Email:</strong> {selectedApplicant?.student?.email}</p>
          <p><strong>Category:</strong> {selectedApplicant?.student?.category}</p>
          <p><strong>Skills:</strong> {selectedApplicant?.student?.skills}</p>
          <p><strong>Education:</strong> {selectedApplicant?.student?.education}</p>
          <p><strong>Location Preferences:</strong> {selectedApplicant?.student?.locationPreferences}</p>
        </div>
      </Modal>
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'selected': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'applied': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default IndustryDashboardPage;
