# Contributing to Surf

Thank you for your interest in contributing to Surf! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We expect all contributors to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, trolling, or discriminatory comments
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js 18+ and Yarn 1.22+
- Git
- Chrome or Arc browser
- Basic knowledge of TypeScript and React
- Familiarity with Chrome extensions (helpful but not required)

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork:**
```bash
git clone https://github.com/YOUR_USERNAME/surf.git
cd surf
```

3. **Add upstream remote:**
```bash
git remote add upstream https://github.com/scottsus/surf.git
```

4. **Install dependencies:**
```bash
yarn install
```

5. **Set up environment variables** (see [DEVELOPMENT.md](docs/DEVELOPMENT.md))

6. **Verify setup:**
```bash
# Start backend
cd apps/web && yarn dev

# In another terminal, start extension
cd apps/majordomo && yarn dev
```

## How to Contribute

### Reporting Bugs

Before creating a bug report:
- Check existing issues to avoid duplicates
- Collect relevant information (browser version, OS, steps to reproduce)

When creating a bug report, include:
- **Clear title** describing the issue
- **Detailed description** of the problem
- **Steps to reproduce** the bug
- **Expected behavior** vs actual behavior
- **Screenshots or videos** (if applicable)
- **Environment details** (browser, OS, extension version)
- **Console logs or error messages**

Example:
```markdown
**Bug**: Cursor doesn't move to correct element

**Steps to Reproduce**:
1. Open extension on amazon.com
2. Enter "Click search button"
3. Observe cursor movement

**Expected**: Cursor moves to search button
**Actual**: Cursor moves to wrong element

**Environment**:
- Browser: Chrome 120.0.6099.109
- OS: macOS 14.1
- Extension version: 0.0.3

**Console Errors**:
```
Error: querySelector returned null
```
```

### Suggesting Enhancements

Enhancement suggestions are welcome! Include:
- **Clear title** describing the enhancement
- **Detailed description** of the proposed feature
- **Use cases** explaining why this would be useful
- **Mockups or examples** (if applicable)
- **Implementation ideas** (optional)

### Contributing Code

We welcome code contributions! Here are areas where you can help:

**High Priority:**
- Performance optimizations
- Bug fixes
- Test coverage
- Documentation improvements

**Feature Requests:**
- New action types
- Additional AI providers
- Custom keyboard shortcuts
- Site-specific optimizations

**Good First Issues:**
- Look for issues labeled `good first issue`
- These are beginner-friendly tasks
- Ask questions if anything is unclear

## Development Process

### 1. Create a Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/changes

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation as needed
- Write tests for new features

### 3. Test Your Changes

**Manual Testing:**
- Load extension in Chrome
- Test affected functionality
- Check for console errors
- Test on multiple websites
- Verify no regressions

**Automated Testing:**
```bash
# Run linter
yarn lint

# Run type check
yarn tsc --noEmit

# Run tests (when available)
yarn test
```

### 4. Commit Your Changes

Write clear, descriptive commit messages:

```bash
# Good commit messages
git commit -m "Add voice mode toggle to command bar"
git commit -m "Fix cursor position calculation on scroll"
git commit -m "Optimize DOM minification performance"

# Avoid vague messages
git commit -m "updates"
git commit -m "fix"
```

Commit message format:
```
<type>: <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build process or auxiliary tool changes

Example:
```
feat: Add voice mode for command input

Implements voice recognition for hands-free command input.
Uses Web Speech API for browser compatibility.

Closes #123
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] Branch is up to date with main
- [ ] No merge conflicts

### Creating a Pull Request

1. **Go to your fork on GitHub**
2. **Click "New Pull Request"**
3. **Select your branch**
4. **Fill out the PR template:**

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Detailed list of changes
- Include file names if helpful

## Testing
How to test these changes:
1. Step 1
2. Step 2
3. Expected result

## Screenshots
(if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] All tests passing
```

### PR Review Process

1. **Automated checks** run (linting, type checking)
2. **Maintainers review** your code
3. **Address feedback** by pushing new commits
4. **Approval** from at least one maintainer
5. **Merge** into main branch

### After Your PR is Merged

- Delete your feature branch
- Update your local main branch
- Celebrate! 🎉

## Coding Standards

### TypeScript

```typescript
// Use explicit types
function processAction(action: Action): Promise<void> {
  // Implementation
}

// Prefer interfaces for objects
interface ActionResult {
  success: boolean;
  message: string;
}

// Use type unions for variants
type Status = "idle" | "loading" | "success" | "error";

