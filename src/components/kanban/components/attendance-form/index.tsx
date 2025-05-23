
import { AttendanceFormContent } from "./AttendanceFormContent"
import { AttendanceFormProps } from "../../types/attendance-form.types"

export function AttendanceForm(props: AttendanceFormProps) {
  console.log('Renderizando AttendanceForm para cliente:', props.clientName, 'disabled:', props.isDisabled)
  return <AttendanceFormContent {...props} />
}
