const STORAGE_KEY = 'campus360-admission-draft-v1';

function sanitizeFormDataForDraft(data) {
  if (!data || typeof data !== 'object') return {};
  const out = {};
  for (const [key, val] of Object.entries(data)) {
    if (val instanceof File) {
      out[key] = { __draftFile: true, name: val.name, size: val.size };
    } else {
      out[key] = val;
    }
  }
  return out;
}

export function saveAdmissionDraft(formData, currentStep) {
  const payload = {
    savedAt: new Date().toISOString(),
    currentStep,
    formData: sanitizeFormDataForDraft(formData),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('admission-draft-saved'));
  } catch {
    /* quota or private mode */
  }
}

/** Returns 1 if a draft snapshot exists, else 0 (for KPI display). */
export function getSavedDraftsCount() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    JSON.parse(raw);
    return 1;
  } catch {
    return 0;
  }
}
