import React from 'react';

/** Save Draft + Next (or other submit control), aligned for every admission step. */
export const AdmissionDraftNextGroup = ({ onSaveDraft, children }) => (
  <div className="admission-step-actions-end">
    <button type="button" className="btn-draft admission-btn-save-draft" onClick={onSaveDraft}>
      Save Draft
    </button>
    {children}
  </div>
);
