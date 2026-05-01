import React from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';

export const FinancialServicesLayout = () => {
  // Important: keep PageLayout's Outlet context (setNavTitle) working for nested pages.
  const outletContext = useOutletContext();
  return <Outlet context={outletContext} />;
};

