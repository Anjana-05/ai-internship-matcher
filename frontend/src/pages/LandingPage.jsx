import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const LandingPage = () => {
  const { isAuthenticated, user } = useAppContext();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-8">
              🚀 Powered by Advanced AI Technology
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              PM Internship Scheme
              <span className="block text-blue-600">AI-Based Smart Allocation Engine</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
              Revolutionizing career development by intelligently matching students with industry opportunities. 
              Join thousands of students and top companies in India's most advanced internship platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              {isAuthenticated ? (
                <>
                  {user.role === 'student' && (
                    <Link to="/dashboard" className="btn-primary bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-lg px-8 py-4">
                      Go to Student Dashboard
                    </Link>
                  )}
                  {user.role === 'industry' && (
                    <Link to="/dashboard/industry" className="btn-primary bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-lg px-8 py-4">
                      Go to Industry Dashboard
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/dashboard/admin" className="btn-primary bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 text-lg px-8 py-4">
                      Go to Admin Dashboard
                    </Link>
                  )}
                  <Link to="/opportunities" className="btn-secondary text-lg px-8 py-4">
                    Explore All Opportunities
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/auth/student" className="btn-primary bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-lg px-8 py-4 transform hover:scale-105 transition-all duration-200">
                    Apply as Student
                  </Link>
                  <Link to="/auth/industry" className="btn-primary bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-lg px-8 py-4 transform hover:scale-105 transition-all duration-200">
                    Partner with Us
                  </Link>
                </>
              )}
            </div>
            
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">1 Crore+</div>
                <div className="text-gray-600">Internship Opportunities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">500+</div>
                <div className="text-gray-600">Top Companies</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
                <div className="text-gray-600">Match Accuracy</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              The Challenge We're Solving
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Traditional internship matching processes are inefficient, time-consuming, and often result in poor fits between students and opportunities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Manual Matching</h3>
              <p className="text-gray-600">Time-intensive manual processes lead to suboptimal matches and missed opportunities for both students and companies.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Limited Reach</h3>
              <p className="text-gray-600">Students struggle to discover relevant opportunities while companies can't find the right talent efficiently.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Poor Analytics</h3>
              <p className="text-gray-600">Lack of data-driven insights makes it difficult to improve matching outcomes and track success rates.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our AI-Powered Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Leveraging advanced machine learning algorithms to create perfect matches between students and industry opportunities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Matching Algorithm</h3>
                    <p className="text-gray-600">AI analyzes student profiles, skills, interests, and career goals to match with the most suitable opportunities.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Processing</h3>
                    <p className="text-gray-600">Instant matching and application processing with automated screening and recommendation systems.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
                    <p className="text-gray-600">Comprehensive dashboards and insights for students, companies, and administrators to track progress and outcomes.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl">
              <div className="text-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Engine at Work</h3>
                <p className="text-gray-600 mb-6">Our sophisticated algorithms process thousands of data points to ensure optimal matches.</p>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500 mb-2">Match Accuracy</div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-600 h-3 rounded-full" style={{width: '95%'}}></div>
                  </div>
                  <div className="text-right text-sm font-semibold text-blue-600 mt-1">95%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, streamlined process designed for both students and industry partners.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Create Profile</h3>
              <p className="text-gray-600">Students and companies create detailed profiles with skills, preferences, and requirements.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Analysis</h3>
              <p className="text-gray-600">Our AI engine analyzes profiles and identifies the best potential matches based on multiple criteria.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Matching</h3>
              <p className="text-gray-600">Receive personalized recommendations and apply to opportunities that align with your goals.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">4</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Success</h3>
              <p className="text-gray-600">Begin your internship journey with ongoing support and progress tracking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Career Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join thousands of students and top companies who are already benefiting from our AI-powered matching platform.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {!isAuthenticated && (
              <>
                <Link 
                  to="/auth/student" 
                  className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg text-lg transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Apply as Student
                </Link>
                <Link 
                  to="/auth/industry" 
                  className="bg-blue-800 text-white hover:bg-blue-900 font-semibold py-4 px-8 rounded-lg text-lg transform hover:scale-105 transition-all duration-200 shadow-lg border-2 border-blue-400"
                >
                  Partner with Us
                </Link>
              </>
            )}
            <Link 
              to="/opportunities" 
              className="bg-transparent text-white hover:bg-white hover:text-blue-600 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200 border-2 border-white"
            >
              Explore Opportunities
            </Link>
          </div>
          
          <div className="mt-12 text-blue-100 text-sm">
            <p>Trusted by students from 1000+ colleges and 500+ top companies across India</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
