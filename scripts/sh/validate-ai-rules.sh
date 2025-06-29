#!/bin/bash

# Script to validate that code follows AI agent instructions
# Usage: ./scripts/sh/validate-ai-rules.sh

echo "🤖 Validating adherence to AI Agent rules..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0

# 1. Check if instructions file exists
if [ ! -f ".ai-instructions.md" ]; then
  echo -e "${RED}❌ ERROR: .ai-instructions.md not found${NC}"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ Instructions file found${NC}"
fi

# 2. Check folder structure
echo -e "\n📁 Checking folder structure..."

REQUIRED_DIRS=(
  "src/components"
  "src/components/ui"
  "src/hooks"
  "src/lib"
  "src/api"
  "src/types"
  "src/utils"
)

for dir in "${REQUIRED_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo -e "${GREEN}✅ $dir exists${NC}"
  else
    echo -e "${YELLOW}⚠️  WARNING: $dir does not exist${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
done

# 3. Check TypeScript vs JavaScript usage
echo -e "\n🔍 Checking TypeScript usage..."

JS_FILES=$(find src -name "*.js" | wc -l)
if [ $JS_FILES -gt 0 ]; then
  echo -e "${RED}❌ ERROR: Found $JS_FILES .js files in src/ (should be .ts/.tsx)${NC}"
  find src -name "*.js" | head -5
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ Only TypeScript files found${NC}"
fi

# 4. Check that components use interfaces
echo -e "\n🏗️  Checking interfaces in components..."

COMPONENTS=$(find src/components -name "*.tsx")
NO_INTERFACE_COMPONENTS=0

for component in $COMPONENTS; do
  if ! grep -q "interface.*Props" "$component"; then
    echo -e "${YELLOW}⚠️  WARNING: $component might not have interface for props${NC}"
    NO_INTERFACE_COMPONENTS=$((NO_INTERFACE_COMPONENTS + 1))
  fi
done

if [ $NO_INTERFACE_COMPONENTS -gt 0 ]; then
  WARNINGS=$((WARNINGS + 1))
fi

# 5. Check Tailwind CSS usage
echo -e "\n🎨 Checking Tailwind CSS usage..."

INLINE_STYLES=$(find src -name "*.tsx" -exec grep -l "style=" {} \; | wc -l)
if [ $INLINE_STYLES -gt 0 ]; then
  echo -e "${YELLOW}⚠️  WARNING: $INLINE_STYLES files use inline styles (prefer Tailwind)${NC}"
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "${GREEN}✅ No inline styles found${NC}"
fi

# 6. Check console.log in production files
echo -e "\n🐛 Checking console.log..."

CONSOLE_LOGS=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "console\." | wc -l)
if [ $CONSOLE_LOGS -gt 0 ]; then
  echo -e "${GREEN}✅ Found console.log for debugging (correct during development)${NC}"
else
  echo -e "${YELLOW}⚠️  INFO: No console.log found${NC}"
fi

# 7. Check relative imports
echo -e "\n📦 Checking imports..."

ABSOLUTE_IMPORTS=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "from ['\"]@/" | wc -l)
if [ $ABSOLUTE_IMPORTS -gt 0 ]; then
  echo -e "${GREEN}✅ Using @ alias imports correctly${NC}"
else
  echo -e "${YELLOW}⚠️  WARNING: No @ alias imports found${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# 8. Check that important config files exist
echo -e "\n⚙️  Checking configuration..."

CONFIG_FILES=("package.json" "tsconfig.json" "tailwind.config.js" "vite.config.ts")

for file in "${CONFIG_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✅ $file exists${NC}"
  else
    echo -e "${RED}❌ ERROR: $file not found${NC}"
    ERRORS=$((ERRORS + 1))
  fi
done

# 9. Check organization of generated files
echo -e "\n📂 Checking organization of generated files..."

# Check that .md/.mdx files are in public/content/
MD_FILES_OUTSIDE=$(find . -name "*.md" -o -name "*.mdx" | grep -v "public/content" | grep -v ".ai-instructions.md" | grep -v "README" | grep -v "node_modules" | wc -l)
if [ $MD_FILES_OUTSIDE -gt 0 ]; then
  echo -e "${YELLOW}⚠️  WARNING: Found .md/.mdx files outside public/content/${NC}"
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "${GREEN}✅ .md/.mdx files correctly organized${NC}"
fi

# Check that .sh scripts are in scripts/sh/
SH_FILES_OUTSIDE=$(find scripts -name "*.sh" | grep -v "scripts/sh/" | wc -l)
if [ $SH_FILES_OUTSIDE -gt 0 ]; then
  echo -e "${YELLOW}⚠️  WARNING: Found .sh files outside scripts/sh/${NC}"
  find scripts -name "*.sh" | grep -v "scripts/sh/" | head -3
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "${GREEN}✅ .sh scripts correctly organized${NC}"
fi

