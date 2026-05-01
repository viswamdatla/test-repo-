import React from 'react';

export const Step3Guardian = ({ formData, updateFormData, onNext, onBack }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <>
      <div className="form-card">
        <div className="form-header">
          <h3>Guardian Information</h3>
          <p>Step 3 of 7: Provide contact details for parents and emergency contacts.</p>
        </div>

        <form className="admission-form" onSubmit={handleSubmit}>
          
          {/* Father's Info */}
          <div className="section-divider">
            <div className="icon-wrapper bg-primary text-white" style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
              <span className="material-symbols-outlined text-sm">person</span>
            </div>
            <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Father's Information</h4>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Name*</label>
              <input type="text" placeholder="Enter father's full name" required defaultValue={formData.fatherName} onChange={e => updateFormData({ fatherName: e.target.value })}/>
            </div>
            <div className="form-group">
              <label>Occupation</label>
              <input type="text" placeholder="e.g. Engineer, Business" defaultValue={formData.fatherOccupation} onChange={e => updateFormData({ fatherOccupation: e.target.value })}/>
            </div>
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label>Phone*</label>
              <input type="tel" placeholder="+1 (555) 000-0000" required defaultValue={formData.fatherPhone} onChange={e => updateFormData({ fatherPhone: e.target.value })}/>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="father@example.com" defaultValue={formData.fatherEmail} onChange={e => updateFormData({ fatherEmail: e.target.value })}/>
            </div>
          </div>

          <div style={{ height: '32px' }}></div> {/* Spacer */}

          {/* Mother's Info */}
          <div className="section-divider">
            <div className="icon-wrapper" style={{ backgroundColor: 'var(--secondary-container)', color: 'var(--secondary)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
              <span className="material-symbols-outlined text-sm">person_2</span>
            </div>
            <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Mother's Information</h4>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Name*</label>
              <input type="text" placeholder="Enter mother's full name" required defaultValue={formData.motherName} onChange={e => updateFormData({ motherName: e.target.value })}/>
            </div>
            <div className="form-group">
              <label>Occupation</label>
              <input type="text" placeholder="e.g. Doctor, Teacher" defaultValue={formData.motherOccupation} onChange={e => updateFormData({ motherOccupation: e.target.value })}/>
            </div>
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label>Phone*</label>
              <input type="tel" placeholder="+1 (555) 000-0000" required defaultValue={formData.motherPhone} onChange={e => updateFormData({ motherPhone: e.target.value })}/>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="mother@example.com" defaultValue={formData.motherEmail} onChange={e => updateFormData({ motherEmail: e.target.value })}/>
            </div>
          </div>

          <div style={{ height: '32px' }}></div> {/* Spacer */}

          {/* Income Details */}
          <div className="section-divider">
            <div className="icon-wrapper" style={{ backgroundColor: 'var(--tertiary-fixed)', color: 'var(--tertiary)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
              <span className="material-symbols-outlined text-sm">payments</span>
            </div>
            <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Income Details</h4>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Parents Annual Income</label>
              <input type="number" placeholder="Actual income amount" defaultValue={formData.income} onChange={e => updateFormData({ income: e.target.value })}/>
            </div>
            <div className="form-group">
              <label>Income Bracket (in lakhs)*</label>
              <select defaultValue={formData.incomeBracket || ""} required onChange={e => updateFormData({ incomeBracket: e.target.value })}>
                <option value="" disabled>Select income bracket</option>
                <option value="1">&lt; 1 lakh</option>
                <option value="2">1 - 3 lakhs</option>
                <option value="3">3 - 5 lakhs</option>
                <option value="4">5 - 7 lakhs</option>
                <option value="5">7 - 9 lakhs</option>
                <option value="6">&gt; 9 lakhs</option>
              </select>
            </div>
          </div>

          <div style={{ height: '32px' }}></div> {/* Spacer */}

          {/* Emergency Contact */}
          <div className="section-divider">
            <div className="icon-wrapper bg-rose-light color-rose" style={{ backgroundColor: '#ffe4e6', color: '#be123c', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
              <span className="material-symbols-outlined text-sm">emergency</span>
            </div>
            <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Emergency Contact</h4>
          </div>

          <div className="form-row-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '24px' }}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" placeholder="Full name" defaultValue={formData.emergencyName} onChange={e => updateFormData({ emergencyName: e.target.value })}/>
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" placeholder="Primary contact" defaultValue={formData.emergencyPhone} onChange={e => updateFormData({ emergencyPhone: e.target.value })}/>
            </div>
            <div className="form-group">
              <label>Relationship</label>
              <input type="text" placeholder="e.g. Uncle, Neighbor" defaultValue={formData.emergencyRelation} onChange={e => updateFormData({ emergencyRelation: e.target.value })}/>
            </div>
          </div>

          <div className="form-actions space-between" style={{ marginTop: '40px' }}>
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
        <div className="feature-card" style={{ flex: 2 }}>
          <div className="icon-wrapper color-primary bg-primary-fixed">
            <span className="material-symbols-outlined">info</span>
          </div>
          <div>
            <h4 style={{ marginBottom: '4px' }}>Privacy Guarantee</h4>
            <p>All guardian information is encrypted and only accessible by authorized school administrative personnel for communication purposes.</p>
          </div>
        </div>
        <div className="feature-card" style={{ flex: 1, flexDirection: 'column', textAlign: 'center', alignItems: 'center' }}>
          <span className="material-symbols-outlined text-tertiary mb-2">support_agent</span>
          <h4 className="color-tertiary">Need Help?</h4>
          <a href="#" className="color-dark" style={{ textDecoration: 'underline' }}>Contact Registry</a>
        </div>
      </div>
    </>
  );
};
