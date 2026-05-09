import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.scss';

const BRANCHES = ['Darga', 'Main Campus', 'North Block'];

export const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => sessionStorage.getItem('sidebarCollapsed') === '1');
  const [selectedBranch, setSelectedBranch] = useState(() => {
    const stored = sessionStorage.getItem('selectedBranch');
    return stored && BRANCHES.includes(stored) ? stored : BRANCHES[0];
  });
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
  const branchBtnRef = useRef(null);
  const branchMenuRef = useRef(null);

  const isInFinancialServices = useMemo(
    () => location.pathname.startsWith('/financial-services'),
    [location.pathname]
  );
  const isInEmployees = useMemo(() => location.pathname.startsWith('/employees'), [location.pathname]);
  const isInAcademics = useMemo(() => location.pathname.startsWith('/academics'), [location.pathname]);

  const persistBranch = (next) => {
    setSelectedBranch(next);
    sessionStorage.setItem('selectedBranch', next);
    globalThis.dispatchEvent(new CustomEvent('branch:change', { detail: next }));
  };

  // Allow the Academics wizard to update the sidebar branch and keep both UIs in sync.
  useEffect(() => {
    const handler = (e) => {
      const next = e?.detail;
      if (typeof next === 'string' && BRANCHES.includes(next)) {
        setSelectedBranch(next);
        sessionStorage.setItem('selectedBranch', next);
      }
    };
    globalThis.addEventListener('branch:change', handler);
    return () => globalThis.removeEventListener('branch:change', handler);
  }, []);

  // Close branch menu on outside click.
  useEffect(() => {
    if (!isBranchMenuOpen) return;
    const onPointerDown = (e) => {
      const target = e.target;
      if (branchBtnRef.current?.contains(target)) return;
      if (branchMenuRef.current?.contains(target)) return;
      setIsBranchMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [isBranchMenuOpen]);

  return (
    <aside className={`sidebar${isCollapsed ? ' sidebar--collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <h1>Campus360Pro</h1>
          <p>Institutional Management</p>
        </div>

        <button
          type="button"
          className="sidebar-collapse-toggle"
          onClick={() => {
            const next = !isCollapsed;
            setIsCollapsed(next);
            sessionStorage.setItem('sidebarCollapsed', next ? '1' : '0');
          }}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="material-symbols-outlined" aria-hidden>
            menu
          </span>
        </button>
      </div>
      <nav className="sidebar-nav">
        <NavLink
          to="/"
          end
          data-tooltip="Dashboard"
          aria-label="Dashboard"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="nav-label">Dashboard</span>
        </NavLink>

        <NavLink
          to="/admission"
          data-tooltip="Admission"
          aria-label="Admission"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          <span className="material-symbols-outlined">person_add</span>
          <span className="nav-label">Admission</span>
        </NavLink>

        <NavLink
          to="/employees/teachers"
          data-tooltip="Employees"
          aria-label="Employees"
          className={`nav-link ${isInEmployees ? 'active' : ''}`}
        >
            <span className="material-symbols-outlined">group</span>
            <span className="nav-label">Employees</span>
        </NavLink>

        <NavLink
          to="/financial-services"
          data-tooltip="Financial Services"
          aria-label="Financial Services"
          className={`nav-link ${isInFinancialServices ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">payments</span>
          <span className="nav-label">Financial Services</span>
        </NavLink>

        <NavLink
          to="/academics"
          data-tooltip="Academics"
          aria-label="Academics"
          className={`nav-link ${isInAcademics ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">school</span>
          <span className="nav-label">Academics</span>
        </NavLink>

        <NavLink
          to="/user-management"
          data-tooltip="User Management"
          aria-label="User Management"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          <span className="material-symbols-outlined">manage_accounts</span>
          <span className="nav-label">User Management</span>
        </NavLink>

        <NavLink
          to="/settings"
          data-tooltip="Settings"
          aria-label="Settings"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="nav-label">Settings</span>
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <button
          ref={branchBtnRef}
          type="button"
          className="branch-btn bg-gradient-primary"
          onClick={() => setIsBranchMenuOpen((v) => !v)}
          aria-label="Select Branch"
          aria-expanded={isBranchMenuOpen}
          data-tooltip={`Branch: ${selectedBranch}`}
        >
          <span className="material-symbols-outlined shrink-icon">account_tree</span>
          <span className="branch-btn__label">{selectedBranch}</span>
          <span className="material-symbols-outlined branch-btn__chevron">unfold_more</span>
        </button>

        {isBranchMenuOpen && (
          <div className="branch-menu" ref={branchMenuRef} role="menu" aria-label="Branches">
            {BRANCHES.map((b) => (
              <button
                key={b}
                type="button"
                className={`branch-menu__item${b === selectedBranch ? ' is-active' : ''}`}
                onClick={() => {
                  persistBranch(b);
                  setIsBranchMenuOpen(false);
                }}
                role="menuitem"
              >
                {b}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
