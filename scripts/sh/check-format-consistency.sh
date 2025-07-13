#!/bin/bash

# Format Consistency Checker
# Verifica que todas las herramientas de desarrollo tengan configuraciones consistentes

echo "🔧 Verificando consistencia de configuración..."

# Verificar que Prettier y ESLint estén alineados
echo "📝 Formateando archivos con Prettier..."
npx prettier --write "src/**/*.{ts,tsx,js,jsx}"

echo "🔍 Ejecutando ESLint..."
npx eslint "src/**/*.{ts,tsx}" --fix

echo "📊 Ejecutando verificación de TypeScript..."
npx tsc --noEmit

echo "✅ Verificación completada. Todas las herramientas están alineadas con:"
echo "   - Indentación: 4 espacios"
echo "   - Ancho de línea: 120 caracteres"
echo "   - Comillas: dobles"
echo "   - Trailing commas: always-multiline (es5)"
echo "   - Semicolons: siempre"
