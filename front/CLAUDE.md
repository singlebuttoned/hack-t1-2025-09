# Frontend Development Ruleset - Next.js Dashboard Template

## Project Overview

This is a comprehensive Next.js dashboard template featuring modern UI components and development patterns. Built with Next.js 15, it provides a solid foundation for building admin interfaces, e-commerce dashboards, and analytics applications.

**Template Features:**

- Complete dashboard layout with sidebar navigation
- Advanced data tables with filtering and pagination
- Form handling with validation (React Hook Form + Zod)
- Chart components and analytics visualization
- Theme system (dark/light mode)
- Mock authentication system
- Example product management implementation

## Architecture Principles

### Frontend Architecture Pattern

**Primary Pattern**: Microfrontend-Based Modular Architecture

- **Microfrontend-based organization**: Business domains in separate mfes (`/mfes`)
- **Next.js shell**: Layout in `/app` and code in `features`
- **Component-based UI**: Reusable components in `/components`
- **Shared utilities**: Common logic in `/lib`, `/hooks`
- **Flexible imports**: No strict layered dependency rules

**NOT**: Traditional layered architecture or Feature-Sliced Design

### Frontend Module Structure

```
src/
├─ app/                   # Next.js routes, layouts, metadata
│  ├─ auth/               # Mock auth pages
│  └─ dashboard/[[...slug]]/page.tsx  # MFE host route
├─ components/
│  ├─ layout/             # App shell, sidebar, header, shared page wrappers
│  ├─ ui/                 # shadcn-generated primitives
│  └─ edition-switcher.tsx# Dev-only edition picker
├─ hooks/                 # Navigation + edition utilities
├─ lib/                   # Auth mock, formatting, search params, etc.
├─ backend/               # Demo data + mock API helpers
├─ mfes/                  # Microfrontend runtime + feature apps (see doc inside)
│  ├─ config.ts           # Registry of MFEs + edition definitions
│  ├─ lib/                # Runtime helpers (single-spa root, error store, etc.)
│  └─ <mfe-key>/          # Individual React applications
├─ features/              # Legacy/hosted feature modules (currently auth only)
├─ test/                  # UI harness and utilities
└─ types/                 # Shared TypeScript types
```

## State Management Strategy

### Primary Pattern: Hybrid State Architecture

**Multiple patterns for different needs**: Zustand for business logic, React Context for framework-level concerns

### When to Use Each Pattern

| Pattern                   | Use Cases                                     | Examples in Codebase                                 |
| ------------------------- | --------------------------------------------- | ---------------------------------------------------- |
| **Global Zustand Stores** | Business logic, CRUD operations, domain state | `useProductStore`, `useAnalyticsStore`               |
| **Atomic Zustand Stores** | Component state, local behavior, UI logic     | `useProductCardStore`, `useSearchBoxStore`           |
| **React Context**         | Framework integration, component tree state   | `KBarProvider`                                       |
| **3rd Party Providers**   | External library integration                  | `AuthProvider` (mock), `ThemeProvider` (next-themes) |
| **URL State (nuqs)**      | Shareable/bookmarkable state                  | Pagination, filters, search                          |
| **Form State (RHF)**      | Form-specific validation and state            | Product forms, settings                              |

### 0. React Context Providers - Framework Integration

**Use for**: Library integration, component tree configuration, SSR-safe state

```typescript
// Pattern: Custom Context for framework-level concerns
interface ThemeContextType {
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ActiveThemeProvider({ children, initialTheme }: {
  children: ReactNode;
  initialTheme?: string;
}) {
  const [activeTheme, setActiveTheme] = useState<string>(
    () => initialTheme || DEFAULT_THEME
  );

  useEffect(() => {
    // Framework-level side effects: DOM manipulation, cookies
    setThemeCookie(activeTheme);
    document.body.classList.add(`theme-${activeTheme}`);
  }, [activeTheme]);

  return (
    <ThemeContext.Provider value={{ activeTheme, setActiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeConfig() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeConfig must be used within ActiveThemeProvider');
  }
  return context;
}
```

**Provider Guidelines**:

- **SSR Safety**: Initialize from server-provided props (`initialTheme`)
- **Error Boundaries**: Always validate context exists
- **Side Effects**: Handle DOM manipulation, cookies, external integrations
- **Composition**: Nest providers in logical order (theme → auth → app-specific)

### 1. Feature-Level Stores - Zustand

**Use for**: Domain-specific state, business logic, CRUD operations

```typescript
// Pattern: Complete domain management in stores
interface ProductStore {
  // State
  products: Product[];
  loading: boolean;
  filters: ProductFilters;

  // CRUD Operations
  fetchProducts: () => Promise<void>;
  createProduct: (data: ProductFormData) => Promise<void>;

  // Business Logic
  validateProduct: (data: ProductFormData) => ValidationResult;
  calculateEarnings: (product: Product) => number;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  filters: { category: 'all' },

  fetchProducts: async () => {
    set({ loading: true });
    const products = await productsApi.getAll();
    set({ products, loading: false });
  },

  validateProduct: (data) => {
    // Business validation logic here
    if (data.commissionPercent > 50)
      return { isValid: false, errors: ['Max 50%'] };
    return { isValid: true, errors: [] };
  }
}));
```

