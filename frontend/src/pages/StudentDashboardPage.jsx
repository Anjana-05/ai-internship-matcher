import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';
import Card from '../components/Card';
import ProgressTracker from '../components/ProgressTracker';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

const StudentDashboardPage = () => {
  const { user, isAuthenticated, showToast } = useAppContext();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [recommendedOpportunities, setRecommendedOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'student') {
      showToast("Please log in as a student to view your dashboard.", "info");
      navigate('/auth/student');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [applicationsResponse, myResultsResponse] = await Promise.all([
          api.get('/applications/me'),
          api.get('/match/my-results'),
        ]);

        setApplications(applicationsResponse.data);
        setRecommendedOpportunities(myResultsResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data');
        showToast(err.response?.data?.message || 'Failed to load dashboard data', 'error');
        console.error('Error fetching student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, user, navigate, showToast]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'selected': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'applied': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 text-xl text-gray-700">
        <svg className="animate-spin h-8 w-8 text-blue-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading student dashboard...
      </div>
    );
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-64px)] text-red-500 text-xl">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-[calc(100vh-64px)] bg-gray-50">
      <PageHeader
        title="Student Dashboard"
        subtitle="Track your applications and explore AI-recommended internships tailored to you."
      />

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Applications</h2>
        {applications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => (
              <Card key={app._id} className="p-6 space-y-3">
                <h3 className="text-xl font-semibold text-gray-800">{app.opportunity?.title}</h3>
                <p className="text-gray-600"><strong>Company:</strong> {app.opportunity?.company?.companyName}</p>
                <p className="text-gray-600"><strong>Location:</strong> {app.opportunity?.location}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                  <ProgressTracker status={app.status} />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📬"
            title="No applications yet"
            description="You haven’t applied to any internships. Explore opportunities and apply to get started."
            action={<Link to="/opportunities" className="btn-primary bg-blue-600 hover:bg-blue-700 focus:ring-blue-500">Explore Opportunities</Link>}
          />
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">AI Recommended Opportunities</h2>
        {recommendedOpportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedOpportunities.map((match) => (
              <Card key={match._id} className="p-6 space-y-3 transform transition duration-300 hover:scale-105 hover:shadow-xl">
                <h3 className="text-xl font-semibold text-gray-800">{match.opportunity?.title}</h3>
                <p className="text-blue-600 font-medium mb-1">{match.opportunity?.company?.companyName}</p>
                <p className="text-gray-600 text-sm mb-1"><strong>Location:</strong> {match.opportunity?.location}</p>
                <p className="text-gray-600 text-sm mb-3"><strong>Match Score:</strong> <span className="font-bold text-green-700">{match.score}%</span></p>
                <button
                  onClick={() => setSelectedMatch(match)}
                  className="btn-primary bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 w-full"
                >
                  View Match Details
                </button>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🤖"
            title="No recommendations yet"
            description="Make sure your profile is complete to receive personalized matches. Check back soon!"
            action={<Link to="/profile/student" className="btn-secondary">Update My Profile</Link>}
          />
        )}
      </section>

      {selectedMatch && (
        <Modal isOpen={!!selectedMatch} onClose={() => setSelectedMatch(null)} title={`Match Details for ${selectedMatch.opportunity?.title}`}>
          <div className="space-y-4 text-gray-700">
            <p className="text-blue-600 font-medium text-lg"><strong>Opportunity:</strong> {selectedMatch.opportunity?.title}</p>
            <p><strong>Company:</strong> {selectedMatch.opportunity?.company?.companyName}</p>
            <p><strong>Match Score:</strong> <span className="font-bold text-green-700">{selectedMatch.score}%</span></p>
            {selectedMatch.explanation && (
              <div>
                <h4 className="font-bold mt-4 mb-2">Score Breakdown:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {Object.entries(JSON.parse(selectedMatch.explanation)).map(([key, value]) => (
                    <li key={key}><strong>{key}:</strong> {(value * 100).toFixed(2)}%</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StudentDashboardPage;
