# GitHub Copilot Instructions for MDXViewer

## Project Overview

MDXViewer is a full-stack MDX file viewer with React 19 + TypeScript frontend and Express.js backend. The project emphasizes strict TypeScript typing, component-based architecture, and automated quality checks.

## Essential Architecture Knowledge

### Full-Stack Setup

- **Frontend**: React 19 + TypeScript + Vite (port 5173)
- **Backend**: Express.js server (port 3001) with API proxy
- **Development**: `npm run dev:watch` starts both with hot reload + file watching
- **Build**: TypeScript compilation → Vite build process

### Key Data Flows

1. **Content System**: MDX files in `public/content/` → Express server endpoints → React Query → UI components
2. **Preview Generation**: File changes → preview watcher → static preview files → served via `/api/preview`
3. **File Management**: Upload/create through UI → server file operations → content index regeneration

### Critical Component Patterns

- **Strict Import Order**: React imports → external libraries (alphabetical) → `@/` imports (alphabetical) → relative imports
- **TypeScript-First**: Never use `any` - always proper interfaces and type definitions
- **Component Structure**: One component per file, max 500 lines, extract utilities/hooks separately
- **UI System**: shadcn/ui components + Tailwind CSS + Lucide React icons exclusively

## Development Workflow Commands

### Essential Development Commands

```bash
# Primary development (client + server + watchers)
npm run dev:watch

# Quality checks (run before commits)
npm run pre-commit  # formats, lints, validates AI rules, checks code smells

# Manual validation
npm run validate:ai        # Check adherence to project conventions
npm run quality:check      # ESLint + format consistency
npm run code-smell-check   # Automated code quality analysis
```

### File Organization Rules

- **MDX/MD files**: `public/content/{docs,guides,examples,api}/`
- **Shell scripts**: `scripts/sh/`
- **Test scripts**: `scripts/js/`
- **Components**: `src/components/` (domain-organized subdirectories)
- **One component per file** with proper TypeScript interfaces

## Project-Specific Conventions

### State Management Pattern

- **React Query** for all server state (files, statistics, health)
- **Local state** with useState for UI-only concerns
- **Custom hooks** in `src/hooks/` for reusable logic
- Example: `useAPIQuery` pattern with proper error handling

### Server Architecture

- **Clean separation**: `server/endpoints/` for API routes
- **Utility modules**: `server/utils/` for file operations, validation
- **Constants**: `server/constants/` for configuration
- **Preview system**: Universal handling for all content nesting levels

### Quality Automation

- **Auto-formatting**: ESLint + Prettier integration
- **AI rule validation**: Custom script validates TypeScript usage, file organization, import ordering
- **Code smell detection**: Automated analysis with HTML reporting
- **Pre-commit hooks**: Enforces quality standards before commits

## Component/Feature Development Guidelines

### Quality Standards (MANDATORY)

**Every component/feature MUST follow these quality standards:**

- **ESLint**: All code must pass ESLint validation without errors or warnings
- **Prettier**: Code must be formatted with Prettier before commits
- **SonarQube**: Follow SonarQube quality rules for maintainability and security
- **Codacy**: Adhere to Codacy code quality standards and best practices
- **English Only**: All code, comments, variables, functions, and UI text must be in English

### Logical Code Division (REQUIRED)

**Always divide components/features into logical portions:**

#### 1. **Types & Interfaces** (`types/`)

```typescript
// types/UserProfile.ts
export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
}

export interface UserProfileProps {
    profile: UserProfile;
    onEdit: (profile: UserProfile) => void;
    className?: string;
}
```

#### 2. **Constants** (`const/`)

```typescript
// const/userProfile.ts
export const USER_ROLES = {
    ADMIN: "admin",
    USER: "user",
} as const;

export const VALIDATION_RULES = {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50,
} as const;
```

#### 3. **Utilities** (`utils/`)

