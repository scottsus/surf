# Surf API Documentation

## Backend API Endpoints

All API endpoints are hosted on the Next.js backend (`apps/web`) and are called by the browser extension.

### POST /api/choose-action-and-query-selector

Determines the next action(s) to take based on user intent and current page state.

**Request:**
```typescript
FormData {
  userIntent: string;        // User's goal (e.g., "Find flights to Paris")
  hostname: string;          // Current page hostname
  htmlDom: string;          // JSON stringified MinifiedElement[]
  history: string;          // JSON stringified ActionMetadata[][]
}
```

**Response:**
```typescript
{
  actions: Action[]
}

type Action = 
  | { type: "click"; idx: number }
  | { type: "input"; idx: number; content: string; withSubmit: boolean }
  | { type: "navigate"; url: string }
  | { type: "refresh" }
  | { type: "back" }
  | { type: "clarify"; question: string }
  | { type: "done"; explanation: string }
```

**AI Model:** Claude Sonnet 3.7

**Example:**
```typescript
const formData = new FormData();
formData.append("userIntent", "Search for MacBook Pro");
formData.append("hostname", "amazon.com");
formData.append("htmlDom", JSON.stringify(minifiedElements));
formData.append("history", JSON.stringify([]));

const response = await fetch(`${SERVER_URL}/api/choose-action-and-query-selector`, {
  method: "POST",
  body: formData,
});

const { actions } = await response.json();
// actions: [{ type: "input", idx: 42, content: "MacBook Pro", withSubmit: true }]
```

---

### POST /api/evaluate-actions

Evaluates whether previously attempted actions were successful.

**Request:**
```typescript
FormData {
  actions: string;          // JSON stringified action summaries
  htmlDom: string;          // JSON stringified updated DOM state
}
```

**Response:**
```typescript
{
  evaluations: boolean[]    // Success/failure for each action
}
```

**AI Model:** Claude Haiku

**Example:**
```typescript
const formData = new FormData();
formData.append("actions", JSON.stringify([
  "Clicked search button",
  "Entered 'MacBook Pro' in search field"
]));
formData.append("htmlDom", JSON.stringify(updatedDom));

const response = await fetch(`${SERVER_URL}/api/evaluate-actions`, {
  method: "POST",
  body: formData,
});

const { evaluations } = await response.json();
// evaluations: [true, true]
```

---

### POST /api/complete-sentence

Completes a partial sentence for the text completion feature.

**Request:**
```typescript
{
  currentSentence: string   // Partial sentence to complete
}
```

**Response:**
```typescript
{
  ok: boolean;              // Whether completion was successful
  completion: string;       // Completed text (if ok: true)
}
```

**AI Model:** Default provider (configurable)

**Example:**
```typescript
const response = await fetch(`${SERVER_URL}/api/complete-sentence`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    currentSentence: "The capital of France is"
  }),
});

const { ok, completion } = await response.json();
// { ok: true, completion: "Paris." }
```

---

### POST /api/estimate-element-location

Estimates pixel coordinates of a UI element from a screenshot.

**Request:**
```typescript
FormData {
  userIntent: string;       // What element to find
  screenshot: string;       // Base64 encoded screenshot
  dimensions: {
    width: number;
    height: number;
  }
}
```

**Response:**
```typescript
{
  ok: boolean;
  xEstimate: number;        // X coordinate (if ok: true)
  yEstimate: number;        // Y coordinate (if ok: true)
}
```

**AI Model:** Default provider with vision capabilities

**Example:**
```typescript
const formData = new FormData();
formData.append("userIntent", "Click the search button");
formData.append("screenshot", base64Screenshot);
formData.append("dimensions", JSON.stringify({ width: 1920, height: 1080 }));

const response = await fetch(`${SERVER_URL}/api/estimate-element-location`, {
  method: "POST",
  body: formData,
});

const { ok, xEstimate, yEstimate } = await response.json();
// { ok: true, xEstimate: 960, yEstimate: 100 }
```

---

## Chrome Extension APIs

### Background Script Messages

The background script handles Chrome API operations via message passing.

**Message Format:**
```typescript
{
  action: string;           // Action type
  [key: string]: any;       // Additional parameters
}
```

#### Available Actions

**get_tab_id**
```typescript
// Request
{ action: "get_tab_id" }

// Response
{ id: number }
```

**screenshot**
```typescript
// Request
{ action: "screenshot" }

// Response
{ ok: boolean; screenshot: string }
```

**navigate**
```typescript
// Request
{ action: "navigate"; url: string }

// Response
{ ok: boolean }
```

**refresh**
```typescript
// Request
{ action: "refresh" }

// Response
{ ok: boolean }
```

**back**
```typescript
// Request
{ action: "back" }

// Response
{ ok: boolean }
```

