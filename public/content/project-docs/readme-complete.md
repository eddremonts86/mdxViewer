# MDX Viewer - File Management System

## 🚀 Descripción del Proyecto

MDX Viewer es una aplicación web moderna para visualizar y gestionar archivos Markdown (.md) y MDX (.mdx). La aplicación cuenta con un sistema robusto de gestión de archivos y carpetas, utilizando TypeScript tanto en el frontend como en el backend.

## 🛠️ Tecnologías Utilizadas

### Frontend

-   **React 18** con TypeScript
-   **TanStack Query** para el estado del servidor y cache
-   **React Router** para navegación
-   **Tailwind CSS** para estilos
-   **Vite** como bundler

### Backend

-   **Node.js** con TypeScript
-   **Express.js** para el servidor API
-   **Multer** para subida de archivos
-   **CORS** configurado

## 📋 Funcionalidades Implementadas

### ✅ Gestión de Archivos y Carpetas

-   **Listar archivos** recursivamente con estructura de carpetas
-   **Crear archivos** (.md y .mdx) con contenido personalizable
-   **Crear carpetas** con estructura anidada
-   **Subir múltiples archivos** con creación automática de carpetas
-   **Eliminar archivos y carpetas** (individual y múltiple)
-   **Búsqueda en tiempo real** de archivos y carpetas

### ✅ API Endpoints (TypeScript)

```
GET    /api/files          - Listar archivos y carpetas
GET    /api/files/content  - Obtener contenido de archivo
POST   /api/files/create   - Crear nuevo archivo
POST   /api/folders/create - Crear nueva carpeta
POST   /api/files/upload   - Subir múltiples archivos
DELETE /api/files          - Eliminar archivos/carpetas
GET    /api/health         - Estado del servidor
```

### ✅ Frontend con TanStack Query

-   **useFiles()** - Hook para listar archivos
-   **useFileContent()** - Hook para obtener contenido
-   **useCreateFile()** - Hook para crear archivos
-   **useCreateFolder()** - Hook para crear carpetas
-   **useUploadFiles()** - Hook para subir archivos
-   **useDeleteFiles()** - Hook para eliminar archivos

## 🗂️ Estructura del Proyecto

```
mdxViewer/
├── server/
│   └── index.ts                 # Servidor TypeScript con Express
├── src/
│   ├── api/
│   │   └── fileAPI.ts          # Cliente API para todas las operaciones
│   ├── hooks/api/
│   │   └── useFiles.ts         # Hooks de TanStack Query
│   ├── components/
│   │   ├── Sidebar.tsx         # Sidebar con gestión de archivos
│   │   ├── FileTreeNode.tsx    # Nodo del árbol de archivos
│   │   └── ...
│   └── pages/
│       └── DocumentPage.tsx    # Página de visualización de documentos
└── public/content/             # Directorio de archivos gestionados
```

## 🚦 Cómo Ejecutar

### 1. Instalar dependencias

```bash
npm install
```

### 2. Iniciar el servidor backend (TypeScript)

```bash
npm run server
```

El servidor estará disponible en: `http://localhost:3001`

### 3. Iniciar el frontend

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:5174`

### 4. Ejecutar ambos al mismo tiempo

```bash
npm run dev
```

(Ejecuta tanto el servidor como el frontend con concurrently)

## 📡 Endpoints de la API

### Obtener lista de archivos

```bash
curl http://localhost:3001/api/files
```

### Crear un archivo

```bash
curl -X POST http://localhost:3001/api/files/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ejemplo.md",
    "type": "md",
    "path": "docs",
    "content": "# Mi archivo"
  }'
```

### Subir archivos

```bash
curl -X POST http://localhost:3001/api/files/upload \
  -F "files=@archivo1.md" \
  -F "files=@archivo2.mdx" \
  -F "path=docs/ejemplos" \
  -F "createFolders=true"
```

### Eliminar archivos

```bash
curl -X DELETE http://localhost:3001/api/files \
  -H "Content-Type: application/json" \
  -d '{
    "paths": ["docs/archivo1.md", "docs/archivo2.mdx"]
  }'
```

## ✨ Características Destacadas

1. **Solo TypeScript**: Todo el backend está implementado en TypeScript
2. **TanStack Query**: Gestión inteligente del estado del servidor con cache automático
3. **Subida múltiple**: Permite subir varios archivos a la vez con creación automática de carpetas
4. **Búsqueda en tiempo real**: Filtrado instantáneo de archivos y carpetas
5. **Interfaz moderna**: UI limpia con Tailwind CSS y componentes reutilizables

## 🔧 Configuración

### Variables de entorno

-   `PORT`: Puerto del servidor (por defecto: 3001)
-   `CONTENT_PATH`: Directorio de archivos (por defecto: public/content)

### Formatos soportados

-   `.md` (Markdown)
-   `.mdx` (MDX)
-   `.txt` (Texto plano)

## 📚 Dependencias Principales

```json
{
    "dependencies": {
        "@tanstack/react-query": "^5.x",
        "express": "^4.x",
        "multer": "^1.x",
        "tsx": "^4.x"
    }
}
```

## 🧹 Archivos Eliminados

Se han eliminado todos los archivos innecesarios:

-   `server/simple.js`
-   `server/test.js`
-   `server/index.js`
-   Hooks obsoletos (`useFileManager`, `useFileSystemDynamic`)
-   Componentes obsoletos (`CreateDialog`, `DeleteDialog`, `FileManagerToolbar`, etc.)

## ✅ Estado del Proyecto

-   ✅ Backend TypeScript completamente funcional
-   ✅ API endpoints implementados y probados
-   ✅ Frontend con TanStack Query
-   ✅ Sidebar con gestión de archivos
-   ✅ Subida de archivos múltiples
-   ✅ Búsqueda y filtrado
-   ✅ Eliminación de archivos obsoletos

El proyecto está **COMPLETADO** y listo para usar. Todas las funcionalidades de gestión de archivos están implementadas con TypeScript y TanStack Query.
