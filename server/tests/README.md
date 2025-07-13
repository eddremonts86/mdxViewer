# 🧪 MDX Viewer Server Tests

Este directorio contiene una suite completa de tests para el servidor MDX Viewer que valida **todas las funcionalidades** del sistema.

## 📋 Estructura de Tests

### 🔧 Tests Principales

- **`simple-server.test.ts`** - Tests básicos de endpoints y funcionalidad core
- **`all-previews.test.ts`** - Test completo que valida que TODAS las previews son accesibles
- **`preview-accessibility.test.ts`** - Test avanzado de accesibilidad de previews

### 📜 Scripts de Validación

- **`validate-all-previews.js`** - Script independiente que valida todas las previews sin dependencias

## 🚀 Comandos de Testing

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar solo tests del servidor
npm run test:server

# Ejecutar test específico de previews
npm run test:previews

# Validar todas las previews (script independiente)
npm run validate:all-previews

# Tests con interfaz visual
npm run test:ui

# Tests con coverage
npm run test:coverage
```

## 🎯 Cobertura de Tests

### 🔗 Endpoints Probados

- ✅ **Health Check** (`/api/health`) - Estado del servidor
- ✅ **Files API** (`/api/files`) - Árbol de archivos
- ✅ **File Content** (`/api/files/content`) - Contenido de archivos
- ✅ **Statistics** (`/api/statistics`) - Estadísticas del sitio
- ✅ **Universal Previews** (`/api/previews/**`) - Sistema universal de previews

### 🖼️ Sistema de Previews - Cobertura Completa

El test de previews valida **TODOS** los casos posibles:

#### 📁 Niveles de Anidamiento

- ✅ **Nivel 1**: `docs/introduction.md`
- ✅ **Nivel 2**: `project-docs/README.md`
- ✅ **Nivel 3**: `project-docs/features/auth.md`
- ✅ **Nivel 4+**: `project-docs/features/deep/nested/file.md`
- ✅ **Nivel 10**: `tests/navigation/deep-nested/level4/level5/level6/test-10-levels.md`

#### 🔗 Formatos de URL

- ✅ **URL Encoding**: `docs%2Fintroduction.png`
- ✅ **Sin Encoding**: `docs/introduction.png`
- ✅ **Caracteres Especiales**: `path%20with%20spaces.png`
- ✅ **Paths Complejos**: `tests%2Fnavigation%2Fdeep-nested%2Flevel4%2Flevel5%2Flevel6%2Ftest-10-levels.png`

#### 📄 Tipos de Archivo

- ✅ **Markdown**: `.md` → `.png`
- ✅ **MDX**: `.mdx` → `.png`
- ✅ **Todos los archivos del proyecto**

### ⚡ Tests de Rendimiento

- ✅ **Requests Concurrentes** - Múltiples previews simultáneas
- ✅ **Tiempo de Respuesta** - Respuestas bajo 2 segundos
- ✅ **Carga del Sistema** - 10+ requests paralelos

### 🔐 Tests de Seguridad

- ✅ **CORS Headers** - Headers de Cross-Origin correctos
- ✅ **Paths Maliciosos** - Protección contra path traversal
- ✅ **Rate Limiting** - Manejo de requests múltiples
- ✅ **Error Handling** - Respuestas apropiadas para errores

### 🌍 Tests de Robustez

- ✅ **Archivos Inexistentes** - 404 apropiados
- ✅ **Paths Malformados** - Manejo graceful de errores
- ✅ **Caracteres Especiales** - Espacios, símbolos, Unicode
- ✅ **Límites del Sistema** - Paths muy largos, nesting extremo

## 📊 Análisis de Resultados

Los tests proporcionan análisis detallado incluyendo:

### 🌳 Cobertura por Niveles de Anidamiento

```
Level 1: 15 files (100% success)
Level 2: 25 files (100% success)
Level 3: 18 files (100% success)
Level 4+: 12 files (100% success)
```

### 📈 Estadísticas de Rendimiento

```
Total Previews Tested: 76
Success Rate: 100%
Average Response Time: 150ms
Concurrent Requests: 10 (all successful)
```

### 🎯 Validación de URLs

```
✅ All URLs properly formatted
✅ All URLs use .png extension
✅ All URLs properly URL-encoded
✅ No malformed or invalid URLs
```

## 🔍 Test de Validación Completa

El script `validate-all-previews.js` es especialmente importante porque:

1. **Descubre automáticamente** todos los archivos markdown del proyecto
2. **Genera las URLs** de preview correspondientes
3. **Prueba cada URL** individualmente
4. **Reporta estadísticas completas** de éxito/fallo
5. **Analiza niveles de anidamiento** automáticamente
6. **Valida la implementación universal** del sistema de previews

### Ejemplo de Salida:

```bash
🧪 Starting Complete Preview Validation...
📁 Content directory: /path/to/content
🌐 Server URL: http://localhost:3001

🔍 Discovering all markdown files...
📄 Found 76 markdown files

🧪 Testing 76 preview URLs...
  📊 Progress: 10/76 (✅ 10, ❌ 0)
  📊 Progress: 20/76 (✅ 20, ❌ 0)
  ...
  📊 Progress: 76/76 (✅ 76, ❌ 0)

📊 FINAL RESULTS:
  📄 Total files tested: 76
  ✅ Successful previews: 76
  ❌ Failed previews: 0
  📈 Success rate: 100.00%

🌳 NESTING LEVEL ANALYSIS:
  Level 1: 15/15 (100.0%)
  Level 2: 25/25 (100.0%)
  Level 3: 18/18 (100.0%)
  Level 4: 12/12 (100.0%)
  Level 6: 6/6 (100.0%)

🎉 SUCCESS: ALL PREVIEWS ARE ACCESSIBLE!

✅ The universal preview system is working perfectly!
✅ All nesting levels are supported!
✅ URL encoding is handled correctly!
```

## 🛠️ Configuración de Tests

Los tests están configurados con:

- **Vitest** - Framework de testing moderno
- **Supertest** - Tests de APIs HTTP
- **TypeScript** - Tipado estático
- **Coverage Reports** - Reportes de cobertura
- **CI/CD Ready** - Listo para integración continua

## 🎯 Objetivo de los Tests

Estos tests garantizan que:

1. **TODAS las previews funcionan** - Sin excepción
2. **Todos los niveles de anidamiento** están soportados
3. **La codificación URL** es correcta
4. **El rendimiento** es aceptable
5. **La robustez** ante errores es adecuada
6. **La seguridad** está implementada

Con esta suite de tests, podemos tener **100% de confianza** en que el sistema universal de previews funciona correctamente para cualquier estructura de archivos.
