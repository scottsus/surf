# Surf Development Guide

## Getting Started

### Prerequisites

- **Node.js** 18+ and **Yarn** 1.22+
- **Chrome** or **Arc** browser
- **Git**
- **API Keys** (for backend):
  - Anthropic API key
  - OpenAI API key (optional)
  - Google AI API key (optional)
  - Clerk account for authentication

### Initial Setup

1. **Clone the repository:**
```bash
git clone https://github.com/scottsus/surf.git
cd surf
```

2. **Install dependencies:**
```bash
yarn install
```

3. **Set up environment variables:**

For the backend (`apps/web/.env.local`):
```bash
# AI Provider API Keys
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Database (optional for development)
DATABASE_URL=your_database_url
```

For the extension (`apps/majordomo/.env`):
```bash
# Development only - pre-fill command prompt
VITE_INITIAL_COMMAND_PROMPT="Search for MacBook Pro"

# Backend server URL
SERVER_URL=http://localhost:3000
```

## Development Workflow

### Running the Backend

```bash
# From root directory
cd apps/web
yarn dev
```

The backend will start on `http://localhost:3000`.

### Running the Extension

```bash
# From root directory
cd apps/majordomo
yarn dev
```

This starts Vite in watch mode. The extension will be built to `apps/majordomo/dist/`.

### Loading the Extension

1. Open Chrome/Arc and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `apps/majordomo/dist/` directory
5. The extension should now appear in your extensions list

### Hot Reload

- **Backend**: Next.js automatically reloads on file changes
- **Extension**: Vite rebuilds on file changes, but you need to:
  1. Click the reload icon on the extension card in `chrome://extensions`
  2. Or use the keyboard shortcut (usually Ctrl+R on the extensions page)
  3. Refresh any open tabs where you want to use the extension

## Project Structure Deep Dive

### Extension Entry Points

**Content Script:**
- Entry: `apps/majordomo/src/pages/majordomo/entry.tsx`
- Injected into every page
- Creates Shadow DOM for UI isolation
- Sets up React root and providers

**Background Script:**
- Entry: `apps/majordomo/src/pages/background/index.ts`
- Runs as service worker
- Handles Chrome API calls
- Manages state persistence

**Popup:**
- Entry: `apps/majordomo/src/pages/popup/Popup.tsx`
- Extension popup UI (currently minimal)

### Key Directories

```
apps/majordomo/src/
├── components/          # Reusable React components
├── hooks/              # Custom React hooks
├── lib/
│   ├── agent/          # AI agent logic
│   ├── ai/             # AI API clients
│   ├── auth/           # Authentication
│   ├── dom/            # DOM manipulation
│   └── interface/      # TypeScript interfaces
└── pages/
    ├── background/     # Background script
    ├── majordomo/      # Content script UI
    ├── popup/          # Extension popup
    └── sticker/        # Sticker UI component
```

## Common Development Tasks

### Adding a New Action Type

1. **Define the action in types:**
```typescript
// packages/types/src/action.ts
export interface MyNewAction {
  type: "my_new_action";
  param1: string;
  param2: number;
}

export type Action = 
  | ClickAction
  | InputAction
  | MyNewAction  // Add here
  | ...
```

2. **Update AI schema:**
```typescript
// packages/ai-schemas/src/choose-action-and-query-selector.ts
const actionSchema = z.discriminatedUnion("type", [
  clickActionSchema,
  inputActionSchema,
  z.object({  // Add schema
    type: z.literal("my_new_action"),
    param1: z.string(),
    param2: z.number(),
  }),
  ...
]);
```

3. **Implement action handler:**
```typescript
// apps/majordomo/src/lib/agent/actions.ts
export async function takeMyNewAction({
  param1,
  param2,
}: {
  param1: string;
  param2: number;
}) {
  const runnable = async () => {
    // Implementation
  };
  return { runnable };
}
```

4. **Add to agent loop:**
```typescript
// apps/majordomo/src/lib/agent/index.ts
switch (action.type) {
  // ... existing cases
  case "my_new_action":
    const response = await takeMyNewAction({
      param1: action.param1,
      param2: action.param2,
    });
    runnable = response.runnable;
    break;
}
```

5. **Update backend prompt:**
```typescript
// apps/web/src/app/api/choose-action-and-query-selector/prompts.ts
// Add documentation for the new action type
```

### Adding a New API Endpoint

1. **Create route file:**
```typescript
// apps/web/src/app/api/my-endpoint/route.ts
export async function POST(req: Request) {
  try {
    const { param } = await req.json();
    
    // Process request
    const result = await processData(param);
    
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    console.error("my-endpoint:", err);
    return new Response(JSON.stringify(err), { status: 500 });
  }
}
```

