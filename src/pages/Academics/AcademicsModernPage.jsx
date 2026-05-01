import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle';
import { ClassCard } from './ClassCard';
import { CLASS_CARDS } from './classSectionRegistry';
import './AcademicsModernPage.scss';

const PAGE_META = {
  studentManagement: {
    title: 'Student Management',
    subtitle: 'Organize and manage school enrollment by academic level.',
    cta: 'Add Student',
  },
  attendance: {
    title: 'Attendance',
    subtitle: 'Track daily attendance, monitor trends, and identify at-risk students.',
    cta: 'Mark Attendance',
  },
  grades: {
    title: 'Grades',
    subtitle: 'Manage assessments, publish marksheets, and monitor performance.',
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
    if (typeof globalThis === 'undefined' || !globalThis.matchMedia) return 6;
    if (globalThis.matchMedia('(min-width: 1200px)').matches) return 6;
    if (globalThis.matchMedia('(min-width: 900px)').matches) return 4;
    return 2;
  });

  useEffect(() => {
    const mqLg = globalThis.matchMedia('(min-width: 1200px)');
    const mqMd = globalThis.matchMedia('(min-width: 900px)');
    const update = () => {
      if (mqLg.matches) setItemsPerRow(6);
      else if (mqMd.matches) setItemsPerRow(4);
      else setItemsPerRow(2);
    };
    update();
    mqLg.addEventListener('change', update);
    mqMd.addEventListener('change', update);
    return () => {
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

export const AcademicsModernPage = ({ pageKey }) => {
  const meta = PAGE_META[pageKey] ?? PAGE_META.studentManagement;
  usePageTitle(meta.title);
  const navigate = useNavigate();

  const itemsPerRow = useItemsPerRow();
  const [selectedClassCode, setSelectedClassCode] = useState(null);
  const [sectionsByClass, setSectionsByClass] = useState({});

  const gridItems = useMemo(
    () => [...CLASS_CARDS.map((c) => ({ kind: 'class', ...c })), { kind: 'add', id: 'add-new-class' }],
    [],
  );

  const rows = useMemo(() => chunkItems(gridItems, itemsPerRow), [gridItems, itemsPerRow]);

  const classByCode = useMemo(() => {
    const m = new Map();
    CLASS_CARDS.forEach((c) => m.set(c.code, c));
    return m;
  }, []);

  const handleClassClick = useCallback(
    (code) => {
      setSelectedClassCode((prev) => (prev === code ? null : code));
    },
    [],
  );

  const goToSectionRoster = useCallback(
    (sectionDbId) => {
      navigate(`/academics/student-management/section/${encodeURIComponent(sectionDbId)}`);
    },
    [navigate],
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

  const handleAddSectionClick = useCallback(() => {
    if (!selectedClassCode) return;
    setSectionsByClass((prev) => {
      const list = [...(prev[selectedClassCode] ?? [])];
      const pill = nextAvailablePill(list.map((s) => s.pill));
      const id = `${selectedClassCode}-${pill}`;
      const next = [
        ...list,
        {
          id,
          pill,
          title: `Section ${pill}`,
          count: 0,
        },
      ];
      return { ...prev, [selectedClassCode]: next };
    });
  }, [selectedClassCode]);

  const panelLabel = selectedClass
    ? `Sections for ${selectedClass.label}`
    : 'Class sections';

  return (
    <div className="ac-modern-page">
      <nav className="ac-modern-breadcrumb" aria-label="Breadcrumb">
        <span>Academics</span>
        <span className="material-symbols-outlined">chevron_right</span>
        <span className="current">{meta.title}</span>
      </nav>

      <header className="ac-modern-header">
        <div>
          <h1>{meta.title}</h1>
          <p>{meta.subtitle}</p>
        </div>
        <div className="actions">
          <button type="button" className="ghost-btn">
            <span className="material-symbols-outlined">filter_list</span>
            <span>Filter View</span>
          </button>
          <button type="button" className="primary-btn">
            <span className="material-symbols-outlined">add_circle</span>
            <span>{meta.cta}</span>
          </button>
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
              </div>
              <div className="ac-sections-row">
                {(sectionsForSelected ?? []).map((sec) => (
                  <div key={sec.id} className="ac-section-card-wrap">
                    <div className="ac-section-card-actions">
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
                  onClick={handleAddSectionClick}
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
    </div>
  );
};
