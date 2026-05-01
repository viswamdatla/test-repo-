import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { usePageTitle } from '../../../hooks/usePageTitle';
import {
  classLevelToSlug,
  flattenAllClassNames,
  resolveStageForClass,
  sectionToSlug,
  slugToClassLevel,
} from '../studentManagement/studentManagementConfig';
import {
  fetchAcademicsData,
  selectAcademicsStructure,
  selectAcademicsSectionItems,
  selectAcademicsStatus,
} from '../../../store/academics/academicsSlice';
import { AcademicsProvisionPanel } from './AcademicsProvisionPanel';
import { getWizardMeta } from './wizardMeta';
import '../AcademicsPages.scss';
import '../studentManagement/StudentManagementFlow.scss';

const countCaption = (key) => (key === 'students' ? 'Students' : 'Records');

export const AcademicsFlatGatewayPage = () => {
  const { classSlug } = useParams();
  const { pathname } = useLocation();
  const { wizardBase } = useOutletContext();
  const meta = getWizardMeta(pathname);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loadStatus = useSelector(selectAcademicsStatus);
  const structure = useSelector(selectAcademicsStructure);

  const countKey = pathname.startsWith('/academics/student-management')
    ? 'students'
    : pathname.startsWith('/academics/attendance')
      ? 'attendance'
      : 'grades';
  const showProvision = pathname.startsWith('/academics/student-management');

  const countItems = useSelector((s) => selectAcademicsSectionItems(s, countKey));
  const [quickEnroll, setQuickEnroll] = useState('');

  const allClasses = useMemo(() => flattenAllClassNames(structure), [structure]);
  const classLevel = classSlug ? slugToClassLevel(classSlug, allClasses) : null;
  const validClass = Boolean(classLevel && allClasses.includes(classLevel));
  const stage = useMemo(
    () => (classLevel ? resolveStageForClass(structure, classLevel) : null),
    [structure, classLevel]
  );
  const sections = useMemo(() => {
    if (!stage || !classLevel) return [];
    return structure.stages?.[stage]?.classes?.find((c) => c.name === classLevel)?.sections ?? [];
  }, [structure, stage, classLevel]);

  const classCounts = useMemo(() => {
    const out = {};
    countItems.forEach((row) => {
      const cl = row.classLevel;
      if (!cl) return;
      out[cl] = (out[cl] || 0) + 1;
    });
    return out;
  }, [countItems]);

  const sectionCounts = useMemo(() => {
    const out = {};
    countItems.forEach((row) => {
      if (row.classLevel !== classLevel) return;
      const sec = row.section || '';
      out[sec] = (out[sec] || 0) + 1;
    });
    return out;
  }, [countItems, classLevel]);

  const visibleClasses = useMemo(() => {
    const q = quickEnroll.trim().toLowerCase();
    if (!q) return allClasses;
    return allClasses.filter((cl) => cl.toLowerCase().includes(q));
  }, [allClasses, quickEnroll]);

  const visibleSections = useMemo(() => {
    const q = quickEnroll.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter((sec) => sec.toLowerCase().includes(q));
  }, [sections, quickEnroll]);

  usePageTitle(validClass ? `${classLevel} — Sections` : meta.navRootTitle);

  useEffect(() => {
    if (loadStatus === 'idle') dispatch(fetchAcademicsData());
  }, [dispatch, loadStatus]);

  useEffect(() => {
    if (!classSlug) return;
    if (!validClass) {
      navigate(wizardBase, { replace: true });
    }
  }, [classSlug, validClass, navigate, wizardBase]);

  const classNumLabel = (name) => {
    const m = /^Class\s+(\d+)/i.exec(name || '');
    return m ? m[1] : name?.replace(/\s+/g, '') || '—';
  };

  const title = meta.navRootTitle;
  const subtitle = meta.gatewaySubtitle || meta.classSubtitle;

  return (
    <div className="sm-card sm-order-page sm-student-gateway">
      <nav className="sm-gateway-breadcrumb" aria-label="Breadcrumb">
        <button type="button" className="sm-crumb" onClick={() => navigate('/academics')}>
          Academics
        </button>
        <span className="material-symbols-outlined sm-crumb-sep">chevron_right</span>
        <span className="sm-crumb sm-crumb-current">{title}</span>
        {validClass && (
          <>
            <span className="material-symbols-outlined sm-crumb-sep">chevron_right</span>
            <span className="sm-crumb sm-crumb-em">{classLevel}</span>
          </>
        )}
      </nav>

      <button type="button" className="sm-back" onClick={() => navigate(classSlug ? wizardBase : '/academics')}>
        <span className="material-symbols-outlined">arrow_back</span>
        {classSlug ? 'All classes' : 'Academics'}
      </button>

      <div className="sm-order-header">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="sm-order-controls sm-order-controls-single">
          <label htmlFor="flat-gateway-search">
            Quick search
            <div className="sm-quick-enroll-wrap">
              <span className="material-symbols-outlined sm-quick-enroll-icon">search</span>
              <input
                id="flat-gateway-search"
                value={quickEnroll}
                onChange={(e) => setQuickEnroll(e.target.value)}
                placeholder="Filter by class or section…"
                type="search"
              />
            </div>
          </label>
        </div>
      </div>

      <div className="sm-class-grid" role="list">
        {visibleClasses.map((cl) => {
          const active = validClass && cl === classLevel;
          return (
            <button
              key={cl}
              type="button"
              role="listitem"
              className={`sm-class-tile ${active ? 'active' : ''}`}
              onClick={() => navigate(`${wizardBase}/${classLevelToSlug(cl)}`)}
            >
              {active && (
                <span className="sm-class-tile-check material-symbols-outlined" aria-hidden>
                  check_circle
                </span>
              )}
              <div className="badge">{classNumLabel(cl)}</div>
              <div className="name">{cl}</div>
              <div className="count">
                {classCounts[cl] ?? 0} {countCaption(countKey)}
              </div>
            </button>
          );
        })}
      </div>

      {visibleClasses.length === 0 && <p className="sm-empty-hint">No classes match this search.</p>}

      {validClass && (
        <section className="sm-sections-panel">
          <header>
            <h3>
              <span className="material-symbols-outlined sm-sections-panel-icon">groups</span>
              Sections for {classLevel}
            </h3>
            <span className="sm-sections-count">{visibleSections.length} available</span>
          </header>
          <div className="sm-sections-row">
            {visibleSections.map((sec) => (
              <button
                key={sec}
                type="button"
                className="sm-section-card"
                onClick={() =>
                  navigate(`${wizardBase}/${classLevelToSlug(classLevel)}/${sectionToSlug(sec)}`)
                }
              >
                <div className="left">
                  <span className="avatar">{sec}</span>
                  <div>
                    <p className="title">Section {sec}</p>
                    <p className="meta">
                      {sectionCounts[sec] ?? 0} {countCaption(countKey)}
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            ))}
            {visibleSections.length === 0 && (
              <p className="sm-empty-hint">No sections for this class. Ask a superadmin to add sections.</p>
            )}
          </div>
        </section>
      )}

      {!classSlug && <p className="sm-gateway-hint">Select a class above to see its sections.</p>}

      {loadStatus === 'loading' && <p className="sm-loading">Loading…</p>}

      {showProvision && <AcademicsProvisionPanel />}
    </div>
  );
};
