---
title: "Getting Started Guide"
description: "First steps with the viewer"
author: "System"
date: "2025-06-21"
---

# Quick Start Guide

## Installation

```bash
# Clone the project
git clone <repository-url>
cd mdxViewer

# Install dependencies
npm install

# Run in development mode
npm run dev
```

## Project Structure

```
src/
├── components/          # React components
├── content/            # .md and .mdx files
│   ├── docs/          # Documentation
│   ├── examples/      # MDX examples
│   └── guides/        # Tutorial guides
├── hooks/             # Custom hooks
└── utils/             # Utilities
```

## Adding Content

### Markdown Files (.md)

Place `.md` files in the content folders. Use frontmatter for metadata:

```yaml
---
title: "My Document"
description: "Document description"
---
```

### MDX Files (.mdx)

`.mdx` files allow you to use React components:

```jsx
import { Alert } from '../components/Alert'

# My MDX Document

<Alert type="info">
  This is a React component inside MDX!
</Alert>
```

## Next Steps

-   Explore the [MDX examples](/examples/interactive-demo)
-   Read the [advanced guides](/guides/setup)
-   Customize the [components](/guides/customization)
