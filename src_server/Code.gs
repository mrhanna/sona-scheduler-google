// 1. Serves the HTML Web App UI
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('SoNA Mentors Visit Scheduler')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getInitialData() {
  const config = getConfiguration();

  const calendarIds = config.schools.map((school) => school.calendarId);
  const startTime = new Date();
  const endTime = new Date();
  endTime.setMonth(endTime.getMonth() + 6); // Fetch events for the next 6 months

  const calendars = getEventsForCalendars(calendarIds, startTime, endTime);

  return { config, calendars };
}

function getConfiguration() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  const configurationSheet = ss.getSheetByName('Configuration');
  const classesSheet = ss.getSheetByName('Classes');

  if (configurationSheet.getLastRow() < 2) return null;
  if (classesSheet.getLastRow() < 2) return null;

  // Batch read classes
  const classData = classesSheet
    .getRange(2, 1, classesSheet.getLastRow() - 1, 6)
    .getValues();
  const classes = classData.map((row) => ({
    school: row[0],
    name: row[1],
    start:
      row[2] instanceof Date
        ? row[2].toTimeString().substring(0, 5)
        : String(row[2]),
    end:
      row[3] instanceof Date
        ? row[3].toTimeString().substring(0, 5)
        : String(row[3]),
    recurrence: row[4],
    instruments: row[5].split(',').map((name) => name.trim()),
  }));

  // Batch read configuration
  const rawData = configurationSheet
    .getRange(2, 1, configurationSheet.getLastRow() - 1, 5)
    .getValues();

  const schools = rawData
    .filter((row) => !!row[0])
    .map((row) => ({
      name: row[0],
      calendarId: row[1],
      classes: classes.filter((c) => c.school === row[0]),
    }));

  const mentors = rawData
    .filter((row) => !!row[2])
    .map((row) => ({
      name: row[2],
      email: row[3],
    }));

  const instruments = rawData.map((row) => row[4]).filter((cell) => !!cell);

  return {
    schools,
    mentors,
    instruments,
  };
}

function test_getConfiguration() {
  const config = getConfiguration();
  console.log(config);
  console.log(config.classes[0].instruments);
}

/**
 * Fetches all calendar events from a specific calendar within a date range.
 *
 * @param {string[]} calendarIds - The IDs of the target calendars (e.g., 'primary' or 'c_12345@group.calendar.google.com').
 * @param {Date|string} startTime - The start time (Date object or ISO string).
 * @param {Date|string} endTime - The end time (Date object or ISO string).
 * @returns {Record<string, CalendarEvent[]>} where each key is a calendar ID and the value is an array of events for that calendar.
 */
function getEventsForCalendars(calendarIds, startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  // Process all calendars synchronously in a single server-side thread
  return calendarIds.reduce((acc, id) => {
    try {
      const cal = CalendarApp.getCalendarById(id);
      acc[id] = cal
        ? cal.getEvents(start, end).map((e) => ({
            id: e.getId(),
            title: e.getTitle(),
            startTime: e.getStartTime().toISOString(),
            endTime: e.getEndTime().toISOString(),
            isAllDay: e.isAllDayEvent(),
          }))
        : [];
    } catch (err) {
      acc[id] = [];
    }
    return acc;
  }, {});
}
