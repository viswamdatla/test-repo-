import React from 'react';

export const Step1Student = ({ formData, updateFormData, onNext }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <>
      <div className="form-card">
        <div className="form-header">
          <h3>Student Information</h3>
          <p>Step 1 of 7: Basic demographic and identity details.</p>
        </div>

        <form className="admission-form" onSubmit={handleSubmit}>
          <div className="form-row-2">
            <div className="form-group">
              <label>First Name*</label>
              <input type="text" placeholder="e.g. Aarav" required defaultValue={formData.firstName} onChange={e => updateFormData({ firstName: e.target.value })}/>
            </div>
            <div className="form-group">
              <label>Last Name*</label>
              <input type="text" placeholder="e.g. Sharma" required defaultValue={formData.lastName} onChange={e => updateFormData({ lastName: e.target.value })}/>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Gender*</label>
              <select defaultValue={formData.gender || ""} required onChange={e => updateFormData({ gender: e.target.value })}>
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Blood Group</label>
              <select defaultValue={formData.bloodGroup || ""} onChange={e => updateFormData({ bloodGroup: e.target.value })}>
                <option value="" disabled>Select Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Nationality</label>
              <select defaultValue={formData.nationality || "India"} onChange={e => updateFormData({ nationality: e.target.value })}>
                <option value="India">India</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Academic Year</label>
              <select defaultValue={formData.academicYear || "2024-25"} onChange={e => updateFormData({ academicYear: e.target.value })}>
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Date of Birth*</label>
              <input type="date" required defaultValue={formData.dob} onChange={e => updateFormData({ dob: e.target.value })}/>
            </div>
            <div className="form-group">
              <label>Religion</label>
              <input type="text" placeholder="e.g. Hindu, Muslim, Sikh" defaultValue={formData.religion} onChange={e => updateFormData({ religion: e.target.value })}/>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Previous School</label>
            <input type="text" placeholder="Name of previous academic institution" defaultValue={formData.previousSchool} onChange={e => updateFormData({ previousSchool: e.target.value })}/>
          </div>

          <div className="form-actions">
            <p className="required-note">* Required fields must be completed</p>
            <div className="action-buttons">
              <button type="button" className="btn-draft">Save Draft</button>
              <button type="submit" className="btn-next bg-gradient-primary">
                <span>Next</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </form>
      </div>
      
      <div className="hint-card">
        <span className="material-symbols-outlined info-icon">info</span>
        <p>Ensure the Student's name matches their official birth certificate or passport for verification. You can save your progress and return to this form at any time before final submission.</p>
      </div>
    </>
  );
};
