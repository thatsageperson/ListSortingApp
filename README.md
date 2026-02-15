# SmartLists - AI-Powered List Organization

**SmartLists** (List Organizer Chat) is an intelligent list management application that uses AI to automatically categorize and organize your tasks, logs, and notes through natural language input.

## Overview

SmartLists combines the simplicity of a chat interface with powerful AI categorization to help you organize your life. Simply type what you need to track, and the AI automatically places it in the right list, determines if it's a task or a logged event, and formats it appropriately.

### Key Features

- **Natural Language Input**: Type in plain English - no complex forms or menus
- **AI-Powered Categorization**: Automatically sorts items into the right lists
- **Smart Task vs. Log Detection**: Distinguishes between future tasks and past events
- **Flexible Display Modes**: Checkboxes, bullets, timestamps - choose what works best
- **Cross-Platform**: Available on web and mobile (iOS/Android via Expo)
- **Collaboration**: Share lists with view or edit permissions
- **Export**: Download as iCalendar or text format
- **Guest Mode**: Try it without signing up

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database (Neon recommended)
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd "List Organizer Chat"

# Install dependencies
npm install
cd apps/web && npm install
cd ../mobile && npm install
```

### Configuration

Create `apps/web/.env`:

```env
DATABASE_URL=postgresql://your-database-url
AUTH_SECRET=your-auth-secret
OPENAI_API_KEY=sk-proj-your-openai-key
GOOGLE_CLIENT_ID=optional-google-oauth-id
GOOGLE_CLIENT_SECRET=optional-google-oauth-secret
```

Create `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000
```

### Running the Application

**Web Application:**

```bash
cd apps/web
npm run dev
# Open http://localhost:5173
```

**Mobile Application:**

```bash
cd apps/mobile
npm start
# Scan QR code with Expo Go app
```

**Production Build:**

```bash
npm run build
npm start
```

## Architecture

### Monorepo Structure

```
List Organizer Chat/
├── apps/
│   ├── web/          # React Router 7 web app
│   └── mobile/       # Expo/React Native mobile app
├── package.json      # Root workspace
└── railway.json      # Deployment config
```

### Technology Stack

#### Frontend (Web)
- **Framework**: React Router 7 with SSR
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4 + Chakra UI 2.8
- **State**: Zustand + TanStack Query 5.72
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Animation**: Motion (Framer Motion)
- **Additional**: DnD Kit, React Markdown, Recharts, Sonner

#### Frontend (Mobile)
- **Framework**: Expo 54 / React Native 0.81
- **Router**: Expo Router 6
- **State**: Same as web (Zustand + TanStack Query)
- **Animation**: Moti + React Native Reanimated
- **Features**: Maps, Camera, Calendar, Contacts, RevenueCat

#### Backend
- **Server**: React Router's Hono server
- **Database**: PostgreSQL (Neon serverless)
- **Auth**: Auth.js with Credentials + Google OAuth
- **AI**: OpenAI API (GPT-4o-mini)

#### Deployment
- **Platform**: Railway
- **Builder**: Nixpacks
- **Runtime**: Node.js

## Core Features

### 1. Chat-Based Interface

The main interface is a conversational chat where you type naturally:

```
You: "I walked the dog at 8am, he pooped twice"
AI: ✓ Added log entry to "Pet Care" list

You: "Walk the dog tomorrow"
AI: ✓ Added task to "Pet Care" list

