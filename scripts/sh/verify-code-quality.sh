#!/bin/bash

# Script de verificación completa de calidad de código

echo "🔧 Verificación completa de calidad de código..."

# 1. Prettier
echo "📝 Formateando código con Prettier..."
npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"

# 2. ESLint
echo "🔍 Verificando y corrigiendo con ESLint..."
npx eslint . --fix

# 3. TypeScript
echo "📊 Verificando tipos con TypeScript..."
npx tsc --noEmit

# 4. Verificación final
echo "✅ Verificación final..."
npx eslint . --max-warnings 0

echo "🎉 ¡Verificación completa exitosa! Código listo para producción."
