import React, { useMemo } from 'react';
import { Outlet, useLocation, useOutletContext } from 'react-router-dom';
import '../AcademicsPages.scss';
import '../studentManagement/StudentManagementFlow.scss';

export const AcademicsWizardLayout = () => {
  const parentCtx = useOutletContext();
  const { pathname } = useLocation();
  const wizardBase = useMemo(() => {
    const segs = pathname.split('/').filter(Boolean);
    if (segs.length < 2) return '/academics/student-management';
    return `/${segs[0]}/${segs[1]}`;
  }, [pathname]);

  return (
    <div className="academics-page sm-flow">
      <Outlet context={{ ...parentCtx, wizardBase }} />
    </div>
  );
};