# Check that .js test scripts are in scripts/js/
JS_TEST_FILES_OUTSIDE=$(find scripts -name "test-*.js" -o -name "*-test.js" | grep -v "scripts/js/" | wc -l)
if [ $JS_TEST_FILES_OUTSIDE -gt 0 ]; then
  echo -e "${YELLOW}⚠️  WARNING: Found test scripts outside scripts/js/${NC}"
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "${GREEN}✅ Test scripts correctly organized${NC}"
fi

# 10. Check English usage in file names
echo -e "\n🌐 Checking English usage in file names..."

SPANISH_NAMED_FILES=$(find src public scripts -name "*español*" -o -name "*espanol*" -o -name "*guia*" -o -name "*prueba*" -o -name "*archivo*" | wc -l)
if [ $SPANISH_NAMED_FILES -gt 0 ]; then
  echo -e "${YELLOW}⚠️  WARNING: Found files with Spanish names${NC}"
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "${GREEN}✅ File names in English${NC}"
fi

# 11. Check proper use of contrast and accessibility
echo -e "\n🎨 Checking contrast and accessibility..."

# Check use of semantic classes for contrast
SEMANTIC_COLOR_USAGE=$(find src -name "*.tsx" -exec grep -l "text-foreground\|text-muted-foreground\|bg-background\|bg-card" {} \; | wc -l)
if [ $SEMANTIC_COLOR_USAGE -gt 0 ]; then
  echo -e "${GREEN}✅ Using semantic color classes for proper contrast${NC}"
else
  echo -e "${YELLOW}⚠️  WARNING: Limited use of semantic color classes${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# Check use of problematic colors
PROBLEMATIC_COLORS=$(find src -name "*.tsx" -exec grep -l "text-gray-200\|text-yellow-200\|bg-gray-400.*text-gray-300" {} \; | wc -l)
if [ $PROBLEMATIC_COLORS -gt 0 ]; then
  echo -e "${RED}❌ ERROR: Found potentially low contrast color combinations${NC}"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ No obvious low contrast combinations found${NC}"
fi

# Check that icons are used with colors to convey information
ICON_WITH_COLOR=$(find src -name "*.tsx" -exec grep -l "className.*text-.*\|from.*lucide-react" {} \; | wc -l)
if [ $ICON_WITH_COLOR -gt 0 ]; then
  echo -e "${GREEN}✅ Components use icons with color for better accessibility${NC}"
else
  echo -e "${YELLOW}⚠️  WARNING: Consider using icons with color to convey information${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# 12. Check ESLint and Prettier formatting
echo -e "\n🔧 Checking code formatting..."

# Check if ESLint passes
if npm run lint >/dev/null 2>&1; then
  echo -e "${GREEN}✅ ESLint validation passed${NC}"
else
  echo -e "${RED}❌ ERROR: ESLint validation failed${NC}"
  echo -e "${YELLOW}Run 'npm run lint:fix' to fix formatting issues${NC}"
  ERRORS=$((ERRORS + 1))
fi

# Check if Prettier formatting is correct
if npm run format:check >/dev/null 2>&1; then
  echo -e "${GREEN}✅ Prettier formatting is correct${NC}"
else
  echo -e "${YELLOW}⚠️  WARNING: Code formatting issues found${NC}"
  echo -e "${YELLOW}Run 'npm run format' to fix formatting${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# Check import sorting in key files
echo -e "\n📦 Checking import sorting..."

COMPONENTS_WITH_IMPORTS=$(find src/components -name "*.tsx" | head -5)
INCORRECT_IMPORT_ORDER=0

for component in $COMPONENTS_WITH_IMPORTS; do
  if [ -f "$component" ]; then
    # Check if React imports come first
    FIRST_IMPORT=$(grep -n "^import" "$component" | head -1 | cut -d: -f2)
    if [[ "$FIRST_IMPORT" == *"from \"react\""* ]] || [[ "$FIRST_IMPORT" == *"from 'react'"* ]]; then
      continue
    else
      echo -e "${YELLOW}⚠️  WARNING: $component may have incorrect import order${NC}"
      INCORRECT_IMPORT_ORDER=$((INCORRECT_IMPORT_ORDER + 1))
    fi
  fi
done

if [ $INCORRECT_IMPORT_ORDER -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Found $INCORRECT_IMPORT_ORDER files with potential import order issues${NC}"
  echo -e "${YELLOW}Run 'npm run lint:fix' to automatically fix import sorting${NC}"
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "${GREEN}✅ Import sorting appears correct in checked files${NC}"
fi

# Final summary
echo -e "\n📊 VALIDATION SUMMARY"
echo "========================"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}🎉 PERFECT! The project follows all AI agent rules${NC}"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠️  $WARNINGS warnings found${NC}"
  echo -e "${GREEN}✅ No critical errors${NC}"
  exit 0
else
  echo -e "${RED}❌ $ERRORS errors found${NC}"
  echo -e "${YELLOW}⚠️  $WARNINGS warnings found${NC}"
  echo -e "${RED}Please review and fix the errors before continuing${NC}"
  exit 1
fi
