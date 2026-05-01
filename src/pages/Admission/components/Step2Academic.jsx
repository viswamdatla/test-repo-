import React from 'react';

export const Step2Academic = ({ formData, updateFormData, onNext, onBack }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <>
      <div className="form-card">
        <div className="form-header">
          <h3>Academic Information</h3>
          <p>Step 2 of 7: Please fill in the academic details accurately to proceed with the kit allocation.</p>
        </div>

        <form className="admission-form" onSubmit={handleSubmit}>
          <div className="form-row-2">
            <div className="form-group">
              <label>Class Applied For*</label>
              <select defaultValue={formData.classApplied || ""} required onChange={e => updateFormData({ classApplied: e.target.value })}>
                <option value="" disabled>Select class</option>
                <option>Nursery</option>
                <option>LKG</option>
                <option>UKG</option>
                <option>1st Grade</option>
                <option>2nd Grade</option>
                <option>3rd Grade</option>
                <option>4th Grade</option>
                <option>5th Grade</option>
                <option>6th Grade</option>
                <option>7th Grade</option>
                <option>8th Grade</option>
                <option>9th Grade</option>
                <option>10th Grade</option>
              </select>
            </div>
            <div className="form-group">
              <label>Medium of Instruction</label>
              <select defaultValue={formData.medium || ""} onChange={e => updateFormData({ medium: e.target.value })}>
                <option value="" disabled>Select medium</option>
                <option>English</option>
                <option>Hindi</option>
                <option>Telugu</option>
                <option>Tamil</option>
                <option>Kannada</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Previous Class/Grade</label>
              <input type="text" placeholder="e.g. 5th Grade" defaultValue={formData.previousClass} onChange={e => updateFormData({ previousClass: e.target.value })}/>
            </div>
            <div className="form-group">
              <label>Final Grade / Percentage</label>
              <input type="text" placeholder="e.g. 92% or A+" defaultValue={formData.previousGrade} onChange={e => updateFormData({ previousGrade: e.target.value })}/>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Section Preference</label>
              <select defaultValue={formData.sectionPref || ""} onChange={e => updateFormData({ sectionPref: e.target.value })}>
                <option value="" disabled>Select section</option>
                <option>Section A</option>
                <option>Section B</option>
                <option>Section C</option>
              </select>
            </div>
            <div className="form-group">
              <label>Transfer Certificate Number</label>
              <input type="text" placeholder="Enter TC Number" defaultValue={formData.tcNumber} onChange={e => updateFormData({ tcNumber: e.target.value })}/>
            </div>
          </div>

          <div className="form-actions space-between">
            <button type="button" className="btn-back" onClick={onBack}>
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back</span>
            </button>
            <button type="submit" className="btn-next bg-gradient-primary">
              <span>Next Step</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </form>
      </div>

      <div className="feature-cards">
        <div className="feature-card">
          <div className="icon-wrapper color-tertiary bg-tertiary-fixed">
            <span className="material-symbols-outlined">info</span>
          </div>
          <p>Ensure all data matches the student's previous transfer certificate to avoid admission delays.</p>
        </div>
        <div className="feature-card">
          <div className="icon-wrapper color-secondary bg-secondary-fixed">
            <span className="material-symbols-outlined">verified_user</span>
          </div>
          <p>All submitted information is encrypted and handled according to the school data privacy policy.</p>
        </div>
        <div className="feature-card">
          <div className="icon-wrapper color-primary bg-primary-fixed">
            <span className="material-symbols-outlined">support_agent</span>
          </div>
          <p>Need help? Contact the registrar office at ext. 402 for assistance with academic records.</p>
        </div>
      </div>
    </>
  );
};