### 2. Global Stores - Zustand

**Use for**: Cross-cutting application state (not framework concerns - use Context for those)

```typescript
// Pattern: Shared application state
export const useDummyAuthStore = create<DummyAuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null })
    }),
    { name: 'dummy-auth-preferences' }
  )
);
```

### 2.5. Atomic Component Stores - Zustand

**Use for**: Component-specific state, local behavior, avoiding complex useState chains

```typescript
// Pattern: Factory function for per-component stores
function createProductCardStore(
  productId: string,
  deps: {
    productsStore: ProductsStore;
    cartStore: CartStore;
  }
) {
  return create<ProductCardState>((set, get) => ({
    isExpanded: false,
    isEditing: false,
    localChanges: {},

    toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),

    addToCart: async () => {
      const product = deps.productsStore
        .getState()
        .products.find((p) => p.id === productId);
      await deps.cartStore.getState().addItem(product);
    },

    saveChanges: async () => {
      const { localChanges } = get();
      await deps.productsStore
        .getState()
        .updateProduct(productId, localChanges);
      set({ isEditing: false, localChanges: {} });
    }
  }));
}

// Usage with dependency injection
class StoreFactory {
  createProductCard(productId: string) {
    return createProductCardStore(productId, {
      productsStore: useProductsStore.getState(),
      cartStore: useCartStore.getState()
    });
  }
}

export const storeFactory = new StoreFactory();
```

**Atomic Store Guidelines**:

- **Use when**: ≥3 related state pieces, complex transitions, testable logic needed
- **Avoid when**: Simple toggles, one-off UI state, direct DOM manipulation
- **Dependencies**: Inject global stores, never import atomic stores directly
- **Communication**: Atomic → Global (delegate), Global → Atomic (subscribe)

### 3. URL State - Nuqs (Supplementary)

**Use for**: Pagination, sorting, filtering, shareable state

```typescript
// Pattern: Search params for bookmarkable state
const [page] = useQueryState('page', parseAsInteger.withDefault(1));
```

### 4. Form State - React Hook Form + Zod

**Use for**: Complex forms with validation

```typescript
// Pattern: Schema-first validation
const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  commissionPercent: z.number().max(50, 'Max 50% commission')
});
```

## Data Flow Patterns

### Frontend Data Flow Pattern

```
Component → Zustand Store → API Client → Backend API
                ↓
      Store Updates → Component Re-renders
```

### Store-Centric Flow

```
User Action → Component → Store Method → API Call → Store State Update → UI Update
```

### API Client Setup (`src/lib/api-client.ts`)

```typescript
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
});
```

### Store Composition & Dependencies

**Store Hierarchy**: Global Stores → Atomic Stores → Components

```typescript
// Store responsibility layers
// Layer 1: Global Domain Stores (data + business logic)
useProductsStore; // Products CRUD, caching, business rules
useCartStore; // Cart state, checkout logic

// Layer 2: Atomic Component Stores (UI state + local behavior)
useProductCardStore; // Expansion, editing, local validation
useCartWidgetStore; // Dropdown state, animations

// Layer 3: Cross-cutting Stores (framework concerns)
useNotificationStore; // Toast messages
useUIStore; // Theme, modals, loading states
```

**Dependency Rules**:

- ✅ Global stores are singletons, created once
- ✅ Atomic stores inject global store dependencies
- ✅ Communication: Atomic → Global (delegate), Global → Atomic (subscribe)
- ❌ Never: Atomic → Atomic communication (use Global as mediator)
- ❌ Never: Global → Atomic imports (circular dependency)

### Store Error Handling Pattern

```typescript
// Error handling in stores with notifications
export const useProductStore = create<ProductStore>((set, get) => ({
  createProduct: async (data) => {
    try {
      set({ loading: true, error: null });
      const newProduct = await productsApi.create(data);
      set({ products: [...get().products, newProduct], loading: false });

      // Success notification
      useNotificationStore.getState().addNotification({
        type: 'success',
        message: 'Product created successfully'
      });
    } catch (error) {
      set({ error: error.message, loading: false });
      useNotificationStore.getState().addNotification({
        type: 'error',
        message: error.message
      });
    }
  }
}));
```

## Feature Development Rules

### Directory Structure for Features

```
src/features/{domain}/
├── stores/                     # Feature-specific Zustand stores
│   ├── types/                  # Domain-specific store types
│   ├── {domain}-store.ts       # Global domain store
│   └── store-factory.ts        # Factory with dependency injection
├── components/                 # Domain-specific components
│   ├── ProductCard/
│   │   ├── ProductCard.tsx
│   │   └── product-card-store.ts    # Atomic store next to component
│   └── SearchBox/
│       ├── SearchBox.tsx
│       └── search-box-store.ts      # Atomic store next to component
├── api/                        # API endpoints (pure HTTP calls)
├── types/                      # Domain TypeScript types
└── schemas/                    # Zod validation schemas
```

