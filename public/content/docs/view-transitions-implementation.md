# View Transitions Implementation Guide

This document explains the comprehensive View Transitions implementation in MDXViewer, providing smooth animations between pages and states using the CSS View Transitions API.

## Features Implemented

### 1. CSS View Transitions API Integration

- **Cross-document transitions**: Enabled with `@view-transition { navigation: auto; }`
- **Same-document transitions**: Programmatic transitions using `document.startViewTransition()`
- **Automatic fallbacks**: Graceful degradation for unsupported browsers
- **Motion preferences**: Respects `prefers-reduced-motion` user settings

### 2. Tailwind CSS Best Practices Setup

Instead of using `eslint-plugin-tailwindcss` (which was unavailable), we implemented:

- **`prettier-plugin-tailwindcss`**: Official Prettier plugin for automatic class sorting
- **Custom ESLint rules**: Manual rules for Tailwind CSS best practices
- **Consistent formatting**: Automatic class ordering according to Tailwind recommendations
- **Integration**: Seamless integration with existing Prettier and ESLint setup

### 3. Utility Functions

#### `src/utils/viewTransitions.ts`

Core utilities for View Transitions:

- `isViewTransitionSupported()`: Feature detection
- `prefersReducedMotion()`: User preference detection
- `executeViewTransition()`: Generic transition executor
- `transitionToRoute()`: Route navigation transitions
- `transitionModal()`: Modal state transitions
- `transitionTheme()`: Theme change transitions
- `useViewTransitions()`: React hook for components

### 4. Custom Components

#### `TransitionLink` Component

Enhanced link component with View Transitions:

```tsx
<TransitionLink
    to="/path"
    transitionName="custom-transition"
    respectReducedMotion={true}
>
    Navigate with transition
</TransitionLink>
```

Features:

- Smooth page transitions
- Automatic fallback for unsupported browsers
- Respects user motion preferences
- Works with React Router

## CSS Animations

### Default Page Transitions

```css
::view-transition-old(root) {
    animation: fade-out 0.3s ease-out;
}

::view-transition-new(root) {
    animation: fade-in 0.3s ease-in;
}
```

### Route Transitions

- Slide animations for page navigation
- Custom timing and easing
- Directional awareness

### Component-Specific Transitions

1. **Breadcrumb Navigation**: Smooth item transitions
2. **Document Content**: Fade and slide effects
3. **Sidebar**: Panel slide animations
4. **Theme Toggle**: Brightness transitions
5. **File Tree**: Scale and fade effects

## Implementation Details

### 1. Navigation Flow

```tsx
const handleBreadcrumbNavigation = async (path: string) => {
    await transitionToRoute(
        () => {
            navigate(path);
        },
        {
            transitionName: "breadcrumb-navigation",
            debug: process.env.NODE_ENV === "development",
        }
    );
};
```

### 2. Theme Changes

```tsx
const handleThemeChange = async (theme: "light" | "dark" | "system") => {
    await transitionTheme(() => {
        setTheme(theme);
    });
};
```

### 3. File Navigation

Updated `FileTreeNode` to use `TransitionLink`:

```tsx
<TransitionLink
    to={node.path}
    className="block"
    transitionName="file-navigation"
>
    {nodeElement}
</TransitionLink>
```

## CSS Classes for Transitions

### Semantic Classes

- `.document-content`: Main document area
- `.sidebar`: File explorer sidebar
- `.navigation-header`: Breadcrumb navigation
- `.breadcrumb-item`: Individual breadcrumb items
- `.file-tree-item`: File tree nodes

### Utility Classes

- `.transition-slide-up`: Upward slide animation
- `.focus-transition`: Focus state animations

## Browser Support

### Supported Browsers

- **Chrome**: 111+ (same-document), 126+ (cross-document)
- **Edge**: 111+ (same-document), 126+ (cross-document)
- **Safari**: 18+ (same-document), 18.2+ (cross-document)
- **Firefox**: Not yet supported

### Fallback Behavior

When View Transitions API is not supported:

- Functions execute immediately without animation
- No visual artifacts or broken functionality
- Maintains full application functionality

## Performance Considerations

### Optimizations

1. **Conditional Loading**: Transitions only run when supported
2. **Motion Preferences**: Respects user settings automatically
3. **Debug Mode**: Logging only in development
4. **Efficient Selectors**: Minimal CSS specificity

### Best Practices

1. **Short Durations**: Keep animations under 400ms
2. **Meaningful Transitions**: Only animate when it adds value
3. **Accessibility**: Always respect motion preferences
4. **Progressive Enhancement**: Works without transitions

## Testing

### Manual Testing Steps

1. **Navigation**: Test breadcrumb back button
2. **File Browsing**: Click through file tree
3. **Theme Toggle**: Switch between light/dark modes
4. **Reduced Motion**: Test with system preference enabled

### Debugging

Enable debug mode in development:

```tsx
transitionToRoute(callback, {
    debug: process.env.NODE_ENV === "development",
});
```

## Configuration

### Customizing Transitions

Modify `src/assets/styles/view-transitions.css`:

```css
::view-transition-old(custom-name) {
    animation: your-custom-animation 0.3s ease-out;
}
```

### Adding New Transition Types

1. Create CSS animations in view-transitions.css
2. Add utility function in viewTransitions.ts
3. Apply transition classes to components

## Integration Points

### Updated Components

1. **DocumentPage**: Navigation and content transitions
2. **FileTreeNode**: File navigation transitions
3. **ModeToggle**: Theme change transitions
4. **SidebarNew**: Panel transitions
5. **NavigationBreadcrumb**: Breadcrumb item transitions

### CSS Files

- `src/assets/styles/view-transitions.css`: All transition styles
- `src/main.tsx`: CSS import

## Future Enhancements

### Planned Features

1. **Custom Transition Names**: Per-route transition customization
2. **Advanced Animations**: Complex multi-element transitions
3. **Gesture Support**: Touch-based transition triggers
4. **Performance Metrics**: Transition timing analysis

### Browser Updates

Monitor support for:

- Firefox implementation timeline
- Enhanced `attr()` function for dynamic naming
- Additional View Transitions features

## Troubleshooting

### Common Issues

1. **No Transitions**: Check browser support and feature detection
2. **Jerky Animations**: Verify CSS animation properties
3. **Performance**: Monitor frame rates during transitions
4. **Accessibility**: Ensure motion preferences are respected

### Debug Information

View Transitions utility provides console logging in development mode for:

- Transition start/completion
- Fallback usage
- Motion preference detection

This comprehensive implementation provides smooth, accessible transitions throughout the MDXViewer application while maintaining compatibility and performance across all browsers.
