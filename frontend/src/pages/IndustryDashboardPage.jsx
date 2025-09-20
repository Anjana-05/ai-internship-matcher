import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';
import Card from '../components/Card';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

const IndustryDashboardPage = () => {
  const { user, isAuthenticated, showToast } = useAppContext();
  const navigate = useNavigate();
  const [myOpportunities, setMyOpportunities] = useState([]);
  const [applicantCounts, setApplicantCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        console.log('[INDUSTRY] Fetching opportunities for user:', user?.id || user?._id);
        const response = await api.get('/opportunities');
        console.log('[INDUSTRY] All opportunities:', response.data);
        
        const ownedOpportunities = response.data.filter(opp => {
          const uid = user?.id || user?._id;
          console.log('[INDUSTRY] Checking opportunity:', opp.title, 'company:', opp.company, 'against uid:', uid);
          return opp.company && opp.company._id === uid;
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

  // Upload form handlers removed: this page focuses only on viewing internships and applicants

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
      const uid = user?.id || user?._id;
      const ownedOpportunities = response.data.filter(opp => opp.company && opp.company._id === uid);
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
      <PageHeader
        title="My Internships"
        subtitle="Review your posted internships and manage applicants."
      />

      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Internships</h2>
          <div className="flex space-x-3">
            <button
              onClick={refreshOpportunities}
              className="btn-secondary py-2 px-4"
              title="Refresh opportunities and applicant counts"
            >
              🔄 Refresh
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
          <EmptyState
            icon="📢"
            title="No internships posted yet"
            description="Use the Upload Internship page to add your first listing."
          />
        )}
      </section>

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
                <h4 className="text-lg font-semibold text-gray-800">{applicant.fullName || applicant.student?.name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mt-1">
                  <p><strong>Email:</strong> {applicant.email || applicant.student?.email}</p>
                  <p><strong>Phone:</strong> {applicant.phone || '—'}</p>
                  <p><strong>Location Pref:</strong> {applicant.locationPreference || applicant.student?.locationPreferences || '—'}</p>
                  <p><strong>Education:</strong> {applicant.educationLevel || '—'}</p>
                  <p><strong>Degree/Major:</strong> {applicant.degreeMajor || '—'}</p>
                  <p><strong>Year:</strong> {applicant.yearOfStudy || '—'}</p>
                  <p><strong>CGPA:</strong> {typeof applicant.cgpa === 'number' ? applicant.cgpa : '—'}</p>
                  <p><strong>Category:</strong> {applicant.socialCategory || applicant.student?.category || '—'}</p>
                  <p><strong>Rural/Aspirational:</strong> {applicant.isRuralOrAspirational ? 'Yes' : 'No'}</p>
                  <p><strong>Disability:</strong> {applicant.hasDisability ? 'Yes' : 'No'}</p>
                  <p className="md:col-span-2"><strong>Skills:</strong> {(Array.isArray(applicant.skills) ? applicant.skills : (applicant.student?.skills || '')).toString() || '—'}</p>
                  <p className="md:col-span-2"><strong>Sector Interests:</strong> {(Array.isArray(applicant.sectorInterests) ? applicant.sectorInterests : []).join(', ') || '—'}</p>
                  {applicant.pastInternship && (
                    <p className="md:col-span-2"><strong>Past Internship:</strong> {applicant.pastInternship}</p>
                  )}
                  {applicant.resume?.url && (
                    <p className="md:col-span-2">
                      <strong>Resume:</strong> <a href={applicant.resume.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        {applicant.resume.fileName || 'Download'}
                      </a>
                      {applicant.resume.size ? (
                        <span className="text-xs text-gray-500 ml-2">({(applicant.resume.size / 1024).toFixed(0)} KB)</span>
                      ) : null}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(applicant.status)}`}>
                    Status: {applicant.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
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

      <Modal isOpen={!!selectedApplicant} onClose={() => setSelectedApplicant(null)} title={`Applicant Profile: ${selectedApplicant?.fullName || selectedApplicant?.student?.name || ''}`}>
        <div className="space-y-4 text-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <p><strong>Name:</strong> {selectedApplicant?.fullName || selectedApplicant?.student?.name}</p>
            <p><strong>Email:</strong> {selectedApplicant?.email || selectedApplicant?.student?.email}</p>
            <p><strong>Phone:</strong> {selectedApplicant?.phone || '—'}</p>
            <p><strong>Location Pref:</strong> {selectedApplicant?.locationPreference || selectedApplicant?.student?.locationPreferences || '—'}</p>
            <p><strong>Education Level:</strong> {selectedApplicant?.educationLevel || '—'}</p>
            <p><strong>Degree/Major:</strong> {selectedApplicant?.degreeMajor || '—'}</p>
            <p><strong>Year of Study:</strong> {selectedApplicant?.yearOfStudy || '—'}</p>
            <p><strong>CGPA:</strong> {typeof selectedApplicant?.cgpa === 'number' ? selectedApplicant?.cgpa : '—'}</p>
            <p><strong>Category:</strong> {selectedApplicant?.socialCategory || selectedApplicant?.student?.category || '—'}</p>
            <p><strong>Rural/Aspirational:</strong> {selectedApplicant?.isRuralOrAspirational ? 'Yes' : 'No'}</p>
            <p><strong>Disability:</strong> {selectedApplicant?.hasDisability ? 'Yes' : 'No'}</p>
          </div>
          <p><strong>Skills:</strong> {(Array.isArray(selectedApplicant?.skills) ? selectedApplicant?.skills : (selectedApplicant?.student?.skills || '')).toString() || '—'}</p>
          <p><strong>Sector Interests:</strong> {(Array.isArray(selectedApplicant?.sectorInterests) ? selectedApplicant?.sectorInterests : []).join(', ') || '—'}</p>
          {selectedApplicant?.pastInternship && (
            <p><strong>Past Internship:</strong> {selectedApplicant?.pastInternship}</p>
          )}
          {selectedApplicant?.resume?.url && (
            <p>
              <strong>Resume:</strong> <a href={selectedApplicant.resume.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                {selectedApplicant.resume.fileName || 'Download'}
              </a>
              {selectedApplicant.resume.size ? (
                <span className="text-xs text-gray-500 ml-2">({(selectedApplicant.resume.size / 1024).toFixed(0)} KB)</span>
              ) : null}
            </p>
          )}
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
