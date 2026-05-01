import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { usePageTitle } from '../../../hooks/usePageTitle';
import {
  fetchAcademicsData,
  selectAcademicsStructure,
  selectAcademicsSectionItems,
  selectAcademicsSectionUi,
  selectAcademicsStatus,
  selectClassSections,
  setSectionPage,
  setSectionSearchQuery,
  setSectionStatusFilter,
} from '../../../store/academics/academicsSlice';
import {
  flattenAllClassNames,
  resolveStageForClass,
  sectionFromSlug,
  slugToClassLevel,
} from '../studentManagement/studentManagementConfig';
import { useAcademicsWizardMeta } from './useAcademicsWizardMeta';
import '../../../styles/DataTable.scss';
import '../AcademicsPages.scss';
import '../studentManagement/StudentManagementFlow.scss';

const pillClass = (status) => {
  const key = (status || '').toLowerCase();
  if (key === 'active' || key === 'present' || key === 'published') return 'pill-approved';
  if (key === 'pending' || key === 'late') return 'pill-pending';
  if (key === 'absent' || key === 'archived') return 'pill-rejected';
  return 'pill-approved';
};

export const WizardRecordsPage = ({ reduxSection, columns, rowRenderer }) => {
  const { classSlug, sectionSlug } = useParams();
  const { wizardBase } = useOutletContext();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { navRootTitle, recordsSubtitle, recordsEmpty } = useAcademicsWizardMeta();
  const loadStatus = useSelector(selectAcademicsStatus);
  const items = useSelector((s) => selectAcademicsSectionItems(s, reduxSection));
  const ui = useSelector((s) => selectAcademicsSectionUi(s, reduxSection));
  const structure = useSelector(selectAcademicsStructure);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const allClasses = useMemo(() => flattenAllClassNames(structure), [structure]);
  const classLevel = slugToClassLevel(classSlug, allClasses);
  const stage = useMemo(
    () => (classLevel ? resolveStageForClass(structure, classLevel) : null),
    [structure, classLevel]
  );
  const sections = useSelector((s) => selectClassSections(s, stage, classLevel));
  const section = sectionFromSlug(sectionSlug, sections);
  const validClass = Boolean(classLevel && allClasses.includes(classLevel));

  useEffect(() => {
    if (loadStatus === 'idle') dispatch(fetchAcademicsData());
  }, [dispatch, loadStatus]);

  useEffect(() => {
    if (!validClass || !stage) {
      navigate(wizardBase, { replace: true });
      return;
    }
    if (!section) {
      navigate(`${wizardBase}/${classSlug}`, { replace: true });
    }
  }, [stage, validClass, section, navigate, wizardBase, classSlug]);

  usePageTitle(section && classLevel ? `${classLevel} ${section} — ${navRootTitle}` : navRootTitle);

  const filteredItems = useMemo(() => {
    if (!stage || !classLevel || !section) return [];
    const q = ui.searchQuery.trim().toLowerCase();
    return items.filter((it) => {
      const statusMatch = ui.statusFilter === 'all' ? true : (it.status || '').toLowerCase() === ui.statusFilter.toLowerCase();
      if (!statusMatch) return false;
      if ((it.classLevel || '') !== classLevel) return false;
      if ((it.section || '') !== section) return false;
      if (!q) return true;
      return Object.values(it).join(' ').toLowerCase().includes(q);
    });
  }, [items, stage, classLevel, section, ui.searchQuery, ui.statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / ui.pageSize));
  const startIndex = (ui.page - 1) * ui.pageSize;
  const pageItems = filteredItems.slice(startIndex, startIndex + ui.pageSize);
  const endIndex = Math.min(startIndex + ui.pageSize, filteredItems.length);

  useEffect(() => {
    if (ui.page > pageCount) dispatch(setSectionPage({ section: reduxSection, value: pageCount }));
  }, [ui.page, pageCount, dispatch, reduxSection]);

  const pages = useMemo(() => {
    if (pageCount <= 3) return Array.from({ length: pageCount }, (_, i) => i + 1);
    const start = Math.max(1, Math.min(ui.page - 1, pageCount - 2));
    return [start, start + 1, start + 2];
  }, [ui.page, pageCount]);

  const statusOptions = ['all', ...Array.from(new Set(items.map((x) => x.status).filter(Boolean)))];

  if (!stage || !validClass || !section) return null;

  return (
    <div className="sm-card">
      <button type="button" className="sm-back" onClick={() => navigate(`${wizardBase}/${classSlug}`)}>
        <span className="material-symbols-outlined">arrow_back</span>
        Sections
      </button>
      <h1>
        {classLevel} — Section {section}
      </h1>
      <p className="sm-sub">{recordsSubtitle}</p>
      {loadStatus === 'loading' && <p className="sm-loading">Loading…</p>}

      <section className="oe-log academ-log acad-wizard-records">
        <div className="oe-log-actions">
          <div className="oe-search-filter">
            <div className="oe-search">
              <span className="material-symbols-outlined">search</span>
              <input
                value={ui.searchQuery}
                onChange={(e) => dispatch(setSectionSearchQuery({ section: reduxSection, value: e.target.value }))}
                placeholder="Search..."
              />
            </div>
            <div className="oe-filter-wrap">
              <button className="oe-filter-btn" type="button" onClick={() => setIsFilterOpen((v) => !v)}>
                <span className="material-symbols-outlined">filter_list</span>
                Filters
              </button>
              {isFilterOpen && (
                <div className="oe-filter-menu">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`oe-filter-opt ${ui.statusFilter === opt ? 'active' : ''}`}
                      onClick={() => {
                        dispatch(setSectionStatusFilter({ section: reduxSection, value: opt }));
                        setIsFilterOpen(false);
                      }}
                    >
                      {opt === 'all' ? 'All statuses' : opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="oe-table-scroll">
          <table className="oe-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageItems.map((item) => rowRenderer(item, pillClass))}
              {loadStatus !== 'loading' && pageItems.length === 0 && (
                <tr>
                  <td className="oe-empty" colSpan={columns.length}>
                    {recordsEmpty || 'No records found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="oe-pagination">
          <p className="oe-pagination-text">
            Showing {filteredItems.length === 0 ? 0 : startIndex + 1} to {endIndex} of {filteredItems.length} entries
          </p>
          <div className="oe-pagination-controls">
            <button
              type="button"
              className="oe-page-btn"
              onClick={() => dispatch(setSectionPage({ section: reduxSection, value: Math.max(1, ui.page - 1) }))}
              disabled={ui.page === 1}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {pages.map((p) => (
              <button
                key={p}
                type="button"
                className={`oe-page-btn ${p === ui.page ? 'active' : ''}`}
                onClick={() => dispatch(setSectionPage({ section: reduxSection, value: p }))}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              className="oe-page-btn"
              onClick={() => dispatch(setSectionPage({ section: reduxSection, value: Math.min(pageCount, ui.page + 1) }))}
              disabled={ui.page === pageCount}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
