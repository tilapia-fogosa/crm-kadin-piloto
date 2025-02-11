
import { useState } from "react"

export function useCalendarState() {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setIsCalendarOpen(false)
  }

  return {
    selectedDate,
    isCalendarOpen,
    setIsCalendarOpen,
    handleDateSelect
  }
}
