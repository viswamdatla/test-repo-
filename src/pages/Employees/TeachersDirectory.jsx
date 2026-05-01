import React from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { TeachersStaffDirectory } from './TeachersStaffDirectory';

export const TeachersDirectory = () => {
  usePageTitle('Staff Directory');

  return <TeachersStaffDirectory />;
};
