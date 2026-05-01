import React, { useState } from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';

import { Step1Student } from './components/Step1Student';
import { Step2Academic } from './components/Step2Academic';
import { Step3Guardian } from './components/Step3Guardian';
import { Step4Address } from './components/Step4Address';
import { Step5Transport } from './components/Step5Transport';
import { Step6Documents } from './components/Step6Documents';
import { Step7Review } from './components/Step7Review';
import { SuccessView } from './components/SuccessView';

import './Admission.scss';

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
    { num: 5, title: 'Transport', icon: 'directions_bus' },
    { num: 6, title: 'Documents', icon: 'upload_file' },
    { num: 7, title: 'Review', icon: 'verified' }
  ];

  const handleNext = () => {
    if (currentStep < 8) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStep = () => {
    switch(currentStep) {
      case 1: return <Step1Student formData={formData} updateFormData={updateFormData} onNext={handleNext} />;
      case 2: return <Step2Academic formData={formData} updateFormData={updateFormData} onNext={handleNext} onBack={handleBack} />;
      case 3: return <Step3Guardian formData={formData} updateFormData={updateFormData} onNext={handleNext} onBack={handleBack} />;
      case 4: return <Step4Address formData={formData} updateFormData={updateFormData} onNext={handleNext} onBack={handleBack} />;
      case 5: return <Step5Transport formData={formData} updateFormData={updateFormData} onNext={handleNext} onBack={handleBack} />;
      case 6: return <Step6Documents formData={formData} updateFormData={updateFormData} onNext={handleNext} onBack={handleBack} />;
      case 7: return <Step7Review formData={formData} onSubmit={handleNext} onBack={handleBack} />;
      case 8: return <SuccessView />;
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
              <div key={step.num} className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                <div className="step-icon">
                  {isCompleted ? (
                    <span className="material-symbols-outlined completed-icon">check</span>
                  ) : isActive ? (
                    <span className="step-number">{String(step.num).padStart(2, '0')}</span>
                  ) : (
                    <span className={`material-symbols-outlined`}>{step.icon}</span>
                  )}
                </div>
                <span className="step-label">{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {renderStep()}
    </div>
  );
};
