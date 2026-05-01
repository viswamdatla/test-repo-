import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

export const usePageTitle = (title) => {
  const ctx = useOutletContext();
  const setNavTitle = ctx?.setNavTitle;

  useEffect(() => {
    if (typeof setNavTitle === 'function') setNavTitle(title);
  }, [title, setNavTitle]);
};
