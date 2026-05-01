import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import './PageLayout.scss';

export const PageLayout = () => {
  const [navTitle, setNavTitle] = useState('Dashboard');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const hideAdmissionFab = pathname.includes('/employees/teachers/onboarding');

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <Navbar title={navTitle} />
        <Outlet context={{ setNavTitle }} />
      </main>
      
      {!hideAdmissionFab && (
        <button
          type="button"
          className="fab-btn bg-gradient-primary"
          aria-label="Go to Admission page"
          onClick={() => navigate('/admission')}
        >
          <span className="material-symbols-outlined fab-icon">add</span>
          <span className="fab-tooltip">New Admission</span>
        </button>
      )}
    </div>
  );
};
