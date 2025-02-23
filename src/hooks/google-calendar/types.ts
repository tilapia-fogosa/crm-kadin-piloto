
export interface AuthWindowMessage {
  type: 'google-auth-success' | 'google-auth-error';
  code?: string;
  error?: string;
}

export interface Calendar {
  id: string;
  summary: string;
  backgroundColor: string;
  selected?: boolean;
}

export interface CalendarSettings {
  google_account_email: string | null;
  sync_enabled: boolean;
  selected_calendars: string[];
  calendars_metadata: Calendar[];
  last_sync: string | null;
  sync_token?: string | null;
}

export interface RawCalendarSettings {
  id: string;
  user_id: string;
  google_account_email: string | null;
  google_refresh_token: string | null;
  sync_enabled: boolean;
  selected_calendars: Json;
  calendars_metadata: Json;
  last_sync: string | null;
  sync_token: string | null;
  created_at: string | null;
  updated_at: string | null;
}

