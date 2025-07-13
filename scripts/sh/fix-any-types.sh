#!/bin/bash

# Script para corregir tipos any

echo "🔧 Corrigiendo tipos any..."

# Corregir algunos tipos any comunes
sed -i '' 's/: any\[\]/: unknown[]/g' src/features/documentList/components/DocumentsGrid.tsx
sed -i '' 's/: any)/: unknown)/g' src/features/documentList/hooks/useProcessedDocuments.ts
sed -i '' 's/: any\b/: unknown/g' src/hooks/usePreviewStats.ts
sed -i '' 's/Promise<any>/Promise<unknown>/g' src/utils/viewTransitions.ts

echo "✅ Tipos any corregidos"
