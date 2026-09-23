---
title: "Introduction to MDX Viewer"
description: "Quick start guide for the document viewer"
author: "System"
date: "2025-06-21"
tags: ["introduction", "guide", "getting started"]
---

# Introduction to MDX Viewer

Welcome to **MDXViewer**. It charts a folder of Markdown and MDX documentation so you can see the whole collection at once, read any document in it, and reorganize the folder itself.

## Key Features

Our MDX Viewer comes with a comprehensive set of features designed to enhance your documentation experience:

### Tree Navigation

Explore documents organized in folders with an intuitive sidebar navigation. The tree structure makes it easy to find and access your content quickly.

### Dual Rendering

Both `.md` and `.mdx` files are read and rendered. Note that `.mdx` is rendered **as Markdown**: MDX is not compiled, so React components written inside an `.mdx` file are not executed. The viewer says so on any document that defines them, and leaves their source out rather than printing it as prose.

### The Chart

The whole collection is plotted as a graph: every document is a point sized by its file size, every folder is a hub the documents inside it hang from, and the object under the pointer is named in place. It is the answer to "what is in here", before you open anything.

### Printing

Any document prints with its own stylesheet: the interface chrome is dropped, the height caps are lifted, and the page comes out as ink on paper rather than as a screenshot of a dark screen. External links print their URL beside them.

There is no PDF or HTML export. Use your browser's "Print to PDF" if you need a file.

### Theme Support

Beautiful dark and light modes with smooth transitions, ensuring comfortable reading in any environment.

## Getting Started

Use the **left sidebar** to navigate between documents. Click on folders to expand them and on files to view them.

### Quick Actions

At the top of each document, you'll find convenient action buttons:

-   **Chart**: Go back to the collection
-   **🖨️ Print**: Print with the document's own print stylesheet

## Typography Examples

The MDX Viewer supports rich typography to make your documents more engaging:

### Code Examples

Inline code looks like `this`, and code blocks are beautifully formatted:

```javascript
function greet(name) {
    return `Hello, ${name}!`;
}

console.log(greet("MDX Viewer"));
```

### Lists and Organization

Organize your content with:

1. **Numbered lists** for step-by-step instructions
2. **Bullet points** for feature lists
3. **Nested items** for hierarchical information

### Blockquotes

> **Pro tip**: This document is written in Markdown (.md) and demonstrates the beautiful rendering capabilities of our viewer. Try switching between light and dark themes using the toggle in the header!

---

Ready to explore? Check out our [Getting Started guide](/docs/getting-started) or browse the [Examples section](/examples/interactive-demo) to see MDX components in action.
