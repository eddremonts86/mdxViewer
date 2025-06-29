# MDX Viewer - Modern Viewer for Markdown and MDX Documents

MDX Viewer is a modern web application built with React and TypeScript for viewing, managing, and sharing documentation in Markdown and MDX formats.

## Features

-   **Complete Markdown Support**: Renders all standard Markdown syntax
-   **MDX Support**: Use React components within Markdown documents
-   **Multipurpose Export**: Export documents to PDF, HTML or print directly
-   **Light/Dark Theme**: Switch between display modes according to preferences
-   **Intuitive Navigation**: File system in the sidebar for easy exploration

## Project Structure

The project follows a feature-first architecture:

```
src/
├── core/                     # Core configuration and utilities
│   ├── config/               # Application configuration
│   ├── layouts/              # Main layouts
│   ├── router/               # Router configuration
│   └── types/                # Global types
│
├── features/                 # Features organized by domain
│   ├── document/             # Document viewing related
│   │   ├── components/       # Document-specific components
│   │   ├── pages/            # Viewing pages
│   │   └── utils/            # Utilidades específicas
│   │
│   ├── export/               # Funcionalidades de exportación
│   │   └── utils/            # Utilidades de exportación
│   │
│   ├── fileExplorer/         # Sistema de exploración de archivos
│   │   ├── components/       # Componentes de la interfaz
│   │   └── hooks/            # Hooks para manejo de archivos
│   │
│   └── home/                 # Página de inicio
│       ├── components/       # Componentes específicos
│       └── pages/            # Página principal
│
├── hooks/                    # Hooks globales
├── components/               # Componentes UI reutilizables
│   └── ui/                   # Componentes de UI básicos (shadcn/ui)
│
└── content/                  # Contenido de documentación
    ├── docs/                 # Documentación general
    ├── examples/             # Ejemplos MDX
    ├── guides/               # Guías de uso
    └── api/                  # API documentation
```

## Technologies Used

-   **React 19** with hooks and functional components
-   **TypeScript** for static typing
-   **Vite** as build tool
-   **React Router** for navigation
-   **Tailwind CSS** for styling
-   **MDX** for extended document rendering
-   **react-markdown** for Markdown document rendering
-   **shadcn/ui** for UI components

## Getting Started

```bash
# Install dependencies
npm install

# Start development mode
npm run dev

# Build for production
npm run build
```

## Export Documents

The application allows exporting documents in different formats:

-   **PDF**: Complete export for saving or sharing
-   **HTML**: Standalone web version of the document
-   **Direct printing**: Send to printer

## Contribution

1. Fork the project
2. Create your feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Open a Pull Request
