import React, { useEffect, useState } from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';

import { Step1Student } from './components/Step1Student';
import { Step2Academic } from './components/Step2Academic';
import { Step3Guardian } from './components/Step3Guardian';
import { Step4Address } from './components/Step4Address';
import { Step6Documents } from './components/Step6Documents';
import { StepPayment } from './components/StepPayment';
import { Step7Review } from './components/Step7Review';
import { SuccessView } from './components/SuccessView';

import './Admission.scss';
import { saveAdmissionDraft } from '../../utils/admissionDraftStorage';

export const Admission = () => {
  usePageTitle('Student Admission');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});

  const updateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const steps = [
    { num: 1, title: 'Student Info', icon: 'person' },
    { num: 2, title: 'Academic', icon: 'history_edu' },
    { num: 3, title: 'Guardian', icon: 'family_restroom' },
    { num: 4, title: 'Address', icon: 'home_pin' },
    { num: 5, title: 'Documents', icon: 'upload_file' },
    { num: 6, title: 'Payment', icon: 'payments' },
    { num: 7, title: 'Review', icon: 'verified' }
  ];

  const handleNext = () => {
    if (currentStep < 8) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSaveDraft = () => {
    saveAdmissionDraft(formData, currentStep);
  };

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      document.querySelector('.main-content')?.scrollTo(0, 0);
    };
    scrollToTop();
    requestAnimationFrame(scrollToTop);
  }, [currentStep]);

  const renderStep = () => {
    switch(currentStep) {
      case 1: return <Step1Student formData={formData} updateFormData={updateFormData} onNext={handleNext} onSaveDraft={handleSaveDraft} />;
      case 2: return <Step2Academic formData={formData} updateFormData={updateFormData} onNext={handleNext} onBack={handleBack} onSaveDraft={handleSaveDraft} />;
      case 3: return <Step3Guardian formData={formData} updateFormData={updateFormData} onNext={handleNext} onBack={handleBack} onSaveDraft={handleSaveDraft} />;
      case 4: return <Step4Address formData={formData} updateFormData={updateFormData} onNext={handleNext} onBack={handleBack} onSaveDraft={handleSaveDraft} />;
      case 5: return <Step6Documents formData={formData} updateFormData={updateFormData} onNext={handleNext} onBack={handleBack} onSaveDraft={handleSaveDraft} />;
      case 6: return <StepPayment formData={formData} updateFormData={updateFormData} onNext={handleNext} onBack={handleBack} onSaveDraft={handleSaveDraft} />;
      case 7: return <Step7Review formData={formData} onSubmit={handleNext} onBack={handleBack} onSaveDraft={handleSaveDraft} />;
      default: return null;
    }
  };

  if (currentStep === 8) {
    return <div className="admission-container"><SuccessView /></div>;
  }

  return (
    <div className="admission-container">
      {/* Stepper */}
      <div className="stepper-wrapper">
        <div className="stepper-track-bg"></div>
        <div className="stepper-track-fill" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}></div>
        
        <div className="steps-container">
          {steps.map((step) => {
            const isCompleted = step.num < currentStep;
            const isActive = step.num === currentStep;

            return (
              <button
                key={step.num}
                type="button"
                className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => setCurrentStep(step.num)}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`${step.title}, step ${step.num} of ${steps.length}`}
              >
                <div className="step-icon">
                  {isCompleted ? (
                    <span className="material-symbols-outlined completed-icon">check</span>
                  ) : isActive ? (
                    <span className="step-number">{String(step.num).padStart(2, '0')}</span>
                  ) : (
                    <span className="material-symbols-outlined">{step.icon}</span>
                  )}
                </div>
                <span className="step-label">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {renderStep()}
    </div>
  );
};
