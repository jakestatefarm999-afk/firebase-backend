# Project Development Guidelines — Character AI Chat Application

These notes capture project-specific details for advanced contributors. They focus on build/configuration, testing strategy for the current setup, and development practices that matter in this codebase.

Last verified on: 2025-10-24

## Build and Configuration

- Tooling stack
  - Vite 6 (React plugin) + React 19 (ESM only, package.json has "type": "module").
  - Tailwind CSS v4 with the official @tailwindcss/vite plugin (no traditional tailwind.config.js required for defaults).
  - ESLint 9 with react-hooks and react-refresh plugins.
  - Package manager: pnpm (declared in package.json: pnpm@10). Prefer pnpm; npm/yarn may work but are not guaranteed or tested.
- Node version
  - Recommend Node 20 LTS or newer. Vite 6 requires modern Node; Node 18+ is typically fine, but use Node 20 to match ecosystem defaults.
- Vite configuration
  - File: vite.config.js
  - Aliases: "@" → ./src. Use import paths like import { Button } from '@/components/ui/button.jsx'.
  - Plugins: react(), tailwindcss(). No nonstandard transforms.
- Entry points
  - index.html loads /src/main.jsx which mounts React to #root.
  - The router is set up in src/App.jsx using react-router-dom v7.
- Environment
  - No import.meta.env usage found; the app is a front-end demo without backend integration. Demo behaviors are implemented with localStorage (e.g., auth, coins, subscriptions).

### Commands (pnpm)

- Dev server with HMR: pnpm dev
- Production build: pnpm build (outputs to dist/)
- Preview built app: pnpm preview
- Lint: pnpm lint

If you must use npm: translate pnpm <cmd> to npx pnpm <cmd> or yarn <cmd> accordingly, but this is not the supported path.

## Testing

There is no dedicated test runner configured in this repository (no Vitest/Jest deps). For quick verification of isolated utilities, you can:

1) Use a lightweight Node-based assertion script (zero additional deps).

- Example: test the Tailwind-aware className merger utility src/lib/utils.js (cn), which composes clsx with tailwind-merge so the last conflicting class wins.

Create a temporary file (e.g., temp-cn-test.mjs) at the repo root with the following content:

```js
import assert from 'node:assert/strict'
import { cn } from './src/lib/utils.js'

// Basic join
assert.equal(cn('foo', 'bar'), 'foo bar')
// Falsy values ignored (clsx behavior)
assert.equal(cn('foo', false, null, undefined, 0 && 'zero', 'bar'), 'foo bar')
// Tailwind conflict resolution prefers the latter value (twMerge)
assert.equal(cn('px-2', 'px-4'), 'px-4')
// Arrays/objects are flattened (clsx behavior)
assert.equal(cn(['a', { b: true, c: false }], 'd'), 'a b d')

console.log('[OK] cn utility works as expected')
```

Run it:

- node temp-cn-test.mjs

Expected output:

- [OK] cn utility works as expected (exit code 0)

Clean up:

- Remove the temp file after running the test to keep the repo clean.

2) Recommended path for full testing (optional enhancement)

If you need persistent unit tests in this repo, add Vitest which integrates natively with Vite:

- Install (using pnpm):
  - pnpm add -D vitest @vitest/coverage-v8 jsdom
- Add scripts to package.json:
  - "test": "vitest",
  - "test:ui": "vitest --ui",
  - "test:coverage": "vitest run --coverage"
- Example test: src/lib/utils.test.js
  ```js
  import { describe, it, expect } from 'vitest'
  import { cn } from './utils.js'
  describe('cn', () => {
    it('merges classes and resolves Tailwind conflicts', () => {
      expect(cn('foo', false, 'bar')).toBe('foo bar')
      expect(cn('px-2', 'px-4')).toBe('px-4')
    })
  })
  ```
- Run: pnpm test

Note: Do not commit the above devDependencies unless the team agrees to adopt a permanent test setup.

## Development Notes and Conventions

- Styling and classNames
  - Use the cn helper from src/lib/utils.js to compose class names. This ensures Tailwind conflict resolution via tailwind-merge.
  - Prefer semantic Tailwind classes; avoid redundant conflicting classes (e.g., px-2 and px-4 together) unless you intend the latter to override.
- Router/view structure
  - src/App.jsx houses most demo screens and routes (Chat List/Home, Explore, Character Profile, Chat, Create Modal, Coins/Store, Sidebar, Bottom Nav). The app is intentionally single-file heavy for demo purposes; consider refactoring into feature modules if you plan larger changes.
  - react-router-dom v7 is used with BrowserRouter. Use useNavigate/useLocation from the same package when interacting with routes.
- State and persistence (demo-only)
  - Many UX features are driven by localStorage keys (e.g., response mode, subscription status, demo auth registry). Utilities like lsGet/lsSet exist inline in src/App.jsx.
  - There is no API layer or network I/O at this time.
- ESLint
  - Config: eslint.config.js
  - Rules include react-hooks recommended and react-refresh/only-export-components (warn). Unused variables starting with uppercase or underscore are ignored by no-unused-vars via varsIgnorePattern: '^[A-Z_]'.
  - Run pnpm lint to check.
- Imports and module format
  - ESM only. Use named exports and top-level imports. Avoid default exports unless there's a clear reason.
  - Prefer the @ alias for internal modules (configured in Vite). Relative imports still work but are less ergonomic.
- Assets/public
  - Static images referenced in UI (e.g., /placeholder-*.jpg) are expected under public/. The dev server serves these from the root path.

## Verified Steps (this session)

- Built and ran a zero-dependency Node assertion test against src/lib/utils.js:cn to validate utility behavior. Command executed locally:
  - node temp-cn-test.mjs
  - Result: passed.
- The temporary test file was removed after verification to keep the repository clean. Use the snippet in the Testing section to recreate it when needed.

## Troubleshooting

- Tailwind styles not applying in dev
  - Ensure the @tailwindcss/vite plugin is active and that you are editing files within src/ so content scanning picks up class usage.
- Aliased imports fail to resolve (e.g., '@/components/...')
  - Confirm you are running via Vite (pnpm dev/build). Node cannot resolve @ without bundling unless you add a matching paths map to ts/jsconfig for editors (jsconfig.json exists and aids IDEs only).
- HMR not updating
  - Check that exports remain at the module top level (required for react-refresh) and avoid conditionally exporting React components.