### Store Organization Structure

```
src/stores/
└── global/
    ├── types/
    │   └── {store}-types.ts       # Store interfaces
    ├── auth-store.ts        # User authentication
    ├── ui-store.ts          # Theme, sidebar, modals
    └── notification-store.ts # Toast messages, alerts
```

### Component Organization Rules

1. **Shared components** → `src/components/ui/`
2. **Layout components** → `src/components/layout/`
3. **Feature components** → `src/features/{domain}/components/`
4. **Page components** → `src/app/` (App Router)
5. **Store integration** → Components consume stores via hooks

### Store Development Rules

1. **Global stores** handle domain state, business logic, and API calls
2. **Atomic stores** handle component UI state and local behavior
3. **Dependency injection** via factory pattern prevents circular dependencies
4. **Business logic** lives in store methods, not components
5. **Store communication**: Atomic → Global (delegate), never Atomic → Atomic
6. **Store selection**: Use atomic stores for ≥3 related state pieces, hooks for simple toggles

### File Naming Conventions

- Components: `PascalCase.tsx`
- Stores: `kebab-case-store.ts`
- API files: `kebab-case.ts`
- Types: `kebab-case.ts`
- Schemas: `kebab-case-schema.ts`

## Frontend Data Types & Models

### Result Pattern Types

```typescript
// Core Result pattern (generic)
export type Result<T, E> =
  | { success: true; data: T }
  | { success: false; error: E };

// Discriminated union errors (recommended): explicit, type-safe error codes
// Define codes per domain/module (example below for API + Product domain)
export type ApiErrorCode =
  | 'NETWORK'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'SERVER'
  | 'RATE_LIMITED';

export type ApiError = {
  kind: 'api';
  code: ApiErrorCode;
  message: string;
  status?: number;
};

// Example product/business domain error codes
export type ProductErrorCode =
  | 'VALIDATION'
  | 'POSTCONDITION'
  | 'CONTRACT'
  | 'SVC1'
  | 'SVC1_DATA'
  | 'SVC2';

export type BusinessError = {
  kind: 'business';
  code: ProductErrorCode; // Use per-module unions to keep codes local and meaningful
  message: string;
  field?: string;
};

// Validation error as a distinct kind
export type ValidationError = {
  kind: 'validation';
  issues: string[];
};

// Operation results (with discriminated error types)
export type ValidationResult = Result<void, ValidationError>;
export type ApiResult<T> = Result<T, ApiError>;
export type BusinessResult<T> = Result<T, BusinessError>;

// Alternative (simple) variant without codes, when codes add no value
export type SimpleError = { message: string; cause?: unknown };
export type SimpleResult<T> = Result<T, SimpleError>;
```

### Fail Fast, Stepwise Guarded Flow, and Contracts

These principles complement the existing Result pattern and Zod validation.

1. Fail Fast (guards, early return, pre/postconditions)

```typescript
// src/features/products/stores/product-store.ts (excerpt)
type GuardResult = Result<void, string>;

const ensureNonEmptyTitle = (title: string): GuardResult =>
  title.trim().length > 0
    ? { success: true, data: undefined }
    : { success: false, error: 'Title is required' };

const ensureCommissionRange = (percent: number): GuardResult =>
  percent >= 0 && percent <= 50
    ? { success: true, data: undefined }
    : { success: false, error: 'Commission must be 0-50%' };

// Precondition checks + early returns prevent bad state from flowing further
async function createProductSafe(
  dto: CreateProductDto
): Promise<ApiResult<Product>> {
  const t = ensureNonEmptyTitle(dto.title);
  if (!t.success) {
    return { success: false, error: { message: t.error, code: 'VALIDATION' } };
  }

  const c = ensureCommissionRange(dto.commissionPercent);
  if (!c.success) {
    return { success: false, error: { message: c.error, code: 'VALIDATION' } };
  }

  // ... proceed when preconditions hold
  const res = await productsApi.create(dto);

  // Postcondition (shape) check using zod to ensure API conforms
  const parsed = productSchema.safeParse(res);
  if (!parsed.success) {
    return {
      success: false,
      error: { message: 'Invalid product from API', code: 'POSTCONDITION' }
    };
  }

  return { success: true, data: parsed.data };
}
```

2. Stepwise Guarded Flow (simple, readable)

