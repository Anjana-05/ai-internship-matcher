import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import api from '../services/api';

// Dynamic locations will be fetched from backend meta endpoint
const defaultCities = ['Chennai, TN', 'Bengaluru, KA', 'Hyderabad, TS', 'Delhi, DL', 'Mumbai, MH', 'Kolkata, WB', 'Pune, MH'];
const educationLevels = ['Diploma', 'UG', 'PG', 'Other'];
const years = ['1st', '2nd', '3rd', 'Final'];
const socialCategories = ['General', 'OBC', 'SC', 'ST', 'EWS'];
const skillsList = ['React', 'Node.js', 'Python', 'Data Science', 'Machine Learning', 'AI', 'NLP', 'Computer Vision', 'SQL'];
const sectors = ['IT', 'Healthcare', 'Manufacturing', 'FinTech', 'EduTech', 'E-Commerce'];

export default function ApplicationFormModal({ isOpen, onClose, onSubmit, opportunity }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    locationPreference: '',
    educationLevel: '',
    degreeMajor: '',
    yearOfStudy: '',
    cgpa: '',
    skills: [],
    sectorInterests: [],
    pastInternship: '',
    isRuralOrAspirational: false,
    socialCategory: '',
    hasDisability: false,
    resume: null,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [locations, setLocations] = useState(defaultCities);
  const [dragOver, setDragOver] = useState(false);
  const [showReview, setShowReview] = useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/meta/locations');
        if (mounted && Array.isArray(res.data) && res.data.length) {
          setLocations(res.data);
        }
      } catch (e) {
        // Fallback to defaults silently
      }
    })();
    return () => { mounted = false; };
  }, []);

  const req = useMemo(() => ({
    fullName: 'Full Name is required',
    email: 'Email is required',
    phone: 'Phone Number is required',
    locationPreference: 'Location Preference is required',
    educationLevel: 'Education Level is required',
    degreeMajor: 'Degree / Major is required',
    yearOfStudy: 'Year of Study is required',
    cgpa: 'CGPA / Percentage is required',
    skills: 'Please select at least one skill',
    resume: 'Resume is required',
  }), []);

  const update = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const toggleMulti = (name, value) => {
    setForm((f) => {
      const exists = f[name].includes(value);
      const next = exists ? f[name].filter((v) => v !== value) : [...f[name], value];
      return { ...f, [name]: next };
    });
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    Object.entries(req).forEach(([k, msg]) => {
      if (k === 'skills') {
        if (!form.skills || form.skills.length === 0) e[k] = msg;
      } else if (k === 'resume') {
        if (!form.resume) e[k] = msg;
      } else if (!form[k]) {
        e[k] = msg;
      }
    });
    setErrors(e);
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) return;
    setShowReview(true);
  };

  const confirmSubmission = async () => {
    try {
      setSubmitting(true);
      console.log('[MODAL] Starting submission');
      console.log('[MODAL] Form data:', form);
      console.log('[MODAL] Opportunity ID:', opportunity?._id);
      
      const fd = new FormData();
      fd.append('opportunityId', opportunity?._id);
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'resume') return; // handled below
        if (Array.isArray(v)) {
          // send as comma-separated for backend parsing
          fd.append(k, v.join(','));
        } else {
          fd.append(k, v);
        }
      });
      if (form.resume) fd.append('resume', form.resume);
      
      console.log('[MODAL] FormData entries:');
      for (let [key, value] of fd.entries()) {
        console.log(key, value);
      }

      console.log('[MODAL] Calling onSubmit with FormData');
      const result = await onSubmit(fd);
      console.log('[MODAL] onSubmit result:', result);
    } catch (error) {
      console.error('[MODAL] Submission error:', error);
      console.error('[MODAL] Error details:', error.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  const renderChipSelect = (label, name, options, required=false) => (
    <div className="form-group">
      <label className="block mb-2">{label} {required && <span className="text-red-600">*</span>}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            type="button"
            key={opt}
            onClick={() => toggleMulti(name, opt)}
            className={`px-3 py-1 rounded-full border text-sm transition ${form[name].includes(opt) ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'}`}
          >
            {opt}
          </button>
        ))}
      </div>
      {errors[name] && <p className="mt-1 text-sm text-red-600">{errors[name]}</p>}
    </div>
  );

  if (showReview) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Review Your Application">
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Opportunity: {opportunity?.title}</h3>
            <p className="text-sm text-blue-700">{opportunity?.company?.companyName} • {opportunity?.location}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong>Full Name:</strong> {form.fullName}</div>
            <div><strong>Email:</strong> {form.email}</div>
            <div><strong>Phone:</strong> {form.phone}</div>
            <div><strong>Location Preference:</strong> {form.locationPreference}</div>
            <div><strong>Education Level:</strong> {form.educationLevel}</div>
            <div><strong>Degree/Major:</strong> {form.degreeMajor}</div>
            <div><strong>Year of Study:</strong> {form.yearOfStudy}</div>
            <div><strong>CGPA:</strong> {form.cgpa}</div>
          </div>
          
          <div>
            <strong>Skills:</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {form.skills.map(skill => (
                <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{skill}</span>
              ))}
            </div>
          </div>
          
          {form.sectorInterests.length > 0 && (
            <div>
              <strong>Sector Interests:</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {form.sectorInterests.map(sector => (
                  <span key={sector} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">{sector}</span>
                ))}
              </div>
            </div>
          )}
          
          {form.pastInternship && (
            <div>
              <strong>Past Internship Experience:</strong>
              <p className="text-sm text-gray-700 mt-1">{form.pastInternship}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div><strong>Rural/Aspirational:</strong> {form.isRuralOrAspirational ? 'Yes' : 'No'}</div>
            <div><strong>Social Category:</strong> {form.socialCategory || 'Not specified'}</div>
            <div><strong>Disability:</strong> {form.hasDisability ? 'Yes' : 'No'}</div>
          </div>
          
          {form.resume && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <strong>Resume:</strong> {form.resume.name}
              <span className="text-xs text-gray-500 ml-2">({(form.resume.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between space-x-3 pt-4 mt-6 border-t">
          <button type="button" onClick={() => setShowReview(false)} className="btn-secondary py-2 px-4">
            ← Back to Edit
          </button>
          <button 
            type="button" 
            onClick={confirmSubmission} 
            disabled={submitting} 
            className="btn-primary bg-green-600 hover:bg-green-700 focus:ring-green-500 py-2 px-4"
          >
            {submitting ? 'Submitting...' : 'Confirm & Submit Application'}
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Apply: ${opportunity?.title || ''}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="fullName">Full Name <span className="text-red-600">*</span></label>
            <input id="fullName" className="form-group-input" value={form.fullName} onChange={(e)=>update('fullName', e.target.value)} />
            {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email <span className="text-red-600">*</span></label>
            <input id="email" type="email" className="form-group-input" value={form.email} onChange={(e)=>update('email', e.target.value)} />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone Number <span className="text-red-600">*</span></label>
            <input id="phone" className="form-group-input" value={form.phone} onChange={(e)=>update('phone', e.target.value)} />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="locationPreference">Location Preference <span className="text-red-600">*</span></label>
            <select id="locationPreference" className="form-group-input" value={form.locationPreference} onChange={(e)=>update('locationPreference', e.target.value)}>
              <option value="">Select City/State</option>
              {locations.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.locationPreference && <p className="mt-1 text-sm text-red-600">{errors.locationPreference}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="educationLevel">Current Education Level <span className="text-red-600">*</span></label>
            <select id="educationLevel" className="form-group-input" value={form.educationLevel} onChange={(e)=>update('educationLevel', e.target.value)}>
              <option value="">Select</option>
              {educationLevels.map((lvl)=> <option key={lvl} value={lvl}>{lvl}</option>)}
            </select>
            {errors.educationLevel && <p className="mt-1 text-sm text-red-600">{errors.educationLevel}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="degreeMajor">Degree / Major <span className="text-red-600">*</span></label>
            <input id="degreeMajor" className="form-group-input" value={form.degreeMajor} onChange={(e)=>update('degreeMajor', e.target.value)} />
            {errors.degreeMajor && <p className="mt-1 text-sm text-red-600">{errors.degreeMajor}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="yearOfStudy">Year of Study <span className="text-red-600">*</span></label>
            <select id="yearOfStudy" className="form-group-input" value={form.yearOfStudy} onChange={(e)=>update('yearOfStudy', e.target.value)}>
              <option value="">Select</option>
              {years.map((y)=> <option key={y} value={y}>{y}</option>)}
            </select>
            {errors.yearOfStudy && <p className="mt-1 text-sm text-red-600">{errors.yearOfStudy}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="cgpa">CGPA / Percentage <span className="text-red-600">*</span></label>
            <input id="cgpa" type="number" step="0.01" min="0" max="100" className="form-group-input" value={form.cgpa} onChange={(e)=>update('cgpa', e.target.value)} />
            {errors.cgpa && <p className="mt-1 text-sm text-red-600">{errors.cgpa}</p>}
          </div>
        </div>

        {renderChipSelect('Skills', 'skills', skillsList, true)}
        {renderChipSelect('Sector Interests', 'sectorInterests', sectors, false)}

        <div className="form-group">
          <label htmlFor="pastInternship">Past Internship Experience (optional)</label>
          <textarea id="pastInternship" rows="3" className="form-group-input" value={form.pastInternship} onChange={(e)=>update('pastInternship', e.target.value)}></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group">
            <label className="block mb-2">Rural / Aspirational District</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2"><input type="checkbox" checked={form.isRuralOrAspirational} onChange={(e)=>update('isRuralOrAspirational', e.target.checked)} /><span>Yes</span></label>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="socialCategory">Social Category</label>
            <select id="socialCategory" className="form-group-input" value={form.socialCategory} onChange={(e)=>update('socialCategory', e.target.value)}>
              <option value="">Prefer not to say</option>
              {socialCategories.map((s)=> <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="block mb-2">Disability</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2"><input type="checkbox" checked={form.hasDisability} onChange={(e)=>update('hasDisability', e.target.checked)} /><span>Yes</span></label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="block mb-2">Upload Resume <span className="text-red-600">*</span></label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
            onDragOver={(e)=>{ e.preventDefault(); setDragOver(true); }}
            onDragLeave={()=> setDragOver(false)}
            onDrop={(e)=>{
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files && e.dataTransfer.files[0];
              if (file) update('resume', file);
            }}
          >
            <input
              type="file"
              className="hidden"
              id="resumeInput"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e)=>update('resume', (e.target.files && e.target.files[0]) || null)}
            />
            <p className="text-sm text-gray-700">Drag & drop your resume here</p>
            <p className="text-xs text-gray-500 mb-2">PDF, DOC, or DOCX up to 10MB</p>
            <button type="button" onClick={()=>document.getElementById('resumeInput').click()} className="btn-secondary py-1 px-3">Choose File</button>
            {form.resume && <p className="mt-2 text-sm">Selected: <span className="font-medium">{form.resume.name}</span></p>}
          </div>
          {errors.resume && <p className="mt-1 text-sm text-red-600">{errors.resume}</p>}
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary py-2 px-4">Cancel</button>
          <button type="submit" className="btn-primary bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 py-2 px-4">
            Review Application →
          </button>
        </div>
      </form>
    </Modal>
  );
}
