# Testing Infrastructure - Implementation Guide

## TDD Testing Architecture

This project implements a **three-level testing pyramid** following TDD principles:

### 1. Component Tests (Vitest + React Testing Library)

**Location**: `src/**/__tests__/*.test.{ts,tsx}` | **Command**: `pnpm test`

- **Purpose**: Unit tests for React components and hooks
- **Framework**: Vitest (fast, Vite-native) + React Testing Library
- **Features**: Component rendering, user interactions, accessibility testing
- **Execution**: ~10 seconds for 29 tests

```tsx
// Example: Component test with mock auth
import { render, screen } from '@/test/test-utils';
import { Button } from '../button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

### 2. Integration Tests (Vitest + MSW)

**Location**: `src/**/*.integration.test.{ts,tsx}` | **Command**: `pnpm test`

- **Purpose**: Feature workflows with mocked backend APIs
- **Framework**: Vitest + MSW (Mock Service Worker)
- **Features**: Store integration, API calls, state management
- **Configuration**: Auto-configured in `src/test/setup.ts`

### 3. UI Tests (Playwright)

**Location**: `src/test/ui/*.spec.ts` | **Command**: `pnpm test:ui`

- **Purpose**: Full user journeys with mock authentication
- **Framework**: Playwright with multi-browser support
- **Features**: Complete workflow testing, project-based authentication
- **Configuration**: Automatic dev server startup with authentication state management

```ts
// Example: UI test with authentication
test('dashboard navigation', async ({ page }) => {
  await page.goto('/dashboard');
  await page.getByRole('link', { name: /products/i }).click();
  await expect(page).toHaveURL(/.*\/dashboard\/products/);
});
```

#### **Playwright Projects Architecture**

The UI tests use **three separate Playwright projects** for different authentication scenarios:

| Project             | File Pattern                | Authentication            | Purpose                  |
| ------------------- | --------------------------- | ------------------------- | ------------------------ |
| **`global setup`**  | `global.setup.ts`           | 🔧 **Creates auth state** | Authentication setup     |
| **`authenticated`** | `*authenticated*.spec.ts`   | ✅ **Has auth state**     | Dashboard functionality  |
| **`auth-less`**     | `!(authenticated)*.spec.ts` | ❌ **No auth state**      | Public pages, UI quality |

**Project Configuration**:

```typescript
// playwright.config.ts
projects: [
  {
    name: 'global setup',
    testMatch: /global\.setup\.ts/,
    use: customChromeConfig
  },
  {
    name: 'authenticated',
    testMatch: /.*authenticated.*\.spec\.ts/,
    use: {
      ...customChromeConfig,
      storageState: '.test-data/mock-auth/user.json' // 🔑 Pre-loaded auth
    },
    dependencies: ['global setup']
  },
  {
    name: 'auth-less',
    testMatch: /^(?!.*authenticated).*\.spec\.ts$/,
    use: customChromeConfig, // 🚫 Clean slate
    dependencies: ['global setup']
  }
];
```

## Test Configuration Files

### Core Config

- **`vitest.config.ts`**: Vitest configuration with React plugin
- **`playwright.config.ts`**: Playwright UI configuration
- **`src/test/setup.ts`**: Global test setup (auth mocks, Next.js mocks, jest-dom)
- **`src/test/test-utils.tsx`**: Custom render with providers

### Mock Infrastructure

- **Direct mocks**: Uses `fakeProducts` from `constants/mock-api.ts` for data

## Test Commands Reference

```bash
# Three-Level Testing Pyramid
pnpm test:unit              # Component & Integration tests (Vitest)
pnpm test:ui:headless      # End-to-end tests (Playwright)
pnpm test:all               # Complete test suite (both levels)

# Development & Debugging
pnpm test:unit:watch        # Watch mode for TDD development
pnpm test:unit:coverage     # Generate coverage reports
```

## TDD Development Workflow

### Red-Green-Refactor Cycle

1. **🔴 Red**: Write failing test first
2. **🟢 Green**: Write minimal code to pass
3. **🔵 Refactor**: Improve code while keeping tests green
4. **🔄 Repeat**: Next feature/requirement

### Test-First Implementation Pattern

```bash
# 1. Write component test (fails)
touch src/features/products/components/__tests__/ProductCard.test.tsx

# 2. Write integration test (fails)
touch src/features/products/__tests__/ProductStore.integration.test.tsx

# 3. Implement component (tests pass)
touch src/features/products/components/ProductCard.tsx

# 4. Implement store (integration tests pass)
touch src/features/products/stores/product-store.ts

# 5. Write UI test (fails)
touch src/test/ui/products.spec.ts

# 6. Connect API integration (UI passes)
```

## Test File Organization

```
src/test/
├── setup.ts                          # Global test configuration & mocks
├── test-utils.tsx                    # Custom render with providers
└── ui/                              # Playwright end-to-end tests
    ├── global.setup.ts               # Authentication setup
    ├── dashboard.authenticated.spec.ts # 🔐 Authenticated dashboard tests
    ├── public-pages.spec.ts          # 🌐 Public authentication flow
    └── ui-quality.spec.ts            # 🎨 UI quality & accessibility

src/{domain}/__tests__/               # Component & integration tests
├── *.test.tsx                       # Component unit tests
└── *.integration.test.tsx           # Feature integration tests
```

### **UI Test File Naming Convention**

| Pattern                          | Project         | Authentication       | Example Files                                |
| -------------------------------- | --------------- | -------------------- | -------------------------------------------- |
| `*authenticated*.spec.ts`        | `authenticated` | ✅ **Logged in**     | `dashboard.authenticated.spec.ts`            |
| `*.spec.ts` (no "authenticated") | `auth-less`     | ❌ **Not logged in** | `public-pages.spec.ts`, `ui-quality.spec.ts` |

## Testing Best Practices

### Component Testing

- **Test behavior, not implementation**
- **Use semantic queries** (`getByRole`, `getByLabelText`)
- **Mock external dependencies** (API calls, date functions)
- **Test user interactions** with `userEvent`

### Integration Testing

- **Test complete workflows** (user action → API → store → UI update)
- **Use MSW handlers** for consistent API responses
- **Test error scenarios** and loading states
- **Verify store state changes**

### UI Testing

- **Test critical user paths** only
- **Use Page Object Model** for complex interactions
- **Test cross-browser compatibility**
- **Avoid testing implementation details**

## Authentication Testing Setup

### 🔐 **Authentication Strategy**

**Current Implementation**: **Mock Authentication** (transitioning to Auth.js in the future)

- **✅ Mock Auth**: Custom mock authentication system for all test levels
- **🔮 Future**: Will migrate to Auth.js when ready

### ✅ Unit Test Authentication Implementation

**Current Status**: **All 29 unit tests passing** with proper mock authentication.

**Implementation**: Comprehensive mock auth infrastructure for component tests:

- **Global auth mocks** in `src/test/setup.ts` for useUser, useAuth, SignOutButton
- **Local test mocks** for component-specific auth hooks
- **Test utilities** with AuthProvider integration
- **Server auth mocking** for async Server Components (Dashboard page/layout)

### Unit Test Mock Configuration

```typescript
// src/test/setup.ts - Global auth mocking
vi.mock('@/lib/mock-auth', async () => ({
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      primaryEmailAddress: { emailAddress: 'test@example.com' },
      imageUrl: 'https://example.com/avatar.jpg'
    }
  }),
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
    userId: 'test-user-id',
    getToken: vi.fn().mockResolvedValue('mock-token'),
    signOut: vi.fn()
  }),
  SignOutButton: ({ children }) =>
    React.createElement(
      'button',
      { 'data-testid': 'sign-out-button' },
      children || 'Sign Out'
    )
}));

// Server-side auth mocking for async components
vi.mock('@/lib/mock-auth-server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'test-user-id' })
}));
```

### Component Test Strategies

#### 1. **Simple Components** (Header, Button)

- Use mock components to avoid complex dependency chains
- Focus on core functionality and accessibility
- Avoid testing implementation details of theme/context providers

#### 2. **Layout Components** (AppSidebar, Dashboard Layout)

- Mock complex UI dependencies (SidebarProvider, theme contexts)
- Test structural integrity and navigation patterns
- Verify async Server Component rendering

#### 3. **Server Components** (Dashboard Page)

- Mock server auth with `@/lib/mock-auth-server`
- Handle async component rendering with `await` pattern
- Test authentication flow and redirect logic

### ✅ UI Testing Strategy

**Approach**: **Project-based UI testing** with automatic authentication state management.

**Authentication Flow**:

1. **Global Setup** (`global.setup.ts`): Creates authentication state once
2. **Authenticated Tests** (`*authenticated*.spec.ts`): Use saved auth state
3. **Non-Authenticated Tests** (`*.spec.ts`): Start with clean slate

**Authentication Configuration**:

- **Mock auth integration**: Simple form-based authentication
- **State persistence**: Saves auth state to `.test-data/mock-auth/user.json`
- **Global setup**: `src/test/ui/global.setup.ts` handles mock auth configuration
- **Automatic classification**: File naming determines authentication level

**Authentication State Flow**:

```mermaid
graph TD
    A[Test Run Starts] --> B[Global Setup Project]
    B --> C[Creates user.json]
    C --> D{File Name Check}
    D -->|Contains 'authenticated'| E[Authenticated Project]
    D -->|No 'authenticated'| F[Auth-less Project]
    E --> G[Loads user.json]
    F --> H[Clean Browser State]
    G --> I[Tests Run with Auth]
    H --> J[Tests Run without Auth]
```

### Test Results Summary

#### Component & Integration Tests ✅

- **Status**: **0 failed, 29 passed** (100% success rate)
- **Execution time**: ~10 seconds consistently
- **Coverage**: All UI components with mock authentication
- **Command**: `pnpm test`

#### UI Tests ✅

- **Coverage**: Critical paths including dashboard functionality
- **Projects**: 3 separate playwright projects (global setup, authenticated, auth-less)
- **Command**: `pnpm test:ui`

## Development Integration

### Pre-commit Testing

The project husky hooks will run:

```bash
# Lint and format (pre-commit)
npx lint-staged

# Build verification (pre-push)
cd front && pnpm run build
```

### CI/CD Integration Ready

```yaml
# Example GitHub Actions
- name: Run Tests
  run: |
    pnpm test:unit:coverage
    pnpm test:ui:headless
```

This testing infrastructure ensures **high code quality**, **fast feedback loops**, and **confidence in deployments** through comprehensive test coverage at all levels.
