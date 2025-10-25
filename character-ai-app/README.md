# Character AI Chat Application

A modern, responsive web application that replicates a character AI chat interface with multiple screens and features.

## Features

### Implemented Screens

1. **Chat List (Home)**
   - Search bar for finding characters
   - List of active conversations with avatars, names, and message previews
   - Timestamps for each conversation
   - Clickable chat items to open conversations

2. **Explore**
   - Tab navigation (Subscriptions/Explore)
   - Horizontal scrollable category tabs (Fantastic, Multi-Role, Undercover Love, OC, Anime)
   - 2-column grid of character cards
   - Character cards with images, descriptions, tags, and message counts
   - "New" badges and multi-role indicators

3. **Character Profile**
   - Large character hero image
   - Character information (name, ID, creator)
   - Description and personality tags
   - Statistics (collectors, messages)
   - Action buttons (Chat, Favorite, Share)
   - Comments section with user interactions

4. **Chat Interface**
   - Character-specific chat header
   - AI-generated disclaimer banner
   - Character introduction card
   - Message bubbles with timestamps
   - "Free" badges on messages
   - Input area with attachment and send buttons

5. **Create Modal**
   - Character creation options (Regular, Multi-Role)
   - Templates section
   - Story creation (Fiction)
   - Canvas section (AvatarMix)
   - Gradient card designs

6. **Coins/Store**
   - Coin balance display
   - Coins description with features
   - Earning options (Watch AD, Daily Tasks)
   - Purchase options grid with pricing
   - Special offers with timers
   - Footer with policy links

7. **Sidebar Navigation**
   - Following, Top Creators, You, For you
   - Profile, Chats, Characters, Gallery
   - Favorites, Coins, Membership
   - Create, Install our app

8. **Bottom Navigation (Mobile)**
   - Home, Messages (with notification badge)
   - Create (center button)
   - Explore, Profile

## Design System

