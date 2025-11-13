# KanBan Board

A simple Kanban-style task board built with React and TypeScript. This project demonstrates a column-based board where issues (tasks) can be added, edited, and moved between columns using drag-and-drop.

## Key Features

- Add, edit, and remove issues (tasks).
- Drag-and-drop to reorder issues within a column and move them between columns.
- Minimal, easy-to-follow codebase implemented with React + TypeScript.

## Getting Started

Prerequisites:
- Node.js (v14+ recommended) and npm.

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm start
```

Open `http://localhost:3000` in your browser to view the app. The app will reload automatically when you edit source files.

Run tests:

```bash
npm test
```

Create a production build:

```bash
npm run build
```

## Sample Data (optional)

This repository includes a `public/db.json` file with example data. If you want to serve that file as a fake REST API for local development, install `json-server` and run:

```bash
npx json-server --watch public/db.json --port 3001
```

Then update the frontend API base URL if necessary to point at `http://localhost:3001`.

## Project Structure (important files)

- `src/components/Kanban.tsx` — Main board container and state management.
- `src/components/Column.tsx` — Column component holding issues.
- `src/components/Issue.tsx` — Single issue (task) component.
- `src/components/Form.tsx` — Form UI for creating and editing issues.
- `public/db.json` — Optional sample data.

## Notes

- This project uses React and TypeScript and includes drag-and-drop functionality. Dependencies include `@dnd-kit/core` and `react-beautiful-dnd` (see `package.json`).
- If you plan to deploy, build the app with `npm run build` and serve the `build` folder using your preferred static hosting solution.

## Contributing

Contributions and improvements are welcome. Open an issue or submit a pull request with suggested changes.


