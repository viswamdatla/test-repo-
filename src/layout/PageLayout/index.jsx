import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import './PageLayout.scss';

export const PageLayout = () => {
  const [navTitle, setNavTitle] = useState('Dashboard');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isCollectFeeFullscreen = pathname.includes('/financial-services/collect-fee');
  const hideAdmissionFab =
    pathname.includes('/employees/teachers/onboarding') ||
    pathname.includes('/academics/student-management/section/') ||
    pathname.includes('/academics/time-table/section/') ||
    pathname.includes('/financial-services/collect-fee') ||
    /^\/academics\/attendance\/[^/]+\/[^/]+/.test(pathname) ||
    /^\/academics\/grades\/[^/]+\/[^/]+/.test(pathname);

  return (
    <div className={`page-layout${isCollectFeeFullscreen ? ' page-layout--collect-fee-fullscreen' : ''}`}>
      {!isCollectFeeFullscreen && <Sidebar />}
      <main className={`main-content${isCollectFeeFullscreen ? ' main-content--collect-fee-fullscreen' : ''}`}>
        {!isCollectFeeFullscreen && <Navbar title={navTitle} />}
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