2. **Create client function:**
```typescript
// apps/majordomo/src/lib/ai/api/my-endpoint.ts
export async function callMyEndpoint(param: string) {
  try {
    const res = await fetch(`${SERVER_URL}/api/my-endpoint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ param }),
    });
    
    if (!res.ok) {
      throw new Error("non-2xx http status");
    }
    
    return await res.json();
  } catch (err) {
    console.error("callMyEndpoint:", err);
    return null;
  }
}
```

### Adding a New UI Component

1. **Create component:**
```typescript
// apps/majordomo/src/components/MyComponent.tsx
import { useState } from "react";

export function MyComponent({ prop1 }: { prop1: string }) {
  const [state, setState] = useState("");
  
  return (
    <div className="my-component">
      {/* Component JSX */}
    </div>
  );
}
```

2. **Add to content script:**
```typescript
// apps/majordomo/src/pages/majordomo/entry.tsx
import { MyComponent } from "@src/components/MyComponent";

root.render(
  <MajordomoProvider>
    <Overlay>
      <CommandBar />
      <MyComponent prop1="value" />
    </Overlay>
  </MajordomoProvider>
);
```

### Modifying the Agent Loop

The agent loop is in `apps/majordomo/src/lib/agent/index.ts`.

**Key parameters:**
- `MAX_RUN_STEPS`: Maximum iterations (default: 10)
- Sleep duration: Wait time between actions (default: 1500ms)
- `USE_AI_EVALS_FOR_PREV_ACTIONS`: Enable AI evaluation of actions

**Debugging tips:**
- Add `console.log` statements liberally
- Check `history` array to see action sequence
- Monitor `thinkingState` for current agent status
- Use Chrome DevTools to inspect state

### Working with State

**Chrome Storage:**
```typescript
// Load state
const state = await loadState();

// Save state
await saveState({ userIntent: "new intent" });

// Clear state
await clearState("Task completed");
```

**React Context:**
```typescript
const { 
  thinkingState, 
  setThinkingState,
  cursorPosition,
  setCursorPosition 
} = useMajordomo();
```

## Debugging

### Extension Debugging

1. **Content Script:**
   - Open DevTools on the page
   - Console logs appear in page console
   - Use `debugger;` statements

2. **Background Script:**
   - Go to `chrome://extensions`
   - Click "Service worker" link under your extension
   - Opens DevTools for background script

3. **Popup:**
   - Right-click extension icon
   - Select "Inspect popup"

### Common Issues

**Extension not loading:**
- Check for syntax errors in console
- Verify manifest.json is valid
- Ensure all required permissions are declared

**Actions not executing:**
- Check if element selector is correct
- Verify DOM is fully loaded
- Check for Shadow DOM interference
- Look for JavaScript errors on page

**Backend not responding:**
- Verify server is running on correct port
- Check API key environment variables
- Look for CORS issues
- Check network tab in DevTools

**State not persisting:**
- Verify Chrome storage permissions
- Check for storage quota limits
- Ensure state is being saved correctly

### Logging Best Practices

```typescript
// Good: Structured logging
console.log("Action executed:", { 
  type: action.type, 
  success: true 
});

// Good: Error logging with context
console.error("Failed to execute action:", {
  action,
  error: err.message,
  stack: err.stack
});

// Avoid: Vague logs
console.log("it worked");
```

## Testing

### Manual Testing Checklist

**Extension Loading:**
- [ ] Extension loads without errors
- [ ] Icon appears in toolbar
- [ ] Popup opens correctly

**Command Bar:**
- [ ] Opens with CMD+SHIFT+K
- [ ] Accepts text input
- [ ] Submits on Enter
- [ ] Closes properly

**Agent Execution:**
- [ ] Actions execute correctly
- [ ] Cursor moves smoothly
- [ ] State persists across reloads
- [ ] Error handling works

**Text Completion:**
- [ ] Opens with CMD+SHIFT+;
- [ ] Completes sentences
- [ ] Inserts at cursor position

**Authentication:**
- [ ] Sign in flow works
- [ ] Auth state persists
- [ ] Sign out works

### Testing Different Websites

Test on various site types:
- **E-commerce**: Amazon, eBay
- **Social Media**: Twitter, LinkedIn
- **Search**: Google, Bing
- **Forms**: Government sites, applications
- **SPAs**: Gmail, Google Docs

### Performance Testing

Monitor:
- Memory usage (Chrome Task Manager)
- CPU usage during agent execution
- Network requests (DevTools Network tab)
- DOM minification time

