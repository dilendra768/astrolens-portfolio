# AstroLens ✦
### An astrology-inspired reflection journal with lightweight personal analytics

AstroLens is a responsive, browser-based portfolio project built with **HTML, CSS and vanilla JavaScript**. It combines a small astrology-themed profile with a private reflection journal and simple mood-pattern analytics.

> **Important:** Astrology content is presented as a cultural/reflective framework, not as scientific fact, diagnosis, or guaranteed prediction. AstroLens does not calculate a complete natal chart or planetary transits.

## Live demo
Run locally by opening `index.html` in a modern browser, or deploy the repository with GitHub Pages.

## Features
- **Birth profile:** save a display name, date, optional birth time and birthplace.
- **Sun-sign lookup:** determines the conventional Western tropical Sun sign from the birthday.
- **Daily reflection prompt:** rotates deterministically by calendar day.
- **Mood journal:** record a mood and free-text reflection.
- **Personal analytics:** entry count, most common mood, current consecutive-day streak and mood distribution.
- **Data portability:** export profile and journal entries as a JSON backup.
- **Privacy-first storage:** all information stays in browser `localStorage`; no account or backend is required.
- **Responsive UI:** desktop, tablet and mobile layouts.

## Run locally
1. Download or clone this repository.
2. Open `index.html` in Chrome, Firefox, Safari or Edge.
3. Add a birth date, choose a mood and save your first reflection.

No build step, package installation or API key is required.

## Deploy with GitHub Pages
1. Create a GitHub repository (for example, `astrolens`).
2. Upload the contents of this project to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**, choose `main` and `/ (root)`, then save.
5. Wait for the deployment URL to appear in the Pages section.

## Project structure
```text
astrolens-portfolio/
├── index.html       # Semantic application structure
├── styles.css       # Responsive visual design
├── app.js           # State, storage, analytics and UI logic
├── README.md        # Setup, features and deployment guide
├── LICENSE
└── .gitignore
```

## Technical highlights
- Encapsulated application logic in an IIFE to avoid polluting the global scope.
- Defensive parsing and schema checks when loading local data.
- DOM rendering uses `textContent` for user-entered content to reduce injection risk.
- Uses `Intl.DateTimeFormat` for locale-aware dates.
- Uses accessible labels, status messaging and `aria-pressed` state for mood selection.
- Exports a versioned JSON data structure for future migration.

## Limitations and next steps
This is a front-end prototype, not a professional astrology calculation engine. The Sun-sign lookup uses conventional date boundaries and does not account for astronomical boundary-time variations. A production-grade chart calculator would need a validated ephemeris, time-zone conversion and accurate geographic coordinates.

Good next iterations:
1. Add automated unit tests for sign boundaries, streak calculations and import/export validation.
2. Add JSON import with schema validation and a clear overwrite/merge choice.
3. Add a backend with authentication and encrypted storage for multi-device use.
4. Add chart calculations using a reputable ephemeris library and cite the calculation method.
5. Add a TypeScript migration and CI workflow.

## Privacy
Journal text and profile details are stored in the current browser's local storage. Anyone with access to the same browser profile may be able to view that data. Exported backups are ordinary files; store them securely. Clearing browser site data may erase the journal.

## License
MIT — see [LICENSE](LICENSE).
