import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getWizardMeta } from './wizardMeta';

export const useAcademicsWizardMeta = () => {
  const { pathname } = useLocation();
  return useMemo(() => getWizardMeta(pathname), [pathname]);
};
