#!/bin/bash

# Code Smell Detection Demo Script
# This script demonstrates the various ways to make code smells obvious

echo "🔍 MDX Viewer - Code Smell Detection System Demo"
echo "================================================"
echo ""

echo "1. 📊 Running ESLint with enhanced code smell detection..."
echo "   Command: npx eslint src/ --max-warnings 0"
echo ""

# Try to run ESLint and capture output
if command -v npx >/dev/null 2>&1; then
    echo "✅ Running actual ESLint analysis..."
    npx eslint src/ --max-warnings 0 2>&1 | head -20 || echo "   (Analysis complete - check above for any issues)"
else
    echo "❌ npx not available, showing example output:"
    cat <<'EOF'
/src/components/ComplexComponent.tsx
  15:8   error  Function 'handleComplexLogic' has a complexity of 12  complexity
  23:1   error  Function 'processData' has too many parameters (6)    max-params
  45:12  error  Line too long (125 characters)                       max-len
  67:5   error  Deeply nested code (depth 5)                         max-depth

/src/utils/heavyUtils.ts
  12:3   error  File has too many lines (523)                        max-lines
  89:15  error  Magic number should be replaced with a constant      no-magic-numbers
EOF
fi

echo ""
echo "2. 🎨 VS Code Integration Features:"
echo "   ✅ Real-time error highlighting with red underlines"
echo "   ✅ Warning highlighting with yellow underlines"
echo "   ✅ Problem panel integration with color-coded icons"
echo "   ✅ Minimap indicators for quick navigation"
echo "   ✅ Ruler lines at 80 and 120 characters"
echo ""

echo "3. 📋 Code Smell Categories Detected:"
echo "   🔴 COMPLEXITY: Functions too complex or deeply nested"
echo "   📏 LENGTH: Files/functions that are too long"
echo "   🔧 MAINTAINABILITY: Unused vars, magic numbers, dead code"
echo "   🎨 STYLE: Formatting and naming inconsistencies"
echo "   💙 TYPESCRIPT: Type safety improvements needed"
echo "   ⚛️  REACT: Hook dependency and pattern issues"
echo ""

echo "4. 💡 Available Commands for Code Quality:"
echo "   npm run lint              - Run with visual code smell formatter"
echo "   npm run lint:fix          - Auto-fix all fixable issues"
echo "   npm run code-smell-report - Generate detailed HTML report"
echo "   npm run quality-check     - Complete quality assessment"
echo ""

echo "5. 🚨 Making Code Smells OBVIOUS:"
echo "   • Color-coded terminal output with emojis"
echo "   • Severity levels (🚨 ERROR, ⚠️ WARNING, ℹ️ INFO)"
echo "   • Category classification with visual indicators"
echo "   • Priority-based recommendations"
echo "   • Auto-fix suggestions where possible"
echo "   • Interactive HTML reports with charts"
echo ""

echo "6. 📈 Quality Metrics Tracked:"
echo "   • Code complexity scores"
echo "   • File and function length violations"
echo "   • Type safety compliance"
echo "   • Code style consistency"
echo "   • Technical debt indicators"
echo ""

echo "7. ⚙️  VS Code Extensions for Enhanced Detection:"
echo "   • ESLint - Real-time linting"
echo "   • Error Lens - Inline error display"
echo "   • SonarLint - Advanced code analysis"
echo "   • Prettier - Code formatting"
echo "   • Todo Tree - Highlight TODO/FIXME comments"
echo ""

echo "8. 🎯 Benefits of Obvious Code Smells:"
echo "   ✅ Immediate feedback during development"
echo "   ✅ Consistent code quality across the team"
echo "   ✅ Reduced technical debt accumulation"
echo "   ✅ Easier code reviews and maintenance"
echo "   ✅ Better learning for junior developers"
echo ""

echo "================================================"
echo "🎉 Code Smell Detection System is Active!"
echo ""
echo "Next steps:"
echo "1. Open VS Code and see real-time highlighting"
echo "2. Run 'npm run lint' to see the visual formatter"
echo "3. Check .vscode/settings.json for configured rules"
echo "4. Review generated reports in code-smell-report.html"
echo ""
echo "Remember: Code smells are early warning signs! 🧼✨"
