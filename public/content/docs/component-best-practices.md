# Component Development Best Practices

This document outlines the best practices implemented in MDXViewer components, following our AI-driven development guidelines.

## Component Structure Requirements

### 1. TypeScript Interface Definition

Every component MUST have a proper TypeScript interface:

```tsx
interface ComponentNameProps {
    /** JSDoc description for each prop */
    requiredProp: string;
    /** Optional props with default values */
    optionalProp?: boolean;
    /** Callback functions with proper typing */
    onAction?: (data: DataType) => void;
    /** CSS classes for customization */
    className?: string;
}
```

### 2. Component Declaration

Use React.FC with proper typing:

```tsx
/**
 * Component description with purpose and features
 * Follows MDXViewer design system and English-only practices
 */
export const ComponentName: React.FC<ComponentNameProps> = ({
    requiredProp,
    optionalProp = false,
    onAction,
    className = "",
}) => {
    // Component implementation
};
```

### 3. Hook Usage Order

Always follow this order for hooks:

1. `useState` - Component state
2. `useEffect` - Side effects
3. `useMemo` - Memoized calculations
4. `useCallback` - Memoized functions
5. Custom hooks

```tsx
export const Example: React.FC<ExampleProps> = ({ data }) => {
    // State hooks first
    const [isLoading, setIsLoading] = useState(false);
    const [items, setItems] = useState<Item[]>([]);

    // Effect hooks
    useEffect(() => {
        // Side effects
    }, []);

    // Memoized values
    const processedItems = useMemo(() => {
        return items.filter((item) => item.isActive);
    }, [items]);

    // Memoized callbacks
    const handleAction = useCallback(() => {
        // Action handler
    }, []);

    // Custom hooks last
    const { data: apiData } = useCustomHook();

    return <div>{/* JSX */}</div>;
};
```

## Styling Guidelines

### 1. Tailwind CSS Classes

-   Use semantic color classes: `text-foreground`, `bg-background`
-   Implement responsive design: `hidden md:block`, `sm:max-w-none`
-   Add smooth transitions: `transition-all duration-200`

### 2. Conditional Styling

Use template literals for dynamic classes:

```tsx
className={`base-classes ${
    isActive ? "active-classes" : "inactive-classes"
} ${additionalClasses}`}
```

### 3. Responsive Design

Always implement mobile-first responsive design:

```tsx
<div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
    <span className="truncate max-w-32 sm:max-w-none">{content}</span>
</div>
```

## Accessibility Requirements

### 1. ARIA Labels

Provide proper accessibility attributes:

```tsx
<Button
    aria-label="Go back to previous page"
    aria-current={isActive ? "page" : undefined}
>
    Back
</Button>
```

### 2. Semantic HTML

Use appropriate HTML elements:

```tsx
<nav aria-label="Navigation breadcrumb">
    <Button
        role="button"
        tabIndex={0}
    >
        Navigation Item
    </Button>
</nav>
```

## State Management

### 1. Loading States

Always handle loading states:

```tsx
{
    isLoading && (
        <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            <span>Loading...</span>
        </div>
    );
}
```

### 2. Error Boundaries

Implement error fallbacks:

```tsx
const handleError = useCallback((error: Error) => {
    console.error("Component error:", error);
    // Handle error appropriately
}, []);
```

## Performance Optimization

### 1. Memoization

Use `useMemo` for expensive calculations:

```tsx
const processedData = useMemo(() => {
    return data.map((item) => ({
        ...item,
        processed: true,
    }));
}, [data]);
```

### 2. Callback Optimization

Use `useCallback` for event handlers:

```tsx
const handleClick = useCallback(
    (id: string) => {
        onItemClick?.(id);
    },
    [onItemClick]
);
```

## Example: Complete Component

```tsx
import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ExampleComponentProps {
    /** Array of items to display */
    items: Item[];
    /** Callback when item is selected */
    onSelect?: (item: Item) => void;
    /** Whether component is in loading state */
    isLoading?: boolean;
    /** Maximum items to show */
    maxItems?: number;
    /** Additional CSS classes */
    className?: string;
}

/**
 * ExampleComponent demonstrates best practices
 * Features: responsive design, loading states, accessibility
 */
export const ExampleComponent: React.FC<ExampleComponentProps> = ({
    items,
    onSelect,
    isLoading = false,
    maxItems = 10,
    className = "",
}) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const visibleItems = useMemo(() => {
        return items.slice(0, maxItems);
    }, [items, maxItems]);

    const handleItemClick = useCallback(
        (item: Item) => {
            setSelectedId(item.id);
            onSelect?.(item);
        },
        [onSelect]
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                <span className="ml-2">Loading items...</span>
            </div>
        );
    }

    return (
        <div
            className={`space-y-2 ${className}`}
            role="list"
        >
            {visibleItems.map((item, index) => (
                <Button
                    key={item.id}
                    variant={selectedId === item.id ? "secondary" : "ghost"}
                    onClick={() => handleItemClick(item)}
                    className="w-full justify-start transition-all duration-200"
                    aria-selected={selectedId === item.id}
                    role="listitem"
                >
                    <span className="truncate">{item.name}</span>
                    {selectedId === item.id && (
                        <Badge
                            variant="secondary"
                            className="ml-auto"
                        >
                            Selected
                        </Badge>
                    )}
                </Button>
            ))}
        </div>
    );
};
```

## Validation Checklist

Before committing any component, ensure:

-   ✅ TypeScript interface with JSDoc comments
-   ✅ React.FC typing with proper destructuring
-   ✅ English-only code, comments, and documentation
-   ✅ Proper hook usage order
-   ✅ Tailwind CSS for all styling
-   ✅ Responsive design implementation
-   ✅ Loading and error states
-   ✅ Accessibility attributes
-   ✅ Performance optimizations (memoization)
-   ✅ Proper file location in `src/components/`

Use `npm run validate:ai` to check compliance with all project rules.

---

_This document ensures consistent, high-quality component development across the MDXViewer project._
