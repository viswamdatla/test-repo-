export function getWizardMeta(pathname) {
  if (pathname.startsWith('/academics/attendance')) {
    return {
      wizardBase: '/academics/attendance',
      navRootTitle: 'Attendance',
      gatewaySubtitle: 'Choose a class, then a section, to view attendance for that group.',
      stageSubtitle: 'Choose a programme level. Each option opens the class list on the next page.',
      classSubtitle: 'Pick a class to open the sections page.',
      sectionTileCaption: 'Open records',
      recordsSubtitle: 'Search and filter records for this class and section.',
      recordsEmpty: 'No attendance records for this selection.',
    };
  }
  if (pathname.startsWith('/academics/grades')) {
    return {
      wizardBase: '/academics/grades',
      navRootTitle: 'Grades',
      gatewaySubtitle: 'Choose a class, then a section, to view grade records for that group.',
      stageSubtitle: 'Choose a programme level. Each option opens the class list on the next page.',
      classSubtitle: 'Pick a class to open the sections page.',
      sectionTileCaption: 'Open records',
      recordsSubtitle: 'Search and filter gradebook entries for this class and section.',
      recordsEmpty: 'No grade records for this selection.',
    };
  }
  return {
    wizardBase: '/academics/student-management',
    navRootTitle: 'Student Management',
    gatewaySubtitle: 'Choose a class, then a section, to view and manage students.',
    stageSubtitle: 'Choose a programme level. Each option opens the class list on the next page.',
    classSubtitle: 'Pick a class to open the sections page.',
    sectionTileCaption: 'Open student list',
    recordsSubtitle: '',
    recordsEmpty: '',
  };
}
