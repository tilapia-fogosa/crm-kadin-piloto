
export interface Calendar {
  id: string;
  summary: string;
  backgroundColor: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  recurrence?: string[];
  status?: string;
}