You: "Buy milk, eggs, bread"
AI: ✓ Added 3 items to "Groceries" list
```

**Implementation**: [`apps/web/src/app/page.jsx`](apps/web/src/app/page.jsx)

### 2. AI-Powered Input Processing

The AI engine (`GPT-4o-mini`) analyzes your input and:

1. **Parses** the text into individual items
2. **Categorizes** each item into the appropriate list based on your list rules
3. **Detects** whether it's a task (future) or log (past event)
4. **Extracts** timestamps from natural language ("yesterday at 6am")
5. **Identifies** priority levels (low/medium/high)
6. **Separates** core content from additional notes
7. **Determines** the best display mode (checkbox, bullet, timestamp)

**Examples:**

| Input | Type | Result |
|-------|------|--------|
| "I walked the dog at 8am" | Log | Pet Care list, timestamped entry |
| "Walk the dog" | Task | Pet Care list, unchecked task |
| "went to gym yesterday at 6am, did legs" | Log | Fitness list, backdated with notes |
| "Buy milk and bread" | Task | Groceries list, 2 separate items |

**API Route**: [`apps/web/src/app/api/process-input/route.js`](apps/web/src/app/api/process-input/route.js)

### 3. List Management

#### Creating Lists

Three-step AI-assisted process:

1. **Name**: Enter a name (e.g., "Pet Care")
2. **Purpose**: Describe what it's for ("Track dog walking, feeding, vet visits")
3. **AI Analysis**: AI generates smart categorization rules automatically

The AI creates rules that help it categorize future inputs correctly.

**Component**: [`apps/web/src/components/Modals/NewListModal/NewListModal.jsx`](apps/web/src/components/Modals/NewListModal/NewListModal.jsx)

#### List Structure

Each list contains:
- **Name**: Display title
- **Description**: AI-generated overview
- **Rules**: AI-readable categorization rules
- **Items**: Tasks, logs, or notes belonging to this list
- **Permissions**: Owner and shared user access

### 4. List Items

Items support multiple display modes:

- **Todo (Strike)**: Checkbox with strikethrough when completed ✓ ~~Done~~
- **Todo (No Strike)**: Checkbox without strikethrough ✓ Done
- **Bullet**: Simple bullet point • Item
- **Log (Clock)**: Timestamp with clock icon 🕐 8:00 AM - Walked dog

Each item can have:
- Content (main text)
- Notes (additional details)
- Priority (low/medium/high)
- Completion status
- Creation timestamp (can be backdated for logs)

**Component**: [`apps/web/src/components/ListView/ListItem.jsx`](apps/web/src/components/ListView/ListItem.jsx)

### 5. Sharing & Collaboration

Share lists with others via email:

- **View Permission**: Read-only access
- **Edit Permission**: Can add and modify items

Shared lists appear in the recipient's sidebar with a shared indicator.

**API Route**: [`apps/web/src/app/api/lists/[id]/share/route.js`](apps/web/src/app/api/lists/[id]/share/route.js)

### 6. Export

Export lists to integrate with other tools:

- **iCalendar (.ics)**: Import into calendar apps
- **Text (.txt)**: Plain text format

Options to include or exclude completed items.

**API Route**: [`apps/web/src/app/api/lists/[id]/export/route.js`](apps/web/src/app/api/lists/[id]/export/route.js)

### 7. User Settings

Customize your experience:

- **Dark Mode**: Toggle dark/light theme
- **Font Size**: Small, medium, large, or extra large
- **Show Completed**: Hide or show completed items
- **List Density**: Comfortable or compact spacing
- **Default Sort**: Custom sorting preferences
- **Export Defaults**: Preferred format and options

Settings sync across devices and are stored in PostgreSQL as JSONB.

**API Route**: [`apps/web/src/app/api/user/settings/route.js`](apps/web/src/app/api/user/settings/route.js)

### 8. Authentication

Multiple authentication methods:

1. **Email/Password**: Traditional credentials with bcrypt hashing
2. **Google OAuth**: One-click sign in with Google
3. **Guest Mode**: Try without signing up (localStorage only)

Session management with secure tokens stored in PostgreSQL.

**Pages:**
- Sign In: [`apps/web/src/app/account/signin/page.jsx`](apps/web/src/app/account/signin/page.jsx)
- Sign Up: [`apps/web/src/app/account/signup/page.jsx`](apps/web/src/app/account/signup/page.jsx)
- Logout: [`apps/web/src/app/account/logout/page.jsx`](apps/web/src/app/account/logout/page.jsx)

## Database Schema

### Core Tables

```sql
-- Lists
CREATE TABLE lists (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rules TEXT,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- List Items
CREATE TABLE list_items (
  id SERIAL PRIMARY KEY,
  list_id INTEGER REFERENCES lists(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  notes TEXT,
  priority TEXT,
  completed BOOLEAN DEFAULT false,
  type TEXT DEFAULT 'task',
  display_mode TEXT DEFAULT 'todo-strike',
  created_at TIMESTAMP DEFAULT NOW()
);

-- List Sharing
CREATE TABLE list_shares (
  id SERIAL PRIMARY KEY,
  list_id INTEGER REFERENCES lists(id) ON DELETE CASCADE,
  shared_with_user_id TEXT NOT NULL,
  permission TEXT NOT NULL
);

-- User Settings
CREATE TABLE user_settings (
  user_id TEXT PRIMARY KEY,
  settings JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Auth Tables

- `auth_users`: User profiles (id, email, name, image)
- `auth_accounts`: Provider links (credentials, Google OAuth)
- `auth_sessions`: Active sessions with tokens
- `auth_verification_token`: Email verification tokens

## API Reference

### Lists

```
GET    /api/lists              # Get all user's lists (owned + shared)
POST   /api/lists              # Create a new list
PATCH  /api/lists/[id]         # Update list details
DELETE /api/lists/[id]         # Delete a list
```

### List Items

```
GET    /api/lists/[id]/items   # Get all items in a list
POST   /api/lists/[id]/items   # Add item to list
PUT    /api/lists/[id]/items   # Update an item
DELETE /api/lists/[id]/items   # Delete item(s)
```

### Other

```
POST   /api/process-input      # AI-powered input processing
POST   /api/lists/analyze-purpose  # AI list analysis
POST   /api/lists/[id]/share   # Share a list
GET    /api/lists/[id]/export  # Export list (ics/text)
GET    /api/user/settings      # Get user settings
PUT    /api/user/settings      # Update settings
GET    /api/auth/token         # Get auth token
```

## State Management

### Server State (TanStack Query)
- Lists and items fetching
- Automatic caching (5-minute stale time)
- Optimistic updates for instant UI feedback
- Background refetching

### Client State (Zustand)
- UI state (modals, sidebar open/closed)
- Settings persistence
- Theme preferences

### Custom Hooks

#### Web ([`apps/web/src/hooks/`](apps/web/src/hooks/))
- `useListMutations`: CRUD operations
- `useChatMutations`: Message processing
- `useNewListModal`: List creation flow
- `useDarkMode`: Theme management
- `useSettings`: User preferences

#### Mobile ([`apps/mobile/src/hooks/`](apps/mobile/src/hooks/))
- Similar hooks adapted for mobile UX

## Component Architecture

### Web Components

**Layout:**
- `Sidebar`: Navigation, list selector, settings
- `MobileHeader`: Responsive mobile header

**Chat:**
- `ChatWelcome`: Empty state with examples
- `ChatHistory`: Message display with scrolling
- `ChatInput`: Text input with send button

**Lists:**
- `ListView`: List container with filtering/sorting
- `ListHeader`: Actions (share, export, edit)
- `ListItem`: Individual item with all display modes

**Modals:**
- `NewListModal`: 3-step list creation wizard
- `EditListModal`: Update list details
- `ShareModal`: Share with email/permission
- `ExportModal`: Export format selection
- `SettingsModal`: User preferences panel

### Mobile Components

Similar structure optimized for touch:
- `DrawerSidebar`: Swipeable navigation drawer
- `ListView`: Mobile-optimized list view
- `ListItem`: Touch-friendly interactions
- `ChatInput`: Keyboard-aware input
- `NewListModal`: Mobile-friendly modals
- `SettingsScreen`: Full-screen settings

## Development

### Project Structure

```
apps/web/
├── src/
│   ├── app/
│   │   ├── page.jsx              # Main application page
│   │   ├── routes.ts             # Route configuration
│   │   ├── root.tsx              # Root layout & error boundaries
│   │   ├── api/                  # API route handlers
│   │   └── account/              # Auth pages (signin/signup/logout)
│   ├── components/               # React components
│   ├── hooks/                    # Custom hooks
│   └── utils/                    # Utility functions
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # Tailwind CSS config
└── package.json

apps/mobile/
├── src/
│   ├── app/
│   │   ├── index.jsx             # Entry screen
│   │   ├── main.jsx              # Main app screen
│   │   └── _layout.jsx           # Root layout
│   ├── components/               # React Native components
│   ├── hooks/                    # Custom hooks
│   └── utils/                    # Utility functions
├── App.tsx                       # App entry point
├── app.json                      # Expo configuration
└── package.json
```

### Development Commands

```bash
# Web development
cd apps/web
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build
npm start            # Start production server
npm run typecheck    # TypeScript type checking

# Mobile development
cd apps/mobile
npm start            # Start Expo dev server
npm run postinstall  # Apply patches after install
```

### Environment Variables

**Required for Web:**
- `DATABASE_URL`: PostgreSQL connection string (Neon)
- `AUTH_SECRET`: Secret for session encryption
- `OPENAI_API_KEY`: OpenAI API key for GPT-4o-mini

**Optional for Web:**
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth secret

**Mobile:**
- `EXPO_PUBLIC_API_BASE_URL`: Backend API URL (defaults to localhost:4000)
- `EXPO_PUBLIC_BASE_URL`: Web app URL for OAuth
- `EXPO_PUBLIC_PROXY_BASE_URL`: Proxy URL for OAuth flow

## Deployment

### Railway Deployment

The application is configured for Railway deployment:

```json
{
  "build": {
    "builder": "nixpacks",
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "npm start"
  }
}
```

**Steps:**
1. Push to GitHub repository
2. Connect repository to Railway
3. Add environment variables in Railway dashboard
4. Deploy automatically on push

**Environment Variables to Set:**
- `DATABASE_URL`
- `AUTH_SECRET`
- `OPENAI_API_KEY`
- `GOOGLE_CLIENT_ID` (optional)
- `GOOGLE_CLIENT_SECRET` (optional)

### Troubleshooting: startup crash loop on Railway

If logs repeatedly show:

`Warning: Detected unsettled top-level await`

and Railway keeps restarting the service, it usually means the generated server bundle has a circular import between:
- `build/server/assets/server-build.js`
- `build/server/assets/index-*.js` (server entry chunk)

This project now includes a guard that fails builds if that cycle pattern reappears:

```bash
cd apps/web
npm run check:server-build-cycle
```

Recommended verification flow after deployment:
1. Confirm required env vars are present in Railway (`DATABASE_URL`, `AUTH_SECRET`, `OPENAI_API_KEY`).
2. Redeploy.
3. Verify logs show a single successful server start (no repeated `> start` loops, no unsettled top-level-await warning).

## Performance & Optimization

### Caching Strategy
- React Query: 5-minute stale time, 30-minute cache
- Database: Indexed on `user_id`, `list_id`, `created_at`
- Code Splitting: Lazy loading with React Router

### Optimistic Updates
- Instant UI feedback before server confirmation
- Automatic rollback on errors
- Seamless user experience

### Security
- **Password Hashing**: bcrypt with 10 salt rounds
- **Session Tokens**: Secure random tokens in database
- **SQL Injection**: Protected via parameterized queries
- **Permission Checks**: Enforced at API level
- **HTTPS**: Required in production

## Testing Notes

**Current Status:**
Authentication is temporarily disabled for testing purposes. API routes use a fallback `"test-user"` ID. This should be re-enabled before production deployment by uncommenting the auth checks in:

- `apps/web/src/app/api/lists/route.js`
- `apps/web/src/app/api/lists/[id]/route.js`
- `apps/web/src/app/api/lists/[id]/items/route.js`
- `apps/web/src/app/api/process-input/route.js`

## Future Roadmap

Potential enhancements:

- [ ] Additional AI model support (Anthropic Claude, Gemini)
- [ ] More export formats (JSON, CSV, Markdown)
- [ ] Advanced list templates
- [ ] Calendar integration
- [ ] Recurring tasks and reminders
- [ ] List analytics and insights
- [ ] Team workspaces
- [ ] API webhooks
- [ ] Third-party app integrations
- [ ] Voice input support
- [ ] Offline mode with sync

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Add your license here]

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built with ❤️ using React Router, Expo, PostgreSQL, and OpenAI**
