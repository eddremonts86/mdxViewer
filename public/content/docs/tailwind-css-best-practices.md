# Tailwind CSS Best Practices for MDXViewer

This document outlines the Tailwind CSS best practices and linting setup for the MDXViewer project.

## Overview

While we couldn't install the `eslint-plugin-tailwindcss` package (it appears to not exist or be unavailable), we've implemented the next best solution using Prettier with the official Tailwind CSS plugin.

## Setup

### 1. Prettier Plugin for Tailwind CSS

We've installed and configured `prettier-plugin-tailwindcss` which provides:

- **Automatic class sorting**: Orders classes according to Tailwind's recommended order
- **Consistent formatting**: Ensures classes are formatted consistently across the project
- **Integration with existing Prettier setup**: Works seamlessly with our current formatting workflow

### 2. Configuration

#### `.prettierrc`

```json
{
    "plugins": ["prettier-plugin-tailwindcss"]
}
```

#### ESLint Custom Rules

```javascript
// Custom Tailwind CSS best practices (manual rules)
"no-unused-vars": ["error", {
    "varsIgnorePattern": "^(tw|tailwind)",
    "argsIgnorePattern": "^_"
}],
```

## Best Practices

### 1. Class Ordering

Prettier will automatically sort classes in this order:

1. Layout (display, position, z-index)
2. Box model (width, height, margin, padding)
3. Typography (font, text)
4. Visual (background, border, shadow)
5. Miscellaneous (cursor, user-select)
6. Interactive states (hover, focus, active)

### 2. Responsive Design

```tsx
// ✅ Good - Mobile first approach
<div className="w-full md:w-1/2 lg:w-1/3">

// ❌ Avoid - Desktop first approach
<div className="w-1/3 lg:w-1/2 md:w-full">
```

### 3. Component Classes

```tsx
// ✅ Good - Use cn() utility for conditional classes
import { cn } from "@/lib/utils";

<div className={cn(
    "base-class another-class",
    isActive && "active-state",
    variant === "primary" && "primary-variant"
)}>
```

### 4. Custom CSS Classes

```tsx
// ✅ Good - Use CSS variables with Tailwind
<div className="bg-background text-foreground">

// ✅ Good - Semantic color usage
<div className="bg-destructive text-destructive-foreground">

// ❌ Avoid - Hard-coded colors when semantic options exist
<div className="bg-red-500 text-white">
```

### 5. Accessibility Classes

```tsx
// ✅ Good - Include accessibility classes
<button className="sr-only focus:not-sr-only">
<div className="focus:outline-none focus:ring-2 focus:ring-primary">
```

### 6. Animation Classes

```tsx
// ✅ Good - Use Tailwind's animation utilities
<div className="transition-all duration-300 ease-in-out hover:scale-105">

// ✅ Good - Use custom animations from tailwindcss-animate
<div className="animate-fade-in animate-duration-300">
```

## Common Patterns in MDXViewer

### 1. Button Variants

```tsx
// Primary button
className = "bg-primary text-primary-foreground hover:bg-primary/90";

// Secondary button
className = "bg-secondary text-secondary-foreground hover:bg-secondary/80";

// Destructive button
className =
    "bg-destructive text-destructive-foreground hover:bg-destructive/90";
```

### 2. Card Components

```tsx
className = "rounded-lg border bg-card text-card-foreground shadow-sm";
```

### 3. Input Fields

```tsx
className =
    "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
```

### 4. Layout Containers

```tsx
// Main container
className = "container mx-auto px-4";

// Flexible layouts
className = "flex items-center justify-between";

// Grid layouts
className = "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3";
```

## Validation

### 1. Automatic Formatting

Run formatting to apply Tailwind class sorting:

```bash
npm run format
```

### 2. ESLint Validation

Run linting to catch common issues:

```bash
npm run lint
```

### 3. Pre-commit Hooks

The project includes pre-commit hooks that automatically:

- Format code with Prettier (including Tailwind class sorting)
- Run ESLint fixes
- Validate AI rules

## Custom Utilities

### 1. Class Merging

Use `cn()` from `@/lib/utils` for merging classes:

```tsx
import { cn } from "@/lib/utils";

const className = cn(
    "default-classes",
    condition && "conditional-classes",
    variant === "special" && "special-classes"
);
```

### 2. CSS Variables

Prefer CSS variables for theme-aware styling:

```css
/* Use theme colors */
.custom-component {
    background: hsl(var(--background));
    color: hsl(var(--foreground));
}
```

## Integration with View Transitions

Tailwind classes work seamlessly with our View Transitions:

```tsx
// Classes for transition targeting
<div className="document-content transition-all duration-300">
<nav className="navigation-header animate-fade-in">
<aside className="sidebar transform transition-transform">
```

## Troubleshooting

### 1. Classes Not Sorting

If Prettier isn't sorting classes:

- Ensure `prettier-plugin-tailwindcss` is installed
- Check that the plugin is listed in `.prettierrc`
- Restart your editor/IDE

### 2. Custom Classes

For project-specific classes, ensure they're:

- Added to your Tailwind config if they're utilities
- Prefixed appropriately to avoid conflicts
- Documented in component comments

### 3. Performance

For better performance:

- Use Tailwind's JIT mode (enabled by default in v3+)
- Purge unused styles in production
- Avoid overly complex class combinations

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss)
- [Tailwind CSS Best Practices](https://tailwindcss.com/docs/reusing-styles)
- [shadcn/ui Component Guidelines](https://ui.shadcn.com/)

This setup provides excellent Tailwind CSS development experience with automatic class sorting, consistent formatting, and integration with our existing tooling.
