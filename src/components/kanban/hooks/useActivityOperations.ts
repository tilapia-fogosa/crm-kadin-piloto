
import { useContactAttempt } from "./useContactAttempt"
import { useEffectiveContact } from "./useEffectiveContact"
import { useScheduling } from "./useScheduling"
import { useActivityDeletion } from "./useActivityDeletion"
import { useAttendanceSubmission } from "./useAttendanceSubmission"
import { useCallback } from "react"

export function useActivityOperations() {
  // Call all hooks at the top level, unconditionally
  const contactAttemptHook = useContactAttempt()
  const effectiveContactHook = useEffectiveContact()
  const schedulingHook = useScheduling()
  const activityDeletionHook = useActivityDeletion()
  const attendanceSubmissionHook = useAttendanceSubmission()

  // Use useCallback to memoize the functions
  const registerAttempt = useCallback(contactAttemptHook.registerAttempt, [contactAttemptHook.registerAttempt])
  const registerEffectiveContact = useCallback(effectiveContactHook.registerEffectiveContact, [effectiveContactHook.registerEffectiveContact])
  const registerScheduling = useCallback(schedulingHook.registerScheduling, [schedulingHook.registerScheduling])
  const deleteActivity = useCallback(activityDeletionHook.deleteActivity, [activityDeletionHook.deleteActivity])
  const registerAttendance = useCallback(attendanceSubmissionHook.submitAttendance, [attendanceSubmissionHook.submitAttendance])

  return {
    registerAttempt,
    registerEffectiveContact,
    registerScheduling,
    deleteActivity,
    registerAttendance
  }
}
