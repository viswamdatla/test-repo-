import React from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';

/** Merges `wizardBase` with parent (e.g. PageLayout `setNavTitle`) for nested academics routes */
export const AcademicsKeyedOutlet = ({ wizardBase }) => {
  const parentCtx = useOutletContext() ?? {};
  return <Outlet context={{ ...parentCtx, wizardBase }} />;
};
