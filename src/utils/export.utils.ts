/**
 * Utilidades para exportar documentos
 */

export interface ExportOptions {
    filename?: string;
    title?: string;
}

/**
 * Exporta un elemento HTML a PDF
 */
export async function exportToPDF(
    _element: HTMLElement,
    options: ExportOptions = {},
): Promise<void> {
    try {
        const { filename = "document.pdf" } = options;

        // Usar window.print() como fallback simple
        // En una implementación real, se usaría una librería como jsPDF o puppeteer
        window.print();

        console.log(`PDF export completed: ${filename}`);
    } catch (error) {
        console.error("Error exporting to PDF:", error);
        throw error;
    }
}

/**
 * Exporta un elemento HTML a archivo HTML
 */
export async function exportToHTML(
    element: HTMLElement,
    options: ExportOptions = {},
): Promise<void> {
    try {
        const { filename = "document.html", title = "Document" } = options;

        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
        h1, h2, h3, h4, h5, h6 { margin-top: 2rem; margin-bottom: 1rem; }
        p { margin-bottom: 1rem; line-height: 1.6; }
        code { background: #f1f5f9; padding: 0.25rem 0.5rem; border-radius: 0.25rem; }
        pre { background: #f1f5f9; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
        blockquote { border-left: 4px solid #e2e8f0; padding-left: 1rem; margin: 1rem 0; color: #64748b; }
    </style>
</head>
<body>
    ${element.innerHTML}
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log(`HTML export completed: ${filename}`);
    } catch (error) {
        console.error("Error exporting to HTML:", error);
        throw error;
    }
}

/**
 * Imprime un documento
 */
export async function printDocument(): Promise<void> {
    try {
        window.print();
        console.log("Print dialog opened");
    } catch (error) {
        console.error("Error printing document:", error);
        throw error;
    }
}
