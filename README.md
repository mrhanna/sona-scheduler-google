# SoNA Mentors Visit Scheduler

A lightweight React and TypeScript web application backed by Google Apps Script designed for the **Symphony of Northwest Arkansas (SoNA) Mentors Program**.

The app streamlines visit scheduling for teaching mentors by solving two primary friction points: navigating complex, non-standard school block schedules, and eliminating personal calendar clutter caused by shared Google Calendars.

**Live Demo (with mock data):** [mrhanna.dev/demos/sona-scheduler](https://mrhanna.dev/demos/sona-scheduler/)

---

## The Problem

1. **Complex Block Scheduling:** Partner schools operate on varying schedules (e.g., A/B days, Even/Odd block days). Calculating valid visit dates manually created high friction for mentors.
2. **Calendar Overload:** Mentors were previously added to shared Google Calendars for every school. Viewing these calendars overlaid all other mentors' visits onto their personal screens, making individual schedules unreadable.

---

## The Solution

The Visit Scheduler provides a single, friction-free interface that:

- **Automates Date Math:** Computes block-scheduling rules to present mentors with valid, ready-to-book visit slots.
- **Detects Conflicts:** Scans shared calendars for potential scheduling collisions before booking.
- **Generates Native Google Calendar Links:** Creates pre-filled "Add to Calendar" links that push the event to the appropriate shared school calendar while inviting the mentor's personal Google account.

### Low-Tech Architecture & Security Model

The app is intentionally built to fit directly over existing organizational workflows:

- **Sheets-Driven Configuration:** Administration and schedule configuration are managed via standard Google Sheets, requiring no custom database or admin dashboard.
- **Zero API Costs & Minimal Permissions:** By transferring mentors to native Google Calendar event creation URLs instead of executing server-side API mutations, the app avoids API rate limits and execution quotas.
- **Native Google Security:** The app itself does not expose write operations. Event creation relies on Google's native authorization—mentors can only mutate shared calendars if their logged-in Google account already holds edit permissions.
- **Cleaner Personal Calendars:** Mentors no longer need to keep shared school calendars enabled on their devices. Accepting the direct invite places only _their_ scheduled visits onto their personal calendar.

---

## Tech Stack

| Layer                    | Technology                         |
| ------------------------ | ---------------------------------- |
| **Frontend Framework**   | React, TypeScript                  |
| **Styling & Components** | CSS Modules, Custom Design Tokens  |
| **Backend & Hosting**    | Google Apps Script (`HtmlService`) |
| **Tooling & Deployment** | Vite, `clasp`, Node.js             |

---

## Setup & Local Development

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm**
- **Google Apps Script CLI (`clasp`)** logged in on your machine:

```bash
npm install -g @google/clasp
clasp login

```

### Quick Start

1. **Clone the repository:**

```bash
git clone https://github.com/your-username/sona-mentors-scheduler.git
cd sona-mentors-scheduler

```

2. **Install dependencies:**

```bash
npm install

```

3. **Run the local development server:**

```bash
npm run dev

```

_Note: The local environment uses bundled **mock data** representing school configurations, mentor rosters, and calendar slots for offline testing without hitting Google Services._

---

## Deployment

1. Create or link your Google Apps Script project target in `.clasp.json`:

```json
{
  "scriptId": "YOUR_GOOGLE_APPS_SCRIPT_ID",
  "rootDir": "./dist"
}
```

_(Note: `.clasp.json` is ignored by Git to keep environment target IDs private)._ 2. **Build and deploy to Apps Script:**

```bash
npm run build
clasp push

```

---

## License

Distributed under the MIT License. See `LICENSE` for details.
