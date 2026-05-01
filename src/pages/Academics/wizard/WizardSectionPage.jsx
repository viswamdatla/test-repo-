import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { selectAcademicsSectionItems, selectAcademicsStructure } from '../../../store/academics/academicsSlice';
import { classLevelToSlug, classesForStageSlug, sectionToSlug, slugToClassLevel, slugToStage } from '../studentManagement/studentManagementConfig';
import { useAcademicsWizardMeta } from './useAcademicsWizardMeta';
import '../AcademicsPages.scss';
import '../studentManagement/StudentManagementFlow.scss';

const BRANCHES = ['Darga', 'Main Campus', 'North Block'];

export const WizardSectionPage = () => {
  const { stageSlug, classSlug } = useParams();
  const { wizardBase } = useOutletContext();
  const { sectionTileCaption } = useAcademicsWizardMeta();
  const navigate = useNavigate();
  const structure = useSelector(selectAcademicsStructure);
  const students = useSelector((s) => selectAcademicsSectionItems(s, 'students'));
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [quickEnroll, setQuickEnroll] = useState('');
  const stage = slugToStage(stageSlug);
  const allowed = useMemo(() => classesForStageSlug(stageSlug, structure), [stageSlug, structure]);
  const classLevel = slugToClassLevel(classSlug, allowed);
  const validClass = classLevel && allowed.includes(classLevel);
  const sections = useMemo(
    () => structure.stages?.[stage]?.classes?.find((c) => c.name === classLevel)?.sections ?? [],
    [structure, stage, classLevel]
  );
  const classStudentCounts = useMemo(() => {
    const out = {};
    students.forEach((s) => {
      if (s.stage !== stage) return;
      out[s.classLevel] = (out[s.classLevel] || 0) + 1;
    });
    return out;
  }, [students, stage]);
  const sectionStudentCounts = useMemo(() => {
    const out = {};
    students.forEach((s) => {
      if (s.stage !== stage || s.classLevel !== classLevel) return;
      out[s.section] = (out[s.section] || 0) + 1;
    });
    return out;
  }, [students, stage, classLevel]);
  const visibleClasses = useMemo(() => {
    const q = quickEnroll.trim().toLowerCase();
    if (!q) return allowed;
    return allowed.filter((cl) => cl.toLowerCase().includes(q));
  }, [allowed, quickEnroll]);
  const visibleSections = useMemo(() => {
    const q = quickEnroll.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter((sec) => sec.toLowerCase().includes(q));
  }, [sections, quickEnroll]);

  usePageTitle(validClass ? `${classLevel} — Sections` : 'Academics');

  useEffect(() => {
    if (!stage) {
      navigate(wizardBase, { replace: true });
      return;
    }
    if (!validClass) {
      navigate(`${wizardBase}/${stageSlug}`, { replace: true });
    }
  }, [stage, validClass, navigate, wizardBase, stageSlug]);

  if (!stage || !validClass) return null;

  return (
    <div className="sm-card sm-order-page">
      <p className="sm-order-breadcrumb">Orders &gt; New Selection &gt; {stage}</p>
      <button type="button" className="sm-back" onClick={() => navigate(`${wizardBase}/${stageSlug}`)}>
        <span className="material-symbols-outlined">arrow_back</span>
        Classes
      </button>
      <div className="sm-order-header">
        <div>
          <h1>New Order Selection</h1>
          <p>Choose a class to begin the enrollment kit distribution</p>
        </div>
        <div className="sm-order-controls">
          <label>
            Select Branch
            <select value={branch} onChange={(e) => setBranch(e.target.value)}>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
          <label>
            Quick Enroll
            <input
              value={quickEnroll}
              onChange={(e) => setQuickEnroll(e.target.value)}
              placeholder="Search class / section..."
            />
          </label>
        </div>
      </div>

      <div className="sm-class-grid">
        {visibleClasses.map((cl) => (
          <button
            key={cl}
            type="button"
            className={`sm-class-tile ${cl === classLevel ? 'active' : ''}`}
            onClick={() => navigate(`${wizardBase}/${stageSlug}/${classLevelToSlug(cl)}`)}
          >
            <div className="badge">{cl.replace('Class ', '')}</div>
            <div className="name">{cl}</div>
            <div className="count">{classStudentCounts[cl] || 0} Students</div>
          </button>
        ))}
      </div>

      <section className="sm-sections-panel">
        <header>
          <h3>Sections for {classLevel}</h3>
          <span className="sm-sections-count">{visibleSections.length} AVAILABLE</span>
        </header>
        <div className="sm-sections-row">
          {visibleSections.map((sec) => (
            <button
              key={sec}
              type="button"
              className="sm-section-card"
              onClick={() => navigate(`${wizardBase}/${stageSlug}/${classSlug}/${sectionToSlug(sec)}`)}
            >
              <div className="left">
                <span className="avatar">{sec}</span>
                <div>
                  <p className="title">Section {sec}</p>
                  <p className="meta">{sectionStudentCounts[sec] || 0} Students</p>
                </div>
              </div>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          ))}
          {visibleSections.length === 0 && (
            <p className="sm-empty-hint">No sections match this search. {sectionTileCaption}</p>
          )}
        </div>
      </section>
    </div>
  );
};
