import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';
import Card from '../components/Card';
import Modal from '../components/Modal';

const AIMatchesPage = () => {
  const { user, isAuthenticated, showToast } = useAppContext();
  const navigate = useNavigate();
  const [matchResults, setMatchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      showToast("Please log in to view AI matches.", "info");
      navigate('/auth/student');
      return;
    }

    const fetchMatchResults = async () => {
      try {
        let response;
        if (user.role === 'admin') {
          response = await api.get('/match/results');
        } else if (user.role === 'student') {
          const allMatches = await api.get('/match/results');
          response = { data: allMatches.data.filter(match => match.student && match.student._id === user._id) };
        } else {
          showToast("You are not authorized to view this page.", "error");
          navigate('/dashboard');
          return;
        }
        setMatchResults(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch AI match results');
        showToast(err.response?.data?.message || 'Failed to load AI match results', 'error');
        console.error('Error fetching AI match results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchResults();
  }, [isAuthenticated, user, navigate, showToast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 text-xl text-gray-700">
        <svg className="animate-spin h-8 w-8 text-blue-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading AI match results...
      </div>
    );
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-64px)] text-red-500 text-xl">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-[calc(100vh-64px)] bg-gray-50">
      <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8">AI Match Results</h1>

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
        <p className="text-gray-600 text-lg text-center">No AI match results available yet. Admin needs to run the AI matching engine.</p>
      )}

      {selectedMatch && (
        <Modal isOpen={!!selectedMatch} onClose={() => setSelectedMatch(null)} title={`Match Details for ${selectedMatch.student?.name || ''} - ${selectedMatch.opportunity?.title || ''}`}>
          <div className="space-y-3 text-gray-700">
            <p><strong>Student:</strong> {selectedMatch.student?.name}</p>
            <p><strong>Opportunity:</strong> {selectedMatch.opportunity?.title}</p>
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

export default AIMatchesPage;