```typescript
// src/features/products/services/big-process.ts
const inputSchema = z.object({ id: z.string(), amount: z.number().positive() });
type Input = z.infer<typeof inputSchema>;

interface Output {
  confirmationId: string;
}

export async function doBigProcess(
  inputWrapped: unknown
): Promise<Result<Output, BusinessError>> {
  // Unwrap and auto-check input
  const parsed = inputSchema.safeParse(inputWrapped);
  if (!parsed.success) {
    return {
      success: false,
      error: { message: 'Invalid input', code: 'INPUT' }
    };
  }
  const input: Input = parsed.data;

  // Step 1: get required data
  const requiredData1 = await service1.getRequiredData(input.id); // ApiResult<{ value: string }>
  if (!requiredData1.success) {
    return {
      success: false,
      error: {
        message: `service1 failed: ${requiredData1.error.message}`,
        code: 'SVC1'
      }
    };
  }
  if (requiredData1.data.value !== 'correct value') {
    return {
      success: false,
      error: { message: 'Invalid requiredData1 value', code: 'SVC1_DATA' }
    };
  }

  // Step 2: perform action using validated data
  const action = await service2.doAction({
    id: input.id,
    amount: input.amount
  }); // BusinessResult<{ confirmationId: string }>
  if (!action.success) {
    return {
      success: false,
      error: {
        message: `service2 failed: ${action.error.message}`,
        code: 'SVC2'
      }
    };
  }

  // Success
  return {
    success: true,
    data: { confirmationId: action.data.confirmationId }
  };
}
```

3. Programming by Contract (types + Zod + tests)

```typescript
// Contract: Product coming from API
export const productSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  title: z.string().min(1),
  description: z.string(),
  category: z.enum(['sports nutrition', 'equipment', 'clothing', 'gadgets']),
  price: z.number().positive(),
  commissionPercent: z.number().min(0).max(50),
  referralLink: z.string().url(),
  clicks: z.number().int().nonnegative(),
  createdAt: z.string()
});

export type ProductContract = z.infer<typeof productSchema>;

// Boundary enforcement
async function getProduct(id: string): Promise<ApiResult<ProductContract>> {
  const raw = await productsApi.getById(id);
  const parsed = productSchema.safeParse(raw);
  return parsed.success
    ? { success: true, data: parsed.data }
    : {
        success: false,
        error: { message: 'Contract violation', code: 'CONTRACT' }
      };
}
```

Tests as contracts (specifying behavior and types):

```typescript
// src/features/products/__tests__/product-contract.spec.ts
import { describe, it, expect } from 'vitest';
import { productSchema } from '@/features/products/schemas/product';

describe('Product contract', () => {
  it('accepts valid payloads and rejects invalid ones', () => {
    const valid = {
      _id: 'p1',
      userId: 'u1',
      title: 'Name',
      description: 'desc',
      category: 'equipment',
      price: 10,
      commissionPercent: 10,
      referralLink: 'https://x.y',
      clicks: 0,
      createdAt: new Date().toISOString()
    };

    expect(productSchema.safeParse(valid).success).toBe(true);
    expect(
      productSchema.safeParse({ ...valid, commissionPercent: 200 }).success
    ).toBe(false);
  });
});
```

### Frontend Product Types

```typescript
interface Product {
  readonly _id: string;
  readonly userId: string;
  title: string;
  description: string;
  category: 'sports nutrition' | 'equipment' | 'clothing' | 'gadgets';
  price: number;
  commissionPercent: number;
  readonly referralLink: string;
  readonly clicks: number;
  readonly createdAt: string;
}

// Form DTOs for API calls - explicit types
interface CreateProductDto {
  title: string;
  description: string;
  category: Product['category'];
  price: number;
  commissionPercent: number;
}

interface UpdateProductDto {
  title?: string;
  description?: string;
  category?: Product['category'];
  price?: number;
  commissionPercent?: number;
}

// Store state types
interface ProductFilters {
  category: Product['category'] | 'all';
  search: string;
  sortBy: 'createdAt' | 'title' | 'price' | 'clicks';
  sortOrder: 'asc' | 'desc';
}
```

## Frontend Route Structure

### App Router Organization

```
src/app/dashboard/
├── page.tsx              # Main dashboard
├── products/
│   ├── page.tsx          # Product list
│   ├── add/
│   │   └── page.tsx      # Add product
│   └── edit/
│       └── [id]/
│           └── page.tsx  # Edit product
├── stats/
│   └── page.tsx          # Analytics
└── settings/
    └── page.tsx          # User settings
```

### App Directory Responsibility

**App/ Should Only Handle**: Routing, layouts, metadata, suspense boundaries, parallel route composition

**Clean App/ Pattern**:

```typescript
// ✅ GOOD: Thin routing logic only
export const metadata = { title: 'Dashboard: Products' };

export default async function Page(props: pageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsPageView searchParams={searchParams} />
    </Suspense>
  );
}
```

