
export interface Calendar {
  id: string;
  summary: string;
  backgroundColor: string;
}

export interface CalendarSettings {
  google_account_email: string | null;
  sync_enabled: boolean;
  google_refresh_token: string | null;
  last_sync: string | null;
  calendars_metadata: Calendar[];
  selected_calendars: string[];
  default_calendar_id: string | null;
  sync_token: string | null;
}

export interface RawCalendarSettings {
  google_account_email: string | null;
  sync_enabled: boolean;
  google_refresh_token: string | null;
  last_sync: string | null;
  calendars_metadata: Calendar[];
  selected_calendars: string[];
  default_calendar_id: string | null;
  sync_token: string | null;
}

export interface AuthWindowMessage {
  type: 'google-auth-success' | 'google-auth-error';
  code?: string;
  error?: string;
}
