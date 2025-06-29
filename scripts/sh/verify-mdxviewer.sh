#!/bin/bash

# Verification script for mdxViewer
echo "🔍 Verifying mdxViewer installation..."

# Project directory
PROJECT_DIR="/Volumes/Developer/Projects/mdxViewer"

# Check if the directory exists
if [ ! -d "$PROJECT_DIR" ]; then
  echo "❌ Project directory does not exist at $PROJECT_DIR"
  exit 1
fi

# Navigate to project directory
cd "$PROJECT_DIR" || {
  echo "❌ Could not access the project directory"
  exit 1
}

# Verify critical files
CRITICAL_FILES=(
  "package.json"
  "vite.config.ts"
  "tsconfig.json"
  "tailwind.config.js"
  "components.json"
  "src/main.tsx"
  "src/App.tsx"
  "src/router.tsx"
  "src/components/globals/Layout.tsx"
  "src/components/Sidebar.tsx"
  "src/components/DocumentViewer.tsx"
  "src/components/MarkdownRenderer.tsx"
)

MISSING_FILES=0
for file in "${CRITICAL_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Critical file missing: $file"
    MISSING_FILES=$((MISSING_FILES + 1))
  else
    echo "✅ File found: $file"
  fi
done

# Verify important directories
CRITICAL_DIRS=(
  "src/components"
  "src/components/ui"
  "src/pages"
  "src/hooks"
  "src/lib"
  "src/utils"
  "public/content"
)

MISSING_DIRS=0
for dir in "${CRITICAL_DIRS[@]}"; do
  if [ ! -d "$dir" ]; then
    echo "❌ Critical directory missing: $dir"
    MISSING_DIRS=$((MISSING_DIRS + 1))
  else
    echo "✅ Directory found: $dir"
  fi
done

# Verify critical dependencies in package.json
if [ -f "package.json" ]; then
  DEPS=(
    "react"
    "react-dom"
    "react-router-dom"
    "react-markdown"
    "@mdx-js/react"
    "html2canvas"
    "jspdf"
    "tailwindcss"
  )

  MISSING_DEPS=0
  for dep in "${DEPS[@]}"; do
    if ! grep -q "\"$dep\":" package.json; then
      echo "❌ Critical dependency missing: $dep"
      MISSING_DEPS=$((MISSING_DEPS + 1))
    else
      echo "✅ Dependency found: $dep"
    fi
  done

  if [ $MISSING_DEPS -eq 0 ]; then
    echo "✅ All critical dependencies are installed."
  else
    echo "❌ Missing $MISSING_DEPS critical dependencies."
  fi
else
  echo "❌ Could not find package.json to verify dependencies."
fi

# Final summary
if [ $MISSING_FILES -eq 0 ] && [ $MISSING_DIRS -eq 0 ] && [ $MISSING_DEPS -eq 0 ]; then
  echo "✅ Verification complete: The project appears to be correctly installed."
  echo "🚀 To start the development server run: npm run dev"
else
  echo "❌ Verification complete: There are issues with the installation."
  echo "- Missing files: $MISSING_FILES"
  echo "- Missing directories: $MISSING_DIRS"
  echo "- Missing dependencies: $MISSING_DEPS"
  echo "👉 Run the complete installation script to resolve the issues."
fi
