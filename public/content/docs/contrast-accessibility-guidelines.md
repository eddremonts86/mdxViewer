# Contrast and Accessibility Guidelines

This document outlines the contrast and accessibility requirements for MDXViewer components.

## Contrast Requirements

### WCAG 2.1 Compliance

All components MUST meet WCAG 2.1 AA standards:

-   **Normal text**: Minimum contrast ratio of 4.5:1
-   **Large text** (18pt+ or 14pt+ bold): Minimum contrast ratio of 3:1
-   **Interactive elements**: Clear focus indicators with sufficient contrast

### Semantic Color Classes

Always use Tailwind's semantic color classes that automatically provide proper contrast:

#### ✅ Recommended Color Classes

```tsx
// Text colors with guaranteed contrast
text - foreground; // Primary text color
text - muted - foreground; // Secondary text color
text - card - foreground; // Text on card backgrounds
text - destructive - foreground; // Text on destructive backgrounds
text - primary - foreground; // Text on primary backgrounds

// Background colors
bg - background; // Main background
bg - card; // Card/panel background
bg - muted; // Subtle background
bg - accent; // Accent background
bg - destructive; // Error/destructive background
bg - primary; // Primary action background
```

#### ❌ Avoid These Combinations

```tsx
// Low contrast combinations
<div className="bg-gray-400 text-gray-300">Low contrast</div>
<div className="bg-yellow-100 text-yellow-200">Very low contrast</div>
<div className="bg-blue-500 text-blue-400">Insufficient contrast</div>

// Custom colors without contrast verification
<div className="bg-[#f0f0f0] text-[#d0d0d0]">Unknown contrast</div>
```

## Theme Compatibility

### Light and Dark Mode Testing

Every component MUST be tested in both themes:

```tsx
// ✅ CORRECT: Theme-aware colors
const ThemeAwareComponent = () => {
    return (
        <div className="bg-card text-card-foreground border border-border">
            <h2 className="text-foreground">Title</h2>
            <p className="text-muted-foreground">Description</p>
        </div>
    );
};
```

### State Variations

All interactive states must maintain proper contrast:

```tsx
// ✅ CORRECT: Accessible button states
<Button
    variant="outline"
    className="
        border-input
        text-foreground
        hover:bg-accent
        hover:text-accent-foreground
        focus:ring-2
        focus:ring-ring
        focus:ring-offset-2
    "
>
    Accessible Button
</Button>
```

## Information Conveyance

### Color + Alternative Indicators

Never rely solely on color to convey information:

#### ✅ CORRECT: Color + Icon

```tsx
const StatusIndicator = ({
    status,
}: {
    status: "success" | "error" | "warning";
}) => {
    const getStatusConfig = () => {
        switch (status) {
            case "success":
                return {
                    icon: <CheckCircle className="h-4 w-4" />,
                    className: "text-green-600 bg-green-50 border-green-200",
                    label: "Success",
                };
            case "error":
                return {
                    icon: <XCircle className="h-4 w-4" />,
                    className:
                        "text-destructive bg-destructive/10 border-destructive/20",
                    label: "Error",
                };
            case "warning":
                return {
                    icon: <AlertTriangle className="h-4 w-4" />,
                    className: "text-yellow-600 bg-yellow-50 border-yellow-200",
                    label: "Warning",
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div
            className={`flex items-center space-x-2 p-3 border rounded-md ${config.className}`}
        >
            {config.icon}
            <span className="font-medium">{config.label}</span>
        </div>
    );
};
```

#### ❌ INCORRECT: Color Only

```tsx
// Bad: Information conveyed only through color
<span className="text-red-500">Error</span>
<span className="text-green-500">Success</span>
<span className="text-yellow-500">Warning</span>
```

## Form Accessibility

### Labels and Instructions

```tsx
// ✅ CORRECT: Proper labeling and error states
const AccessibleInput = ({ error }: { error?: string }) => {
    return (
        <div className="space-y-2">
            <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
            >
                Email Address
            </label>
            <Input
                id="email"
                type="email"
                className={`
                    border-input
                    text-foreground
                    placeholder:text-muted-foreground
                    focus:ring-2
                    focus:ring-ring
                    ${error ? "border-destructive focus:ring-destructive" : ""}
                `}
                placeholder="Enter your email"
                aria-describedby={error ? "email-error" : undefined}
                aria-invalid={error ? "true" : "false"}
            />
            {error && (
                <div
                    id="email-error"
                    className="flex items-center space-x-2 text-sm text-destructive"
                >
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};
```

## Focus Indicators

### Keyboard Navigation

All interactive elements must have clear focus indicators:

```tsx
// ✅ CORRECT: Visible focus states
<Button className="
    focus:outline-none
    focus:ring-2
    focus:ring-ring
    focus:ring-offset-2
    focus:ring-offset-background
">
    Keyboard Accessible
</Button>

// ✅ CORRECT: Custom focus styles
<div
    tabIndex={0}
    className="
        cursor-pointer
        rounded-md
        focus:outline-none
        focus:ring-2
        focus:ring-primary
        focus:ring-offset-2
    "
    onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
        }
    }}
>
    Custom Focusable Element
</div>
```

## Validation Tools

### Automated Checks

The validation script checks for:

1. **Semantic color usage**: `text-foreground`, `bg-background`, etc.
2. **Problematic combinations**: Known low-contrast patterns
3. **Icon usage**: Components that combine icons with color
4. **Theme compatibility**: Colors that work in both themes

### Manual Testing

For each component:

1. **Switch themes**: Test in both light and dark modes
2. **Keyboard navigation**: Tab through all interactive elements
3. **Screen reader testing**: Verify proper announcements
4. **Color blindness**: Test with color vision simulators

## Common Patterns

### Loading States

```tsx
// ✅ CORRECT: Accessible loading indicator
const LoadingSpinner = () => (
    <div className="flex items-center space-x-2 text-muted-foreground">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
        <span className="text-sm">Loading...</span>
    </div>
);
```

### Error Messages

```tsx
// ✅ CORRECT: Clear error presentation
const ErrorMessage = ({ message }: { message: string }) => (
    <div className="flex items-center space-x-2 p-3 border border-destructive/20 bg-destructive/10 rounded-md">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
        <span className="text-sm text-destructive font-medium">{message}</span>
    </div>
);
```

### Success Feedback

```tsx
// ✅ CORRECT: Positive feedback with multiple indicators
const SuccessMessage = ({ message }: { message: string }) => (
    <div className="flex items-center space-x-2 p-3 border border-green-200 bg-green-50 rounded-md">
        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
        <span className="text-sm text-green-800 font-medium">{message}</span>
    </div>
);
```

## Validation Checklist

Before committing any component:

-   ✅ Uses semantic Tailwind color classes
-   ✅ Tested in both light and dark themes
-   ✅ Information not conveyed by color alone
-   ✅ Proper focus indicators for interactive elements
-   ✅ Sufficient contrast ratios (4.5:1 for normal text)
-   ✅ Icons accompany color-coded information
-   ✅ Accessible labels and descriptions
-   ✅ Keyboard navigation support

Use `npm run validate:ai` to run automated accessibility checks.

---

_Following these guidelines ensures MDXViewer components are accessible to all users, regardless of visual abilities or assistive technologies._
