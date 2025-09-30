# Next.js Dashboard Template

This folder contains an admin dashboard starter built with Next.js 15, TypeScript, Tailwind CSS v4, and shadcn/ui components. Use it as a foundation for your own product.

## Overview

The template includes prebuilt flows, reusable UI elements, and sensible defaults:

- Framework – [Next.js 15](https://nextjs.org)
- Language – [TypeScript](https://www.typescriptlang.org)
- Error Tracking – [Sentry](https://sentry.io)
- Styling – [Tailwind CSS v4](https://tailwindcss.com)
- Components – [shadcn/ui](https://ui.shadcn.com)
- Forms – [React Hook Form](https://ui.shadcn.com/docs/components/form) + [Zod](https://zod.dev)
- Tables – [TanStack Table](https://tanstack.com/table) integration
- State Management – [Zustand](https://zustand-demo.pmnd.rs)
- Search Params – [Nuqs](https://nuqs.47ng.com)
- Tooling – ESLint, Prettier, Vitest, Playwright, Husky

## Pages

| Page                                                                                                                                                                   | Purpose                                                                                                                                                                                                      |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/auth/sign-in`                                                                                                                                                        | Mock sign in UI for wiring up your own auth provider.                                                                                                                                                        |
| `/auth/sign-up`                                                                                                                                                        | Mock sign up UI with shared styling and validation.                                                                                                                                                          |
| `/dashboard/overview`                                                                                                                                                  | Analytics cards and charts showcasing the layout system.                                                                                                                                                     |
| `/dashboard/product`                                                                                                                                                   | Example data table with filtering, pagination, and actions.                                                                                                                                                  |
| `/dashboard/product/new`                                                                                                                                               | Demonstrates form patterns using shadcn/ui and React Hook Form.                                                                                                                                              |
| `/dashboard/profile`                                                                                                                                                   | Sample account profile page.                                                                                                                                                                                 |
| `/dashboard/notfound`                                                                                                                                                  | Custom 404 UI inside the dashboard layout.                                                                                                                                                                   |
| [Global Error](https://sentry.io/for/nextjs/?utm_source=github&utm_medium=paid-community&utm_campaign=general-fy26q2-nextjs&utm_content=github-banner-project-tryfree) | A centralized error page that captures and displays errors across the application. Integrated with **Sentry** to log errors, provide detailed reports, and enable replay functionality for better debugging. |

## Feature based structure

```plaintext
src/
├── app/ # Next.js App Router directory
│ ├── (auth)/ # Auth route group
│ │ ├── (signin)/
│ ├── (dashboard)/ # Dashboard route group
│ │ ├── layout.tsx
│ │ ├── loading.tsx
│ │ └── page.tsx
│ └── api/ # API routes
│
├── components/ # Shared components
│ ├── ui/ # UI components (buttons, inputs, etc.)
│ └── layout/ # Layout components (header, sidebar, etc.)
│
├── features/ # Feature-based modules
│ ├── feature/
│ │ ├── components/ # Feature-specific components
│ │ ├── actions/ # Server actions
│ │ ├── schemas/ # Form validation schemas
│ │ └── utils/ # Feature-specific utilities
│ │
├── lib/ # Core utilities and configurations
│ ├── auth/ # Auth configuration
│ ├── db/ # Database utilities
│ └── utils/ # Shared utilities
│
├── hooks/ # Custom hooks
│ └── use-debounce.ts
│
├── stores/ # Zustand stores
│ └── dashboard-store.ts
│
└── types/ # TypeScript types
└── index.ts
```

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy the example environment file and adjust as needed:

   ```bash
   cp env.example.txt .env.local
   ```

3. Start the development server:

   ```bash
   pnpm run dev
   ```

Visit `http://localhost:3000` to explore the template.

### Environment Configuration

`env.example.txt` lists placeholders for services such as Sentry. Replace them with your own keys or remove the integrations you do not plan to use.