```typescript
// utils/userValidation.ts
import { VALIDATION_RULES } from "../const/userProfile";

export const validateEmail = (email: string): boolean => {
    return VALIDATION_RULES.EMAIL_REGEX.test(email);
};

export const validateName = (name: string): boolean => {
    return name.length >= VALIDATION_RULES.MIN_NAME_LENGTH && name.length <= VALIDATION_RULES.MAX_NAME_LENGTH;
};
```

#### 4. **Custom Hooks** (`hooks/`)

```typescript
// hooks/useUserProfile.ts
import { useState, useCallback } from "react";
import { UserProfile } from "../types/UserProfile";

export const useUserProfile = (initialProfile: UserProfile) => {
    const [profile, setProfile] = useState<UserProfile>(initialProfile);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const handleEdit = useCallback((updatedProfile: UserProfile) => {
        setProfile(updatedProfile);
        setIsEditing(false);
    }, []);

    return {
        profile,
        isEditing,
        setIsEditing,
        handleEdit,
    };
};
```

#### 5. **Providers/Context** (`providers/`)

```typescript
// providers/UserProvider.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { UserProfile } from "../types/UserProfile";

interface UserContextType {
    currentUser: UserProfile | null;
    setCurrentUser: (user: UserProfile | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Provider implementation
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within UserProvider");
    }
    return context;
};
```

#### 6. **Libraries/Services** (`lib/`)

```typescript
// lib/userService.ts
import { UserProfile } from "../types/UserProfile";

export class UserService {
    static async fetchUserProfile(id: string): Promise<UserProfile> {
        // Service implementation
    }

    static async updateUserProfile(profile: UserProfile): Promise<UserProfile> {
        // Service implementation
    }
}
```

#### 7. **Component Implementation**

```typescript
// components/UserProfileCard.tsx
import React from "react";
import { UserProfileProps } from "../types/UserProfile";
import { useUserProfile } from "../hooks/useUserProfile";
import { USER_ROLES } from "../const/userProfile";
import { validateEmail, validateName } from "../utils/userValidation";

export const UserProfileCard: React.FC<UserProfileProps> = ({ profile, onEdit, className = "" }) => {
    const { isEditing, setIsEditing, handleEdit } = useUserProfile(profile);

    // Component implementation
};
```

### Development Workflow for Components/Features

#### Before Writing Code

1. **Run quality checks**: `npm run quality:check`
2. **Validate AI rules**: `npm run validate:ai`

#### During Development

1. **Create logical file structure** following the division above
2. **Write TypeScript interfaces first** (never use `any`)
3. **Extract reusable logic** into hooks and utilities
4. **Follow import order**: React → external → @/ → relative

#### After Writing Code

1. **Format code**: `npm run format`
2. **Fix linting**: `npm run lint:fix`
3. **Run pre-commit**: `npm run pre-commit`
4. **Check code smells**: `npm run code-smell-check`

### File Organization Example

```text
src/features/user-profile/
├── components/
│   ├── UserProfileCard.tsx
│   ├── UserProfileForm.tsx
│   └── UserProfileList.tsx
├── hooks/
│   ├── useUserProfile.ts
│   └── useUserValidation.ts
├── types/
│   ├── UserProfile.ts
│   └── UserValidation.ts
├── const/
│   ├── userProfile.ts
│   └── validation.ts
├── utils/
│   ├── userValidation.ts
│   └── userFormatting.ts
├── lib/
│   ├── userService.ts
│   └── userAPI.ts
└── providers/
    └── UserProvider.tsx
```

### Quality Validation Commands

```bash
# Complete quality validation (run before commits)
npm run pre-commit

# Individual quality checks
npm run lint:fix        # Fix ESLint issues
npm run format          # Apply Prettier formatting
npm run validate:ai     # Validate AI rules adherence
npm run code-smell-check # Check code quality with reports
```

## Key Files to Reference

- `.ai-instructions.md`: Comprehensive development rules and patterns
- `scripts/sh/validate-ai-rules.sh`: Quality validation implementation
- `src/components/ui/`: shadcn/ui base components
- `server/clean-server.ts`: Express server entry point
- `vite.config.ts`: Build configuration with MDX support
