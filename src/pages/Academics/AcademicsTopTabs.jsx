import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { getMergedClassCards } from './classSectionRegistry';
import { classLevelToSlug, sectionToSlug } from './studentManagement/studentManagementConfig';
import './AcademicsTopTabs.scss';

const tabs = [
  { to: '/academics/student-management', end: true, label: 'Student Dashboard' },
  { to: '/academics/time-table', label: 'Time Table' },
  { to: '/academics/attendance', label: 'Attendance' },
  { to: '/academics/grades', label: 'Grades' },
];

const SECTION_PATH_PATTERNS = [
  /^\/academics\/student-management\/section\/([^/]+)/,
  /^\/academics\/time-table\/section\/([^/]+)/,
];

const getSectionIdFromPath = (pathname) => {
  for (const pattern of SECTION_PATH_PATTERNS) {
    const match = pathname.match(pattern);
    if (match?.[1]) return decodeURIComponent(match[1]);
  }

  const attendanceOrGradesMatch = pathname.match(/^\/academics\/(?:attendance|grades)\/([^/]+)\/([^/]+)/);
  if (!attendanceOrGradesMatch) return null;

  const [, classSlug, sectionSlug] = attendanceOrGradesMatch;
  const classCard = getMergedClassCards().find((card) => classLevelToSlug(card.label) === classSlug);
  const section = classCard?.sections?.find((item) => sectionToSlug(item.pill) === sectionSlug);
  return section?.id ?? null;
};

const sectionTabPaths = (sectionId) => {
  const classCard = getMergedClassCards().find((card) => card.sections?.some((section) => section.id === sectionId));
  const section = classCard?.sections?.find((item) => item.id === sectionId);
  if (!classCard || !section) return tabs;

  const encodedSectionId = encodeURIComponent(sectionId);
  const classSlug = classLevelToSlug(classCard.label);
  const sectionSlug = sectionToSlug(section.pill);

  return [
    { to: `/academics/student-management/section/${encodedSectionId}`, label: 'Student Dashboard' },
    { to: `/academics/time-table/section/${encodedSectionId}`, label: 'Time Table' },
    { to: `/academics/attendance/${classSlug}/${sectionSlug}`, label: 'Attendance' },
    { to: `/academics/grades/${classSlug}/${sectionSlug}`, label: 'Grades' },
  ];
};

export const AcademicsTopTabs = () => {
  const { pathname } = useLocation();
  const sectionId = getSectionIdFromPath(pathname);
  const resolvedTabs = sectionId ? sectionTabPaths(sectionId) : tabs;

  return (
    <div className="academics-top-tabs" role="tablist" aria-label="Academic sections">
      {resolvedTabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => `academics-top-tab ${isActive ? 'active' : ''}`}
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
};