**load_state**
```typescript
// Request
{ action: "load_state" }

// Response
ExtensionState | null
```

**save_state**
```typescript
// Request
{ action: "save_state"; state: Partial<ExtensionState> }

// Response
{ ok: boolean }
```

**clear_state**
```typescript
// Request
{ action: "clear_state" }

// Response
{ ok: boolean }
```

**abort**
```typescript
// Request
{ action: "abort" }

// Response
{ ok: boolean }
```

**auth_state_changed**
```typescript
// Request
{ action: "auth_state_changed"; isSignedIn: boolean }

// Response
{ ok: boolean }
```

**get_auth_state**
```typescript
// Request
{ action: "get_auth_state" }

// Response
{ isSignedIn: boolean }
```

**screencast_in_background**
```typescript
// Request
{ action: "screencast_in_background" }

// Response
{ streamId: string }
```

---

## Type Definitions

### MinifiedElement

Represents a simplified DOM element for AI processing.

```typescript
interface MinifiedElement {
  tag: string;              // Element role/type
  id: string;               // Element ID
  topic: string;            // Text content or label
  idx: number;              // Index in element array
  meta: {
    querySelector: string;  // CSS selector to find element
  };
}
```

### Action

Represents an action the AI agent can take.

```typescript
type Action = 
  | ClickAction
  | InputAction
  | NavigateAction
  | RefreshAction
  | BackAction
  | ClarifyAction
  | DoneAction;

interface ClickAction {
  type: "click";
  idx: number;              // Element index to click
}

interface InputAction {
  type: "input";
  idx: number;              // Element index to input into
  content: string;          // Text to input
  withSubmit: boolean;      // Whether to submit form after input
}

interface NavigateAction {
  type: "navigate";
  url: string;              // URL to navigate to
}

interface RefreshAction {
  type: "refresh";
}

interface BackAction {
  type: "back";
}

interface ClarifyAction {
  type: "clarify";
  question: string;         // Question to ask user
}

interface DoneAction {
  type: "done";
  explanation: string;      // Why task is complete
}
```

### ActionMetadata

Tracks action execution and results.

```typescript
interface ActionMetadata {
  action: Action;           // The action taken
  querySelector: string;    // CSS selector used (if applicable)
  summary: string;          // Human-readable summary
  state: ActionState;       // Current state
}

enum ActionState {
  IN_PROGRESS = "in_progress",
  SUCCESS = "success",
  FAILURE = "failure",
}
```

### ExtensionState

Persistent state stored in Chrome storage.

```typescript
interface ExtensionState {
  workingTabId: number;     // Tab where agent is working
  userIntent: string;       // User's goal
  step: number;             // Current step in agent loop
  history: ActionMetadata[][]; // Action history by step
  error?: string;           // Error message if failed
  cursorPosition?: {
    x: number;
    y: number;
  };
}
```

### ThinkingState

UI state showing what the agent is doing.

```typescript
type ThinkingState =
  | { type: "idle" }
  | { type: "awaiting_ui_changes" }
  | { type: "deciding_action" }
  | { type: "action"; action: Action }
  | { type: "clicking_button" }
  | { type: "done" }
  | { type: "require_assistance" }
  | { type: "error"; errorMessage: string };
```

### PageOpts

Page-specific configuration options.

```typescript
interface PageOpts {
  hostname: string;
  includeIdInQuerySelector: boolean;
  useWithSubmit: boolean;
}
```

---

## Agent Functions

### runUntilCompletion

Main agent loop that executes actions until task completion.

```typescript
async function runUntilCompletion({
  stateManager: {
    loadState: () => Promise<ExtensionState | null>;
    clearState: (expl: string) => Promise<void>;
    errorState: (error: string) => Promise<void>;
    setThinkingState: React.Dispatch<React.SetStateAction<ThinkingState>>;
  };
  historyManager: {
    getLatestActions: () => Promise<ActionMetadata[] | null | undefined>;
    appendHistory: (params: { step: number; action: ActionMetadata }) => Promise<void>;
    incrStep: () => void;
    applyEvaluations: (params: { evaluation: boolean[] }) => Promise<void>;
  };
  userInputOpts: {
    clarifyInputRef: MutableRefObject<(() => Promise<string>) | null>;
    overlayBlurRef: MutableRefObject<((blur: boolean) => void) | null>;
    checkTakeOverRef: MutableRefObject<boolean>;
    takeOverRef: MutableRefObject<(() => Promise<void>) | null>;
    setTakeOverStateRef: MutableRefObject<React.Dispatch<React.SetStateAction<TakeOverState>> | null>;
  };
  cursorOpts: {
    performClickRef: MutableRefObject<(() => void) | null>;
    updateCursorPosition: (coord: CursorCoordinate) => Promise<void>;
    setCursorPosition: React.Dispatch<React.SetStateAction<CursorCoordinate>>;
  };
}): Promise<void>
```

