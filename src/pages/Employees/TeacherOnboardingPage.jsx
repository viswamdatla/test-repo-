import React, { useState } from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { TeacherOnboardingWizard } from './onboarding/TeacherOnboardingWizard';

const TITLES = {
  1: 'Teacher Onboarding',
  2: 'Professional Info',
  3: 'Documents & Credentials',
  4: 'Review & Submit',
};

export const TeacherOnboardingPage = () => {
  const [step, setStep] = useState(1);
  usePageTitle(TITLES[step] ?? 'Teacher Onboarding');

  return <TeacherOnboardingWizard onStepChange={setStep} />;
};
