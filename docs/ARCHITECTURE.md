# Surf Architecture

## Overview

Surf is an open-source browser extension that equips your browser with AI superpowers, inspired by OpenAI's Operator. The project is built as a Turborepo monorepo with multiple applications and shared packages.

## Project Structure

```
surf/
├── apps/
│   ├── majordomo/          # Browser extension (Chrome/Arc)
│   ├── web/                # Next.js backend server for LLM calls
│   └── fastapi/            # FastAPI backend (alternative/experimental)
├── packages/
│   ├── ai-schemas/         # Zod schemas for AI responses
│   ├── database/           # Prisma database client
│   ├── eslint-config/      # Shared ESLint configurations
│   ├── tailwind-config/    # Shared Tailwind configurations
│   ├── types/              # Shared TypeScript types
│   ├── typescript-config/  # Shared TypeScript configurations
│   └── ui/                 # Shared React UI components
└── docs/                   # Documentation
```

## Core Applications

### 1. Majordomo (Browser Extension)

**Location:** `apps/majordomo/`

The browser extension is the primary user interface for Surf. It runs as a Chrome/Arc extension and provides AI-powered browsing capabilities.

#### Key Components

**Content Scripts:**
- `pages/majordomo/entry.tsx` - Main entry point, sets up shadow DOM and React root
- `pages/majordomo/provider.tsx` - Context provider managing state and communication
- `pages/majordomo/command.tsx` - Command bar UI (CMD+SHIFT+K)
- `pages/majordomo/completer.tsx` - Text completion UI (CMD+SHIFT+;)
- `pages/majordomo/cursor.tsx` - Visual cursor for AI actions
- `pages/majordomo/overlay.tsx` - Overlay UI for monitoring Surf
- `pages/majordomo/pip.tsx` - Picture-in-picture monitoring view

**Background Script:**
- `pages/background/index.ts` - Service worker handling Chrome extension APIs
- Manages tab operations, screenshots, state persistence
- Handles message passing between content scripts and extension

**Agent System:**
- `lib/agent/index.ts` - Main agent loop executing AI-driven actions
- `lib/agent/actions.ts` - Action implementations (click, input, navigate, etc.)
- `lib/agent/keyboard.ts` - Keyboard input simulation

**DOM Processing:**
- `lib/dom/minify-dom.ts` - Converts DOM to minified representation for AI
- `lib/dom/get-elements.ts` - Extracts interactive elements from page

**AI Integration:**
- `lib/ai/api/` - API clients for communicating with backend
  - `choose-action-and-query-selector.ts` - Determines next action
  - `evaluate-actions.ts` - Evaluates action success
  - `complete-sentence.ts` - Text completion
  - `estimate-element-location.ts` - Visual element location

**State Management:**
- Uses Chrome storage API for persistence
- React Context for UI state
- Message passing for cross-component communication

#### Technology Stack
- React 18
- TypeScript
- Vite (build tool)
- CRXJS (Chrome extension plugin)
- Tailwind CSS
- Clerk (authentication)
- Zod (schema validation)

### 2. Web (Backend Server)

**Location:** `apps/web/`

Next.js application serving as the backend for LLM API calls. Handles all AI model interactions.

#### API Routes

**`/api/choose-action-and-query-selector`**
- Determines the next action(s) to take based on user intent and DOM state
- Uses Claude Sonnet 3.7
- Input: user intent, DOM elements, action history
- Output: array of actions with query selectors

**`/api/evaluate-actions`**
- Evaluates whether previous actions were successful
- Uses Claude Haiku
- Input: attempted actions, updated DOM
- Output: success/failure for each action

**`/api/complete-sentence`**
- Completes partial sentences for text completion feature
- Uses default provider (configurable)
- Input: partial sentence
- Output: completion text

**`/api/estimate-element-location`**
- Estimates pixel coordinates of UI elements from screenshots
- Uses default provider with vision capabilities
- Input: screenshot, user intent, dimensions
- Output: x,y coordinates

#### AI Providers

The backend supports multiple AI providers:
- **Anthropic**: Claude Haiku, Claude Sonnet
- **OpenAI**: GPT-4 Turbo, GPT-4o Mini
- **Google**: Gemini 2.0 Flash

Providers are configured in `lib/ai/clients/`:
- `anthropic.ts` - Claude models
- `openai.ts` - GPT models
- `google.ts` - Gemini models
- `default-provider.ts` - Default provider selection

#### Technology Stack
- Next.js 15
- TypeScript
- Vercel AI SDK
- Prisma (database ORM)
- Clerk (authentication)
- Tailwind CSS

### 3. FastAPI (Experimental Backend)

**Location:** `apps/fastapi/`

Alternative Python-based backend using FastAPI. Currently experimental.

## Shared Packages

### @repo/ai-schemas