**Flow:**
1. Load current state
2. Wait for UI changes (1.5s)
3. Minify DOM
4. Evaluate previous actions (if any)
5. Generate next action(s)
6. Execute action(s)
7. Check for user takeover
8. Append to history
9. Repeat until done or max steps (10)

### minifyDom

Converts DOM to AI-readable format.

```typescript
function minifyDom({
  document: HTMLElement;
  pageOpts: PageOpts;
}): MinifiedElement[]
```

**Process:**
1. Query all elements (including iframes)
2. Filter out non-interactive elements
3. Extract relevant attributes (href, aria-label, title, etc.)
4. Generate unique CSS selectors
5. Deduplicate similar elements
6. Truncate long text content
7. Return array of MinifiedElement

### generateAction

Calls backend to determine next action.

```typescript
async function generateAction({
  userIntent: string;
  minifiedElements: MinifiedElement[];
  history: ActionMetadata[][];
  pageOpts: PageOpts;
}): Promise<Action[]>
```

### evaluateActions

Calls backend to evaluate action success.

```typescript
async function evaluateActions({
  latestActions: ActionMetadata[];
  minifiedElements: MinifiedElement[];
}): Promise<boolean[]>
```

---

## React Hooks

### useMajordomo

Access Majordomo context and functions.

```typescript
const {
  authState,
  currentTabIsWorking,
  loadState,
  clearState,
  errorState,
  stateTrigger,
  thinkingState,
  setThinkingState,
  setUserIntent,
  setClarifyInput,
  setOverlayBlur,
  setOverlayExit,
  setOverlayError,
  checkTakeOverRef,
  setTakeOverRef,
  setTakeOverStateRef,
  setPerformClick,
  updateCursorPosition,
  cursorPosition,
  setCursorPosition,
} = useMajordomo();
```

### useAuthState

Monitor authentication state.

```typescript
const authState = useAuthState();
// { isSignedIn: boolean }
```

### useWindowSize

Get current window dimensions.

```typescript
const { windowSize } = useWindowSize();
// { width: number; height: number }
```

---

## Environment Variables

### Extension (apps/majordomo)

```bash
# Development
VITE_INITIAL_COMMAND_PROMPT=""  # Pre-fill command prompt in dev mode

# Server URL
SERVER_URL="http://localhost:3000"  # Backend server URL
```

### Backend (apps/web)

```bash
# AI Provider API Keys
ANTHROPIC_API_KEY=""
OPENAI_API_KEY=""
GOOGLE_GENERATIVE_AI_API_KEY=""

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""

# Database
DATABASE_URL=""

# Deployment
VERCEL_URL=""
```

---

## Error Handling

### Backend Errors

All API endpoints return errors in this format:

```typescript
{
  error: string;            // Error message
  details?: any;            // Additional error details
}
```

HTTP Status Codes:
- `200` - Success
- `400` - Bad request (missing parameters)
- `500` - Internal server error

### Extension Errors

Errors are handled at multiple levels:

1. **Agent Loop**: Caught in `runUntilCompletion`, sets error state
2. **Action Execution**: Individual actions handle their own errors
3. **Message Passing**: Chrome API errors are logged to console
4. **UI**: Error state displayed in overlay

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding:
- Request queuing in extension
- Rate limiting middleware on backend
- Exponential backoff for retries

---

## Testing

### Backend API Testing

```bash
# Test action selection
curl -X POST http://localhost:3000/api/choose-action-and-query-selector \
  -F "userIntent=Search for MacBook" \
  -F "hostname=amazon.com" \
  -F "htmlDom=[]" \
  -F "history=[]"

# Test sentence completion
curl -X POST http://localhost:3000/api/complete-sentence \
  -H "Content-Type: application/json" \
  -d '{"currentSentence":"The capital of France is"}'
```

### Extension Testing

1. Load extension in Chrome
2. Open Chrome DevTools
3. Check Console for logs
4. Use `chrome.runtime.sendMessage()` to test message passing

---

## Best Practices

### API Usage

1. Always validate input before sending to backend
2. Handle network errors gracefully
3. Implement retry logic for transient failures
4. Log requests for debugging

### State Management

1. Minimize Chrome storage writes (they're async and slow)
2. Batch state updates when possible
3. Clear state on task completion
4. Handle state corruption gracefully

### Performance

1. Debounce frequent operations
2. Cache repeated queries
3. Minimize DOM queries
4. Use efficient selectors

### Security

1. Validate all message inputs
2. Sanitize user input before sending to AI
3. Never expose API keys in extension
4. Use HTTPS for all API calls
