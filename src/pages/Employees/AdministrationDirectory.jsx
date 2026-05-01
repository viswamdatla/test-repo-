import React from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { EmployeesDirectoryView } from './EmployeesDirectoryView';
import './EmployeesDirectory.scss';

export const AdministrationDirectory = () => {
  usePageTitle('Administration Directory');

  return (
    <EmployeesDirectoryView
      section="administration"
      title="Administration Directory"
      subtitle="View and manage administrative staff, roles, departments, and contact details."
    />
  );
};

