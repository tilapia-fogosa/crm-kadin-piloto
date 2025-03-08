
import { useContactAttempt } from "./useContactAttempt"
import { useEffectiveContact } from "./useEffectiveContact"
import { useScheduling } from "./useScheduling"
import { useActivityDeletion } from "./useActivityDeletion"
import { useCallback } from "react"

export function useActivityOperations() {
  console.log('Inicializando useActivityOperations')
  
  // Call all hooks at the top level, unconditionally
  const contactAttemptHook = useContactAttempt()
  const effectiveContactHook = useEffectiveContact()
  const schedulingHook = useScheduling()
  const activityDeletionHook = useActivityDeletion()

  // Use useCallback to memoize the functions
  const registerAttempt = useCallback(contactAttemptHook.registerAttempt, [contactAttemptHook.registerAttempt])
  const registerEffectiveContact = useCallback(effectiveContactHook.registerEffectiveContact, [effectiveContactHook.registerEffectiveContact])
  const registerScheduling = useCallback(schedulingHook.registerScheduling, [schedulingHook.registerScheduling])
  const deleteActivity = useCallback(activityDeletionHook.deleteActivity, [activityDeletionHook.deleteActivity])

  return {
    registerAttempt,
    registerEffectiveContact,
    registerScheduling,
    deleteActivity
  }
}
