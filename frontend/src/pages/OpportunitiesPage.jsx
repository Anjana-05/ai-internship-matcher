import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';
import Card from '../components/Card';
import Modal from '../components/Modal';
import ApplicationFormModal from '../components/ApplicationFormModal';

const OpportunitiesPage = () => {
  const { user, isAuthenticated, showToast } = useAppContext();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const response = await api.get('/opportunities');
        setOpportunities(response.data);
        setFilteredOpportunities(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch opportunities');
        showToast(err.response?.data?.message || 'Failed to load opportunities', 'error');
        console.error('Error fetching opportunities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, [showToast]);

  useEffect(() => {
    let tempOpportunities = [...opportunities];

    if (searchTerm) {
      tempOpportunities = tempOpportunities.filter(
        (opp) =>
          opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.company.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterLocation) {
      tempOpportunities = tempOpportunities.filter((opp) =>
        opp.location.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }

    if (filterSector) {
      tempOpportunities = tempOpportunities.filter((opp) =>
        (opp.sector || '').toLowerCase().includes(filterSector.toLowerCase())
      );
    }

    setFilteredOpportunities(tempOpportunities);
  }, [searchTerm, filterLocation, filterSector, opportunities]);

  const openApplicationForm = () => {
    if (!isAuthenticated || user?.role !== 'student') {
      showToast("Please log in as a student to apply.", "info");
      navigate('/auth/student');
      return;
    }
    setShowApplicationForm(true);
  };

  const submitApplication = async (formData) => {
    try {
      setIsApplying(true);
      console.log('[OPPORTUNITIES] Submitting application');
      console.log('[OPPORTUNITIES] FormData received');
      
      const res = await api.post('/applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log('[OPPORTUNITIES] Success response:', res.data);
      showToast('Application submitted successfully!', 'success');
      setShowApplicationForm(false);
      setSelectedOpportunity(null);
      
      // Notify other components about the new application
      window.dispatchEvent(new CustomEvent('applicationSubmitted', {
        detail: { opportunityId: formData.get('opportunityId'), applicationData: res.data }
      }));
      
      return res.data;
    } catch (err) {
      console.error('[OPPORTUNITIES] Full error:', err);
      console.error('[OPPORTUNITIES] Response data:', err.response?.data);
      console.error('[OPPORTUNITIES] Status:', err.response?.status);
      
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to submit application';
      showToast(message, 'error');
      console.error('Apply error:', err.response?.data || err.message);
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 text-xl text-gray-700">
        <svg className="animate-spin h-8 w-8 text-blue-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading opportunities...
      </div>
    );
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-64px)] text-red-500 text-xl">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-[calc(100vh-64px)] bg-gray-50">
      <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8">Explore Opportunities</h1>

      <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by title, company, description..."
            className="form-group-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <input
            type="text"
            placeholder="Filter by location..."
            className="form-group-input"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
          />
          <input
            type="text"
            placeholder="Filter by sector..."
            className="form-group-input"
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
          />
        </div>
        <button
          onClick={() => {
            setSearchTerm('');
            setFilterLocation('');
            setFilterSector('');
            showToast("Filters cleared.", "info");
          }}
          className="btn-secondary w-full py-2 px-4"
        >
          Clear Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOpportunities.length > 0 ? (
          filteredOpportunities.map((opportunity) => (
            <Card key={opportunity._id} className="transform transition duration-300 hover:scale-105 hover:shadow-xl">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{opportunity.title}</h2>
              <p className="text-blue-600 font-medium text-base mb-1">{opportunity.company?.companyName}</p>
              <p className="text-gray-600 text-sm mb-1"><strong>Location:</strong> {opportunity.location}</p>
              <p className="text-gray-600 text-sm mb-3"><strong>Sector:</strong> {opportunity.sector}</p>
              <button
                onClick={() => setSelectedOpportunity(opportunity)}
                className="btn-primary bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 w-full"
              >
                View Details
              </button>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-600 text-lg">No opportunities found matching your criteria.</p>
        )}
      </div>

      {selectedOpportunity && (
        <Modal isOpen={!!selectedOpportunity} onClose={() => setSelectedOpportunity(null)} title={selectedOpportunity.title}>
          <div className="space-y-4 text-gray-700">
            <p className="text-blue-600 font-medium text-lg"><strong>Company:</strong> {selectedOpportunity.company?.companyName}</p>
            <p><strong>Company Info:</strong> {selectedOpportunity.company?.companyInfo}</p>
            <p><strong>Location:</strong> {selectedOpportunity.location}</p>
            <p><strong>Sector:</strong> {selectedOpportunity.sector}</p>
            <p><strong>Duration:</strong> {selectedOpportunity.duration}</p>
            <p><strong>Capacity:</strong> {selectedOpportunity.capacity}</p>
            <p><strong>Description:</strong> {selectedOpportunity.description}</p>
            {selectedOpportunity.affirmativeCategory && (
              <p className="font-semibold text-purple-700"><strong>Affirmative Category:</strong> {selectedOpportunity.affirmativeCategory}</p>
            )}
            <button
              onClick={openApplicationForm}
              className="btn-primary bg-green-600 hover:bg-green-700 focus:ring-green-500 w-full mt-6"
              disabled={user?.role !== 'student'}
            >
              {user?.role === 'student' ? 'Apply Now' : 'Login as Student to Apply'}
            </button>
          </div>
        </Modal>
      )}

      {showApplicationForm && selectedOpportunity && (
        <ApplicationFormModal
          isOpen={showApplicationForm}
          onClose={() => setShowApplicationForm(false)}
          onSubmit={submitApplication}
          opportunity={selectedOpportunity}
        />
      )}
    </div>
  );
};

export default OpportunitiesPage;