**Move to Features/**:

- UI component composition (`<Card>`, `<Button>`, etc.)
- Hardcoded content and text
- Business logic and data fetching
- Complex layout structures
- Form handling and validation

**Enforcement**: ESLint rules prevent UI imports and limit file size in `app/` directory.

### Navigation Configuration

```typescript
// src/constants/data.ts
export const navItems: NavItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: 'dashboard' },
  { title: 'Products', url: '/dashboard/products', icon: 'product' },
  { title: 'Analytics', url: '/dashboard/stats', icon: 'analytics' },
  { title: 'Settings', url: '/dashboard/settings', icon: 'settings' }
];
```

## Frontend Best Practices

### Code Quality Rules

1. **Explicit TypeScript**: All functions, variables, and returns must have explicit type definitions
2. **Result Pattern**: Use Result<T, E> for operations that can fail
3. **Error Handling**: Always handle loading/error states
4. **Validation**: Use Zod schemas for all forms
5. **Accessibility**: Follow WCAG guidelines
6. **Performance**: Lazy load components when appropriate
7. **Fail Fast**: Prefer early returns and pre/postcondition checks to avoid propagating invalid state
8. **Stepwise Guarded Flow**: Use simple guards to short-circuit on failure and return Result values (no complex functional helpers needed)
9. **Programming by Contract**: Define contracts via types and Zod; enforce at boundaries (props, API, store methods); tests also act as executable contracts

## TypeScript Best Practices

### Strict Type Policy

#### 1. **`any` is Forbidden with Migration and Edge Case Strategy**

```typescript
// ❌ FORBIDDEN - Never use any in new code
function handleData(data: any): void {}
const result: any = await fetchData();

// ✅ MIGRATION STRATEGY - For existing template code
// Step 1: Add TODO comment for migration
function handleLegacyData(
  data: any /* TODO: Replace with proper type */
): void {
  // Step 2: Add runtime assertion as first line
  if (!isValidLegacyData(data)) {
    throw new Error('Invalid legacy data structure');
  }
  // Step 3: Use type assertion after validation
  const typedData = data as LegacyDataType;
  // Step 4: Replace any with proper type in function signature
}

// ✅ EDGE CASE SUPPRESSION - Only when fixing is impractical
// Use when third-party libraries force any usage or trusted libraries show lint errors

// Example 1: Third-party library forcing any
const libraryResult = library.processData(input);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
library.continueProcessDataWithWrongTypeDefinitions(input as any);

// Example 2: Shadcn/ui component with lint errors (trusted source)
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
const { data } = useQuery<any>('key', fetcher);

// ✅ PREFERRED - Explicit types with validation
function handleData(data: unknown): Result<ProcessedData, ValidationError> {
  const validation = dataSchema.safeParse(data);
  return validation.success
    ? { success: true, data: processData(validation.data) }
    : { success: false, error: { issues: validation.error.errors } };
}
```

#### 2. **Type Hierarchy (Preferred → Forbidden)**

```typescript
// ✅ PREFERRED - Explicit and specific
string | number | boolean          // Union types
T extends Record<string, unknown>  // Constrained generics
unknown                           // For truly dynamic content
object                           // Only with explicit constraints

// ⚠️ MIGRATION ONLY - Replace in existing code
any                              // Legacy migration only

// ⚠️ SUPPRESSION ONLY - Edge cases with ESLint disable comments
any                              // Third-party library requirements
                                 // Trusted libraries (e.g., shadcn/ui) with lint errors

// ❌ FORBIDDEN - Never use
{}                               // Empty object (use Record<string, unknown>)
object                           // Unconstrained (use specific interface)
Function                         // Use proper function signature
```

#### 3. **React Component Generics - Use Constraints**

```typescript
// ❌ FORBIDDEN - any in React generics
ReactElement<any>[]
ComponentProps<any>
forwardRef<any, any>

// ✅ PREFERRED - Constrained generics
ReactElement<Record<string, unknown>>[]  // For unknown props
ReactElement[]                           // When props don't matter
ComponentProps<'button'>                 // For specific elements
ComponentProps<typeof Button>           // For custom components

// ✅ BEST - Explicit interface constraints
interface StepProps {
  readonly onNext: () => void;
  readonly onPrev: () => void;
}

function useMultistepForm(steps: ReactElement<StepProps>[]): MultiStepForm {
  // Implementation with proper typing
}
```

#### 4. **Third-Party Library Type Strategy**

**Hierarchy (try in order):**

```typescript
// 1. ✅ FIRST: Search for official typing packages
npm install @types/library-name

// 2. ✅ SECOND: Search for community typing packages
npm install @types/react-library-name
npm install library-name-types

// 3. ✅ THIRD: Write our own type definitions
// types/library-name.d.ts
declare module 'untyped-library' {
  interface LibraryConfig {
    readonly timeout: number;
    readonly retries?: number;
  }

  export function createClient(config: LibraryConfig): LibraryClient;

  interface LibraryClient {
    request: (url: string) => Promise<unknown>;
    destroy: () => void;
  }
}

// 4. ✅ FOURTH: Module augmentation for incomplete types
declare module 'recharts' {
  interface TooltipProps {
    payload?: Array<{
      color?: string;
      payload: Record<string, unknown>;
      dataKey?: string;
      name?: string;
      value?: unknown;
    }>;
  }
}

