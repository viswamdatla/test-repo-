import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle';
import { ClassCard } from './ClassCard';
import {
  appendDynamicClassCard,
  createClassCardFromForm,
  getMergedClassCards,
  getSectionContext,
} from './classSectionRegistry';
import { classLevelToSlug, sectionToSlug } from './studentManagement/studentManagementConfig';
import './AcademicsModernPage.scss';

const PAGE_META = {
  studentManagement: {
    title: 'Student Dashboard',
    subtitle: 'Organize and manage school enrollment by academic level.',
    cta: '+ Add Class',
  },
  timeTable: {
    title: 'Time Table',
    subtitle: 'Organize and manage school enrollment by academic level.',
    cta: null,
  },
  attendance: {
    title: 'Attendance',
    subtitle: 'Track daily attendance, monitor trends, and identify at-risk students.',
    cta: 'Mark Attendance',
  },
  grades: {
    title: 'Grades',
    subtitle: 'Manage assessments, publish marksheets, and monitor\u00a0performance.',
    cta: 'Publish Results',
  },
};

function chunkItems(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

function useItemsPerRow() {
  const [itemsPerRow, setItemsPerRow] = useState(() => {
    if (typeof globalThis === 'undefined' || !globalThis.matchMedia) return 7;
    if (globalThis.matchMedia('(min-width: 1400px)').matches) return 7;
    if (globalThis.matchMedia('(min-width: 1100px)').matches) return 6;
    if (globalThis.matchMedia('(min-width: 640px)').matches) return 4;
    return 2;
  });

  useEffect(() => {
    const mqXl = globalThis.matchMedia('(min-width: 1400px)');
    const mqLg = globalThis.matchMedia('(min-width: 1100px)');
    const mqMd = globalThis.matchMedia('(min-width: 640px)');
    const update = () => {
      if (mqXl.matches) setItemsPerRow(7);
      else if (mqLg.matches) setItemsPerRow(6);
      else if (mqMd.matches) setItemsPerRow(4);
      else setItemsPerRow(2);
    };
    update();
    mqXl.addEventListener('change', update);
    mqLg.addEventListener('change', update);
    mqMd.addEventListener('change', update);
    return () => {
      mqXl.removeEventListener('change', update);
      mqLg.removeEventListener('change', update);
      mqMd.removeEventListener('change', update);
    };
  }, []);

  return itemsPerRow;
}

const PILLS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function nextAvailablePill(existingPills) {
  const used = new Set(existingPills.map(String));
  return PILLS.find((p) => !used.has(p)) ?? 'Z';
}

/** Base path for list → section roster navigation per academics tab */
const ACADEMICS_SECTION_LIST_BASE = {
  studentManagement: '/academics/student-management',
  timeTable: '/academics/time-table',
  attendance: '/academics/attendance',
  grades: '/academics/grades',
};

const defaultNewClassForm = () => ({
  name: '',
  code: '',
  sections: 1,
  teacher: '',
  description: '',
});

export const AcademicsModernPage = ({ pageKey }) => {
  const meta = PAGE_META[pageKey] ?? PAGE_META.studentManagement;
  const isAcademicsLanding = pageKey === 'studentManagement';
  const pageTitle = isAcademicsLanding ? 'Academics' : meta.title;
  usePageTitle(pageTitle);
  const navigate = useNavigate();

  const itemsPerRow = useItemsPerRow();
  const [mergedClassTick, setMergedClassTick] = useState(0);
  const mergedClassCards = useMemo(() => getMergedClassCards(), [mergedClassTick]);

  const [selectedClassCode, setSelectedClassCode] = useState(null);
  const [sectionsByClass, setSectionsByClass] = useState({});

  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');

  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newClassForm, setNewClassForm] = useState(defaultNewClassForm);
  const [addClassFieldErrors, setAddClassFieldErrors] = useState({});

  const gridItems = useMemo(() => {
    const classes = mergedClassCards.map((c) => ({ kind: 'class', ...c }));
    if (pageKey === 'timeTable') return classes;
    return [...classes, { kind: 'add', id: 'add-new-class' }];
  }, [mergedClassCards, pageKey]);

  const rows = useMemo(() => chunkItems(gridItems, itemsPerRow), [gridItems, itemsPerRow]);

  const classByCode = useMemo(() => {
    const m = new Map();
    mergedClassCards.forEach((c) => m.set(c.code, c));
    return m;
  }, [mergedClassCards]);

  useEffect(() => {
    if (!showAddSectionModal && !showAddClassModal) return;
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (showAddSectionModal) {
        setShowAddSectionModal(false);
        setNewSectionName('');
      }
      if (showAddClassModal) {
        setShowAddClassModal(false);
        setNewClassForm(defaultNewClassForm());
        setAddClassFieldErrors({});
      }
    };
    globalThis.addEventListener('keydown', onKeyDown);
    return () => globalThis.removeEventListener('keydown', onKeyDown);
  }, [showAddSectionModal, showAddClassModal]);

  const handleClassClick = useCallback(
    (code) => {
      setSelectedClassCode((prev) => (prev === code ? null : code));
    },
    [],
  );

  const sectionListBase =
    ACADEMICS_SECTION_LIST_BASE[pageKey] ?? ACADEMICS_SECTION_LIST_BASE.studentManagement;

  const goToSectionRoster = useCallback(
    (sectionDbId) => {
      if (pageKey === 'attendance' || pageKey === 'grades') {
        const ctx = getSectionContext(sectionDbId);
        if (!ctx) return;
        const classSlug = classLevelToSlug(ctx.classLabel);
        // Must match academicsSlice section labels (e.g. "A"), not card title "Section A"
        const sectionSlug = sectionToSlug(String(ctx.sectionLetter));
        navigate(`${sectionListBase}/${classSlug}/${sectionSlug}`);
        return;
      }
      navigate(`${sectionListBase}/section/${encodeURIComponent(sectionDbId)}`);
    },
    [navigate, sectionListBase, pageKey],
  );

  const selectedClass = selectedClassCode ? classByCode.get(selectedClassCode) : null;

  useEffect(() => {
    if (!selectedClassCode || !selectedClass) return;
    setSectionsByClass((prev) => {
      if (prev[selectedClassCode] !== undefined) return prev;
      const seed = selectedClass.sections?.length ? selectedClass.sections.map((s) => ({ ...s })) : [];
      return { ...prev, [selectedClassCode]: seed };
    });
  }, [selectedClassCode, selectedClass]);

  const sectionsForSelected = useMemo(() => {
    if (!selectedClassCode) return null;
    const fromState = sectionsByClass[selectedClassCode];
    if (fromState !== undefined) return fromState;
    if (selectedClass?.sections?.length) return selectedClass.sections;
    return selectedClass ? [] : null;
  }, [selectedClassCode, selectedClass, sectionsByClass]);

  const [sectionsPerCardEditMode, setSectionsPerCardEditMode] = useState(false);

  useEffect(() => {
    setSectionsPerCardEditMode(false);
  }, [selectedClassCode]);

  const handleEditSection = useCallback(
    (sec) => {
      if (!selectedClassCode) return;
      const nextTitle = globalThis.prompt?.('Section name', sec.title);
      if (nextTitle === null) return;
      const trimmed = String(nextTitle).trim();
      if (!trimmed) return;
      setSectionsByClass((prev) => {
        const list = prev[selectedClassCode] ?? [];
        return {
          ...prev,
          [selectedClassCode]: list.map((s) =>
            s.id === sec.id ? { ...s, title: trimmed } : s,
          ),
        };
      });
    },
    [selectedClassCode],
  );

  const handleDeleteSection = useCallback(
    (sectionId) => {
      if (!selectedClassCode) return;
      const ok = globalThis.confirm?.('Remove this section?');
      if (!ok) return;
      setSectionsByClass((prev) => {
        const list = prev[selectedClassCode] ?? [];
        return {
          ...prev,
          [selectedClassCode]: list.filter((s) => s.id !== sectionId),
        };
      });
    },
    [selectedClassCode],
  );

  const handleAddSectionClick = useCallback(
    (rawSectionName) => {
      if (!selectedClassCode) return;
      const trimmedName = String(rawSectionName ?? '').trim();
      setSectionsByClass((prev) => {
        const list = [...(prev[selectedClassCode] ?? [])];
        const pill = nextAvailablePill(list.map((s) => s.pill));
        const id = `${selectedClassCode}-${pill}`;
        const title = trimmedName || `Section ${pill}`;
        const next = [
          ...list,
          {
            id,
            pill,
            title,
            count: 0,
          },
        ];
        return { ...prev, [selectedClassCode]: next };
      });
    },
    [selectedClassCode],
  );

  const confirmAddSectionFromModal = useCallback(() => {
    handleAddSectionClick(newSectionName);
    setShowAddSectionModal(false);
    setNewSectionName('');
  }, [handleAddSectionClick, newSectionName]);

  const closeAddSectionModal = useCallback(() => {
    setShowAddSectionModal(false);
    setNewSectionName('');
  }, []);

  const openAddClassModal = useCallback(() => {
    setAddClassFieldErrors({});
    setShowAddClassModal(true);
  }, []);

  const closeAddClassModal = useCallback(() => {
    setShowAddClassModal(false);
    setNewClassForm(defaultNewClassForm());
    setAddClassFieldErrors({});
  }, []);

  const handleCreateClass = useCallback(() => {
    const nameErr = String(newClassForm.name || '').trim() ? '' : 'This field is required';
    const codeErr = String(newClassForm.code || '').trim() ? '' : 'This field is required';
    setAddClassFieldErrors({
      ...(nameErr ? { name: nameErr } : {}),
      ...(codeErr ? { code: codeErr } : {}),
    });
    if (nameErr || codeErr) return;

    const draft = createClassCardFromForm(newClassForm);
    const exists = mergedClassCards.some((c) => c.code === draft.code);
    if (exists) {
      setAddClassFieldErrors({ code: 'This class code is already in use' });
      return;
    }

    appendDynamicClassCard(draft);
    setMergedClassTick((t) => t + 1);
    closeAddClassModal();
  }, [newClassForm, mergedClassCards, closeAddClassModal]);

  const panelLabel = selectedClass
    ? `Sections for ${selectedClass.label}`
    : 'Class sections';

  const inputStyle = {
    border: '1px solid #c1c7d3',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 14,
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <div className="ac-modern-page">
      <nav className="ac-modern-breadcrumb" aria-label="Breadcrumb">
        <span>Academics</span>
        {!isAcademicsLanding && (
          <>
            <span className="material-symbols-outlined">chevron_right</span>
            <span className="current">{pageTitle}</span>
          </>
        )}
      </nav>

      <header className="ac-modern-header">
        <div>
          <h1>{pageTitle}</h1>
          <p>{meta.subtitle}</p>
        </div>
        <div className="actions">
          <button type="button" className="ghost-btn">
            <span className="material-symbols-outlined">filter_list</span>
            <span>Filter View</span>
          </button>
          {meta.cta ? (
            <button type="button" className="primary-btn" onClick={openAddClassModal}>
              <span className="material-symbols-outlined">add_circle</span>
              <span>{meta.cta}</span>
            </button>
          ) : null}
        </div>
      </header>

      <section className="ac-modern-class-grid" aria-label="Class groups">
        {rows.map((row) => {
          const rowKey = row.map((r) => (r.kind === 'add' ? r.id : r.code)).join('-');

          return (
            <div
              key={`ac-class-row-${rowKey}`}
              className="ac-class-grid-row"
              style={{ gridTemplateColumns: `repeat(${itemsPerRow}, minmax(0, 1fr))` }}
            >
              {row.map((item) => {
                if (item.kind === 'add') {
                  return (
                    <button key={item.id} type="button" className="ac-class-card add-card">
                      <span className="material-symbols-outlined">add_circle_outline</span>
                      <p>Add New Class</p>
                    </button>
                  );
                }
                return (
                  <ClassCard
                    key={item.code}
                    pill={item.code}
                    title={item.label}
                    count={item.count}
                    isSenior={item.isSenior}
                    isSelected={selectedClassCode === item.code}
                    onClick={() => handleClassClick(item.code)}
                  />
                );
              })}
            </div>
          );
        })}

        {selectedClass ? (
          <section
            className="ac-sections-panel"
            id={`sections-${selectedClass.code}`}
            aria-label={panelLabel}
          >
            <div className="ac-sections-panel-inner">
              <div className="ac-sections-panel-head">
                <p className="ac-sections-panel-title">
                  <span>{selectedClass.label}</span>
                  <span className="ac-sections-panel-meta">Sections</span>
                </p>
                {(sectionsForSelected ?? []).length > 0 ? (
                  <div className="ac-sections-panel-toolbar">
                    <button
                      type="button"
                      className="ac-sections-panel-edit-btn"
                      aria-pressed={sectionsPerCardEditMode}
                      onClick={() => setSectionsPerCardEditMode((v) => !v)}
                    >
                      <span className="material-symbols-outlined" aria-hidden>
                        edit
                      </span>
                      <span>{sectionsPerCardEditMode ? 'Done' : 'Edit sections'}</span>
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="ac-sections-row">
                {(sectionsForSelected ?? []).map((sec) => (
                  <div
                    key={sec.id}
                    className={`ac-section-card-wrap${sectionsPerCardEditMode ? ' ac-section-card-wrap--edit-mode' : ''}`}
                  >
                    <div className="ac-section-card-actions">
                      {sectionsPerCardEditMode ? (
                        <button
                          type="button"
                          className="ac-section-action-btn"
                          aria-label={`Edit ${sec.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSection(sec);
                          }}
                        >
                          <span className="material-symbols-outlined" aria-hidden>
                            edit
                          </span>
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="ac-section-action-btn ac-section-action-btn--danger"
                        aria-label={`Delete ${sec.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSection(sec.id);
                        }}
                      >
                        <span className="material-symbols-outlined" aria-hidden>
                          delete
                        </span>
                      </button>
                    </div>
                    <ClassCard
                      variant="section"
                      pill={sec.pill}
                      title={sec.title}
                      count={sec.count}
                      onClick={() => goToSectionRoster(sec.id)}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="ac-class-card ac-section-card add-card"
                  aria-label="Add new section"
                  onClick={() => setShowAddSectionModal(true)}
                >
                  <span className="material-symbols-outlined" aria-hidden>
                    add_circle_outline
                  </span>
                  <p>Add New Section</p>
                </button>
              </div>
            </div>
          </section>
        ) : null}
      </section>

      <section className="ac-modern-insights">
        <article className="promo-card">
          <span className="tag">Promotion Window</span>
          <h3>Academic Promotion Period Active</h3>
          <p>Bulk promote eligible students to the next level after final review.</p>
          <button type="button">Start Promotion Flow</button>
        </article>
      </section>

      {showAddSectionModal ? (
        <div className="section-modal-backdrop" role="presentation" onClick={closeAddSectionModal}>
          <div
            className="section-modal-card"
            role="dialog"
            aria-labelledby="add-section-modal-title"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="add-section-modal-title" style={{ fontWeight: 600, margin: '0 0 8px' }}>
              Add New Section
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#414751' }}>
              This section will be added under {selectedClass ? selectedClass.label : 'the selected class'}.
            </p>
            <input
              type="text"
              placeholder="e.g. Section C"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              style={inputStyle}
              autoFocus
              aria-label="Section name"
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 12,
                marginTop: 24,
              }}
            >
              <button
                type="button"
                onClick={closeAddSectionModal}
                className="ac-modal-btn ac-modal-btn--ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAddSectionFromModal}
                className="ac-modal-btn ac-modal-btn--primary"
              >
                Add Section
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showAddClassModal ? (
        <div className="section-modal-backdrop" role="presentation" onClick={closeAddClassModal}>
          <div
            className="add-class-modal-card"
            role="dialog"
            aria-labelledby="add-class-modal-title"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="add-class-modal-title" style={{ fontWeight: 600, margin: '0 0 8px' }}>
              Add New Class
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <label style={{ display: 'block' }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Class Name
                </span>
                <input
                  type="text"
                  placeholder="e.g. Class 11"
                  required
                  value={newClassForm.name}
                  onChange={(e) => setNewClassForm((f) => ({ ...f, name: e.target.value }))}
                  style={inputStyle}
                  aria-invalid={Boolean(addClassFieldErrors.name)}
                  aria-describedby={addClassFieldErrors.name ? 'add-class-name-err' : undefined}
                />
                {addClassFieldErrors.name ? (
                  <p id="add-class-name-err" className="modal-field-error">
                    {addClassFieldErrors.name}
                  </p>
                ) : null}
              </label>
              <label style={{ display: 'block' }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Class Code / Label
                </span>
                <input
                  type="text"
                  placeholder="e.g. 11"
                  maxLength={4}
                  required
                  value={newClassForm.code}
                  onChange={(e) => setNewClassForm((f) => ({ ...f, code: e.target.value }))}
                  style={inputStyle}
                  aria-invalid={Boolean(addClassFieldErrors.code)}
                  aria-describedby={addClassFieldErrors.code ? 'add-class-code-err' : undefined}
                />
                {addClassFieldErrors.code ? (
                  <p id="add-class-code-err" className="modal-field-error">
                    {addClassFieldErrors.code}
                  </p>
                ) : null}
              </label>
              <label style={{ display: 'block' }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Number of Sections
                </span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={newClassForm.sections}
                  onChange={(e) =>
                    setNewClassForm((f) => ({
                      ...f,
                      sections: Number(e.target.value) || 1,
                    }))
                  }
                  style={inputStyle}
                  aria-label="Number of sections"
                />
              </label>
              <label style={{ display: 'block' }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Class Teacher Name
                </span>
                <input
                  type="text"
                  placeholder="e.g. Mrs. Sharma"
                  value={newClassForm.teacher}
                  onChange={(e) => setNewClassForm((f) => ({ ...f, teacher: e.target.value }))}
                  style={inputStyle}
                />
              </label>
              <label style={{ display: 'block' }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Description
                </span>
                <textarea
                  placeholder="Optional notes..."
                  rows={2}
                  value={newClassForm.description}
                  onChange={(e) => setNewClassForm((f) => ({ ...f, description: e.target.value }))}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                />
              </label>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 12,
                marginTop: 24,
              }}
            >
              <button type="button" onClick={closeAddClassModal} className="ac-modal-btn ac-modal-btn--ghost">
                Cancel
              </button>
              <button type="button" onClick={handleCreateClass} className="ac-modal-btn ac-modal-btn--primary">
                Create Class
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
