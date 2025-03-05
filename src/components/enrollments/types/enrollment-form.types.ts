
import { Student } from '@/types/enrollment';

export interface EnrollmentFormState {
  currentStep: number;
  formData: Partial<Student>;
  clientId?: string;
}

export interface EnrollmentFormContextType {
  state: EnrollmentFormState;
  setCurrentStep: (step: number) => void;
  updateFormData: (data: Partial<Student>) => void;
  setClientId: (id: string) => void;
  resetForm: () => void;
}
