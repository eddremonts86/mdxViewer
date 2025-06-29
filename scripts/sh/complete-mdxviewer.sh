#!/bin/bash

# Script to finish the mdxViewer project installation

echo "🚀 Completing mdxViewer installation..."

# Base directory
BASE_DIR="/Volumes/Developer/Projects/mdxViewer"
cd "$BASE_DIR" || {
  echo "❌ Could not access the project directory"
  exit 1
}

# Create a new DocumentViewer component
echo "🔄 Updating DocumentViewer component..."
cat >src/components/DocumentViewer.tsx <<'EOF'
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { exportToHTML, exportToPDF, printDocument } from "@/core/utils/export.utils";
import { Download, FileText, Printer, Share } from "lucide-react";
import { useRef, useState } from "react";

interface DocumentViewerProps {
    document: {
        title: string;
        content: string;
        type: "md" | "mdx";
        frontmatter?: Record<string, unknown>;
        path?: string;
    };
}

export function DocumentViewer({ document }: DocumentViewerProps) {
    const [exporting, setExporting] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const handleDownloadPDF = async () => {
        if (!contentRef.current || !document) return;

        setExporting(true);
        try {
            await exportToPDF(contentRef.current, {
                filename: `${document.title.replace(/\s+/g, "-").toLowerCase()}.pdf`,
                title: document.title,
            });
        } catch (error) {
            console.error("Error exporting PDF:", error);
        } finally {
            setExporting(false);
        }
    };

    const handleDownloadHTML = async () => {
        if (!contentRef.current || !document) return;

        setExporting(true);
        try {
            await exportToHTML(contentRef.current, {
                filename: `${document.title.replace(/\s+/g, "-").toLowerCase()}.html`,
                title: document.title,
            });
        } catch (error) {
            console.error("Error exporting HTML:", error);
        } finally {
            setExporting(false);
        }
    };

    const handlePrint = async () => {
        if (!contentRef.current || !document) return;

        setExporting(true);
        try {
            await printDocument(contentRef.current);
        } catch (error) {
            console.error("Error printing:", error);
        } finally {
            setExporting(false);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: document.title,
                text: `Check out this document: ${document.title}`,
                url: window.location.href,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Enlace copiado al portapapeles");
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Document Actions */}
            <div className="flex items-center justify-between mb-6 p-4 border rounded-lg bg-card">
                <div>
                    <h1 className="text-2xl font-bold">{document.title}</h1>
                    <p className="text-sm text-muted-foreground">
                        Tipo: {document.type.toUpperCase()}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDownloadPDF}
                        disabled={exporting}
                    >
                        {exporting ? (
                            <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                        ) : (
                            <Download className="w-4 h-4 mr-2" />
                        )}
                        PDF
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDownloadHTML}
                        disabled={exporting}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        HTML
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handlePrint}
                        disabled={exporting}
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimir
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleShare}>
                        <Share className="w-4 h-4 mr-2" />
                        Compartir
                    </Button>
                </div>
            </div>

            {/* Document Content */}
            <Card>
                <CardContent className="p-8">
                    <div
                        ref={contentRef}
                        className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none"
                    >
                        <MarkdownRenderer content={document.content} type={document.type} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
EOF

# Update README with more information
echo "📝 Updating README.md..."
cat >README.md <<'EOF'
# MDX Viewer

A modern application for viewing Markdown (.md) and MDX (.mdx) files with a professional interface.

## Features

- 📁 **Tree Navigation**: Explore documents organized in folders
- 📄 **Dual Rendering**: Support for .md and .mdx files
- 🎨 **Interactive Components**: Custom MDX elements
- 📥 **Export**: Download as PDF or HTML
- 🖨️ **Printing**: Optimized for documents
- 🌙 **Themes**: Dark and light mode

## Tecnologías

- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- Zustand
- MDX/Markdown

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd mdxViewer

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

## Project Structure

```
src/
├── components/         # React components
│   ├── ui/            # UI components (shadcn)
│   └── markdown/      # Markdown specific components
├── content/           # .md and .mdx files
│   ├── docs/          # Documentation
│   ├── examples/      # MDX examples
│   ├── guides/        # Tutorial guides
│   └── api/           # API documentation
├── hooks/             # Custom hooks
├── utils/             # Utilities
├── types/             # Type definitions
└── pages/             # Main pages
```

## Usage

1. Start the application with `npm run dev`
2. Browse documents using the sidebar
3. View documents in the main panel
4. Use export, print, and share options as needed

## Personalización

Puedes personalizar la apariencia y comportamiento de la aplicación:

- Modifica los temas en `tailwind.config.js`
- Añade nuevos componentes MDX en `src/components/markdown`
- Expande la funcionalidad con hooks personalizados

## Licencia

MIT
EOF

# Crear un script start-mdxviewer.sh para iniciar la aplicación
echo "📄 Creando script de inicio..."
cat >start-mdxviewer.sh <<'EOF'
#!/bin/bash
cd /Volumes/Developer/Projects/mdxViewer && npm run dev
EOF
chmod +x start-mdxviewer.sh

# Crear un script de verificación
echo "📄 Creando script de verificación..."
cat >verify-mdxviewer.sh <<'EOF'
#!/bin/bash
echo "🧪 Verifying mdxViewer installation..."

# Verify project directory
if [ ! -d "/Volumes/Developer/Projects/mdxViewer" ]; then
    echo "❌ Error: Project directory not found"
    exit 1
fi

# Verify main files
cd /Volumes/Developer/Projects/mdxViewer || exit 1

FILES=(
    "package.json"
    "vite.config.ts"
    "tsconfig.json"
    "tailwind.config.js"
    "src/main.tsx"
    "src/App.tsx"
    "src/components/DocumentViewer.tsx"
    "src/components/Sidebar.tsx"
    "src/components/MarkdownRenderer.tsx"
)

for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Error: File $file not found"
        exit 1
    fi
done

# Verificar node_modules
if [ ! -d "node_modules" ]; then
    echo "❌ Error: Dependencias no instaladas. Ejecuta 'npm install'"
    exit 1
fi

echo "✅ Verificación completa: Todo parece estar correctamente instalado"
echo "🚀 Para iniciar la aplicación, ejecuta: ./start-mdxviewer.sh"
exit 0
EOF
chmod +x verify-mdxviewer.sh

# Instalar dependencias adicionales si es necesario
echo "📦 Verificando dependencias adicionales..."
npm list html2canvas jspdf react-to-print file-saver || npm install html2canvas jspdf react-to-print file-saver

# Ejecutar verificación
echo "🧪 Ejecutando verificación final..."
./verify-mdxviewer.sh

echo "✅ Instalación completada con éxito."
echo "🚀 Para iniciar la aplicación, ejecuta: ./start-mdxviewer.sh"