Zod schemas defining the structure of AI responses:
- `choose-action-and-query-selector.ts` - Action selection schema
- `evaluate-actions.ts` - Action evaluation schema
- `complete-sentence.ts` - Text completion schema
- `estimate-element-location.ts` - Element location schema

### @repo/types

Shared TypeScript types used across the monorepo:
- `action.ts` - Action type definitions
- `action-metadata.ts` - Action metadata and state
- `element.ts` - DOM element types
- `page-opts.ts` - Page-specific options

### @repo/database

Prisma database client for user data and state persistence.

### @repo/ui

Shared React UI components:
- Button, Card, Checkbox, Dialog, Drawer
- Toast notifications
- Loading spinners
- Custom hooks (use-toast)

### Configuration Packages

- `@repo/eslint-config` - Shared ESLint rules
- `@repo/tailwind-config` - Shared Tailwind configuration
- `@repo/typescript-config` - Shared TypeScript configuration

## Data Flow

### 1. User Initiates Action

```
User presses CMD+SHIFT+K
  ↓
CommandBar opens
  ↓
User enters intent
  ↓
State saved to Chrome storage
```

### 2. Agent Loop Execution

```
runUntilCompletion() starts
  ↓
minifyDom() - Convert page to AI-readable format
  ↓
POST /api/choose-action-and-query-selector
  ↓
Backend: Claude Sonnet analyzes intent + DOM
  ↓
Returns action(s) to take
  ↓
Execute action (click, input, navigate, etc.)
  ↓
Wait for UI changes (1.5s)
  ↓
POST /api/evaluate-actions
  ↓
Backend: Claude Haiku evaluates success
  ↓
Update action history
  ↓
Repeat until done or max steps (10)
```

### 3. Message Passing

```
Content Script ←→ Background Script
     ↓                    ↓
  Chrome APIs      Tab Management
  DOM Access       Screenshots
  UI Rendering     State Storage
```

## Key Design Patterns

### Shadow DOM Isolation

The extension uses Shadow DOM to isolate its UI from the host page:
- Prevents CSS conflicts
- Maintains consistent styling
- Protects against page JavaScript interference

### Message-Based Architecture

All communication between components uses Chrome's message passing:
- Content scripts send messages to background script
- Background script handles Chrome API calls
- Responses returned via callbacks

### State Management

Multi-layer state management:
1. **Chrome Storage** - Persistent state across sessions
2. **React Context** - UI state within content script
3. **Refs** - Cross-component function references

### AI-First Design

The agent loop is designed around AI decision-making:
- DOM is minified to fit in context windows
- Actions are evaluated by AI for success
- History is maintained for context
- Clarification requests when uncertain

## Performance Considerations

### DOM Minification

The `minifyDom` function is called every 1.5 seconds in the agent loop:
- Filters out non-interactive elements
- Deduplicates similar elements
- Truncates long text content
- Limits total DOM size to 150,000 characters

### Message Listener Optimization

Background script uses a single consolidated message listener:
- Reduces overhead from multiple listener registrations
- Switch statement for efficient routing
- Proper async handling with `return true`

### Caching and Memoization

Opportunities for optimization:
- DOM minification results could be cached
- State loading could be memoized
- Repeated Chrome API calls could be batched

## Security Considerations

### Content Security

- Shadow DOM isolation prevents page interference
- Message validation for all Chrome API calls
- No eval() or unsafe code execution

### Authentication

- Clerk integration for user authentication
- Secure token storage
- API key management on backend

### Data Privacy

- User data stored locally in Chrome storage
- LLM calls go through backend (no direct API keys in extension)
- No telemetry collection (planned feature with opt-in)

## Extension Permissions

Required Chrome permissions:
- `activeTab` - Access to current tab
- `tabs` - Tab management
- `storage` - State persistence
- `scripting` - Content script injection
- `tabCapture` - Screenshot capability
- Host permissions for target websites

## Development Workflow

### Build Process

```bash
# Install dependencies
yarn install

# Development mode (hot reload)
yarn dev

# Build for production
yarn build

# Lint code
yarn lint
```

### Extension Loading

1. Run `yarn dev` in `apps/majordomo`
2. Go to `chrome://extensions`
3. Enable Developer Mode
4. Click "Load Unpacked"
5. Select `apps/majordomo/dist/`

### Backend Development

1. Run `yarn dev` in `apps/web`
2. Server starts on `http://localhost:3000`
3. Configure `SERVER_URL` in extension

## Future Architecture Considerations

### Scalability

- Consider WebSocket for real-time updates
- Implement request queuing for rate limiting
- Add caching layer for repeated queries

### Extensibility

- Plugin system for custom actions
- Configurable AI providers
- Custom DOM selectors per site

### Performance

- Implement virtual DOM diffing
- Add request batching
- Optimize minifyDom algorithm
- Consider WebAssembly for heavy processing

## References

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Anthropic Claude API](https://docs.anthropic.com/)
