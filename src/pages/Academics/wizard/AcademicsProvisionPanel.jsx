import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addClassToStage,
  addSectionToClass,
  removeClassFromStage,
  removeSectionFromClass,
  selectAcademicsStructure,
  selectStageOrder,
} from '../../../store/academics/academicsSlice';

export const AcademicsProvisionPanel = () => {
  const dispatch = useDispatch();
  const stageOrder = useSelector(selectStageOrder);
  const structure = useSelector(selectAcademicsStructure);
  const [stage, setStage] = useState(stageOrder[0] ?? 'Pre Primary');
  const classes = useMemo(
    () => structure.stages?.[stage]?.classes?.map((c) => c.name) ?? [],
    [structure, stage]
  );
  const [className, setClassName] = useState(classes[0] ?? '');
  const sections = useMemo(
    () => structure.stages?.[stage]?.classes?.find((c) => c.name === className)?.sections ?? [],
    [structure, stage, className]
  );
  const [newClassName, setNewClassName] = useState('');
  const [newSectionName, setNewSectionName] = useState('');

  const removeClass = (name) => {
    dispatch(removeClassFromStage({ stage, className: name }));
    if (name === className) setClassName('');
  };

  return (
    <section className="sm-admin-panel">
      <h3>Superadmin Class & Section Provision</h3>
      <p>Add or remove classes and sections. Tiles update immediately across Student Management, Attendance, and Grades.</p>

      <div className="sm-admin-grid">
        <label>
          Stage
          <select value={stage} onChange={(e) => setStage(e.target.value)}>
            {stageOrder.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          Class
          <select value={className} onChange={(e) => setClassName(e.target.value)}>
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="sm-admin-actions">
        <input
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
          placeholder="New class name"
        />
        <button
          type="button"
          onClick={() => {
            dispatch(addClassToStage({ stage, className: newClassName }));
            setNewClassName('');
          }}
        >
          Add Class
        </button>
      </div>

      <div className="sm-admin-chip-list">
        {classes.map((c) => (
          <span className="sm-admin-chip" key={c}>
            {c}
            <button type="button" onClick={() => removeClass(c)}>
              remove
            </button>
          </span>
        ))}
      </div>

      {className && (
        <>
          <div className="sm-admin-actions">
            <input
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="New section label"
            />
            <button
              type="button"
              onClick={() => {
                dispatch(addSectionToClass({ stage, className, sectionName: newSectionName }));
                setNewSectionName('');
              }}
            >
              Add Section
            </button>
          </div>
          <div className="sm-admin-chip-list">
            {sections.map((s) => (
              <span className="sm-admin-chip" key={s}>
                {s}
                <button
                  type="button"
                  onClick={() => dispatch(removeSectionFromClass({ stage, className, sectionName: s }))}
                >
                  remove
                </button>
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

