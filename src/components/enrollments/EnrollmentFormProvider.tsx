import React, { createContext, useContext, useState } from 'react';
import { Student } from '@/types/enrollment';

interface EnrollmentFormState {
  currentStep: number;
  formData: Partial<Student>;
  clientId?: string;
}

interface EnrollmentFormContextType {
  state: EnrollmentFormState;
  setCurrentStep: (step: number) => void;
  updateFormData: (data: Partial<Student>) => void;
  resetForm: () => void;
}

const EnrollmentFormContext = createContext<EnrollmentFormContextType | undefined>(undefined);

const initialState: EnrollmentFormState = {
  currentStep: 0,
  formData: {},
  clientId: undefined
};

export function EnrollmentFormProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<EnrollmentFormState>(initialState);
  console.log('EnrollmentFormProvider state:', state);

  const setCurrentStep = (step: number) => {
    console.log('Setting current step to:', step);
    setState(prev => ({ ...prev, currentStep: step }));
  };

  const updateFormData = (data: Partial<Student>) => {
    console.log('Updating form data:', data);
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data }
    }));
  };

  const resetForm = () => {
    console.log('Resetting form');
    setState(initialState);
  };

  return (
    <EnrollmentFormContext.Provider value={{
      state,
      setCurrentStep,
      updateFormData,
      resetForm
    }}>
      {children}
    </EnrollmentFormContext.Provider>
  );
}

export function useEnrollmentForm() {
  const context = useContext(EnrollmentFormContext);
  if (context === undefined) {
    throw new Error('useEnrollmentForm must be used within an EnrollmentFormProvider');
  }
  return context;
}
