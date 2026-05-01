import React from 'react';

export const Step5Transport = ({ formData, updateFormData, onNext, onBack }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  const isTransportRequired = formData.transportRequired !== 'no';

  return (
    <>
      <div className="form-card">
        <div className="form-header">
          <h3>Transport Information</h3>
          <p>Please specify if the student requires the school's shuttle service.</p>
        </div>

        <form className="admission-form" onSubmit={handleSubmit}>
          <div className="transport-toggle">
            <p className="section-label">TRANSPORT REQUIRED*</p>
            <div className="toggle-options">
              <label className={`toggle-btn ${isTransportRequired ? 'selected' : ''}`}>
                <input type="radio" name="transport" value="yes" checked={isTransportRequired} onChange={() => updateFormData({ transportRequired: 'yes' })} />
                <span className="material-symbols-outlined">directions_bus</span>
                Yes, Required
              </label>
              <label className={`toggle-btn ${!isTransportRequired ? 'selected' : ''}`}>
                <input type="radio" name="transport" value="no" checked={!isTransportRequired} onChange={() => updateFormData({ transportRequired: 'no' })} />
                <span className="material-symbols-outlined">no_transfer</span>
                No, Thanks
              </label>
            </div>
          </div>

          {isTransportRequired && (
            <div className="form-row-2">
              <div className="form-group">
                <label>Pickup Point*</label>
                <select defaultValue={formData.pickupPoint || ""} required onChange={e => updateFormData({ pickupPoint: e.target.value })}>
                  <option value="" disabled>Select Pickup Zone</option>
                  <option value="zone1">Zone 1 - North</option>
                  <option value="zone2">Zone 2 - South</option>
                  <option value="zone3">Zone 3 - East</option>
                  <option value="zone4">Zone 4 - West</option>
                </select>
              </div>
              <div className="form-group">
                <label>Drop Point*</label>
                <select defaultValue={formData.dropPoint || ""} required onChange={e => updateFormData({ dropPoint: e.target.value })}>
                  <option value="" disabled>Select Drop Zone</option>
                  <option value="zone1">Zone 1 - North</option>
                  <option value="zone2">Zone 2 - South</option>
                  <option value="zone3">Zone 3 - East</option>
                  <option value="zone4">Zone 4 - West</option>
                </select>
              </div>
            </div>
          )}

          <div className="service-availability-alert">
            <span className="material-symbols-outlined info-icon">info</span>
            <div className="alert-content">
              <p className="alert-title">Service Availability</p>
              <p className="alert-desc">Estimated transit time for the selected zones is <strong>25-30 minutes</strong>. Bus number and driver details will be shared after admission approval.</p>
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
          <div className="icon-wrapper bg-amber">
            <span className="material-symbols-outlined">shield</span>
          </div>
          <h4>Safe Transit</h4>
          <p>All buses are GPS-tracked with mandatory female attendants on board.</p>
        </div>
        <div className="feature-card">
          <div className="icon-wrapper bg-blue">
            <span className="material-symbols-outlined">emergency</span>
          </div>
          <h4>Emergency Care</h4>
          <p>First-aid kits and emergency contact protocols are strictly followed.</p>
        </div>
        <div className="feature-card">
          <div className="icon-wrapper bg-stone">
            <span className="material-symbols-outlined">schedule</span>
          </div>
          <h4>Punctuality</h4>
          <p>Live updates via mobile app for real-time pickup and drop notifications.</p>
        </div>
      </div>
    </>
  );
};
