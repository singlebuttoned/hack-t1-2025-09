# Next.js Dashboard Template - Project Overview

## Project Context

This project is a **full-stack web application template** built with Next.js 15, designed for product management and analytics dashboards. It provides a modern, scalable foundation for building admin interfaces and e-commerce management systems.

**Mission**: Provide a comprehensive, production-ready dashboard template that can be easily customized for various business domains including e-commerce, product management, analytics, and more.

## Project Architecture

### High-Level Structure
```
4cells-dashboard/
├── front/          # Next.js frontend dashboard
├── back/           # Mockoon API server (mock backend)
├── docs/           # Project documentation and examples
└── CLAUDE.md       # This overview document
```

### Technology Stack
- **Frontend**: Next.js 15 + TypeScript + Shadcn/ui + Tailwind CSS
- **Backend**: Mockoon (mock API server for development)
- **Database**: JSON files (via Mockoon, simulating MongoDB structure)
- **State Management**: React Query + Zustand + Nuqs
- **Authentication**: Mock Authentication (development mode, Auth.js planned)

### Development Approach
- **Component-driven development** with reusable UI patterns
- **Mock API backend** for rapid prototyping and development
- **Feature-based organization** with clear separation of concerns
- **Modern development tools** and best practices

## Template Features Overview

### 1. Dashboard Foundation
- **Modern UI Components**: Built with shadcn/ui and Tailwind CSS
- **Responsive Layout**: Sidebar navigation with mobile support
- **Data Tables**: Advanced filtering, sorting, and pagination
- **Form Handling**: React Hook Form with Zod validation

### 2. Example Domain (E-commerce/Product Management)
- **Product Management**: CRUD operations with modal forms
- **Analytics Dashboard**: Charts and metrics visualization
- **Data Filtering**: Category-based filtering and search
- **Mock Data Integration**: Ready-to-use example data

### 3. Developer Experience
- **Type Safety**: Full TypeScript coverage with strict configuration
- **State Management**: Zustand for client state, Nuqs for URL state
- **Testing Setup**: Vitest + Playwright with comprehensive test suites
- **Code Quality**: ESLint, Prettier, and automated formatting

### 4. Production Features
- **Authentication**: Mock auth system (easily replaceable)
- **Error Handling**: Sentry integration and error boundaries
- **Performance**: Optimized builds and lazy loading
- **Accessibility**: WCAG compliant components

## Project Bootstrap Instructions

### Prerequisites
```bash
# Required tools
- Node.js 18+
- npm/pnpm
- Git
```

### Setup Steps

#### 1. Clone and Setup Frontend
```bash
cd front
npm install
cp env.example.txt .env.local
# Configure environment variables in .env.local
npm run dev
```
Frontend will be available at `http://localhost:3000`

#### 2. Setup Backend (Mockoon)
```bash
cd back
# Setup Mockoon server (instructions in back/CLAUDE.md)
# Server will run on http://localhost:3001
```

#### 3. Verify Integration
- Frontend should connect to backend API
- Test data should be visible in dashboard
- All CRUD operations should work

## Development Workflow

### Phase 1: Foundation Setup
1. ✅ **Template Analysis** - Understand existing structure
2. ✅ **Component Library** - shadcn/ui integration complete
3. ✅ **State Management** - Zustand and Nuqs setup
4. ✅ **Testing Infrastructure** - Vitest and Playwright configured

### Phase 2: Core Template Features
1. ✅ **Dashboard Layout** - Responsive sidebar navigation
2. ✅ **Data Tables** - Advanced table with TanStack Table
3. ✅ **Form System** - React Hook Form + Zod validation
4. ✅ **Theme System** - Dark/light mode support

### Phase 3: Example Implementation
1. ✅ **Product Management** - Complete CRUD operations
2. ✅ **Analytics Dashboard** - Charts and metrics
3. ✅ **Mock Backend** - Mockoon API server
4. ✅ **Authentication** - Mock auth system

### Phase 4: Production Readiness
1. ✅ **Error Handling** - Sentry integration
2. ✅ **Performance** - Build optimization
3. ✅ **Testing** - Comprehensive test coverage
4. ✅ **Documentation** - Complete setup guides