// 5. ⚠️ LAST RESORT: Runtime assertion pattern
function useUntypedChartLibrary(config: unknown): Result<ChartInstance, ValidationError> {
  if (!assertChartConfig(config)) {
    return { success: false, error: { message: 'Invalid chart config' } };
  }

  // Now TypeScript knows the shape
  const chart = createChart(config);
  return { success: true, data: chart };
}

// 6. ⚠️ SUPPRESSION: When all else fails for trusted/forced any usage
// Criteria for suppression:
// - Third-party library forces any in its API
// - Trusted library (e.g., shadcn/ui) shows lint errors that aren't breaking
// - Always use specific ESLint disable comments, never blanket disables

// For trusted libraries like shadcn/ui with multiple lint issues:
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
const componentProps = { ...defaultProps, ...userProps };
```

#### 5. **Dynamic Data Handling - Prefer Zod**

```typescript
// ✅ PREFERRED - Zod for all dynamic data
const apiResponseSchema = z.object({
  id: z.string(),
  data: z.array(z.record(z.unknown()))
});

function handleServerResponse(
  response: unknown
): Result<ApiResponse, ValidationError> {
  const result = apiResponseSchema.safeParse(response);
  return result.success
    ? { success: true, data: result.data }
    : {
        success: false,
        error: { issues: result.error.errors.map((e) => e.message) }
      };
}

// ✅ ACCEPTABLE - JSON.parse with immediate validation
function parseJsonSafely(
  jsonString: string
): Result<ParsedData, ValidationError> {
  try {
    const parsed: unknown = JSON.parse(jsonString); // unknown, not any
    return validateParsedData(parsed); // Immediate validation
  } catch (error) {
    return { success: false, error: { message: 'Invalid JSON' } };
  }
}

// ❌ FORBIDDEN - Raw JSON.parse usage
const data = JSON.parse(response); // Returns any, no validation
processData(data); // Unsafe usage
```

### Untyped Object Assertion Pattern

**For working with untyped but known objects (documentation examples, legacy APIs):**

```typescript
// Step 1: Define expected interface
interface ExpectedLibraryObject {
  readonly id: string;
  readonly config: { timeout: number };
  process: (data: string) => Promise<void>;
  destroy: () => void;
}

// Step 2: Create type guard with explicit checks
function assertLibraryShape(obj: unknown): obj is ExpectedLibraryObject {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof (obj as Record<string, unknown>).id === 'string' &&
    'config' in obj &&
    typeof (obj as Record<string, unknown>).config === 'object' &&
    'process' in obj &&
    typeof (obj as Record<string, unknown>).process === 'function' &&
    'destroy' in obj &&
    typeof (obj as Record<string, unknown>).destroy === 'function'
  );
}

// Step 3: Use with Result pattern
function initializeLibrary(
  untypedLib: unknown
): Result<ExpectedLibraryObject, ValidationError> {
  if (!assertLibraryShape(untypedLib)) {
    return {
      success: false,
      error: { message: 'Library does not match expected interface' }
    };
  }

  // Now TypeScript knows the exact type
  return { success: true, data: untypedLib };
}

// Step 4: Alternative with Zod for complex validation
const librarySchema = z.object({
  id: z.string().min(1),
  config: z.object({
    timeout: z.number().positive()
  }),
  process: z.function(),
  destroy: z.function()
});

function validateLibraryWithZod(
  obj: unknown
): Result<ExpectedLibraryObject, ValidationError> {
  const result = librarySchema.safeParse(obj);
  return result.success
    ? { success: true, data: result.data as ExpectedLibraryObject }
    : {
        success: false,
        error: { issues: result.error.errors.map((e) => e.message) }
      };
}
```

### Component Patterns

```typescript
// Pattern: Explicit types + Result pattern integration
interface ProductCardProps {
  readonly product: Product;
}

