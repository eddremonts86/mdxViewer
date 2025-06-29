#!/bin/bash

# Script para validar que el código sigue las instrucciones del agente AI
# Uso: ./scripts/validate-ai-rules.sh

echo "🤖 Validando adherencia a las reglas del Agente AI..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
ERRORS=0
WARNINGS=0

# 1. Verificar que existe el archivo de instrucciones
if [ ! -f ".ai-instructions.md" ]; then
  echo -e "${RED}❌ ERROR: No se encuentra .ai-instructions.md${NC}"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ Archivo de instrucciones encontrado${NC}"
fi

# 2. Verificar estructura de carpetas
echo -e "\n📁 Verificando estructura de carpetas..."

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
    echo -e "${GREEN}✅ $dir existe${NC}"
  else
    echo -e "${YELLOW}⚠️  WARNING: $dir no existe${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
done

# 3. Verificar archivos TypeScript vs JavaScript
echo -e "\n🔍 Verificando uso de TypeScript..."

JS_FILES=$(find src -name "*.js" | wc -l)
if [ $JS_FILES -gt 0 ]; then
  echo -e "${RED}❌ ERROR: Encontrados $JS_FILES archivos .js en src/ (deben ser .ts/.tsx)${NC}"
  find src -name "*.js" | head -5
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ Solo archivos TypeScript encontrados${NC}"
fi

# 4. Verificar que los componentes usan interfaces
echo -e "\n🏗️  Verificando interfaces en componentes..."

COMPONENTS=$(find src/components -name "*.tsx")
NO_INTERFACE_COMPONENTS=0

for component in $COMPONENTS; do
  if ! grep -q "interface.*Props" "$component"; then
    echo -e "${YELLOW}⚠️  WARNING: $component podría no tener interface para props${NC}"
    NO_INTERFACE_COMPONENTS=$((NO_INTERFACE_COMPONENTS + 1))
  fi
done

if [ $NO_INTERFACE_COMPONENTS -gt 0 ]; then
  WARNINGS=$((WARNINGS + 1))
fi

# 5. Verificar uso de Tailwind CSS
echo -e "\n🎨 Verificando uso de Tailwind CSS..."

INLINE_STYLES=$(find src -name "*.tsx" -exec grep -l "style=" {} \; | wc -l)
if [ $INLINE_STYLES -gt 0 ]; then
  echo -e "${YELLOW}⚠️  WARNING: $INLINE_STYLES archivos usan estilos inline (preferir Tailwind)${NC}"
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "${GREEN}✅ No se encontraron estilos inline${NC}"
fi

# 6. Verificar console.log en archivos de producción
echo -e "\n🐛 Verificando console.log..."

CONSOLE_LOGS=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "console\." | wc -l)
if [ $CONSOLE_LOGS -gt 0 ]; then
  echo -e "${GREEN}✅ Encontrados console.log para debugging (correcto durante desarrollo)${NC}"
else
  echo -e "${YELLOW}⚠️  INFO: No se encontraron console.log${NC}"
fi

# 7. Verificar imports relativos
echo -e "\n📦 Verificando imports..."

ABSOLUTE_IMPORTS=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "from ['\"]@/" | wc -l)
if [ $ABSOLUTE_IMPORTS -gt 0 ]; then
  echo -e "${GREEN}✅ Usando imports con alias @ correctamente${NC}"
else
  echo -e "${YELLOW}⚠️  WARNING: No se encontraron imports con alias @${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# 8. Verificar que existen archivos de configuración importantes
echo -e "\n⚙️  Verificando configuración..."

CONFIG_FILES=("package.json" "tsconfig.json" "tailwind.config.js" "vite.config.ts")

for file in "${CONFIG_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✅ $file existe${NC}"
  else
    echo -e "${RED}❌ ERROR: $file no encontrado${NC}"
    ERRORS=$((ERRORS + 1))
  fi
done

# 9. Verificar organización de archivos generados
echo -e "\n📂 Verificando organización de archivos generados..."

# Verificar que archivos .md/.mdx están en public/content/
MD_FILES_OUTSIDE=$(find . -name "*.md" -o -name "*.mdx" | grep -v "public/content" | grep -v ".ai-instructions.md" | grep -v "README" | grep -v "node_modules" | wc -l)
if [ $MD_FILES_OUTSIDE -gt 0 ]; then
    echo -e "${YELLOW}⚠️  WARNING: Encontrados archivos .md/.mdx fuera de public/content/${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ Archivos .md/.mdx correctamente organizados${NC}"
fi

# Verificar que scripts .sh están en scripts/sh/
SH_FILES_OUTSIDE=$(find scripts -name "*.sh" | grep -v "scripts/sh/" | wc -l)
if [ $SH_FILES_OUTSIDE -gt 0 ]; then
    echo -e "${YELLOW}⚠️  WARNING: Encontrados archivos .sh fuera de scripts/sh/${NC}"
    find scripts -name "*.sh" | grep -v "scripts/sh/" | head -3
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ Scripts .sh correctamente organizados${NC}"
fi

# Verificar que scripts .js de testing están en scripts/js/
JS_TEST_FILES_OUTSIDE=$(find scripts -name "test-*.js" -o -name "*-test.js" | grep -v "scripts/js/" | wc -l)
if [ $JS_TEST_FILES_OUTSIDE -gt 0 ]; then
    echo -e "${YELLOW}⚠️  WARNING: Encontrados scripts de testing fuera de scripts/js/${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ Scripts de testing correctamente organizados${NC}"
fi

# 10. Verificar nombres en inglés
echo -e "\n🌐 Verificando uso de inglés en nombres de archivos..."

SPANISH_NAMED_FILES=$(find src public scripts -name "*español*" -o -name "*espanol*" -o -name "*guia*" -o -name "*prueba*" -o -name "*archivo*" | wc -l)
if [ $SPANISH_NAMED_FILES -gt 0 ]; then
    echo -e "${YELLOW}⚠️  WARNING: Encontrados archivos con nombres en español${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ Nombres de archivos en inglés${NC}"
fi

# Resumen final
echo -e "\n📊 RESUMEN DE VALIDACIÓN"
echo "========================"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}🎉 ¡PERFECTO! El proyecto sigue todas las reglas del agente AI${NC}"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠️  $WARNINGS advertencias encontradas${NC}"
  echo -e "${GREEN}✅ Sin errores críticos${NC}"
  exit 0
else
  echo -e "${RED}❌ $ERRORS errores encontrados${NC}"
  echo -e "${YELLOW}⚠️  $WARNINGS advertencias encontradas${NC}"
  echo -e "${RED}Por favor, revisa y corrige los errores antes de continuar${NC}"
  exit 1
fi
