import React from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { EmployeesDirectoryView } from './EmployeesDirectoryView';
import './EmployeesDirectory.scss';

export const TeachersDirectory = () => {
  usePageTitle('Employees');

  return (
    <EmployeesDirectoryView section="teachers" />
  );
};