// Avoid 'any' - use 'unknown' if type is truly unknown
function handleData(data: unknown) {
  if (typeof data === "string") {
    // Type narrowing
  }
}
```

### React Components

```typescript
// Functional components with explicit props
export function MyComponent({ 
  title, 
  onAction 
}: { 
  title: string; 
  onAction: () => void;
}) {
  return <div>{title}</div>;
}

// Use hooks appropriately
const [state, setState] = useState<string>("");
const ref = useRef<HTMLDivElement>(null);

// Memoize expensive computations
const result = useMemo(() => compute(data), [data]);

// Memoize callbacks passed to children
const handleClick = useCallback(() => {
  // Handler
}, [dependencies]);
```

### File Organization

```typescript
// Imports order:
// 1. External libraries
import { useState } from "react";
import { toast } from "sonner";

// 2. Internal packages
import { Action } from "@repo/types";

// 3. Relative imports
import { useMajordomo } from "./provider";
import styles from "./styles.css";

// Constants at top
const MAX_RETRIES = 3;

// Types/interfaces
interface Props {
  // ...
}

// Component/function
export function MyComponent() {
  // ...
}
```

### Naming Conventions

- **Files**: `kebab-case.tsx`
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`
- **CSS Classes**: `kebab-case`

### Comments

```typescript
// Good: Explain why, not what
// Wait for DOM to settle after navigation
await sleep(1500);

// Good: Document complex algorithms
/**
 * Minifies DOM by extracting only interactive elements.
 * Uses a11y tree and ARIA attributes to identify actionable elements.
 * 
 * @param document - Root element to minify
 * @param pageOpts - Page-specific configuration
 * @returns Array of minified elements
 */
function minifyDom(document: HTMLElement, pageOpts: PageOpts) {
  // ...
}

// Avoid: Obvious comments
// Set count to 0
const count = 0;
```

### Error Handling

```typescript
// Always handle errors
try {
  await riskyOperation();
} catch (err) {
  console.error("Operation failed:", err);
  // Handle gracefully
  return fallbackValue;
}

// Use type guards for error handling
if (err instanceof TypeError) {
  // Handle type error
} else if (err instanceof NetworkError) {
  // Handle network error
}

// Provide context in error messages
throw new Error(`Failed to process action: ${action.type}`);
```

## Testing Guidelines

### Manual Testing Checklist

**For Bug Fixes:**
- [ ] Bug is reproducible before fix
- [ ] Bug is fixed after changes
- [ ] No new bugs introduced
- [ ] Related functionality still works

**For New Features:**
- [ ] Feature works as intended
- [ ] Edge cases handled
- [ ] Error states handled
- [ ] UI is responsive
- [ ] Works on different websites
- [ ] No console errors

**For Refactoring:**
- [ ] Functionality unchanged
- [ ] Performance improved (if applicable)
- [ ] No regressions
- [ ] Code is cleaner/more maintainable

### Test Coverage

When adding tests:
- Test happy path
- Test edge cases
- Test error conditions
- Test with different inputs
- Mock external dependencies

## Documentation

### When to Update Documentation

Update documentation when:
- Adding new features
- Changing existing behavior
- Adding new API endpoints
- Modifying configuration
- Fixing bugs that affect usage

### Documentation Files

- **README.md** - Project overview and quick start
- **docs/ARCHITECTURE.md** - System architecture
- **docs/API.md** - API reference
- **docs/DEVELOPMENT.md** - Development guide
- **CONTRIBUTING.md** - This file

### Code Documentation

```typescript
// Document public APIs
/**
 * Executes the agent loop until task completion.
 * 
 * @param stateManager - Manages extension state
 * @param historyManager - Manages action history
 * @param userInputOpts - User input handlers
 * @param cursorOpts - Cursor control options
 * @returns Promise that resolves when task is complete
 * @throws Error if state cannot be loaded
 */
export async function runUntilCompletion({
  stateManager,
  historyManager,
  userInputOpts,
  cursorOpts,
}: RunUntilCompletionParams): Promise<void> {
  // ...
}
```

## Community

### Communication Channels

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and general discussion
- **Pull Requests** - Code review and collaboration

### Getting Help

If you're stuck:
1. Check existing documentation
2. Search GitHub issues
3. Ask in GitHub Discussions
4. Reach out to maintainers

### Recognition

Contributors are recognized in:
- GitHub contributors page
- Release notes
- Project README (for significant contributions)

## License

By contributing to Surf, you agree that your contributions will be licensed under the MIT License.

## Questions?

If you have questions about contributing, please:
- Open a GitHub Discussion
- Comment on relevant issues
- Reach out to maintainers

Thank you for contributing to Surf! 🏄‍♂️
