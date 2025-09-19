import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAppContext();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMobileMenuOpen(false); // Close mobile menu on logout
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <span className="inline-block w-8 h-8 rounded bg-gradient-to-r from-blue-600 to-indigo-600" />
          <span className="text-blue-800 text-xl md:text-2xl font-bold tracking-wide">
            Career Align Engine
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/opportunities" className="text-blue-700 hover:text-blue-900 transition duration-150 ease-in-out font-medium">
            Opportunities
          </Link>

          {isAuthenticated ? (
            <>
              {user.role === "student" && (
                <>
                  <Link to="/dashboard" className="text-blue-700 hover:text-blue-900 transition duration-150 ease-in-out font-medium">
                    My Dashboard
                  </Link>
                  <Link to="/profile/student" className="text-blue-700 hover:text-blue-900 transition duration-150 ease-in-out font-medium">
                    My Profile
                  </Link>
                </>
              )}
              {user.role === "industry" && (
                <>
                  <Link to="/dashboard/industry" className="text-blue-700 hover:text-blue-900 transition duration-150 ease-in-out font-medium">
                    Industry Dashboard
                  </Link>
                  <Link to="/profile/industry" className="text-blue-700 hover:text-blue-900 transition duration-150 ease-in-out font-medium">
                    Company Profile
                  </Link>
                </>
              )}
              {user.role === "admin" && (
                <>
                  <Link to="/dashboard/admin" className="text-blue-700 hover:text-blue-900 transition duration-150 ease-in-out font-medium">
                    Admin Dashboard
                  </Link>
                  <Link to="/ai-matches" className="text-blue-700 hover:text-blue-900 transition duration-150 ease-in-out font-medium">
                    AI Matches
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/auth/student" className="text-blue-700 hover:text-blue-900 transition duration-150 ease-in-out font-medium">
                Student Login
              </Link>
              <Link to="/auth/industry" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out shadow">
                Industry Login
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-blue-700 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white py-3 px-4 space-y-2 border-t border-gray-200 shadow-lg">
          <Link
            to="/opportunities"
            className="block text-blue-700 hover:text-blue-900 py-2"
            onClick={toggleMobileMenu}
          >
            Opportunities
          </Link>
          {isAuthenticated ? (
            <>
              {user.role === "student" && (
                <>
                  <Link
                    to="/dashboard"
                    className="block text-blue-700 hover:text-blue-900 py-2"
                    onClick={toggleMobileMenu}
                  >
                    My Dashboard
                  </Link>
                  <Link
                    to="/profile/student"
                    className="block text-blue-700 hover:text-blue-900 py-2"
                    onClick={toggleMobileMenu}
                  >
                    My Profile
                  </Link>
                </>
              )}
              {user.role === "industry" && (
                <>
                  <Link
                    to="/dashboard/industry"
                    className="block text-blue-700 hover:text-blue-900 py-2"
                    onClick={toggleMobileMenu}
                  >
                    Industry Dashboard
                  </Link>
                  <Link
                    to="/profile/industry"
                    className="block text-blue-700 hover:text-blue-900 py-2"
                    onClick={toggleMobileMenu}
                  >
                    Company Profile
                  </Link>
                </>
              )}
              {user.role === "admin" && (
                <>
                  <Link
                    to="/dashboard/admin"
                    className="block text-blue-700 hover:text-blue-900 py-2"
                    onClick={toggleMobileMenu}
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/ai-matches"
                    className="block text-blue-700 hover:text-blue-900 py-2"
                    onClick={toggleMobileMenu}
                  >
                    AI Matches
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="block text-red-600 hover:text-red-700 text-left w-full py-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth/student"
                className="block text-blue-700 hover:text-blue-900 py-2"
                onClick={toggleMobileMenu}
              >
                Student Login
              </Link>
              <Link
                to="/auth/industry"
                className="block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md mt-2"
                onClick={toggleMobileMenu}
              >
                Industry Login
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
