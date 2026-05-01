import React from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { EmployeesDirectoryView } from './EmployeesDirectoryView';
import './EmployeesDirectory.scss';

export const AdministrationDirectory = () => {
  usePageTitle('Employees');

  return (
    <EmployeesDirectoryView section="administration" />
  );
};

