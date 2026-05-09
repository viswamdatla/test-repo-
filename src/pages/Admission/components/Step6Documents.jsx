import React from 'react';
import { AdmissionDraftNextGroup } from './AdmissionSaveDraftNext';

const DOC_FIELDS = [
  { id: 'birthCert', label: 'Birth Certificate', showAsterisk: true },
  { id: 'reportCard', label: 'Report Card', showAsterisk: true },
  { id: 'addressProof', label: 'Address Proof', showAsterisk: true },
  { id: 'tc', label: 'Transfer Certificate (TC)', showAsterisk: false },
  { id: 'photos', label: 'Student Photos (3)', showAsterisk: true, icon: 'add_photo_alternate' },
  { id: 'medicalCert', label: 'Medical Certificate', showAsterisk: false },
];

export const Step6Documents = ({ formData, updateFormData, onNext, onBack, onSaveDraft }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <>
      <div className="form-card admission-documents-step">
        <div className="form-header admission-documents-header">
          <div className="admission-documents-title-row">
            <span className="material-symbols-outlined admission-documents-title-icon">cloud_upload</span>
            <div>
              <h3>Document Checklist</h3>
              <p>Step 5 of 7: Upload documents for verification.</p>
            </div>
          </div>
        </div>

        <form className="admission-form admission-form--documents" onSubmit={handleSubmit} noValidate>
          <div className="admission-doc-checklist-grid">
            {DOC_FIELDS.map((doc) => (
              <div key={doc.id} className="form-group admission-doc-field">
                <div className="admission-doc-label" id={`doc-lbl-${doc.id}`}>
                  <span className="admission-doc-label-text">{doc.label}</span>
                  {doc.showAsterisk && <span className="admission-doc-label-asterisk">*</span>}
                </div>
                <label className="admission-doc-file-trigger">
                  <span className="admission-doc-file-name">{formData[doc.id]?.name || 'Select file...'}</span>
                  <span className="material-symbols-outlined admission-doc-file-icon">{doc.icon || 'attach_file'}</span>
                  <input
                    type="file"
                    className="admission-doc-file-input"
                    aria-labelledby={`doc-lbl-${doc.id}`}
                    onChange={(e) => updateFormData({ [doc.id]: e.target.files[0] || null })}
                  />
                </label>
              </div>
            ))}
          </div>

          <div className="form-actions space-between admission-documents-actions">
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
    </>
  );
};
