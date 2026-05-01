import React from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { EmployeesDirectoryView } from './EmployeesDirectoryView';
import './EmployeesDirectory.scss';

export const OperationalStaffDirectory = () => {
  usePageTitle('Operational Staff Directory');

  return (
    <EmployeesDirectoryView
      section="operational"
      title="Operational Staff Directory"
      subtitle="Monitor technical facilities, security teams, and support operations across campus."
    />
  );
};

