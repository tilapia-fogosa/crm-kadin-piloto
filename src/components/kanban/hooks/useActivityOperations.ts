
import { useContactAttempt } from "./useContactAttempt"
import { useEffectiveContact } from "./useEffectiveContact"
import { useScheduling } from "./useScheduling"
import { useActivityDeletion } from "./useActivityDeletion"

export function useActivityOperations() {
  const { registerAttempt } = useContactAttempt()
  const { registerEffectiveContact } = useEffectiveContact()
  const { registerScheduling } = useScheduling()
  const { deleteActivity } = useActivityDeletion()

  return {
    registerAttempt,
    registerEffectiveContact,
    registerScheduling,
    deleteActivity
  }
}
