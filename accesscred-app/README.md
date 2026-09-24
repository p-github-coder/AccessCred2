# AccessCred: jobs and internships for professionals and skilled trades

React 18 + Vite + React Router. Runs fully on the front end with localStorage; the service layer is ready for a backend.

    npm install
    npm run dev

## Structure
    src/
      pages/        Landing, Auth, Onboarding, Home, Jobs (+JobPage), Applications, Messages, Profile, Verify, Settings
      components/   Layout (nav + route guard), JobDetail (+ApplyModal), ui (Icon, Field, Modal, JobCard...)
      services/     jobs.js (live APIs, ranking, cache)   informal.js (skilled-trade listings + seed data)
      context/      AppContext.jsx (auth + user data in localStorage)
      hooks/        useForm.js      utils/ validate.js (form rules)
      data/         content.js (static config only)

## Job data
- **Live APIs (no keys):** The Muse (jobs + internships by industry), Remotive, Jobicy, Arbeitnow. Queries and ranking use the user's profile `focus` (for example "Marketing" or "Fashion Design"). Dev calls go through the Vite proxy (`vite.config.js`). Results are cached in localStorage for 3 hours.
- **Skilled trades (fashion, tailoring, carpentry...):** no free public API exists, so `src/services/informal.js` generates realistic, seeded listings per trade and country. New skilled-trade users also get sample applications and employer messages.

## For the backend engineer
Swap these for HTTP calls and keep the object shapes:
1. `AppContext.jsx`: `register`, `login`, `logout`, `remove`, `patch` (user, profile, saved, apps, badges, threads, settings).
2. `services/informal.js`: `informalFor(profile)` -> `GET /jobs?track=informal&trade=&country=`; `seedInformal` can be dropped.
3. `services/jobs.js`: optionally proxy the public APIs server-side and add your own employer listings.

Job shape: `{ id, source, title, org, logo, location, remote, type, level, category, tags[], posted (ISO), url, salary, desc, generated?, verified? }`
Application shape: `{ jid, job, title, org, status: Submitted|Under review|Interview|Offer|Rejected, date, note, events[{s,t}] }`
Passwords are only base64-encoded in this demo. Hash them server-side.

## Validation
`src/utils/validate.js` + `src/hooks/useForm.js` power every form (sign up, login, onboarding, profile, apply, settings) with inline errors.