## Code Style

### TypeScript

```typescript
// Use explicit types
function processAction(action: Action): Promise<void> {
  // ...
}

// Prefer interfaces for objects
interface ActionResult {
  success: boolean;
  message: string;
}

// Use type unions for variants
type Status = "idle" | "loading" | "success" | "error";
```

### React

```typescript
// Functional components with TypeScript
export function MyComponent({ 
  prop1, 
  prop2 
}: { 
  prop1: string; 
  prop2: number 
}) {
  // ...
}

// Use hooks at top level
const [state, setState] = useState("");
const ref = useRef<HTMLDivElement>(null);

// Memoize expensive computations
const result = useMemo(() => expensiveCalc(data), [data]);
```

### Naming Conventions

- **Files**: kebab-case (`my-component.tsx`)
- **Components**: PascalCase (`MyComponent`)
- **Functions**: camelCase (`processAction`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RUN_STEPS`)
- **Types/Interfaces**: PascalCase (`ActionMetadata`)

### Comments

```typescript
// Good: Explain why, not what
// Wait for DOM to settle before querying elements
await sleep(1500);

// Good: Document complex logic
/**
 * Minifies DOM by extracting only interactive elements.
 * Filters out non-interactive elements to reduce context size.
 */
function minifyDom() { }

// Avoid: Obvious comments
// Set x to 5
const x = 5;
```

## Git Workflow

### Branch Naming

```bash
# Feature branches
git checkout -b feature/add-voice-mode

# Bug fixes
git checkout -b fix/cursor-position-bug

# Documentation
git checkout -b docs/update-api-docs
```

### Commit Messages

```bash
# Good: Clear, descriptive
git commit -m "Add voice mode toggle to command bar"
git commit -m "Fix cursor position calculation on scroll"

# Avoid: Vague
git commit -m "updates"
git commit -m "fix bug"
```

### Pull Requests

1. Create feature branch
2. Make changes and commit
3. Push to remote
4. Create PR with description:
   - What changed
   - Why it changed
   - How to test
   - Screenshots (if UI change)

## Performance Optimization

### DOM Minification

Current bottlenecks:
- `querySelectorAll("*")` is expensive
- Called every 1.5 seconds in agent loop
- No caching of results

Optimization opportunities:
- Cache minified DOM between iterations
- Use MutationObserver to detect changes
- Implement incremental updates

### State Management

Current bottlenecks:
- Multiple Chrome storage reads per iteration
- No batching of state updates
- Redundant state loading

Optimization opportunities:
- Cache state in memory
- Batch state updates
- Use React state for UI, Chrome storage for persistence

### Network Requests

Current bottlenecks:
- Sequential API calls
- No request caching
- Large payload sizes

Optimization opportunities:
- Batch multiple actions
- Cache repeated queries
- Compress payloads

## Deployment

### Extension Deployment

1. **Build for production:**
```bash
cd apps/majordomo
yarn build
```

2. **Test production build:**
   - Load `dist/` folder in Chrome
   - Test all features
   - Check for console errors

3. **Package for Chrome Web Store:**
   - Zip the `dist/` folder
   - Upload to Chrome Web Store Developer Dashboard
   - Fill out store listing
   - Submit for review

### Backend Deployment

The backend is deployed on Vercel:

1. **Connect repository to Vercel**
2. **Configure environment variables**
3. **Deploy:**
```bash
cd apps/web
vercel deploy
```

## Troubleshooting

### Build Errors

**"Module not found":**
- Run `yarn install` again
- Check import paths
- Verify package is in dependencies

**TypeScript errors:**
- Check type definitions
- Verify imports are correct
- Run `yarn tsc --noEmit` to see all errors

### Runtime Errors

**"Cannot read property of undefined":**
- Add null checks
- Use optional chaining (`?.`)
- Verify data is loaded before accessing

**"Maximum call stack size exceeded":**
- Check for infinite loops
- Look for circular dependencies
- Verify recursive functions have base cases

### Extension-Specific Issues

**"Extension context invalidated":**
- Extension was reloaded
- Refresh the page
- Restart Chrome if persists

**"Could not establish connection":**
- Background script may have crashed
- Check background script console
- Reload extension

## Resources

### Documentation
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Anthropic API](https://docs.anthropic.com/)

### Tools
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Turborepo](https://turbo.build/repo/docs)

### Community
- [GitHub Issues](https://github.com/scottsus/surf/issues)
- [Discussions](https://github.com/scottsus/surf/discussions)

## Getting Help

1. Check existing documentation
2. Search GitHub issues
3. Ask in GitHub Discussions
4. Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/logs
   - Environment details
