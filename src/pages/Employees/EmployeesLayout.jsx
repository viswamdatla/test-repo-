import React from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';

export const EmployeesLayout = () => {
  const outletContext = useOutletContext();
  return <Outlet context={outletContext} />;
};

