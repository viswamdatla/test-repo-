import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle';
import { fetchEmployeesData, selectEmployeesSectionItems, selectEmployeesStatus } from '../../store/employees/employeesSlice';
import './EmployeeDetailPage.scss';

const sectionTitle = (section) => {
  if (section === 'teachers') return 'Teacher Profile';
  if (section === 'administration') return 'Administration Profile';
  if (section === 'operational') return 'Operational Staff Profile';
  return 'Employee Profile';
};

const detailFieldsFor = (employee, section) => {
  if (!employee) return [];
  const common = [
    { label: 'Name', value: employee.name },
    { label: 'Employee ID', value: employee.empId },
    { label: 'Role', value: employee.role },
    { label: 'Department', value: employee.department },
    { label: 'Email', value: employee.email },
    { label: 'Phone', value: employee.phone },
    { label: 'Current Status', value: employee.status },
  ];
  if (section === 'teachers') {
    return [
      ...common,
      { label: 'Teacher Category', value: employee.category },
      { label: 'Role Detail', value: employee.roleDetail },
    ];
  }
  if (section === 'operational') {
    return [...common, { label: 'Shift Time', value: employee.shift }];
  }
  return common;
};

const metaFromEmployee = (employee) => {
  const token = String(employee?.empId || employee?.id || '');
  const score = [...token].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const totalLeaves = (score % 8) + 1;
  const approvalStatus = score % 3 === 0 ? 'Rejected' : 'Approved';
  return { totalLeaves, approvalStatus };
};

export const EmployeeDetailPage = () => {
  const { section, employeeId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loadStatus = useSelector(selectEmployeesStatus);
  const items = useSelector((state) => selectEmployeesSectionItems(state, section || 'teachers'));

  usePageTitle('Employee Details');

  useEffect(() => {
    if (loadStatus === 'idle') dispatch(fetchEmployeesData());
  }, [dispatch, loadStatus]);

  const employee = useMemo(() => items.find((it) => String(it.id) === String(employeeId)), [items, employeeId]);
  const { totalLeaves, approvalStatus } = useMemo(() => metaFromEmployee(employee), [employee]);
  const detailFields = useMemo(() => detailFieldsFor(employee, section), [employee, section]);
  const [leaveFilter, setLeaveFilter] = useState('1w');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const filteredLeaves = useMemo(() => {
    if (!totalLeaves) return 0;
    if (leaveFilter === '1d') return Math.max(0, Math.min(totalLeaves, 1));
    if (leaveFilter === '1w') return Math.max(0, Math.min(totalLeaves, 2));
    if (leaveFilter === '1m') return totalLeaves;
    if (leaveFilter === 'custom') {
      if (!customFrom || !customTo) return totalLeaves;
      const from = new Date(customFrom);
      const to = new Date(customTo);
      if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) return 0;
      const diffDays = Math.max(1, Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1);
      const scaled = Math.round((totalLeaves * Math.min(diffDays, 30)) / 30);
      return Math.max(0, Math.min(totalLeaves, scaled));
    }
    return totalLeaves;
  }, [totalLeaves, leaveFilter, customFrom, customTo]);

  if (loadStatus === 'loading' && !employee) {
    return <div className="emp-detail-page">Loading employee details...</div>;
  }

  if (!employee) {
    return (
      <div className="emp-detail-page">
        <button type="button" className="emp-detail-back" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </button>
        <div className="emp-detail-empty">Employee not found.</div>
      </div>
    );
  }

  return (
    <div className="emp-detail-page">
      <div className="emp-detail-head">
        <button type="button" className="emp-detail-back" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </button>
        <h1>{sectionTitle(section)}</h1>
        <p>{employee.name}</p>
      </div>

      <section className="emp-detail-top-metrics">
        <div className="emp-detail-filter-row">
          <label htmlFor="leave-filter">Filter</label>
          <select id="leave-filter" value={leaveFilter} onChange={(e) => setLeaveFilter(e.target.value)}>
            <option value="1d">1 Day</option>
            <option value="1w">1 Week</option>
            <option value="1m">1 Month</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        {leaveFilter === 'custom' && (
          <div className="emp-detail-custom-range">
            <div className="emp-detail-custom-field">
              <label htmlFor="custom-from">From</label>
              <input id="custom-from" type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
            </div>
            <div className="emp-detail-custom-field">
              <label htmlFor="custom-to">To</label>
              <input id="custom-to" type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
            </div>
          </div>
        )}
        <div className="emp-detail-metric">
          <span>Total Leaves</span>
          <strong>{filteredLeaves}</strong>
        </div>
        <div className="emp-detail-metric">
          <span>Approve / Reject Status</span>
          <strong className={approvalStatus === 'Approved' ? 'is-approved' : 'is-rejected'}>{approvalStatus}</strong>
        </div>
      </section>

      <section className="emp-detail-card">
        <h2>Employee Details</h2>
        <div className="emp-detail-grid">
          {detailFields.map((field) => (
            <div key={field.label} className="emp-detail-field">
              <span>{field.label}</span>
              <p>{field.value || '—'}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

