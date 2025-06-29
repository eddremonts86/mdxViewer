# File Organization Rules - MDXViewer

## English-Only Development

This project follows **English-only** development practices:

-   All code, comments, and documentation must be in English
-   Variable names, function names, and file names in English
-   Error messages and logs in English
-   Documentation and README files in English

## File Organization Structure

### Generated Documentation Files

All `.md` and `.mdx` files should be placed in `public/content/` with appropriate subdirectories:

```text
public/content/
├── docs/           # General documentation
├── guides/         # User guides and tutorials
├── examples/       # Code examples and demos
├── api/            # API documentation
└── project-docs/   # Project-specific documentation
```

### Shell Scripts

All `.sh` scripts should be placed in `scripts/sh/`:

```text
scripts/sh/
├── install-dependencies.sh
├── build-and-deploy.sh
├── test-validation.sh
└── validate-project.sh
```

### JavaScript Test Scripts

All `.js` files for testing should be placed in `scripts/js/`:

```text
scripts/js/
├── test-file-manager.js
├── test-depth-validation.js
├── test-api-endpoints.js
└── test-drag-drop.js
```

## Examples

### ✅ Correct File Naming and Organization

```text
public/content/docs/installation-guide.md
public/content/guides/getting-started.mdx
public/content/examples/basic-component.md
scripts/sh/validate-project.sh
scripts/js/test-file-system.js
```

### ❌ Incorrect Examples

```text
❌ docs/guia-instalacion.md          (Spanish name, wrong location)
❌ src/test-script.sh                (Wrong location)
❌ scripts/mi-prueba.js              (Spanish name)
❌ public/documentacion.md           (Spanish name)
```

## Validation

Run the validation script to check compliance:

```bash
npm run validate:ai
```

This will verify:

-   File locations follow the established structure
-   File names are in English
-   No files are in incorrect directories

---

_This document demonstrates the new file organization rules for MDXViewer project._
