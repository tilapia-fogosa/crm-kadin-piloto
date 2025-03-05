
import { Student } from '@/types/enrollment';
import { useEnrollmentForm } from './EnrollmentFormProvider';
import { Button } from '@/components/ui/button';
import { PersonalDataForm } from './steps/PersonalDataForm';

const STEPS = [
  { id: 0, title: 'Dados Pessoais', component: PersonalDataForm },
  { id: 1, title: 'Responsável Financeiro' },
  { id: 2, title: 'Dados Comerciais' },
  { id: 3, title: 'Dados Pedagógicos' },
  { id: 4, title: 'Confirmação' }
];

export function EnrollmentFormSteps() {
  const { state, setCurrentStep } = useEnrollmentForm();
  console.log('Current step:', state.currentStep);

  const CurrentStepComponent = STEPS[state.currentStep]?.component;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-8">
        {STEPS.map((step) => (
          <Button
            key={step.id}
            variant={state.currentStep === step.id ? "default" : "outline"}
            className="w-full mx-1"
            onClick={() => setCurrentStep(step.id)}
          >
            {step.title}
          </Button>
        ))}
      </div>

      <div className="p-4 border rounded">
        {CurrentStepComponent ? (
          <CurrentStepComponent />
        ) : (
          <p>Conteúdo do passo {state.currentStep + 1}</p>
        )}
      </div>

      <div className="flex justify-between mt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, state.currentStep - 1))}
          disabled={state.currentStep === 0}
        >
          Anterior
        </Button>
        <Button
          onClick={() => setCurrentStep(Math.min(STEPS.length - 1, state.currentStep + 1))}
          disabled={state.currentStep === STEPS.length - 1}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
}
