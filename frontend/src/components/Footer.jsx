import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="inline-block w-8 h-8 rounded bg-gradient-to-r from-blue-600 to-indigo-600" />
              <span className="text-white text-lg font-semibold">Career Align Engine</span>
            </Link>
            <p className="mt-4 text-sm text-gray-400">
              AI-based smart allocation engine for the PM Internship Scheme.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/opportunities" className="hover:text-white">Opportunities</Link></li>
              <li><Link to="/ai-matches" className="hover:text-white">AI Matches</Link></li>
              <li><Link to="/dashboard" className="hover:text-white">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">For Users</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/auth/student" className="hover:text-white">Apply as Student</Link></li>
              <li><Link to="/auth/industry" className="hover:text-white">Partner with Us</Link></li>
              <li><Link to="/profile/student" className="hover:text-white">Student Profile</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#how-it-works" className="hover:text-white">How it Works</a></li>
              <li><a href="#" className="hover:text-white">Support</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Career Align Engine. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <a href="#" className="hover:text-white">Privacy</a>
            <span className="text-gray-700">|</span>
            <a href="#" className="hover:text-white">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
