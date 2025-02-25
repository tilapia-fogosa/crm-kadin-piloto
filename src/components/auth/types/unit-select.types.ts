
export interface Unit {
  id: string;
  name: string;
  city: string;
}

export interface MultipleUnitSelectProps {
  selectedUnits: string[] | undefined;
  onUnitsChange: (units: string[]) => void;
  disabled?: boolean;
}
