#!/bin/bash

# Script para aplicar correcciones masivas de ESLint

# Función para reemplazar magic numbers con constantes
replace_magic_numbers() {
    local file="$1"

    # Reemplazar códigos de estado HTTP
    sed -i '' 's/\.status(400)/\.status(HTTP_STATUS.BAD_REQUEST)/g' "$file"
    sed -i '' 's/\.status(404)/\.status(HTTP_STATUS.NOT_FOUND)/g' "$file"
    sed -i '' 's/\.status(409)/\.status(HTTP_STATUS.CONFLICT)/g' "$file"
    sed -i '' 's/\.status(500)/\.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)/g' "$file"

    # Agregar import si es necesario
    if grep -q "HTTP_STATUS\." "$file" && ! grep -q "import.*HTTP_STATUS" "$file"; then
        sed -i '' '1i\
import { HTTP_STATUS } from "@/const/constants";' "$file"
    fi
}

# Función para reemplazar console statements con logging
replace_console_statements() {
    local file="$1"

    # Reemplazar console.log con logOperation
    sed -i '' 's/console\.log(/logOperation(/g' "$file"

    # Reemplazar console.error con logError
    sed -i '' 's/console\.error(/logError(/g' "$file"

    # Agregar imports de logging si es necesario
    if grep -q "logOperation\|logError\|logSuccess" "$file" && ! grep -q "import.*logger" "$file"; then
        sed -i '' '1i\
import { logError, logOperation, logSuccess } from "../utils/logger.js";' "$file"
    fi
}

# Función para reemplazar || con ??
replace_logical_or() {
    local file="$1"

    # Casos comunes donde || debería ser ??
    sed -i '' 's/ || ""/ ?? ""/g' "$file"
    sed -i '' 's/ || filename/ ?? filename/g' "$file"
    sed -i '' 's/ || content/ ?? content/g' "$file"
}

# Aplicar correcciones a todos los archivos del servidor
for file in server/endpoints/*.ts; do
    echo "Corrigiendo: $file"
    replace_magic_numbers "$file"
    replace_console_statements "$file"
    replace_logical_or "$file"
done

echo "Correcciones aplicadas!"
