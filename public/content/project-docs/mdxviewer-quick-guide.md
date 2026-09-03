# MDX Viewer Installation and Usage Guide

## 🚀 Installation

To complete the installation of the MDX Viewer project, follow these steps:

1. **Run the installation script**:

    ```bash
    ./install-mdxviewer.sh
    ```

    This script will install all dependencies and configure the necessary files for the project.

2. **Verify the installation**:

    ```bash
    ./verify-mdxviewer.sh
    ```

    This command will verify that all critical files and dependencies are correctly installed.

3. **Start the development server**:
    ```bash
    ./start-mdxviewer.sh
    ```
    Or directly:
    ```bash
    cd /Volumes/Developer/Projects/mdxViewer && npm run dev
    ```

## 📂 Project Structure

The MDX viewer is organized as follows:

-   **`src/components/`**: Contains all React components for the project

    -   **`ui/`**: Base components from shadcn/ui
    -   **`Layout.tsx`**: Main application layout
    -   **`Sidebar.tsx`**: Tree-style sidebar navigation
    -   **`DocumentViewer.tsx`**: Component for viewing documents
    -   **`MarkdownRenderer.tsx`**: Markdown/MDX renderer

-   **`src/content/`**: Example files (.md and .mdx)

    -   **`docs/`**: General documentation
    -   **`examples/`**: Interactive MDX examples
    -   **`guides/`**: Tutorial guides
    -   **`api/`**: API documentation

-   **`src/utils/`**: Utilities — heading ids, frontmatter readers, MDX source handling

## 📚 Main Features

-   **Tree Navigation**: Intuitive sidebar for exploring documents
-   **Dual Rendering**: `.md` and `.mdx` are both read; `.mdx` renders as Markdown because MDX is not compiled, and its component source is left out rather than printed
-   **The Chart**: The whole collection plotted by file size, folders drawn as constellations
-   **Printing**: A real print stylesheet. No PDF or HTML export
-   **Themes**: Dark and light mode with smooth transitions

## 💡 Troubleshooting

If you encounter issues during installation:

1. **Missing dependencies**:

    ```bash
    cd /Volumes/Developer/Projects/mdxViewer && npm install
    ```

2. **Build errors**:

    ```bash
    cd /Volumes/Developer/Projects/mdxViewer && npm run build
    ```

3. **File access problems**:
    ```bash
    chmod -R 755 /Volumes/Developer/Projects/mdxViewer
    ```

## 🔄 Updating

To update the project in the future:

1. Navigate to the project directory:

    ```bash
    cd /Volumes/Developer/Projects/mdxViewer
    ```

2. Update dependencies:

    ```bash
    npm update
    ```

3. Rebuild the project:
    ```bash
    npm run build
    ```

---

Enjoy using MDX Viewer to view your Markdown and MDX documents!
