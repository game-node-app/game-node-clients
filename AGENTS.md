# AGENDS.md - AI Agent Contribution Guide

This document provides comprehensive instructions for AI agents contributing to the game-node-clients monorepo. It covers architecture, development workflows, coding standards, and best practices.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Development Environment Setup](#development-environment-setup)
- [Monorepo Structure](#monorepo-structure)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Common Tasks](#common-tasks)
- [Testing Guidelines](#testing-guidelines)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Project Overview

**Repository**: game-node-clients  
**Purpose**: Unified monorepo for all GameNode frontend clients (admin dashboard, web app, and mobile app)  
**Tech Stack**: TypeScript, React, Next.js, Ionic/Capacitor, Mantine UI, TurboRepo  
**Package Manager**: Yarn v1.22.22  
**Node Version**: >=18 (LTS recommended)

### Primary Applications

1. **Web** (`apps/web`) - Main website at [gamenode.app](https://gamenode.app) (Next.js)
2. **Admin** (`apps/admin`) - Administrative dashboard (Next.js)
3. **Mobile** (`apps/mobile`) - Hybrid PWA/mobile app (Ionic + Capacitor + Vite)

### Shared Packages

1. **UI** (`packages/ui`) - Shared component library built on Mantine
2. **Wrapper** (`packages/wrapper`) - Auto-generated OpenAPI TypeScript clients
3. **Config Packages** - Shared configurations for ESLint, Prettier, TypeScript, Tailwind

---

## Architecture

### Monorepo Management

- **Build System**: TurboRepo v2.5.8
- **Workspace Manager**: Yarn Workspaces
- **Dependency Sync**: Syncpack (alpha version)

### Key Architectural Decisions

1. **Shared Components**: Common UI components live in `packages/ui` and are consumed by all apps
2. **Platform Injection**: Platform-specific components (Modal, Link, router hooks) are injected at app startup
3. **Code Generation**: API clients are auto-generated from OpenAPI specs via `packages/wrapper`
4. **Monolithic Build**: TurboRepo orchestrates builds with dependency awareness
5. **Non-Transpiled Packages**: Internal packages are NOT pre-compiled; consuming apps transpile them

---

## Development Environment Setup

### Prerequisites

```bash
# Required versions
node --version  # >= 18.x (LTS recommended)
yarn --version  # 1.22.22
```

### Initial Setup

```bash
# 1. Clone repository (if not already done)
git clone <repository-url>
cd game-node-clients

# 2. Install all dependencies
yarn install

# 3. Generate API wrapper clients (if needed)
cd packages/wrapper
yarn build
cd ../..

# 4. Start all apps in development mode
yarn dev

# 5. Or start a specific app
yarn dev:web      # Web app on port 3000
yarn dev:admin    # Admin app on port 3001
yarn dev:mobile   # Mobile app on port 3002
```

### Environment Variables

Each app requires its own `.env.local` file. Check individual app READMEs for specifics:

- **Web**: `apps/web/.env.local.example`
- **Admin**: `apps/admin/.env.local` (if applicable)
- **Mobile**: `apps/mobile/.env.local` (if applicable)

**Development Tip**: When working only on the frontend, point to production APIs:
- Replace `localhost:9000` with `search.gamenode.app`
- Replace `localhost:5000` with `server.gamenode.app`

---

## Monorepo Structure

```
game-node-clients/
├── apps/
│   ├── admin/           # Next.js admin dashboard (port 3001)
│   ├── mobile/          # Ionic/Capacitor mobile app (port 3002)
│   └── web/             # Next.js main website (port 3000)
├── packages/
│   ├── analytics/       # Analytics utilities
│   ├── config-eslint/   # Shared ESLint configuration
│   ├── config-prettier/ # Shared Prettier configuration
│   ├── config-tailwind/ # Shared Tailwind configuration
│   ├── config-typescript/ # Shared TypeScript configuration
│   ├── ui/              # Shared component library (Mantine-based)
│   └── wrapper/         # OpenAPI generated API clients
├── .github/
│   └── workflows/       # CI/CD pipelines (Docker builds)
├── package.json         # Root workspace configuration
├── turbo.json           # TurboRepo configuration
├── .prettierrc          # Prettier config (extends @repo/prettier-config)
├── .syncpackrc          # Dependency version synchronization
└── yarn.lock            # Lock file (DO NOT manually edit)
```

### Important Files

- **`package.json`**: Root scripts and workspace definitions
- **`turbo.json`**: Build orchestration, caching, and task dependencies
- **`.syncpackrc`**: Ensures dependency versions stay aligned (ignores internal @repo/* packages)
- **`.npmrc`**: Enables automatic peer dependency installation

---

## Development Workflow

### Working with Apps

#### Starting Development

```bash
# All apps simultaneously
yarn dev

# Single app with TurboRepo filter
yarn dev -F web
yarn dev -F mobile
yarn dev -F admin

# Or use convenience scripts
yarn dev:web
yarn dev:mobile
yarn dev:admin
```

#### Building Apps

```bash
# Build all apps
yarn build

# Build specific app
yarn build -F web
```

**Note**: Web and admin builds run linting before building (`yarn lint && next build`)

### Working with Packages

#### UI Package (`packages/ui`)

The UI package contains shared React components built on Mantine UI.

**Key Characteristics**:
- NOT pre-transpiled (apps transpile it during build)
- Uses barrel exports (auto-generated via `barrelsby`)
- Components use dependency injection for platform-specific features

**Development**:
```bash
cd packages/ui

# Type checking
yarn type-check

# Linting
yarn lint

# Regenerate barrel exports
yarn barrels:generate
```

**Adding Components**:
1. Create component in `packages/ui/src/components/`
2. Export from appropriate index file
3. Run `yarn barrels:generate` to update barrel exports
4. Import in apps: `import { YourComponent } from "@repo/ui"`

**Consuming in Apps**:
Apps must transpile the UI package. Ensure `next.config.js` or `vite.config.ts` includes:

```javascript
// Next.js
module.exports = {
  transpilePackages: ["@repo/ui", "@repo/wrapper"],
  // ...
};

// Vite
// Already configured in apps/mobile
```

#### Wrapper Package (`packages/wrapper`)

Auto-generated TypeScript clients from OpenAPI specifications.

**Structure**:
- `input/server_swagger.json` → `src/server/`
- `input/search_swagger.json` → `src/search/`

**Regenerating Clients**:
```bash
cd packages/wrapper
yarn build  # Runs generate.js script
```

**Usage**:
```typescript
import { SomeService } from "@repo/wrapper/server";
import { SearchService } from "@repo/wrapper/search";
```

**When to Regenerate**:
- Backend API changes
- New endpoints added
- Schema updates

### Package Management

#### Installing Dependencies

```bash
# Add to root (devDependencies only)
yarn add -D -W <package>

# Add to specific workspace
yarn workspace web add <package>
yarn workspace @repo/ui add <package>

# Add to all apps
cd apps/web && yarn add <package>
cd apps/admin && yarn add <package>
cd apps/mobile && yarn add <package>
```

#### Syncing Dependency Versions

```bash
# Check for version mismatches
yarn mismatches:list

# Auto-fix mismatches
yarn mismatches:fix
```

**Important**: The project uses version resolutions for:
- `prosemirror-model: 1.25.1`
- `@types/react: 19.1.14`
- `@types/react-dom: 19.1.9`

These should be maintained across all packages.

---

## Code Standards

### TypeScript

- **Version**: 5.9.2 (strictly enforced)
- **Config**: Extends `@repo/typescript-config`
- **Strict Mode**: Enabled
- **Module Resolution**: Bundler/Node16

**Type Safety**:
- Always provide explicit return types for functions
- Avoid `any` - use `unknown` if necessary
- Prefer interfaces over types for object shapes
- Use generics for reusable logic

### React

- **Version**: 19.2.0
- **Compiler**: React Compiler (babel-plugin-react-compiler) enabled
- **Patterns**: Functional components with hooks
- **State Management**:
    - React Query (@tanstack/react-query v5.90.5) for server state
    - React hooks for local state

**Component Guidelines**:
- Use functional components
- Destructure props
- Use custom hooks for complex logic
- Memoize expensive computations with `useMemo`
- Memoize callbacks with `useCallback` when passed to optimized children

### Styling

- **Primary**: Mantine UI v8.3.5 components
- **Utility CSS**: TailwindCSS v3.4.3
- **PostCSS**: With Mantine preset and simple-vars
- **Icons**: Tabler Icons React v3.35.0

**Style Approach**:
```tsx
import { Box, Button } from "@mantine/core";

// Mantine for components, Tailwind for utilities
<Box className="flex gap-4">
  <Button variant="filled">Click me</Button>
</Box>
```

**TailwindCSS**:
- Config shared via `@repo/tailwind-config`
- Container queries plugin enabled
- Use `tailwind-merge` utility for conditional classes

### Forms

- **Library**: React Hook Form v8.0.0-alpha.5
- **Validation**: Zod v4.1.12
- **Resolver**: @hookform/resolvers

**Pattern**:
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  
  // ...
}
```

### ESLint & Prettier

- **ESLint**: v8.57.1 with Next.js config
- **Prettier**: v3.5.3 with Tailwind plugin
- **Config**: Extends `@repo/eslint-config` and `@repo/prettier-config`

**Running Linters**:
```bash
# Lint all workspaces
yarn lint

# Lint specific app
yarn workspace web lint

# Fix issues
yarn workspace web lint:fix

# Format all files
yarn format
```

**Pre-commit**: Projects use ESLint with `--max-warnings=0` (zero tolerance)

### Component Reusability

**General Rule**: If a component is used by more than one project (app), it should live in `@repo/ui`.

**Key Principles**:
1. **Shared Components**: Any component used across multiple apps must be moved to `packages/ui/src/components/`
2. **Hooks Location**: All custom hooks should **always** live in `@repo/ui` (`packages/ui/src/hooks/`), regardless of whether they're currently used by one or multiple apps
3. **Barrel File Generation**: Every time a new file is added to the `@repo/ui` project, barrel files must be auto-generated by running:
   ```bash
   cd packages/ui
   yarn barrels:generate
   ```

**Workflow for Adding Shared Components/Hooks**:
```bash
# 1. Create the component or hook in @repo/ui
cd packages/ui/src
# Add your component in components/ or hook in hooks/

# 2. Regenerate barrel exports
cd packages/ui
yarn barrels:generate

# 3. Type check
yarn type-check

# 4. Import in your apps
# import { YourComponent, useYourHook } from "@repo/ui";
```

### Git Workflow

**Branch Naming**: Use descriptive names
- `feature/add-user-profile`
- `fix/login-button-crash`
- `refactor/optimize-queries`

**Commits**: Write clear, concise commit messages
```
feat: add user profile page
fix: resolve login button crash on mobile
refactor: optimize API query performance
docs: update README with new setup steps
```

---

## Common Tasks

### Adding a New Component to UI Library

```bash
# 1. Create component file
cd packages/ui/src/components
mkdir MyComponent
touch MyComponent/MyComponent.tsx
touch MyComponent/index.ts

# 2. Write component
# packages/ui/src/components/MyComponent/MyComponent.tsx
export function MyComponent() {
  return <div>My Component</div>;
}

# packages/ui/src/components/MyComponent/index.ts
export { MyComponent } from "./MyComponent";

# 3. Regenerate barrel exports
cd packages/ui
yarn barrels:generate

# 4. Type check
yarn type-check

# 5. Use in app
# apps/web/src/pages/example.tsx
import { MyComponent } from "@repo/ui";
```

### Adding a New Page (Next.js Apps)

**For web/admin (Pages Router)**:
```bash
# apps/web/src/pages/example.tsx
export default function ExamplePage() {
  return <div>Example</div>;
}
```

### Updating API Client

```bash
# 1. Update OpenAPI spec in packages/wrapper/input/
#    - server_swagger.json
#    - search_swagger.json

# 2. Regenerate clients
cd packages/wrapper
yarn build

# 3. Verify changes
yarn check-types

# 4. Commit generated code
git add src/
git commit -m "chore: regenerate API clients"
```

### Adding a New App Dependency

```bash
# Navigate to app directory
cd apps/web

# Add dependency
yarn add <package>

# Check for version conflicts
cd ../..
yarn mismatches:list

# If conflicts exist, align versions
yarn mismatches:fix
```

### Mobile-Specific Tasks

```bash
cd apps/mobile

# Development
yarn dev

# Build for web
yarn build

# Sync native projects
yarn build  # Includes npx cap sync

# Build Android (requires Android Studio)
yarn build:android

# Type checking
yarn typecheck

# Run tests
yarn test.unit
```

---

## Testing Guidelines

### Current Test Setup

- **Mobile**: Vitest v0.34.6 with @testing-library/react
- **Admin**: Jest v29.7.0 with @testing-library/react
- **Web**: No explicit test configuration (to be added if needed)

### Running Tests

```bash
# Mobile tests
cd apps/mobile
yarn test.unit

# Admin tests (if configured)
cd apps/admin
# Add test scripts as needed
```

### Writing Tests

```typescript
import { render, screen } from "@testing-library/react";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });
});
```

---

## Deployment

### Docker Builds

The project uses GitHub Actions workflows for Docker image builds:

- **Web**: `.github/workflows/web_docker-build-push.yml`
- **Admin**: `.github/workflows/admin_docker-build-push.yml`
- **Mobile**: `.github/workflows/mobile_build-release.yml`

**Manual Trigger**:
```bash
# Via GitHub UI: Actions → Select workflow → Run workflow
```

**Docker Images**:
- `lamarcke/game-node-web:latest` and `lamarcke/game-node-web:<version>`
- `lamarcke/game-node-admin:latest` and `lamarcke/game-node-admin:<version>`

**Versioning**:
Versions are extracted from app-specific `package.json` files during CI.

### Build Process

```bash
# Production build locally
yarn build

# Individual app builds
cd apps/web && yarn build
cd apps/admin && yarn build
cd apps/mobile && yarn build
```

---

## Troubleshooting

### Common Issues

#### 1. **Module Resolution Errors**

**Symptom**: Cannot find module `@repo/ui` or `@repo/wrapper`

**Solution**:
```bash
# Reinstall dependencies
yarn install

# Ensure transpilePackages is configured
# next.config.js or vite.config.ts
```

#### 2. **Type Errors in Shared Packages**

**Symptom**: TypeScript errors in `packages/ui` or `packages/wrapper`

**Solution**:
```bash
# Type check the package
cd packages/ui
yarn type-check

# Rebuild wrapper if needed
cd ../wrapper
yarn build
```

#### 3. **Dependency Version Conflicts**

**Symptom**: Multiple versions of React, @types/react, etc.

**Solution**:
```bash
# Check for mismatches
yarn mismatches:list

# Auto-fix
yarn mismatches:fix

# Manual fix: Update package.json resolutions
# Root package.json already has resolutions for:
# - prosemirror-model
# - @types/react
# - @types/react-dom
```

#### 4. **TurboRepo Cache Issues**

**Symptom**: Build outputs seem stale or incorrect

**Solution**:
```bash
# Clean TurboRepo cache
yarn clean

# Or manually remove
rm -rf .turbo
rm -rf apps/*/.turbo
rm -rf packages/*/.turbo

# Rebuild
yarn build
```

#### 5. **API Client Out of Sync**

**Symptom**: TypeScript errors when using API services

**Solution**:
```bash
# Regenerate API clients
cd packages/wrapper
yarn build

# Restart dev server
cd ../..
yarn dev
```

#### 6. **Mobile Build Fails**

**Symptom**: Capacitor sync or build errors

**Solution**:
```bash
cd apps/mobile

# Clean and rebuild
rm -rf node_modules
yarn install
yarn build

# Ensure Capacitor CLI is up to date
npx cap sync
```

#### 7. **Port Already in Use**

**Symptom**: EADDRINUSE error when starting dev server

**Solution**:
```bash
# Kill process on port (Linux/Mac)
lsof -ti:3000 | xargs kill -9  # Web
lsof -ti:3001 | xargs kill -9  # Admin
lsof -ti:3002 | xargs kill -9  # Mobile

# Or use different port
cd apps/web
PORT=3003 yarn dev
```

### Debugging Tips

1. **Enable Verbose Logging**:
   ```bash
   yarn dev --verbose
   ```

2. **Check TurboRepo Task Graph**:
   ```bash
   yarn turbo run build --dry-run
   ```

3. **Inspect Build Output**:
   ```bash
   # Next.js apps
   ls apps/web/.next
   
   # Mobile
   ls apps/mobile/dist
   ```

4. **Verify Node/Yarn Versions**:
   ```bash
   node --version  # Should be >= 18
   yarn --version  # Should be 1.22.22
   ```

---

## Additional Resources

### Documentation

- **Main README**: `/README.md`
- **Web App README**: `/apps/web/README.md`
- **Admin App README**: `/apps/admin/README.md`
- **UI Package README**: `/packages/ui/README.md`
- **ESLint Config README**: `/packages/config-eslint/README.md`

### External Documentation

- [TurboRepo Docs](https://turbo.build/repo/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Mantine UI Docs](https://mantine.dev/)
- [React Query Docs](https://tanstack.com/query/latest)
- [Ionic React Docs](https://ionicframework.com/docs/react)
- [Capacitor Docs](https://capacitorjs.com/docs)

### Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| React | 19.2.0 | UI framework |
| Next.js | 16.0.0-beta.0 | Web/Admin framework |
| Mantine | 8.3.5 | Component library |
| TailwindCSS | 3.4.3 | Utility CSS |
| React Query | 5.90.5 | Server state management |
| Ionic | 8.7.6 | Mobile framework |
| Capacitor | 7.4.3 | Native bridge |
| TypeScript | 5.9.2 | Type safety |
| Zod | 4.1.12 | Schema validation |
| React Hook Form | 8.0.0-alpha.5 | Form management |

---

## Best Practices for AI Agents

### Code Generation

1. **Always follow existing patterns**: Examine similar files before creating new ones
2. **Respect TypeScript**: Provide proper types, avoid `any`
3. **Use shared components**: Prefer `@repo/ui` over creating duplicates
4. **Import from packages**: Use `@repo/wrapper` for API calls
5. **Follow naming conventions**: PascalCase for components, camelCase for functions/variables
6. **Add error handling**: Use try-catch, loading states, error boundaries
7. **Keep dependencies minimal**: Only add new packages if absolutely necessary
8. **Prefer generating via CLI tools**: When generating a project, prefer to use the tool's 'create' command
   instead of generating the template yourself

### Making Changes

1. **Understand scope**: Know which app/package you're modifying
2. **Check dependencies**: Run `yarn mismatches:list` after adding packages
3. **Test locally**: Run `yarn dev` and verify changes work
4. **Lint before committing**: Run `yarn lint` and fix all warnings
5. **Type check**: Run `yarn type-check` in relevant packages
6. **Update documentation**: If adding features, update READMEs. Avoid creating new, one-off documentation files unless instructed to.
7. **Keep it minimal**: Make the smallest change that solves the problem

### Communication

1. **Be specific**: Mention exact file paths and line numbers
2. **Explain reasoning**: Why you chose a particular approach. Output your reasoning, do not create one-off documentation files.
3. **Note dependencies**: If changes require updates elsewhere
4. **Highlight risks**: Potential breaking changes or side effects
5. **Suggest tests**: Recommend how to verify changes work
6. **Be concise**: Never use big words, add too much preamble or text walls. Eat words if you have to.
7. **Output your reasoning**: Show your reasoning to user directly. Do not create documentation files unless instructed to.

---

## Quick Reference Commands

```bash
# Setup
yarn install                    # Install dependencies
yarn dev                        # Start all apps
yarn dev:web                    # Start web app only
yarn dev:admin                  # Start admin app only
yarn dev:mobile                 # Start mobile app only

# Development
yarn build                      # Build all apps
yarn lint                       # Lint all workspaces
yarn type-check                 # Type check all workspaces
yarn format                     # Format all files

# Maintenance
yarn mismatches:list            # Check version mismatches
yarn mismatches:fix             # Fix version mismatches
yarn clean                      # Clean build artifacts

# Package-specific
cd packages/wrapper && yarn build  # Regenerate API clients
cd packages/ui && yarn barrels:generate  # Regenerate barrel exports
```

---

## Contact & Support

For questions or issues:
- Open an issue on GitHub
- Join the Discord community
- Email: support@gamenode.app

---

**Last Updated**: 2025-10-19  
**Document Version**: 1.0.0