export function ProductCard({ product }: ProductCardProps): JSX.Element {
  const { calculateEarnings, deleteProduct } = useProductStore();

  // Explicit types for all variables
  const earningsResult: BusinessResult<number> = calculateEarnings(product);

  const handleDelete = async (): Promise<void> => {
    const result: BusinessResult<void> = await deleteProduct(product._id);

    if (!result.success) {
      console.error('Failed to delete product:', result.error.message);
      // Error handled by store notifications
    }
  };

  const earnings: number = earningsResult.success ? earningsResult.data : 0;

  return (
    <Card>
      <h3>{product.title}</h3>
      <p>Earnings: ${earnings.toFixed(2)}</p>
      <Button
        onClick={handleDelete}
        disabled={!earningsResult.success}
      >
        Delete
      </Button>
    </Card>
  );
}
```

### Store Patterns

```typescript
// Pattern: Explicit types + Result pattern in stores
interface ProductStore {
  // State - explicit types
  readonly products: readonly Product[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly filters: ProductFilters;

  // CRUD Operations - all return Results
  fetchProducts: () => Promise<ApiResult<readonly Product[]>>;
  createProduct: (data: CreateProductDto) => Promise<ApiResult<Product>>;
  updateProduct: (
    id: string,
    data: UpdateProductDto
  ) => Promise<ApiResult<Product>>;
  deleteProduct: (id: string) => Promise<BusinessResult<void>>;

  // Business Logic - explicit return types
  validateProduct: (data: CreateProductDto) => ValidationResult;
  calculateEarnings: (product: Product) => BusinessResult<number>;
  canDeleteProduct: (product: Product) => BusinessResult<boolean>;

  // State Management
  setFilters: (filters: Partial<ProductFilters>) => void;
  clearError: () => void;
}

export const useProductStore = create<ProductStore>(
  (set, get): ProductStore => ({
    // State initialization
    products: [],
    loading: false,
    error: null,
    filters: {
      category: 'all',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    },

    // Explicit implementations with Result pattern
    fetchProducts: async (): Promise<ApiResult<readonly Product[]>> => {
      try {
        set({ loading: true, error: null });
        const response = await productsApi.getAll();
        set({ products: response, loading: false });
        return { success: true, data: response };
      } catch (error) {
        const apiError: ApiError = {
          message: error instanceof Error ? error.message : 'Unknown error',
          status: error.status,
          code: error.code
        };
        set({ loading: false, error: apiError.message });
        return { success: false, error: apiError };
      }
    },

    validateProduct: (data: CreateProductDto): ValidationResult => {
      const errors: string[] = [];

      if (!data.title.trim()) errors.push('Title is required');
      if (data.commissionPercent < 0 || data.commissionPercent > 50) {
        errors.push('Commission must be between 0-50%');
      }
      if (data.price <= 0) errors.push('Price must be positive');

      return errors.length === 0
        ? { success: true, data: undefined }
        : { success: false, error: errors };
    },

    calculateEarnings: (product: Product): BusinessResult<number> => {
      try {
        const baseEarnings: number =
          ((product.price * product.commissionPercent) / 100) * product.clicks;
        const categoryMultipliers: Record<Product['category'], number> = {
          'sports nutrition': 1.05,
          equipment: 1.03,
          clothing: 1.02,
          gadgets: 1.01
        };

        const multiplier: number = categoryMultipliers[product.category];
        const totalEarnings: number = baseEarnings * multiplier;

        return { success: true, data: totalEarnings };
      } catch (error) {
        return {
          success: false,
          error: {
            message: 'Failed to calculate earnings',
            code: 'CALCULATION_ERROR'
          }
        };
      }
    }
  })
);
```

### Form Integration Patterns

```typescript
// Pattern: Explicit types + Result pattern in forms
interface ProductFormProps {
  readonly productId?: string; // For edit mode
  readonly onSuccess?: () => void;
  readonly onCancel?: () => void;
}

export function ProductForm({ productId, onSuccess, onCancel }: ProductFormProps): JSX.Element {
  const { createProduct, updateProduct, validateProduct } = useProductStore();

  // Explicit form type
  const form = useForm<CreateProductDto>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'sports nutrition',
      price: 0,
      commissionPercent: 0
    }
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (data: CreateProductDto): Promise<void> => {
    setIsSubmitting(true);

    try {
      // Validate first
      const validationResult: ValidationResult = validateProduct(data);
      if (!validationResult.success) {
        validationResult.error.forEach((error: string) => {
          form.setError('root', { message: error });
        });
        return;
      }

      // Perform operation based on mode
      const result: ApiResult<Product> = productId
        ? await updateProduct(productId, data)
        : await createProduct(data);

      if (result.success) {
        form.reset();
        onSuccess?.();
      } else {
        form.setError('root', {
          message: result.error.message
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Input {...form.register('title')} placeholder="Product title" />
      <Textarea {...form.register('description')} placeholder="Description" />
      <Select {...form.register('category')}>
        <option value="sports nutrition">Sports Nutrition</option>
        <option value="equipment">Equipment</option>
        <option value="clothing">Clothing</option>
        <option value="gadgets">Gadgets</option>
      </Select>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {productId ? 'Update' : 'Create'} Product
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      {form.formState.errors.root && (
        <Alert variant="destructive">
          {form.formState.errors.root.message}
        </Alert>
      )}
    </form>
  );
}
```

## Frontend Development Commands

### Development Commands

```bash
# Development server
pnpm run dev

# Production build
pnpm run build

# Code quality
pnpm run lint
pnpm run lint:fix
pnpm run typecheck          # TypeScript only

# ⚠️ IMPORTANT: ESLint alone cannot catch all TypeScript errors
# Always use `pnpm run lint` instead of `eslint .` for complete type safety

# Type checking (via Next.js build)
pnpm run build
```

### Testing Commands

```bash
# Three-Level Testing Pyramid
pnpm test:unit              # Component & Integration tests (Vitest)
pnpm test:ui:headless      # End-to-end tests (Playwright)
pnpm test:all               # Complete test suite (both levels)
```

## TDD Testing Infrastructure ⚡

### Three-Level Testing Pyramid

1. **Component Tests** (Vitest + React Testing Library)

   - Unit tests for individual components
   - Mock external dependencies and contexts
   - Fast execution (~10 seconds)

2. **Integration Tests** (Vitest)

   - Feature workflows with mocked backend
   - Store integration and state management

3. **UI Tests** (Playwright)
   - Full user journey testing
   - Real browser automation
   - Authentication flow validation

### Test File Organization

```
src/test/
├── setup.ts                # Global test configuration
├── test-utils.tsx          # Custom render with providers
└── ui/
    └── *.spec.ts           # Playwright end-to-end tests

src/features/{domain}/
├── __tests__/              # Integration tests
├── components/__tests__/   # Component unit tests
└── stores/__tests__/       # Store unit tests
```

### TDD Workflow (Red-Green-Refactor)

1. **🔴 Write failing test** first (component, integration, or ui)
2. **🟢 Write minimal code** to pass the test
3. **🔵 Refactor** while keeping tests green
4. **🔄 Repeat** for next feature

**Key Testing Features**:

- **Custom Test Utils**: Pre-configured render with all providers
- **Global Mocks**: matchMedia, IntersectionObserver, ResizeObserver
- **Multi-browser UI**: Chromium, Firefox, Safari support
- **Auto Dev Server**: UI tests automatically start/stop server

## Implementation Strategy

### Migration Approach: Hybrid Architecture

We use an **"Islands Architecture"** approach to minimize risk and maximize productivity:

- **Keep existing template code** as-is (stable foundation)
- **Write new features** using our modern architecture (CLAUDE.md patterns)
- **Gradual migration** of existing features only if time permits

### ✅ Template Foundation (Keep As-Is)

- [x] Next.js 15 setup with App Router
- [x] Shadcn/ui component library
- [x] Tailwind CSS configuration
- [x] TypeScript configuration
- [x] Basic dashboard layout
- [x] Data table components
- [x] Form components with validation
- [x] Authentication setup (Mock Auth)
- [x] Theme system
- [x] Command palette (kbar)
- [x] Existing product listing (Server Components + mock data)
- [x] Overview dashboard components

### 🆕 New Architecture (Modern Patterns)

**Phase 1: Foundation Setup (1 hour)**

- [ ] Create store directory structure (`/stores/global/`)
- [ ] Add API client setup (`/lib/api-client.ts`)
- [ ] Add Result pattern types (`/types/result.ts`)
- [ ] Add notification store for error handling

**Phase 2: Integration (1-2 hours)**

- [ ] Connect existing product listing to new API client
- [ ] Replace mock data with real API calls
- [ ] Add global error handling

### 🔄 Gradual Migration (Optional)

**Only if time permits - not required for MVP:**

- [ ] Convert existing product components to use stores
- [ ] Add Result pattern to existing features
- [ ] Enhance error handling throughout
- [ ] Add explicit types to existing code

### 🗑️ Template Cleanup

- [ ] Remove mock data system (`src/constants/mock-api.ts`)
- [ ] Remove unused overview components
- [ ] Remove sample/demo data

### Architecture Coexistence

```
src/
├── features/
│   ├── products/           # HYBRID: Existing + new store layer
│   ├── analytics/          # NEW: Full modern architecture
│   │   └── stores/         #      Internal stores
│   └── settings/           # NEW: Full modern architecture
│       └── stores/         #      Internal stores
├── stores/                 # NEW: Modern global state management
├── components/             # EXISTING: Keep shared components
└── lib/
    └── api-client.ts       # NEW: Replace mock data
```

### Benefits of This Approach

- ✅ **Low Risk**: Template stays functional during development
- ✅ **Fast Delivery**: No massive refactoring required
- ✅ **Best Practices**: New features use modern patterns
- ✅ **Future-Proof**: Clear migration path for existing code
- ✅ **Time Efficient**: ~4 hours setup vs 15+ hours full migration

## Frontend Environment Configuration

### Required Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001
# Mock auth - no keys needed for development
```

### Frontend Development Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Frontend will be available at http://localhost:3000
```

## Integration Notes

### API Integration

- Backend API expected at `http://localhost:3001`
- All API calls go through `src/lib/api-client.ts`
- React Query handles caching and state management
- Error handling via interceptors and toast notifications

## Development Guidelines

### Code Organization Rules

1. **Existing Code**: Keep template foundation unchanged for stability
2. **New Features**: Must follow CLAUDE.md architecture (Zustand + Result pattern + explicit types)
3. **Hybrid Integration**: New stores can be consumed by existing components gradually
4. **Migration**: Only migrate existing features if time permits, not required for delivery

### Implementation Priority

1. **High Priority**: New features (analytics, settings) with modern architecture
2. **Medium Priority**: API integration replacing mock data
3. **Low Priority**: Migrating existing product features to new patterns

This document serves as the single source of truth for frontend development decisions and architectural patterns. **All new frontend code must follow the established modern patterns**, while existing template code can coexist during the transition period.
