---
title: "API Reference"
description: "Complete API documentation"
author: "Development Team"
date: "2025-06-21"
tags: ["api", "reference", "documentation"]
---

# API Reference

This document provides a comprehensive reference for the MDX Viewer API.

## Core Components

### DocumentViewer

The main component for displaying documents.

```typescript
interface DocumentViewerProps {
    slug: string;
}

function DocumentViewer({ slug }: DocumentViewerProps): JSX.Element;
```

**Props:**

-   `slug`: String - The document identifier for routing

**Example:**

```tsx
<DocumentViewer slug="docs/introduction" />
```

### MarkdownRenderer

Component for rendering Markdown and MDX content.

```typescript
interface MarkdownRendererProps {
    content: string;
    type: "md" | "mdx";
}

function MarkdownRenderer({
    content,
    type,
}: MarkdownRendererProps): JSX.Element;
```

**Props:**

-   `content`: String - The markdown/MDX content to render
-   `type`: 'md' | 'mdx' - The type of content

## Utility Functions

### Export Functions

#### exportToPDF(element, options)

Exports an HTML element to PDF.

```typescript
interface ExportOptions {
    filename?: string;
    format?: "a4" | "letter";
    orientation?: "portrait" | "landscape";
}

async function exportToPDF(
    element: HTMLElement,
    options?: ExportOptions
): Promise<void>;
```

**Parameters:**

-   `element`: HTMLElement - The DOM element to export
-   `options`: ExportOptions - Optional export configuration

**Example:**

```typescript
const contentElement = document.getElementById("content");
await exportToPDF(contentElement, {
    filename: "my-document.pdf",
    format: "a4",
    orientation: "portrait",
});
```

#### exportToHTML(element, title)

Exports content as HTML file.

```typescript
function exportToHTML(element: HTMLElement, title?: string): void;
```

#### printDocument()

Optimizes and prints the current document.

```typescript
function printDocument(): void;
```

## Navigation

### File Structure

Documents are organized in a hierarchical structure:

```
src/content/
├── docs/           # Documentation files
├── examples/       # Example and demo files
├── guides/         # Tutorial and guide files
└── api/           # API reference files
```

### URL Routing

The application uses dynamic routing based on file paths:

-   `/docs/introduction` → `src/content/docs/introduction.md`
-   `/examples/demo` → `src/content/examples/demo.mdx`
-   `/guides/setup` → `src/content/guides/setup.md`

## Theming

### CSS Variables

The application uses CSS custom properties for theming:

```css
:root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --muted: 210 40% 96%;
    --border: 214.3 31.8% 91.4%;
}

.dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --muted: 222.2 84% 11%;
    --border: 217.2 32.6% 17.5%;
}
```

### Theme Toggle

Use the `useTheme` hook to control themes:

```typescript
const { theme, setTheme } = useTheme();

// Toggle between light and dark
setTheme(theme === "light" ? "dark" : "light");
```

## Error Handling

### Document Not Found

When a document is not found, the application displays a 404 message:

```typescript
if (!document) {
    return (
        <div className="text-center">
            <h2>Document not found</h2>
            <p>The document you are looking for does not exist.</p>
        </div>
    );
}
```

### Loading States

Documents show loading indicators during fetch:

```typescript
if (loading) {
    return (
        <div className="flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary"></div>
            <p>Loading document...</p>
        </div>
    );
}
```
