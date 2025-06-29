# MDXViewer

A modern, responsive MDX file viewer built with React, TypeScript, and Vite.

## Features

-   🚀 **Fast & Modern**: Built with Vite for lightning-fast development and builds
-   📱 **Responsive Design**: Mobile-first approach using Tailwind CSS
-   🎨 **Dark/Light Theme**: Seamless theme switching with system preference detection
-   📁 **File Management**: Complete file explorer with drag-and-drop support
-   🔍 **Search & Navigation**: Intelligent search with real-time filtering
-   📝 **MDX Support**: Full MDX rendering with syntax highlighting
-   🎯 **TypeScript**: Fully typed for better development experience

## Tech Stack

-   **Frontend**: React 19 + TypeScript + Vite
-   **Styling**: Tailwind CSS + shadcn/ui components
-   **State Management**: React Query for server state
-   **File Processing**: MDX + Gray Matter for frontmatter
-   **Icons**: Lucide React
-   **Development**: ESLint + Hot Module Replacement

## Getting Started

### Prerequisites

-   Node.js 18+
-   npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd mdxviewer

# Install dependencies
npm install

# Start development server
npm run dev:watch
```

### Available Scripts

```bash
npm run dev          # Start dev server (client + server)
npm run dev:watch    # Development with file watching
npm run server       # Start backend server only
npm run client       # Start frontend only
npm run build        # Build for production
npm run lint         # Run ESLint
npm run validate:ai  # Validate code against AI rules
npm run pre-commit   # Run linting and validation
```

## Project Structure

```text
src/
├── components/      # Reusable React components
│   ├── ui/         # Base UI components (shadcn)
│   └── globals/    # Global components
├── features/       # Feature-based modules
├── hooks/          # Custom React hooks
├── lib/            # Utilities and configurations
├── api/            # API clients and types
├── types/          # TypeScript type definitions
└── utils/          # Utility functions

public/content/     # Documentation and content
├── docs/          # Project documentation
├── guides/        # User guides
├── examples/      # Code examples
└── api/           # API documentation

scripts/
├── js/            # JavaScript utility scripts
└── sh/            # Shell scripts
```

## Development Guidelines

This project follows strict development guidelines powered by an AI prompt system:

-   **English Only**: All code, comments, and documentation in English
-   **TypeScript First**: Strict typing with proper interfaces
-   **Component Architecture**: Reusable, well-typed components
-   **File Organization**: Structured directories for different file types
-   **Code Quality**: ESLint validation and automated checks

See [`.ai-instructions.md`](.ai-instructions.md) for complete development rules.

## Contributing

1. Read the AI instructions: [`.ai-instructions.md`](.ai-instructions.md)
2. Run validation: `npm run validate:ai`
3. Follow the established patterns and file organization
4. Ensure all components have proper TypeScript interfaces
5. Use English for all code and documentation

## File Organization Rules

-   **Documentation**: Place `.md/.mdx` files in `public/content/`
-   **Shell Scripts**: Place `.sh` files in `scripts/sh/`
-   **Test Scripts**: Place `.js` test files in `scripts/js/`
-   **Components**: Follow the established component architecture

## License

[Add your license here]

---

Built with ❤️ using modern web technologies and AI-assisted development practices.
