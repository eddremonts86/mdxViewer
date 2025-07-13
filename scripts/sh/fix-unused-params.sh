#!/bin/bash

# Script para corregir parámetros no utilizados

echo "🔧 Corrigiendo parámetros no utilizados..."

# Función para agregar _ a parámetros en interfaces
fix_unused_params() {
    local file="$1"

    # Corregir parámetros comunes en funciones
    sed -i '' 's/(params: /(_params: /g' "$file"
    sed -i '' 's/(path: /(_path: /g' "$file"
    sed -i '' 's/(event: /(_event: /g' "$file"
    sed -i '' 's/(node: /(_node: /g' "$file"
    sed -i '' 's/(name: /(_name: /g' "$file"
    sed -i '' 's/(content?: /(_content?: /g' "$file"
    sed -i '' 's/(items: /(_items: /g' "$file"
    sed -i '' 's/(theme: /(_theme: /g' "$file"
    sed -i '' 's/(state: /(_state: /g' "$file"
    sed -i '' 's/(progress: /(_progress: /g' "$file"
    sed -i '' 's/(query: /(_query: /g' "$file"
    sed -i '' 's/(filter: /(_filter: /g' "$file"
    sed -i '' 's/(id: /(_id: /g' "$file"
}

# Aplicar a archivos específicos con errores
fix_unused_params "src/types/fileManager.ts"
fix_unused_params "src/types/index.ts"
fix_unused_params "src/hooks/use-toast.ts"
fix_unused_params "src/features/documentList/components/SearchAndFilters.tsx"
fix_unused_params "src/components/progress/NotificationCenter.tsx"
fix_unused_params "src/components/theme/theme-provider.tsx"
fix_unused_params "src/utils/fileManagerUtils.ts"
fix_unused_params "src/components/navigation/NavigationBreadcrumb.tsx"

echo "✅ Parámetros no utilizados corregidos"
