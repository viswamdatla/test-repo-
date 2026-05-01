import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePageTitle } from '../../hooks/usePageTitle';
import { fetchSettings, toggleAlert, updateProfileField } from '../../store/settings/settingsSlice';
import './SettingsPage.scss';

export const SettingsPage = () => {
  usePageTitle('Settings');
  const dispatch = useDispatch();
  const { profile, alerts, institutionDefaults } = useSelector((s) => s.settings);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  return (
    <div className="settings-page">
      <section className="settings-header-card">
        <h1>System Configuration</h1>
        <p>Manage your personal preferences and institutional branch defaults.</p>
      </section>

      <section className="settings-grid">
        <div className="settings-card">
          <div className="card-head">
            <h3>Personal Profile</h3>
            <button type="button" className="btn-primary">Save Changes</button>
          </div>
          <div className="profile-grid">
            {[
              { key: 'fullName', label: 'Full Name' },
              { key: 'email', label: 'Email Address' },
              { key: 'designation', label: 'Designation' },
              { key: 'department', label: 'Department' },
            ].map((field) => (
              <label key={field.key} className="field">
                <span>{field.label}</span>
                <input
                  value={profile[field.key]}
                  onChange={(e) =>
                    dispatch(updateProfileField({ field: field.key, value: e.target.value }))
                  }
                />
              </label>
            ))}
          </div>
        </div>

        <div className="settings-card">
          <h3>Alerts</h3>
          <div className="toggle-row">
            <div>
              <h4>Email Notifications</h4>
              <p>Daily summary alerts</p>
            </div>
            <button
              type="button"
              className={`toggle ${alerts.emailNotifications ? 'on' : ''}`}
              onClick={() => dispatch(toggleAlert('emailNotifications'))}
            />
          </div>
          <div className="toggle-row">
            <div>
              <h4>SMS Alerts</h4>
              <p>Critical updates only</p>
            </div>
            <button
              type="button"
              className={`toggle ${alerts.smsAlerts ? 'on' : ''}`}
              onClick={() => dispatch(toggleAlert('smsAlerts'))}
            />
          </div>
        </div>

        <div className="settings-card">
          <h3>Institutional Defaults</h3>
          <div className="default-item">
            <span>Academic Period</span>
            <strong>{institutionDefaults.academicPeriod}</strong>
          </div>
          <div className="default-item">
            <span>Branch Identity</span>
            <strong>{institutionDefaults.branchIdentity}</strong>
          </div>
          <div className="default-item">
            <span>Kit Auto-Replenish</span>
            <strong>{institutionDefaults.autoReplenish}</strong>
          </div>
        </div>
      </section>
    </div>
  );
};

