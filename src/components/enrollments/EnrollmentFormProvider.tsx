
import React, { createContext, useContext, useState } from 'react';
import { Student } from '@/types/enrollment';
import { useClientPreFill } from './hooks/useClientPreFill';

interface EnrollmentFormState {
  currentStep: number;
  formData: Partial<Student>;
  clientId?: string;
}

interface EnrollmentFormContextType {
  state: EnrollmentFormState;
  setCurrentStep: (step: number) => void;
  updateFormData: (data: Partial<Student>) => void;
  setClientId: (id: string) => void;
  resetForm: () => void;
}

const EnrollmentFormContext = createContext<EnrollmentFormContextType | undefined>(undefined);

export function EnrollmentFormProvider({ 
  children,
  initialClientId 
}: { 
  children: React.ReactNode;
  initialClientId?: string;
}) {
  const [state, setState] = useState<EnrollmentFormState>({
    currentStep: 0,
    formData: {},
    clientId: initialClientId
  });

  // Use the pre-fill hook
  useClientPreFill(state.clientId);
  
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

  const setClientId = (id: string) => {
    console.log('Setting client ID:', id);
    setState(prev => ({ ...prev, clientId: id }));
  };

  const resetForm = () => {
    console.log('Resetting form');
    setState({
      currentStep: 0,
      formData: {},
      clientId: undefined
    });
  };

  return (
    <EnrollmentFormContext.Provider value={{
      state,
      setCurrentStep,
      updateFormData,
      setClientId,
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
