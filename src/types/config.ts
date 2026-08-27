export interface School {
  name: string;
  calendarId: string;
}

export interface Mentor {
  name: string;
  email: string;
}

export interface Class {
  school: string;
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
  classes: Class[];
}
