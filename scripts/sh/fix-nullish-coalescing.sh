#!/bin/bash

# Script para corregir errores de nullish coalescing en todo el proyecto

echo "🔧 Corrigiendo operadores nullish coalescing..."

# Corregir || por ?? en patrones comunes
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/result\.error || "/result.error ?? "/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/errorResult\.error || `/errorResult.error ?? `/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/error || "/error ?? "/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/data || \[\]/data ?? []/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/value || "/value ?? "/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/name || "/name ?? "/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/title || "/title ?? "/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/content || "/content ?? "/g'

echo "✅ Operadores nullish coalescing corregidos"
