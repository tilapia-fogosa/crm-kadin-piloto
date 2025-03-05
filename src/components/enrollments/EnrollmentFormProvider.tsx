
import React, { createContext, useContext } from 'react';
import { EnrollmentFormContextType } from './types/enrollment-form.types';
import { useEnrollmentFormState } from './hooks/useEnrollmentFormState';
import { useClientPreFill } from './hooks/useClientPreFill';

const EnrollmentFormContext = createContext<EnrollmentFormContextType | undefined>(undefined);

export function EnrollmentFormProvider({ 
  children,
  initialClientId 
}: { 
  children: React.ReactNode;
  initialClientId?: string;
}) {
  const formState = useEnrollmentFormState(initialClientId);
  
  // Use the pre-fill hook
  useClientPreFill(formState.state.clientId);

  return (
    <EnrollmentFormContext.Provider value={formState}>
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
