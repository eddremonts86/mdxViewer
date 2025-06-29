#!/bin/bash

# Complete installation script for mdxViewer
echo "🚀 Starting complete mdxViewer installation..."

# Ensure we're in the correct directory
cd /Volumes/Developer/Projects/mdxViewer || {
  echo "❌ Could not access the project directory"
  exit 1
}

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Update vite.config.ts to ensure it supports MDX
echo "⚙️ Updating Vite configuration..."
cat >vite.config.ts <<'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mdx(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    open: true,
  },
})
EOF

# Actualizar tsconfig.json para path aliases
echo "⚙️ Updating TypeScript configuration..."
cat >tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "tailwind.config.js"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

# Crear el directorio para contenido si no existe
echo "📁 Creando estructura de directorios..."
mkdir -p public/content/docs
mkdir -p public/content/examples
mkdir -p public/content/guides
mkdir -p public/content/api

# Copy existing content files if they don't exist
echo "📝 Copying content files..."
[ ! -f public/content/api/reference.md ] &&
  cat >public/content/api/reference.md <<'EOF'
---
title: "API Reference"
description: "Complete API documentation"
author: "Development Team"
date: "2025-06-21"
tags: ["api", "reference", "documentation"]
---

# API Reference

This documentation provides a comprehensive reference of the MDX Viewer API.

## Core Components

### DocumentViewer

The main component for displaying documents.

```typescript
interface DocumentViewerProps {
  slug: string
}

function DocumentViewer({ slug }: DocumentViewerProps): JSX.Element
```

**Props:**
- `slug`: String - The document identifier for routing

**Example:**
```tsx
<DocumentViewer slug="docs/introduction" />
```

### MarkdownRenderer

Componente para renderizar contenido Markdown y MDX.

```typescript
interface MarkdownRendererProps {
  content: string
  type: 'md' | 'mdx'
}

function MarkdownRenderer({ content, type }: MarkdownRendererProps): JSX.Element
```

## Funciones de Utilidad

### Funciones de Exportación

```typescript
// Exportar a PDF
await exportToPDF(element, {
  filename: 'document.pdf',
  format: 'a4',
  orientation: 'portrait'
})

// Exportar a HTML
exportToHTML(element, 'Document Title')

// Imprimir optimizado
printDocument()
```
EOF

# Make sure we have a Tailwind configuration file
echo "🎨 Configuring Tailwind..."
cat >tailwind.config.js <<'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
}
EOF

# Build the project
echo "🔨 Building the project..."
npm run build

echo "✅ Installation complete. The project is ready to use."
echo "📝 Para iniciar el servidor de desarrollo ejecuta: npm run dev"
