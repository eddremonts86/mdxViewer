#!/bin/bash

echo "🤖 Validando adherencia a las reglas del Agente AI..."

# Variables
ERRORS=0
WARNINGS=0

# 1. Verificar archivo de instrucciones
if [ -f ".ai-instructions.md" ]; then
  echo "✅ Archivo de instrucciones encontrado"
else
  echo "❌ ERROR: No se encuentra .ai-instructions.md"
  ERRORS=$((ERRORS + 1))
fi

# 2. Verificar estructura básica
if [ -d "src/components" ]; then
  echo "✅ src/components existe"
else
  echo "⚠️  WARNING: src/components no existe"
  WARNINGS=$((WARNINGS + 1))
fi

# 3. Verificar archivos TypeScript
JS_COUNT=$(find src -name "*.js" 2>/dev/null | wc -l | tr -d ' ')
if [ "$JS_COUNT" -gt 0 ]; then
  echo "❌ ERROR: Encontrados $JS_COUNT archivos .js en src/"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ Solo archivos TypeScript en src/"
fi

# Resumen
echo ""
echo "📊 RESUMEN:"
echo "Errores: $ERRORS"
echo "Advertencias: $WARNINGS"

if [ $ERRORS -eq 0 ]; then
  echo "🎉 ¡Validación exitosa!"
  exit 0
else
  echo "❌ Validación falló"
  exit 1
fi
