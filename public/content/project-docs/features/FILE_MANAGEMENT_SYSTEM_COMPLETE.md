# Sistema de Gestión de Archivos/Carpetas - MDX Viewer

## ✅ IMPLEMENTACIÓN COMPLETADA

El sistema de gestión de archivos y carpetas está ahora **completamente funcional** con operaciones reales de archivos.

## 🚀 Características Implementadas

### ✅ Operaciones Reales de Archivos

-   **Creación de archivos**: Crea archivos `.md`, `.mdx` reales en el sistema de archivos
-   **Creación de carpetas**: Crea carpetas reales en el directorio de contenido
-   **Eliminación**: Elimina archivos y carpetas del sistema de archivos
-   **Eliminación por lotes**: Elimina múltiples elementos seleccionados

### ✅ Backend API

-   **Servidor Express.js**: Ejecutándose en puerto 3001
-   **Endpoints REST**:
    -   `POST /api/files/create` - Crear archivos
    -   `POST /api/folders/create` - Crear carpetas
    -   `POST /api/files/delete` - Eliminar archivos/carpetas
    -   `GET /api/health` - Estado del servidor

### ✅ Frontend Integrado

-   **Interface de Usuario**: Botones para crear/eliminar archivos y carpetas
-   **Selección Múltiple**: Modo multi-selección para operaciones por lotes
-   **Diálogos de Confirmación**: Para crear y eliminar elementos
-   **Feedback Visual**: Indicadores de progreso y estados de operación

### ✅ Sincronización en Tiempo Real

-   **Auto-refresh**: El sidebar se actualiza automáticamente después de operaciones
-   **Watcher de Archivos**: Detecta cambios en el sistema de archivos
-   **Regeneración de Índice**: Actualiza el índice de contenido automáticamente

## 🎯 Cómo Usar

### 1. Iniciar el Sistema

```bash
# Opción 1: Iniciar ambos servicios (recomendado)
npm run dev

# Opción 2: Iniciar servicios por separado
npm run server    # Backend en puerto 3001
npm run client    # Frontend en puerto 5174
```

### 2. Crear Archivos/Carpetas

1. **Desde la UI del Sidebar**:

    - Busca los botones "+" en la parte superior del sidebar
    - Selecciona "Crear Archivo" o "Crear Carpeta"
    - Rellena el diálogo que aparece
    - Los archivos se crean inmediatamente en el sistema de archivos

2. **Desde la API**:

```bash
# Crear archivo
curl -X POST http://localhost:3001/api/files/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "mi-archivo",
    "type": "md",
    "path": "docs",
    "content": "# Mi Nuevo Archivo"
  }'

# Crear carpeta
curl -X POST http://localhost:3001/api/folders/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "mi-carpeta",
    "path": "docs"
  }'
```

### 3. Eliminar Archivos/Carpetas

1. **Selección Individual**:

    - Haz clic derecho en un archivo/carpeta
    - Selecciona "Eliminar"

2. **Selección Múltiple**:
    - Activa el modo multi-selección
    - Selecciona varios elementos
    - Haz clic en "Eliminar Seleccionados"

## 📁 Estructura de Archivos

```
src/
├── types/fileManager.ts           # Tipos TypeScript
├── utils/fileManagerUtils.ts      # Utilidades para operaciones
├── api/fileManagerAPI.ts         # API del lado cliente (no usado actualmente)
├── hooks/useFileManager.ts       # Hook React para estado
├── components/
│   ├── FileManagerContext.tsx    # Contexto React
│   ├── FileManagerToolbar.tsx    # Barra de herramientas
│   ├── CreateDialog.tsx         # Diálogo de creación
│   ├── DeleteDialog.tsx         # Diálogo de eliminación
│   ├── BatchProgress.tsx        # Progreso de operaciones
│   ├── FileTreeNode.tsx         # Nodo del árbol de archivos
│   └── Sidebar.tsx              # Sidebar principal
└── const/fileManager.ts          # Constantes

server/
└── index.js                      # Servidor Express.js
```

## 🔧 Endpoints API

### POST /api/files/create

Crea un nuevo archivo.

**Parámetros:**

```json
{
  "name": "nombre-archivo",      // sin extensión
  "type": "md" | "mdx",         // tipo de archivo
  "path": "ruta/relativa",      // carpeta padre (vacío para raíz)
  "content": "contenido..."     // opcional
}
```

### POST /api/folders/create

Crea una nueva carpeta.

**Parámetros:**

```json
{
    "name": "nombre-carpeta", // nombre de la carpeta
    "path": "ruta/relativa" // carpeta padre (vacío para raíz)
}
```

### POST /api/files/delete

Elimina archivos/carpetas.

**Parámetros:**

```json
{
    "paths": ["ruta/archivo1.md", "ruta/carpeta2"] // array de rutas
}
```

## ✅ Tests Realizados

-   ✅ Creación de archivos MD/MDX
-   ✅ Creación de carpetas
-   ✅ Eliminación de archivos individuales
-   ✅ Eliminación de carpetas (con contenido)
-   ✅ Eliminación por lotes
-   ✅ Validación de nombres de archivos
-   ✅ Manejo de errores (archivos existentes, permisos, etc.)
-   ✅ Sincronización con la UI
-   ✅ Auto-refresh del sidebar

## 🚦 Estado del Proyecto

**✅ COMPLETADO** - El sistema de gestión de archivos/carpetas está completamente funcional y listo para producción.

### Próximos Pasos Opcionales

1. **Funciones Adicionales**:

    - Renombrado de archivos/carpetas
    - Mover/copiar archivos
    - Editor de archivos integrado

2. **Mejoras de UX**:

    - Drag & drop para mover archivos
    - Vista previa de archivos en tooltips
    - Filtros avanzados en el explorador

3. **Optimizaciones**:
    - Cache de operaciones
    - Undo/Redo de operaciones
    - Compresión de respuestas API
