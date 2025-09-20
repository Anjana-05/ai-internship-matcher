import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';
import Card from '../components/Card';

const EnhancedStudentProfilePage = () => {
  const { user, isAuthenticated, showToast, login } = useAppContext();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    education: '',
    locationPreferences: '',
    category: 'General',
    skills: [],
    customSkills: '',
    linkedinUrl: '',
    githubUrl: '',
    leetcodeUrl: ''
  });
  
  // File states
  const [files, setFiles] = useState({
    resume: null,
    marksheet: null,
    communityCertificate: null,
    extraCertificates: []
  });
  
  const [extraCertDescriptions, setExtraCertDescriptions] = useState([]);
  const [predefinedSkills, setPredefinedSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Categories and predefined skills
  const categories = ['General', 'SC', 'ST', 'OBC', 'PWD'];

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'student') {
      showToast('Please log in as a student to access your profile.', 'info');
      navigate('/auth/student');
      return;
    }

    fetchProfile();
  }, [isAuthenticated, user, navigate, showToast]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      const userData = response.data.user;
      const skills = response.data.predefinedSkills || [];
      
      setPredefinedSkills(skills);
      
      // Populate form with existing data
      setFormData({
        name: userData.name || '',
        education: userData.education || '',
        locationPreferences: userData.locationPreferences || '',
        category: userData.category || 'General',
        skills: userData.skills || [],
        customSkills: '',
        linkedinUrl: userData.profile?.linkedinUrl || '',
        githubUrl: userData.profile?.githubUrl || '',
        leetcodeUrl: userData.profile?.leetcodeUrl || ''
      });
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      showToast('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleCustomSkillsAdd = () => {
    if (formData.customSkills.trim()) {
      const customSkillsArray = formData.customSkills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill && !formData.skills.includes(skill));
      
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, ...customSkillsArray],
        customSkills: ''
      }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    
    if (name === 'extraCertificates') {
      const fileArray = Array.from(selectedFiles);
      setFiles(prev => ({ ...prev, [name]: fileArray }));
      
      // Initialize descriptions array
      setExtraCertDescriptions(new Array(fileArray.length).fill(''));
    } else {
      setFiles(prev => ({ ...prev, [name]: selectedFiles[0] || null }));
    }
    
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCertDescriptionChange = (index, value) => {
    setExtraCertDescriptions(prev => {
      const newDescriptions = [...prev];
      newDescriptions[index] = value;
      return newDescriptions;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.education.trim()) newErrors.education = 'Education is required';
    if (!formData.locationPreferences.trim()) newErrors.locationPreferences = 'Location preferences are required';
    if (formData.skills.length === 0) newErrors.skills = 'At least one skill is required';
    
    // Required files (only check if not already uploaded)
    if (!files.resume && !user?.profile?.resume) {
      newErrors.resume = 'Resume is required';
    }
    if (!files.marksheet && !user?.profile?.marksheet) {
      newErrors.marksheet = 'Marksheet is required';
    }
    if (!files.communityCertificate && !user?.profile?.communityCertificate) {
      newErrors.communityCertificate = 'Community certificate is required';
    }
    
    // URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (formData.linkedinUrl && !urlPattern.test(formData.linkedinUrl)) {
      newErrors.linkedinUrl = 'Invalid LinkedIn URL';
    }
    if (formData.githubUrl && !urlPattern.test(formData.githubUrl)) {
      newErrors.githubUrl = 'Invalid GitHub URL';
    }
    if (formData.leetcodeUrl && !urlPattern.test(formData.leetcodeUrl)) {
      newErrors.leetcodeUrl = 'Invalid LeetCode URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setSaving(true);
    
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        if (key === 'skills') {
          formDataToSend.append('skills', JSON.stringify(formData.skills));
        } else if (key !== 'customSkills') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add files
      if (files.resume) formDataToSend.append('resume', files.resume);
      if (files.marksheet) formDataToSend.append('marksheet', files.marksheet);
      if (files.communityCertificate) formDataToSend.append('communityCertificate', files.communityCertificate);
      
      // Add extra certificates
      if (files.extraCertificates && files.extraCertificates.length > 0) {
        files.extraCertificates.forEach(file => {
          formDataToSend.append('extraCertificates', file);
        });
        formDataToSend.append('extraCertificateDescriptions', JSON.stringify(extraCertDescriptions));
      }
      
      const response = await api.put('/profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update user context with new data
      login(response.data.user, localStorage.getItem('accessToken'));
      
      showToast('Profile updated successfully!', 'success');
      
      // Reset file inputs
      setFiles({
        resume: null,
        marksheet: null,
        communityCertificate: null,
        extraCertificates: []
      });
      setExtraCertDescriptions([]);
      
    } catch (error) {
      console.error('Profile update error:', error);
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteCertificate = async (certificateId) => {
    try {
      await api.delete(`/profile/certificate/${certificateId}`);
      showToast('Certificate deleted successfully', 'success');
      fetchProfile(); // Refresh profile data
    } catch (error) {
      console.error('Delete certificate error:', error);
      showToast('Failed to delete certificate', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-50">
        <div className="text-xl text-gray-700">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-[calc(100vh-64px)] bg-gray-50">
      <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8">Enhanced Student Profile</h1>
      
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.education ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., B.Tech Computer Science"
                  />
                  {errors.education && <p className="text-red-500 text-sm mt-1">{errors.education}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Preferences <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="locationPreferences"
                    value={formData.locationPreferences}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.locationPreferences ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Remote, Bangalore, Mumbai"
                  />
                  {errors.locationPreferences && <p className="text-red-500 text-sm mt-1">{errors.locationPreferences}</p>}
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Skills <span className="text-red-500">*</span>
              </h2>
              
              {/* Predefined Skills */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select from predefined skills:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {predefinedSkills.map(skill => (
                    <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.skills.includes(skill)}
                        onChange={() => handleSkillToggle(skill)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Custom Skills */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add custom skills (comma-separated):
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="customSkills"
                    value={formData.customSkills}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Figma, Photoshop, Blockchain"
                  />
                  <button
                    type="button"
                    onClick={handleCustomSkillsAdd}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              {/* Selected Skills */}
              {formData.skills.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected skills:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map(skill => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills}</p>}
            </div>

            {/* Required Documents */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Required Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Resume */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume (PDF) <span className="text-red-500">*</span>
                  </label>
                  {user?.profile?.resume && (
                    <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-700">✓ Uploaded: {user.profile.resume.originalName}</p>
                    </div>
                  )}
                  <input
                    type="file"
                    name="resume"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.resume ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.resume && <p className="text-red-500 text-sm mt-1">{errors.resume}</p>}
                </div>
                
                {/* Marksheet */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latest Marksheet (PDF) <span className="text-red-500">*</span>
                  </label>
                  {user?.profile?.marksheet && (
                    <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-700">✓ Uploaded: {user.profile.marksheet.originalName}</p>
                    </div>
                  )}
                  <input
                    type="file"
                    name="marksheet"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.marksheet ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.marksheet && <p className="text-red-500 text-sm mt-1">{errors.marksheet}</p>}
                </div>
                
                {/* Community Certificate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Community Certificate (PDF) <span className="text-red-500">*</span>
                  </label>
                  {user?.profile?.communityCertificate && (
                    <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-700">✓ Uploaded: {user.profile.communityCertificate.originalName}</p>
                    </div>
                  )}
                  <input
                    type="file"
                    name="communityCertificate"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.communityCertificate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.communityCertificate && <p className="text-red-500 text-sm mt-1">{errors.communityCertificate}</p>}
                </div>
              </div>
            </div>

            {/* Optional Links */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Professional Links (Optional)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.linkedinUrl ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                  {errors.linkedinUrl && <p className="text-red-500 text-sm mt-1">{errors.linkedinUrl}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub Profile
                  </label>
                  <input
                    type="url"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.githubUrl ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="https://github.com/yourusername"
                  />
                  {errors.githubUrl && <p className="text-red-500 text-sm mt-1">{errors.githubUrl}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LeetCode Profile
                  </label>
                  <input
                    type="url"
                    name="leetcodeUrl"
                    value={formData.leetcodeUrl}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.leetcodeUrl ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="https://leetcode.com/yourusername"
                  />
                  {errors.leetcodeUrl && <p className="text-red-500 text-sm mt-1">{errors.leetcodeUrl}</p>}
                </div>
              </div>
            </div>

            {/* Extra Certificates */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Extra Certificates (Optional)</h2>
              <p className="text-sm text-gray-600 mb-4">
                Upload additional certificates like AWS, Azure, Coursera, Udemy, etc.
              </p>
              
              {/* Existing Certificates */}
              {user?.profile?.extraCertificates && user.profile.extraCertificates.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Uploaded Certificates:</h3>
                  <div className="space-y-2">
                    {user.profile.extraCertificates.map((cert, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded">
                        <div>
                          <p className="font-medium text-gray-800">{cert.description || cert.originalName}</p>
                          <p className="text-sm text-gray-600">Uploaded: {new Date(cert.uploadedAt).toLocaleDateString()}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteCertificate(cert._id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* New Certificate Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add New Certificates (PDF, up to 5 files)
                </label>
                <input
                  type="file"
                  name="extraCertificates"
                  accept=".pdf"
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                {/* Descriptions for new certificates */}
                {files.extraCertificates && files.extraCertificates.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Add descriptions for your certificates:
                    </label>
                    {files.extraCertificates.map((file, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 w-1/3 truncate">{file.name}</span>
                        <input
                          type="text"
                          value={extraCertDescriptions[index] || ''}
                          onChange={(e) => handleCertDescriptionChange(index, e.target.value)}
                          placeholder="e.g., AWS Cloud Practitioner, React Course"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={saving}
                className={`px-8 py-3 rounded-md font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  saving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {saving ? 'Updating Profile...' : 'Update Profile'}
              </button>
            </div>
            
            {/* Profile Completion Status */}
            {user?.profile?.isProfileComplete !== undefined && (
              <div className={`mt-4 p-4 rounded-md text-center ${
                user.profile.isProfileComplete 
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
              }`}>
                {user.profile.isProfileComplete 
                  ? '✅ Your profile is complete!'
                  : '⚠️ Please complete all required fields to finish your profile'
                }
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedStudentProfilePage;
