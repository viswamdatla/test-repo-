import React from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';

export const AcademicsLayout = () => {
  const outletContext = useOutletContext();
  return <Outlet context={outletContext} />;
};