### Color Palette
- **Background**: Pure black (#000000)
- **Cards/Panels**: Dark gray (#1a1a1a, #2a2a2a)
- **Primary Accent**: Purple/Blue gradient
- **Secondary Accent**: Teal/Cyan
- **Highlight**: Gold/Yellow for character names
- **Text**: White (primary), Gray (secondary)

### Typography
- Clean, modern sans-serif font
- Bold headers and titles
- Italic text for narrative/actions in chat
- Color-coded character names in gold/yellow

### Components
- Rounded corners on all interactive elements
- Gradient backgrounds for feature cards
- Badge indicators (NEW, PRO, notification counts)
- Smooth hover states and transitions
- Responsive grid layouts

## Technology Stack

- Framework: React 19
- Build Tool: Vite 6
- Styling: Tailwind CSS v4 + tw-animate-css
- Icons: lucide-react
- Routing: react-router-dom v7
- UI Components: shadcn-style primitives built on Radix UI (class-variance-authority, @radix-ui primitives)
- Animations: Framer Motion

## Project Structure

```
character-ai-app/
├── src/
│   ├── assets/          # Images and static files
│   ├── components/
│   │   └── ui/          # shadcn/ui components
│   ├── App.jsx          # Main application component
│   ├── App.css          # Global styles
│   ├── main.jsx         # Entry point
│   └── index.css        # Base styles
├── public/              # Public assets
├── dist/                # Production build
└── package.json         # Dependencies
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (or npm/yarn)

### Installation

Navigate to the project directory:
```bash
cd character-ai-app
```
Install dependencies:
```bash
pnpm install
```
Start the development server:
```bash
pnpm run dev
```

Open your browser and visit:
```
http://localhost:5173
```

### Building for Production

```bash
pnpm run build
```

The production-ready files will be in the `dist/` directory.

## Features Breakdown

### Responsive Design
- Desktop: Sidebar navigation always visible
- Mobile: Bottom navigation with hamburger menu for sidebar
- Adaptive layouts for all screen sizes

### Interactive Elements
- Clickable chat items navigate to chat screens
- Character cards link to profile pages
- Sidebar menu items navigate between sections
- Bottom navigation for quick access on mobile

### Visual Polish
- Smooth transitions and hover effects
- Gradient backgrounds for premium features
- Badge indicators for new content and notifications
- Color-coded UI elements for better UX

## Screens Navigation

- `/` - Chat List (Home)
- `/explore` - Explore characters
- `/character/:id` - Character profile
- `/chat/:id` - Chat with character
- `/create` - Create new content
- `/coins` - Coins store
- `/profile` - User profile
- `/following` - Following feed
- `/favorites` - Favorite characters
- And more...

## Customization

The application uses Tailwind CSS for styling, making it easy to customize colors, spacing, and other design elements. Key customization points:

1. **Colors**: Modify the color palette in `App.css`
2. **Layout**: Adjust grid and flex layouts in component files
3. **Components**: Add or modify UI components in `src/components/ui/`

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Notes

- This is a UI-only implementation without backend functionality
- All data is mock data for demonstration purposes
- The application is fully responsive and mobile-friendly
- Character images use placeholder gradients

## Future Enhancements

- Backend API integration
- Real-time chat functionality
- User authentication
- Character creation workflow
- Payment processing for coins
- Push notifications
- Progressive Web App (PWA) support
- Native mobile app with Capacitor

## License

This project is for demonstration purposes.



## Recommendations

### Quick wins (low effort, high impact)
- Fix README/version mismatches (done above): ensure React 19, Vite 6, react-router-dom v7 are reflected everywhere.
- Placeholder images: prevent 404s by either adding real assets under /public or using an <img onError> fallback to a placeholder service (e.g., https://placehold.co). Add a short note in code comments where images are referenced.
- Clarify UI-only scope: keep “Notes” section explicit that all data is mocked and there’s no backend.

### Codebase maintainability
- Extract large App.jsx (~1,200 lines) into feature modules (screens/components) to improve readability and future changes. Suggested folders: src/screens/, src/layout/, src/data/.
- Centralize mock data (mockChats, mockCharacters) under src/data/ to avoid duplication and make it easier to replace with real APIs later.
- Add basic ESLint rules tailored for React 19 + Tailwind v4 (e.g., no unused vars, hooks rules, classnames ordering optional) and ensure lint is part of CI.

### UX polish
- Provide image fallbacks or skeletons for character cards and avatars to avoid layout shifts and broken visuals.
- Add accessible labels/aria attributes where appropriate (buttons with icons only, navigation landmarks).
- Consider adding a theme toggle (light/dark) control surfaced in the UI (tokens are already defined in App.css).

### Future roadmap (non-UI functionality)
- API layer: define a simple data fetching wrapper and interfaces for characters/chats for eventual backend integration.
- Real-time chat: evaluate WebSocket/SSE integration; start with stubbed event handlers.
- Auth: wire a provider-based auth placeholder that can be swapped for real auth later.
- Testing: introduce a minimal test setup (Vitest + React Testing Library) for critical components (navigation, cards, message composer).
- PWA: add manifest, service worker, and basic offline caching for the shell.

### Known gaps
- Several image paths in mock data reference files that do not exist in /public. Either add the files, use a placeholder service, or handle onError to swap the src at runtime.


## Referral Program (Demo)

This project includes a client-side referral program for demonstration purposes (no backend).

- Reward: 250 coins per successful referral
- Requirement: The referred user must join via your link and verify their email
- Cap: Maximum of 3 rewarded referrals per user

How it works (locally):
1. Open the app and go to the Coins page (/coins).
2. Copy your referral link (format: https://your-host/?ref=YOUR_USER_ID).
3. Share it with a friend. To test locally, open the link in a private/incognito window.
4. In that new session, go to the You page (/you) and click "Verify Email".
5. The referrer will receive 250 coins for that verification, up to 3 times.

Notes:
- This is a demo-only implementation using localStorage. It does not sync across devices/browsers.
- The referral ledger and coin balances are stored per-browser. Use private windows to simulate multiple users.
- Your current user ID and referral status are visible on the You page (/you).


## Backend (local demo API)

A minimal Node 20 + Express backend is included for local development. It provides stub endpoints for auth, characters, chats, and messages using in-memory storage (data resets on server restart).

- Location: server/index.mjs
- Default port: 4321 (override with PORT env var)
- CORS: allows http://localhost:5173 (Vite dev) and http://localhost:4173 (Vite preview)

### Run the backend

- Install deps (first time): pnpm install
- Start backend: pnpm dev:server
- Start frontend (separate terminal): pnpm dev

Visit health check:
- http://localhost:4321/api/health

### Endpoints

- GET /api/health → { status, time }
- POST /api/auth/login
  - Body: { email: string, name?: string }
  - Res: { token: string, user: { id, email, name } }
- GET /api/characters → Character[]
- GET /api/characters/:id → Character
- POST /api/characters
  - Body: { name: string, description?: string, avatarUrl?: string, tags?: string[] }
  - Res: 201 Created with Character
- POST /api/characters/generate
  - Body: { count?: number, gender?: 'male'|'female'|'any', tags?: string[] }
  - Res: 201 Created with Character[] (generated and stored in-memory)
  - Notes: Uses realistic RandomUser portraits and templated personas; for demo only.
- PUT /api/characters/:id
  - Body: Partial<Character>
- DELETE /api/characters/:id → { ok: true, removed }
- POST /api/chats
  - Body: { characterId: string, title?: string }
  - Res: 201 Created with Chat
- GET /api/chats/:chatId/messages → Message[]
- POST /api/chats/:chatId/messages
  - Body: { content: string }
  - Res: 201 Created with { user, assistant } messages, where assistant is a stub reply

Types (for reference):
- Character: { id, name, description, avatarUrl, tags }
- Chat: { id, characterId, title, createdAt }
- Message: { id, role: 'user'|'assistant', content, createdAt }

### cURL examples

Health:
```
curl http://localhost:4321/api/health
```

Login (stub):
```
curl -X POST http://localhost:4321/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","name":"Demo"}'
```

List characters:
```
curl http://localhost:4321/api/characters
```

Create a character:
```
curl -X POST http://localhost:4321/api/characters \
  -H "Content-Type: application/json" \
  -d '{"name":"Aiko","description":"Helpful friend","avatarUrl":"/placeholder-4.jpg","tags":["friendly"]}'
```

Create a chat:
```
# First, get a characterId from the characters list
CHAR_ID="<replace>"
curl -X POST http://localhost:4321/api/chats \
  -H "Content-Type: application/json" \
  -d "{\"characterId\":\"$CHAR_ID\"}"
```

Send a message and receive a stub assistant reply:
```
CHAT_ID="<replace>"
curl -X POST http://localhost:4321/api/chats/$CHAT_ID/messages \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello there!"}'
```

Notes:
- This backend does not persist data; restarting the server resets everything.
- For production, replace the in-memory store with a database and implement real auth and LLM calls.
