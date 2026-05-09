import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import './PageLayout.scss';

export const PageLayout = () => {
  const [navTitle, setNavTitle] = useState('Dashboard');
  const { pathname } = useLocation();
  const isCollectFeeFullscreen = pathname.includes('/financial-services/collect-fee');

  return (
    <div className={`page-layout${isCollectFeeFullscreen ? ' page-layout--collect-fee-fullscreen' : ''}`}>
      {!isCollectFeeFullscreen && <Sidebar />}
      <main className={`main-content${isCollectFeeFullscreen ? ' main-content--collect-fee-fullscreen' : ''}`}>
        {!isCollectFeeFullscreen && <Navbar title={navTitle} />}
        <Outlet context={{ setNavTitle }} />
      </main>
    </div>
  );
};
