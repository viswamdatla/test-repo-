import React, { useState } from 'react';
import { AdmissionDraftNextGroup } from './AdmissionSaveDraftNext';

const BUS_ROUTES = {
  'R-101': ['North Gate', 'City Center', 'Lake View', 'Campus Main Gate'],
  'R-205': ['South Park', 'Market Circle', 'Old Bridge', 'Campus Main Gate'],
  'R-309': ['East End', 'Tech Hub', 'River Side', 'Campus Main Gate'],
  'R-412': ['West Plaza', 'Green Meadows', 'Hill Top', 'Campus Main Gate'],
};

export const Step4Address = ({ formData, updateFormData, onNext, onBack, onSaveDraft }) => {
  const [sameAsPresent, setSameAsPresent] = useState(formData.sameAsPresent ?? true);

  const isTransportRequired = formData.transportRequired !== 'no';
  const selectedRoute = formData.busRouteNumber || '';
  const routeStops = selectedRoute ? BUS_ROUTES[selectedRoute] || [] : [];

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
          <p>Step 4 of 7: Address and transport details</p>
        </div>

        <form className="admission-form admission-form--address" onSubmit={handleSubmit} noValidate>
          <div className="section-divider admission-section-divider--address">
            <div className="icon-wrapper bg-primary text-white" style={{ width: '6px', height: '32px', borderRadius: '4px', marginRight: '16px' }}></div>
            <h4 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Present Address</h4>
          </div>

          <div className="address-field-group">
            <div className="form-group full-width">
              <label className="address-field-label" htmlFor="pres-address-line">
                Address Line *
              </label>
              <textarea
                id="pres-address-line"
                className="admission-address-textarea"
                rows={2}
                placeholder="Street name, building number, locality..."
                defaultValue={formData.presAddress}
                onChange={(e) => {
                  updateFormData({ presAddress: e.target.value });
                  if (sameAsPresent) updateFormData({ permAddress: e.target.value });
                }}
              ></textarea>
            </div>

            <div className="form-row-address form-row-address--step4">
              <div className="form-group">
                <label className="address-field-label" htmlFor="pres-city">
                  City *
                </label>
                <input
                  id="pres-city"
                  type="text"
                  placeholder="e.g. Hyderabad"
                  defaultValue={formData.presCity}
                  onChange={(e) => {
                    updateFormData({ presCity: e.target.value });
                    if (sameAsPresent) updateFormData({ permCity: e.target.value });
                  }}
                />
              </div>
              <div className="form-group">
                <label className="address-field-label" htmlFor="pres-state">
                  State *
                </label>
                <select
                  id="pres-state"
                  defaultValue={formData.presState || ''}
                  onChange={(e) => {
                    updateFormData({ presState: e.target.value });
                    if (sameAsPresent) updateFormData({ permState: e.target.value });
                  }}
                >
                  <option value="" disabled>
                    Select State
                  </option>
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
                <label className="address-field-label" htmlFor="pres-pin">
                  PIN Code *
                </label>
                <input
                  id="pres-pin"
                  type="text"
                  placeholder="6-digit PIN code"
                  defaultValue={formData.presPin}
                  onChange={(e) => {
                    updateFormData({ presPin: e.target.value });
                    if (sameAsPresent) updateFormData({ permPin: e.target.value });
                  }}
                />
              </div>
            </div>
          </div>

          <div className="permanent-address-toolbar">
            <div className="permanent-address-toolbar-row">
              <div className="section-divider admission-section-divider--address-toolbar">
                <div
                  className="icon-wrapper color-tertiary bg-tertiary"
                  style={{ backgroundColor: 'var(--tertiary)', width: '6px', height: '32px', borderRadius: '4px', marginRight: '16px' }}
                ></div>
                <h4 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Permanent Address</h4>
              </div>

              <label className="permanent-address-same-checkbox">
                <input type="checkbox" checked={sameAsPresent} onChange={handleSameAsPresentChange} />
                <span>Same as present address</span>
              </label>
            </div>
          </div>

          {!sameAsPresent && (
            <div className="address-field-group address-field-group--permanent">
              <div className="form-group full-width">
                <label className="address-field-label" htmlFor="perm-address-line">
                  Address Line *
                </label>
                <textarea
                  id="perm-address-line"
                  className="admission-address-textarea"
                  rows={2}
                  placeholder="Street name, building number, locality..."
                  value={formData.permAddress || ''}
                  onChange={(e) => updateFormData({ permAddress: e.target.value })}
                ></textarea>
              </div>

              <div className="form-row-address form-row-address--step4">
                <div className="form-group">
                  <label className="address-field-label" htmlFor="perm-city">
                    City *
                  </label>
                  <input id="perm-city" type="text" placeholder="e.g. Hyderabad" value={formData.permCity || ''} onChange={(e) => updateFormData({ permCity: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="address-field-label" htmlFor="perm-state">
                    State *
                  </label>
                  <select id="perm-state" value={formData.permState || ''} onChange={(e) => updateFormData({ permState: e.target.value })}>
                    <option value="" disabled>
                      Select State
                    </option>
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
                  <label className="address-field-label" htmlFor="perm-pin">
                    PIN Code *
                  </label>
                  <input id="perm-pin" type="text" placeholder="6-digit PIN code" value={formData.permPin || ''} onChange={(e) => updateFormData({ permPin: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          <div className="admission-transport-embedded">
            <div className="admission-transport-heading">
              <h3>Transport Information</h3>
              <p>Please specify if the student requires the school&apos;s shuttle service.</p>
            </div>

            <div className="transport-toggle">
              <p className="section-label">TRANSPORT REQUIRED*</p>
              <div className="toggle-options">
                <label className={`toggle-btn ${isTransportRequired ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="transport"
                    value="yes"
                    checked={isTransportRequired}
                    onChange={() => updateFormData({ transportRequired: 'yes' })}
                  />
                  <span className="material-symbols-outlined">directions_bus</span>
                  Yes, Required
                </label>
                <label className={`toggle-btn ${!isTransportRequired ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="transport"
                    value="no"
                    checked={!isTransportRequired}
                    onChange={() =>
                      updateFormData({
                        transportRequired: 'no',
                        busRouteNumber: '',
                        pickupDropPoint: '',
                      })
                    }
                  />
                  <span className="material-symbols-outlined">no_transfer</span>
                  No, Thanks
                </label>
              </div>
            </div>

            {isTransportRequired && (
              <div className="form-row-2 admission-transport-fields">
                <div className="form-group">
                  <label className="address-field-label" htmlFor="bus-route-number">
                    Bus Route Number*
                  </label>
                  <select
                    id="bus-route-number"
                    value={selectedRoute}
                    onChange={(e) => {
                      const nextRoute = e.target.value;
                      updateFormData({
                        busRouteNumber: nextRoute,
                        pickupDropPoint: '',
                      });
                    }}
                  >
                    <option value="" disabled>
                      Select Bus Route
                    </option>
                    {Object.keys(BUS_ROUTES).map((routeNo) => (
                      <option key={routeNo} value={routeNo}>
                        {routeNo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="address-field-label" htmlFor="pickup-drop-point">
                    Pickup / Drop Point*
                  </label>
                  <select
                    key={selectedRoute || 'pickup-no-route'}
                    id="pickup-drop-point"
                    value={formData.pickupDropPoint || ''}
                    disabled={!selectedRoute}
                    onChange={(e) => updateFormData({ pickupDropPoint: e.target.value })}
                  >
                    {!selectedRoute ? (
                      <option value="" disabled>
                        Select route first
                      </option>
                    ) : (
                      <>
                        <option value="">Select Stop</option>
                        {routeStops.map((stop) => (
                          <option key={stop} value={stop}>
                            {stop}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              </div>
            )}

            <div className="service-availability-alert">
              <span className="material-symbols-outlined info-icon">info</span>
              <div className="alert-content">
                <p className="alert-title">Service Availability</p>
                <p className="alert-desc">
                  Estimated transit time for the selected zones is <strong>25-30 minutes</strong>. Bus number and driver details will be shared after admission approval.
                </p>
              </div>
            </div>
          </div>

          <div className="form-actions space-between admission-address-actions">
            <button type="button" className="btn-back" onClick={onBack}>
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back</span>
            </button>
            <AdmissionDraftNextGroup onSaveDraft={onSaveDraft}>
              <button type="submit" className="btn-next bg-gradient-primary">
                <span>Next</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </AdmissionDraftNextGroup>
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
            <p style={{ fontSize: '12px' }}>Fields marked with an asterisk (*) are used for document verification during the kit allocation process.</p>
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
