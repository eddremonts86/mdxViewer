---
title: "Advanced Configuration"
description: "Advanced configuration guide for the viewer"
author: "System"
date: "2025-06-21"
---

# Advanced Configuration

## Theme Customization

### CSS Variables

The project uses CSS variables for themes:

```css
:root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
}

.dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
}
```

## Route Configuration

### React Router

The project uses React Router for navigation:

```typescript
const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <DocumentPage /> },
            { path: "*", element: <DocumentPage /> },
        ],
    },
]);
```

## Optimization

### Performance

-   Document lazy loading
-   Memoization of heavy components
-   Virtual scrolling for large lists

### SEO

-   Dynamic meta tags
-   Open Graph for sharing
-   Automatic sitemap

## Deployment

### Netlify

```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Vercel

```json
{
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## File Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── Layout.tsx       # Main layout
│   ├── Sidebar.tsx      # Side navigation
│   └── DocumentViewer.tsx
├── content/
│   ├── docs/           # Documentation
│   ├── examples/       # Examples
│   └── guides/         # Guides
├── hooks/
│   └── useTheme.tsx    # Hook de temas
└── lib/
    └── utils.ts        # Utilidades
```
