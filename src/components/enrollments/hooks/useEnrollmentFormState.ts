
import { useState } from 'react';
import { EnrollmentFormState } from '../types/enrollment-form.types';
import { Student } from '@/types/enrollment';

export function useEnrollmentFormState(initialClientId?: string) {
  const [state, setState] = useState<EnrollmentFormState>({
    currentStep: 0,
    formData: {},
    clientId: initialClientId
  });

  console.log('EnrollmentFormState:', state);

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

  return {
    state,
    setCurrentStep,
    updateFormData,
    setClientId,
    resetForm
  };
}
