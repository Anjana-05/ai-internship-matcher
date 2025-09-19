import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';
import Card from '../components/Card';
import Modal from '../components/Modal';

const AdminDashboardPage = () => {
  const { user, isAuthenticated, showToast } = useAppContext();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [matchResults, setMatchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [runningAIMatch, setRunningAIMatch] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      showToast("Please log in as an admin to view this dashboard.", "info");
      navigate('/auth/student');
      return;
    }

    const fetchAdminData = async () => {
      try {
        const [usersResponse, opportunitiesResponse, matchResultsResponse] = await Promise.all([
          api.get('/users'),
          api.get('/opportunities'),
          api.get('/api/match/results'),
        ]);
        setUsers(usersResponse.data);
        setOpportunities(opportunitiesResponse.data);
        setMatchResults(matchResultsResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch admin data');
        showToast(err.response?.data?.message || 'Failed to load admin data', 'error');
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [isAuthenticated, user, navigate, showToast]);

  const handleRunAIMatch = async () => {
    setRunningAIMatch(true);
    try {
      const response = await api.post('/match/run');
      showToast(`AI Matching completed: ${response.data.createdResults} results created.`, 'success');
      const updatedMatchResults = await api.get('/api/match/results');
      setMatchResults(updatedMatchResults.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to run AI matching', 'error');
      console.error('AI Match error:', err.response?.data || err.message);
    } finally {
      setRunningAIMatch(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/users/${userId}`);
        setUsers(users.filter(u => u._id !== userId));
        showToast("User deleted successfully!", "success");
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to delete user', 'error');
        console.error('Delete user error:', err.response?.data || err.message);
      }
    }
  };

  const handleDeleteOpportunity = async (opportunityId) => {
    if (window.confirm("Are you sure you want to delete this opportunity?")) {
      try {
        await api.delete(`/opportunities/${opportunityId}`);
        setOpportunities(opportunities.filter(o => o._id !== opportunityId));
        showToast("Opportunity deleted successfully!", "success");
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to delete opportunity', 'error');
        console.error('Delete opportunity error:', err.response?.data || err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 text-xl text-gray-700">
        <svg className="animate-spin h-8 w-8 text-blue-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading admin dashboard...
      </div>
    );
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-64px)] text-red-500 text-xl">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-[calc(100vh-64px)] bg-gray-50">
      <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8">Admin Dashboard</h1>

      <section className="mb-12 bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">AI Matching</h2>
          <button
            onClick={handleRunAIMatch}
            className="btn-primary bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
            disabled={runningAIMatch}
          >
            {runningAIMatch ? 'Running Match...' : 'Run AI Match Engine'}
          </button>
        </div>
        <p className="text-gray-600 text-base">Latest match results: {matchResults.length} matches found.</p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">All Users</h2>
        {users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((u) => (
              <Card key={u._id} className="p-6 space-y-2 transform transition duration-300 hover:scale-105 hover:shadow-xl">
                <h3 className="text-xl font-semibold text-gray-800">{u.name}</h3>
                <p className="text-gray-600"><strong>Email:</strong> {u.email}</p>
                <p className="text-gray-600"><strong>Role:</strong> <span className="capitalize">{u.role}</span></p>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => setSelectedUser(u)}
                    className="py-1 px-3 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDeleteUser(u._id)}
                    className="py-1 px-3 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-lg">No users found.</p>
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">All Opportunities</h2>
        {opportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opp) => (
              <Card key={opp._id} className="p-6 space-y-2 transform transition duration-300 hover:scale-105 hover:shadow-xl">
                <h3 className="text-xl font-semibold text-gray-800">{opp.title}</h3>
                <p className="text-blue-600 font-medium">Company: {opp.company?.companyName}</p>
                <p className="text-gray-600 text-sm">Location: {opp.location}</p>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => setSelectedOpportunity(opp)}
                    className="py-1 px-3 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDeleteOpportunity(opp._id)}
                    className="py-1 px-3 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-lg">No opportunities found.</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">AI Match Results</h2>
        {matchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchResults.map((match) => (
              <Card key={match._id} className="p-6 space-y-2 transform transition duration-300 hover:scale-105 hover:shadow-xl">
                <p className="text-xl font-semibold text-gray-800">Student: {match.student?.name}</p>
                <p className="text-blue-600 font-medium">Opportunity: {match.opportunity?.title}</p>
                <p className="text-gray-600">Match Score: <span className="font-bold text-green-700">{match.score}%</span></p>
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
          <p className="text-gray-600 text-lg">No AI match results yet. Run the AI Match Engine above!</p>
        )}
      </section>

      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title={`User Details: ${selectedUser?.name || ''}`}>
        <div className="space-y-3 text-gray-700">
          <p><strong>Name:</strong> {selectedUser?.name}</p>
          <p><strong>Email:</strong> {selectedUser?.email}</p>
          <p><strong>Role:</strong> <span className="capitalize">{selectedUser?.role}</span></p>
          {selectedUser?.role === 'student' && (
            <>
              <p><strong>Category:</strong> {selectedUser?.category}</p>
              <p><strong>Skills:</strong> {selectedUser?.skills}</p>
              <p><strong>Education:</strong> {selectedUser?.education}</p>
              <p><strong>Location Preferences:</strong> {selectedUser?.locationPreferences}</p>
            </>
          )}
          {selectedUser?.role === 'industry' && (
            <>
              <p><strong>Company Name:</strong> {selectedUser?.companyName}</p>
              <p><strong>Company Info:</strong> {selectedUser?.companyInfo}</p>
            </>
          )}
        </div>
      </Modal>

      <Modal isOpen={!!selectedOpportunity} onClose={() => setSelectedOpportunity(null)} title={`Opportunity Details: ${selectedOpportunity?.title || ''}`}>
        <div className="space-y-3 text-gray-700">
          <p><strong>Title:</strong> {selectedOpportunity?.title}</p>
          <p><strong>Company:</strong> {selectedOpportunity?.company?.companyName}</p>
          <p><strong>Location:</strong> {selectedOpportunity?.location}</p>
          <p><strong>Sector:</strong> {selectedOpportunity?.sector}</p>
          <p><strong>Duration:</strong> {selectedOpportunity?.duration}</p>
          <p><strong>Capacity:</strong> {selectedOpportunity?.capacity}</p>
          <p><strong>Description:</strong> {selectedOpportunity?.description}</p>
          {selectedOpportunity?.affirmativeCategory && (
            <p><strong>Affirmative Category:</strong> {selectedOpportunity?.affirmativeCategory}</p>
          )}
        </div>
      </Modal>

      <Modal isOpen={!!selectedMatch} onClose={() => setSelectedMatch(null)} title={`Match Details for ${selectedMatch?.student?.name || ''} - ${selectedMatch?.opportunity?.title || ''}`}>
        <div className="space-y-3 text-gray-700">
          <p><strong>Student:</strong> {selectedMatch?.student?.name}</p>
          <p><strong>Opportunity:</strong> {selectedMatch?.opportunity?.title}</p>
          <p><strong>Match Score:</strong> <span className="font-bold text-green-700">{selectedMatch?.score}%</span></p>
          {selectedMatch?.explanation && (
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
    </div>
  );
};

export default AdminDashboardPage;
