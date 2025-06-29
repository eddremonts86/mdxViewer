# Sistema de Gestión de Archivos - MDX Viewer

## 📋 Resumen

Se ha implementado un sistema completo de gestión de archivos para el MDX Viewer que permite crear, eliminar y gestionar archivos y carpetas directamente desde la sidebar, con funcionalidad de selección múltiple y operaciones en lote.

## ✅ Funcionalidades Implementadas

### 🔄 Sincronización Automática

-   **File Watcher**: Sistema de vigilancia de archivos usando `chokidar` que detecta cambios en tiempo real
-   **Auto-regeneración**: El índice de contenido se regenera automáticamente cuando se detectan cambios
-   **Actualización de Sidebar**: La sidebar se actualiza automáticamente sin recargar la página

### 📁 Gestión de Archivos y Carpetas

-   **Crear archivos**: Soporte para archivos `.md` y `.mdx` con plantillas predefinidas
-   **Crear carpetas**: Creación de nuevas carpetas con validación de nombres
-   **Eliminar elementos**: Eliminación individual de archivos y carpetas
-   **Operaciones en lote**: Eliminación múltiple de elementos seleccionados

### 🎯 Selección Múltiple

-   **Modo multi-selección**: Activable desde el toolbar
-   **Selección visual**: Checkboxes y resaltado visual de elementos seleccionados
-   **Gestión de estado**: Control completo del estado de selección

### 🛠️ Validación y Seguridad

-   **Validación de nombres**: Verificación de caracteres válidos y nombres reservados
-   **Límites de longitud**: Control de longitud máxima de nombres
-   **Manejo de errores**: Sistema robusto de manejo y reporte de errores

### 💻 Interfaz de Usuario

-   **Toolbar interactivo**: Botones para crear, eliminar y gestionar selección
-   **Diálogos modales**: Interfaces para creación y confirmación de eliminación
-   **Indicadores de progreso**: Barras de progreso para operaciones en lote
-   **Feedback visual**: Estados de carga y mensajes de estado

## 📂 Estructura de Archivos Implementados

### Utilidades (`src/utils/`)

-   **`fileManagerUtils.ts`**: Clase principal con métodos para todas las operaciones de archivos
    -   Validación de nombres de archivos y carpetas
    -   Generación de contenido por defecto
    -   Ejecución de operaciones individuales y en lote
    -   Simulación de operaciones para desarrollo

### Tipos (`src/types/`)

-   **`fileManager.ts`**: Definiciones completas de tipos TypeScript
    -   Interfaces para operaciones de archivos
    -   Estados de componentes
    -   Props de componentes UI
    -   Resultados de operaciones

### Hooks (`src/hooks/`)

-   **`useFileManager.ts`**: Hook personalizado para gestión de estado
    -   Estado global de gestión de archivos
    -   Funciones de selección múltiple
    -   Gestión de diálogos
    -   Ejecución de operaciones

### Componentes (`src/components/`)

-   **`FileManagerToolbar.tsx`**: Barra de herramientas con acciones
-   **`CreateDialog.tsx`**: Diálogo para crear archivos y carpetas
-   **`DeleteDialog.tsx`**: Diálogo de confirmación para eliminación
-   **`BatchProgress.tsx`**: Indicador de progreso para operaciones en lote
-   **`FileManagerContext.tsx`**: Contexto React para compartir estado
-   **`FileTreeNode.tsx`**: Actualizado con soporte para multi-selección
-   **`Sidebar.tsx`**: Actualizada con toda la funcionalidad integrada

### Constantes (`src/const/`)

-   **`fileManager.ts`**: Constantes para validación, tipos de archivo y mensajes

### Scripts (`scripts/`)

-   **`test-file-management.sh`**: Script de prueba para verificar funcionalidad

## 🚀 Cómo Usar

### Iniciar el Sistema

```bash
# Ejecutar con watcher automático
npm run dev:watch

# O ejecutar el script de prueba
./scripts/test-file-management.sh
```

### Funcionalidades Principales

#### 1. Crear Archivos y Carpetas

-   Usar los botones `+` (archivo) y `📁+` (carpeta) en el toolbar
-   Completar el diálogo con nombre y contenido opcional
-   El archivo se crea automáticamente en la ubicación especificada

#### 2. Selección Múltiple

-   Activar modo multi-selección con el botón `☑️`
-   Hacer clic en elementos para seleccionar/deseleccionar
-   Usar el botón de papelera para eliminar todos los seleccionados

#### 3. Operaciones en Lote

-   Seleccionar múltiples elementos
-   Confirmar eliminación en el diálogo
-   Ver progreso en tiempo real

#### 4. Navegación

-   Los archivos creados aparecen automáticamente en la sidebar
-   La estructura se actualiza en tiempo real
-   Click en archivos para navegación normal

## 🔧 Características Técnicas

### Arquitectura

-   **Separación de responsabilidades**: Lógica dividida en utils, hooks, componentes
-   **TypeScript**: Completamente tipado para seguridad de tipos
-   **Composición**: Hooks reutilizables y componentes modulares
-   **Estado reactivo**: Actualizaciones automáticas del UI

### Validación

-   Nombres de archivo y carpeta
-   Caracteres prohibidos y nombres reservados
-   Límites de longitud
-   Extensiones de archivo soportadas

### Desarrollo vs Producción

-   **Desarrollo**: Operaciones simuladas con logs en consola
-   **Producción**: Preparado para integración con APIs reales de filesystem

### Accesibilidad

-   Navegación por teclado
-   Roles ARIA apropiados
-   Etiquetas descriptivas
-   Contraste y visibilidad

## 🧪 Testing

El sistema incluye funcionalidad de testing:

1. **Simulación completa**: Todas las operaciones son simuladas para development
2. **Logs detallados**: Monitoreo de operaciones en la consola
3. **Estados visuales**: Indicadores de progreso y estados de error
4. **Validación completa**: Testing de todos los casos de validación

## 🔄 Integración con Sistema Existente

El sistema se integra perfectamente con:

-   **File watcher existente**: Usa el sistema ya implementado
-   **Estructura de rutas**: Compatible con el router actual
-   **Estilos**: Usa el sistema de design tokens existente
-   **Tipos existentes**: Extiende los tipos de `FileNode` ya definidos

## 📈 Próximos Pasos

Para la implementación en producción:

1. **Backend Integration**: Reemplazar simulaciones con APIs reales
2. **Persistencia**: Implementar guardado real de archivos
3. **Optimización**: Mejorar performance para grandes volúmenes
4. **Testing**: Agregar tests unitarios y de integración
5. **Notificaciones**: Sistema de toasts para feedback al usuario

## 🎯 Beneficios

-   **Productividad**: Gestión de archivos sin salir del editor
-   **Eficiencia**: Operaciones en lote y selección múltiple
-   **Usabilidad**: Interface intuitiva y accesible
-   **Mantenibilidad**: Código bien estructurado y tipado
-   **Escalabilidad**: Arquitectura preparada para crecimiento
