export interface School {
  name: string;
  calendarId: string;
  classes: Class[];
}

export interface Mentor {
  name: string;
  email: string;
}

export interface Class {
  name: string;
  start: string;
  end: string;
  recurrence: string;
  instruments: string[];
}

export interface Config {
  schools: School[];
  mentors: Mentor[];
  instruments: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
}
