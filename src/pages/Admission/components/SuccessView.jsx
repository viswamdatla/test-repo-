import React from 'react';
import { useNavigate } from 'react-router-dom';

export const SuccessView = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '48px 24px', maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
      
      {/* Celebratory Icon */}
      <div style={{ marginBottom: '32px', position: 'relative' }}>
        <div style={{ width: '128px', height: '128px', borderRadius: '50%', backgroundColor: 'rgba(193, 217, 254, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--primary)' }}>check_circle</span>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2 }}>Application Submitted Successfully!</h2>
      <p style={{ fontSize: '18px', color: 'var(--on-surface-variant)', marginBottom: '40px', lineHeight: 1.5 }}>
        Great job! Your admission application has been received and is now under review.
      </p>

      {/* Detail Card */}
      <div style={{ width: '100%', backgroundColor: 'var(--surface-container-lowest)', borderRadius: '12px', padding: '32px', marginBottom: '40px', border: '1px solid var(--surface-container)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '24px', textAlign: 'left' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--outline)' }}>Application ID</span>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>#ADM-2024-8842</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--outline)' }}>Submission Date</span>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--outline)' }}>Reference</span>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Student Admission</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '16px', width: '100%', justifyContent: 'center' }}>
        <button onClick={() => navigate('/applications')} style={{ padding: '16px 32px', background: 'linear-gradient(to right, var(--primary), var(--primary-container))', color: 'white', fontWeight: 700, borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined">visibility</span>
          View Application Status
        </button>
        <button onClick={() => navigate('/')} style={{ padding: '16px 32px', backgroundColor: 'transparent', border: '2px solid var(--outline-variant)', color: 'var(--on-surface)', fontWeight: 700, borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
          <span className="material-symbols-outlined">dashboard</span>
          Return to Dashboard
        </button>
      </div>

      {/* Footer Info */}
      <div style={{ borderTop: '1px solid var(--surface-container)', paddingTop: '32px', marginTop: '48px' }}>
        <p style={{ fontSize: '14px', color: 'var(--outline)', lineHeight: 1.5 }}>
          A confirmation email has been sent to your registered address. You will receive updates via SMS and the Student Portal as your application progresses.
        </p>
      </div>

    </div>
  );
};
