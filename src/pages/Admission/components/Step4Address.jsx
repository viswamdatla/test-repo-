import React, { useState } from 'react';

export const Step4Address = ({ formData, updateFormData, onNext, onBack }) => {
  const [sameAsPresent, setSameAsPresent] = useState(formData.sameAsPresent ?? true);

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  const handleSameAsPresentChange = (e) => {
    const isChecked = e.target.checked;
    setSameAsPresent(isChecked);
    updateFormData({ sameAsPresent: isChecked });
    if (isChecked) {
      updateFormData({
        permAddress: formData.presAddress,
        permCity: formData.presCity,
        permState: formData.presState,
        permPin: formData.presPin,
      });
    }
  };

  return (
    <>
      <div className="form-card">
        <div className="form-header">
          <h3>Address Information</h3>
          <p>Step 4 of 7: Address Information</p>
        </div>

        <form className="admission-form" onSubmit={handleSubmit}>
          
          <div className="section-divider">
            <div className="icon-wrapper bg-primary text-white" style={{ width: '6px', height: '32px', borderRadius: '4px', marginRight: '16px' }}></div>
            <h4 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Present Address</h4>
          </div>

          <div className="form-group full-width">
            <label style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Address Line *</label>
            <textarea 
              rows="3" 
              placeholder="Street name, building number, locality..." 
              required
              defaultValue={formData.presAddress}
              onChange={e => {
                updateFormData({ presAddress: e.target.value });
                if (sameAsPresent) updateFormData({ permAddress: e.target.value });
              }}
            ></textarea>
          </div>

          <div className="form-row-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '24px' }}>
            <div className="form-group">
              <label style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>City *</label>
              <input type="text" placeholder="e.g. Hyderabad" required defaultValue={formData.presCity} 
                onChange={e => {
                  updateFormData({ presCity: e.target.value });
                  if (sameAsPresent) updateFormData({ permCity: e.target.value });
                }} />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>State *</label>
              <select required defaultValue={formData.presState || ""}
                onChange={e => {
                  updateFormData({ presState: e.target.value });
                  if (sameAsPresent) updateFormData({ permState: e.target.value });
                }}>
                <option value="" disabled>Select State</option>
                <option>Andhra Pradesh</option>
                <option>Telangana</option>
                <option>Karnataka</option>
                <option>Tamil Nadu</option>
                <option>Maharashtra</option>
                <option>Delhi</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>PIN Code *</label>
              <input type="text" placeholder="6-digit PIN code" required defaultValue={formData.presPin}
                onChange={e => {
                  updateFormData({ presPin: e.target.value });
                  if (sameAsPresent) updateFormData({ permPin: e.target.value });
                }} />
            </div>
          </div>

          <div style={{ margin: '32px 0 24px', paddingTop: '24px', borderTop: '1px solid var(--surface-container-highest)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="section-divider" style={{ margin: 0 }}>
              <div className="icon-wrapper color-tertiary bg-tertiary" style={{ backgroundColor: 'var(--tertiary)', width: '6px', height: '32px', borderRadius: '4px', marginRight: '16px' }}></div>
              <h4 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Permanent Address</h4>
            </div>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input type="checkbox" checked={sameAsPresent} onChange={handleSameAsPresentChange} style={{ width: '24px', height: '24px' }} />
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Same as present address</span>
            </label>
          </div>

          <div style={{ opacity: sameAsPresent ? 0.6 : 1, pointerEvents: sameAsPresent ? 'none' : 'auto' }}>
            <div className="form-group full-width">
              <label style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Address Line</label>
              <textarea 
                rows="3" 
                placeholder="Permanent residence details..." 
                value={formData.permAddress || ""}
                onChange={e => updateFormData({ permAddress: e.target.value })}
              ></textarea>
            </div>

            <div className="form-row-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '24px' }}>
              <div className="form-group">
                <label style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>City</label>
                <input type="text" value={formData.permCity || ""} onChange={e => updateFormData({ permCity: e.target.value })} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>State</label>
                <select value={formData.permState || ""} onChange={e => updateFormData({ permState: e.target.value })}>
                  <option value="" disabled>Select State</option>
                  <option>Andhra Pradesh</option>
                  <option>Telangana</option>
                  <option>Karnataka</option>
                  <option>Tamil Nadu</option>
                  <option>Maharashtra</option>
                  <option>Delhi</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>PIN Code</label>
                <input type="text" value={formData.permPin || ""} onChange={e => updateFormData({ permPin: e.target.value })} />
              </div>
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
        <div className="feature-card">
          <div className="icon-wrapper color-primary bg-primary-fixed">
            <span className="material-symbols-outlined">info</span>
          </div>
          <div>
            <h4 style={{ marginBottom: '4px' }}>Mandatory Fields</h4>
            <p style={{ fontSize: '12px' }}>Fields marked with an asterisk (*) are required for document verification during the kit allocation process.</p>
          </div>
        </div>
        <div className="feature-card">
          <div className="icon-wrapper color-secondary bg-secondary-fixed">
            <span className="material-symbols-outlined">distance</span>
          </div>
          <div>
            <h4 style={{ marginBottom: '4px' }}>Hostel Eligibility</h4>
            <p style={{ fontSize: '12px' }}>Students residing beyond 50km of the campus are automatically shortlisted for hostel priority.</p>
          </div>
        </div>
        <div className="feature-card">
          <div className="icon-wrapper color-tertiary bg-tertiary-fixed">
            <span className="material-symbols-outlined">contact_support</span>
          </div>
          <div>
            <h4 style={{ marginBottom: '4px' }}>Need Help?</h4>
            <p style={{ fontSize: '12px' }}>Contact admin support for queries regarding inter-state address verification and ZIP codes.</p>
          </div>
        </div>
      </div>
    </>
  );
};