## Directory-Specific Documentation

### Frontend (`front/`)
- **Architecture**: [`front/CLAUDE.md`](front/CLAUDE.md)
- **Patterns**: Component organization, state management, routing
- **Development**: Local development setup and best practices

### Backend (`back/`)
- **Mock API**: [`back/CLAUDE.md`](back/CLAUDE.md)
- **Mock Data**: JSON structure and endpoints
- **Integration**: How frontend connects to backend

### Documentation (`docs/`)
- **Examples**: Sample implementation patterns
- **Guides**: Setup and customization instructions

## Progress Tracking

### 🎯 Project Milestones

#### Milestone 1: Foundation ✅
- [x] Project structure established
- [x] Frontend template analyzed
- [x] Architecture documentation created
- [x] Development environment ready

#### Milestone 2: Core Development 🔄
- [ ] API client integration
- [ ] Frontend uses data from mock backend server
- [ ] Backend mock API setup

#### Milestone 3: Feature Complete ⏳
- [ ] All CRUD operations working on frontend
- [ ] Backend simple CRUD services and db implemented
- [ ] Frontend displaying real data from backend
- [ ] Search and filtering implemented

#### Milestone 4: Polish & Deploy ⏳
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Error handling refinement
- [ ] Deployment preparation

### 🏗️ Component Status

| Feature | Frontend UI | API Integration | Backend Mock | Status |
|---------|------------|-----------------|--------------|--------|
| Product List | ✅ Template | ⏳ Pending | ⏳ Pending | In Progress |
| Add Product | ✅ Template | ⏳ Pending | ⏳ Pending | In Progress |
| Edit Product | ✅ Template | ⏳ Pending | ⏳ Pending | In Progress |
| Settings | ⏳ Pending | ⏳ Pending | ⏳ Pending | Not Started |

## Quality Assurance

### Code Quality Standards
- **TypeScript**: Strict typing across all components
- **ESLint/Prettier**: Consistent code formatting
- **Component Testing**: Jest + React Testing Library
- **UI Testing**: Playwright (optional)

### Performance Targets
- **Load Time**: < 3 seconds first load
- **Bundle Size**: Optimized for production
- **Accessibility**: WCAG 2.1 AA compliance
- **SEO**: Meta tags and structured data

## Risk Mitigation

### Technical Risks
- **Template Compatibility**: Ensure all features work with base template
- **API Integration**: Mock-to-real API transition planning
- **State Management**: Complex state coordination across features
- **Performance**: Large product lists and analytics data

### Development Risks
- **Scope Creep**: Stick to core requirements first
- **Over-engineering**: Simple solutions preferred
- **Time Management**: 8-24 hour delivery window

## Success Metrics

### Functional Success
- [ ] All core features implemented and working
- [ ] CRUD operations complete and tested
- [ ] Responsive design on all devices

### Code Quality Success  
- [ ] Clean, maintainable codebase
- [ ] Proper error handling throughout
- [ ] TypeScript coverage > 95%
- [ ] No console errors in production

## Getting Help

### Documentation Hierarchy
1. **This file** - Project overview and coordination
2. **`front/CLAUDE.md`** - Frontend implementation details
3. **`back/CLAUDE.md`** - Backend mock API details
4. **`front/README.md`** - Quick start guide

### Template Customization
- Use established patterns from template
- Follow architectural guidelines in respective CLAUDE.md files
- Maintain consistency across components and features
- Extend the example domain (products) to your specific needs

### Mock Authentication Setup (Template Feature)

The template includes **mock authentication** for development and demonstration:

**For Development Testing:**
1. Navigate to sign-in page: `http://localhost:3000/auth/sign-in`
2. Use any email/password combination (e.g., `test@example.com` / `password`)
3. Authentication is automatically granted for any credentials

**How It Works:**
- Mock auth accepts any email/password combination
- Session stored in browser cookies (`mock-auth-session`)
- Middleware protects `/dashboard` routes by checking for auth cookie
- Easy to replace with real authentication (Auth.js, Clerk, etc.)

---

*This document serves as the template's architectural guide, coordinating development patterns across frontend and backend components while providing a solid foundation for custom implementations.*