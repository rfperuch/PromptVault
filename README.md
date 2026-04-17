# PromptVault

A simple, personal AI prompt manager built with Electron + React + TypeScript.

I created this tool for personal use as a way to organize and quickly access my AI prompts. Built entirely through vibecoding — no design specs, no detailed planning upfront, just iterating on ideas as they came.

## Features

- **CRUD** — Create, read, update, and delete prompts
- **Folders** — Organize prompts into folders (each stored as a separate JSON file)
- **Categories** — Tag prompts with color-coded categories
- **Search** — Fast substring search across title, content, and description
- **Favorites** — Star prompts for quick access
- **Variables** — Prompts support `{{variable}}` placeholders that can be filled before copying
- **Copy to clipboard** — One-click copy with variable substitution
- **Import/Export** — Backup and restore your data as JSON
- **Dark/Light theme** — Toggle between themes
- **Grid/List view** — Switch between card grid and compact list
- **i18n** — Available in English, Portuguese, and Spanish (auto-detected, remembered between sessions)

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop | Electron 41 |
| Frontend | React 19 + TypeScript |
| Bundler | Vite 8 |
| Styling | Tailwind CSS 4 |
| State | Zustand 5 |
| Storage | JSON files (no database) |
| Icons | Lucide React |

## Project Structure

```
promptvault/
├── electron/
│   ├── main.ts              # Electron main process, IPC handlers, file I/O
│   └── preload.ts           # Secure context bridge
├── src/
│   ├── i18n/                # Translations (en, pt, es)
│   ├── types/               # TypeScript interfaces
│   ├── lib/                 # API wrappers, utilities
│   ├── stores/              # Zustand state management
│   └── components/
│       ├── layout/          # Sidebar, Header, Layout
│       ├── prompt/          # PromptList, PromptCard, PromptEditor, PromptDetail
│       ├── folder/          # FolderSelect, FolderManager
│       ├── category/        # CategoryManager
│       ├── search/          # SearchBar
│       └── ui/              # Button, Input, Textarea, Badge
├── icon.ico                 # App icon (Windows)
├── icon.png                 # App icon (macOS/Linux)
└── package.json
```

## Storage Architecture

Data is stored in the Electron `userData` directory:

```
%APPDATA%/promptvault/                       (Windows)
~/Library/Application Support/promptvault/   (macOS)
~/.config/promptvault/                       (Linux)

├── promptvault-data.json   # Index: folders, all prompts, categories, settings
└── folders/
    ├── <folder-uuid>.json  # Prompts belonging to this folder
    └── ...
```

- The main JSON file stores the full index (all prompts, folders, categories, settings)
- Each folder has its own JSON file containing only its prompts
- Prompts without a folder exist only in the main index

## How to Build

### Prerequisites

- [Node.js](https://nodejs.org/) v20 or later
- npm (comes with Node.js)

### Install dependencies

```bash
npm install
```

### Development

Run the app in development mode with hot reload. You need two terminals:

```bash
# Terminal 1: Start Vite dev server
npx vite

# Terminal 2: Launch Electron
npx electron .
```

### Build for production

Build the React app and Electron main process:

```bash
npm run build:all
```

This runs:
1. `npm run build:electron` — Compiles `electron/main.ts` and `electron/preload.ts` to `dist-electron/`
2. `npm run build` — Bundles the React app to `dist/`

### Package as installer

**Windows** (.exe NSIS installer):

```bash
npm run dist:win
```

**macOS** (.dmg):

```bash
npm run dist:mac
```

**Both platforms:**

```bash
npm run dist
```

> **Note:** macOS builds require a macOS machine. Windows builds require a Windows machine. Cross-compilation is not supported by electron-builder.

### Output

Installers are generated in the `release/` directory:

| Platform | File |
|---|---|
| Windows | `PromptVault Setup 1.0.0.exe` |
| macOS | `PromptVault-1.0.0.dmg` |

## Releases

Download the latest installer from the [GitHub Releases](https://github.com/your-username/promptvault/releases) page.

For automated cross-platform builds, the repository includes a GitHub Actions workflow (`.github/workflows/build.yml`) that:
- Builds on Windows (`.exe`) and macOS (`.dmg`) in parallel
- Publishes artifacts to GitHub Releases when a version tag is pushed

To trigger a release:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## License

MIT
