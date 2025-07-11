# Funcionalidad de Creación de Documentos

## Resumen

Se ha implementado una funcionalidad avanzada para la creación de documentos que permite a los usuarios:

-   ✅ **Seleccionar extensión deseada**: Markdown (.md) o MDX (.mdx)
-   ✅ **Elegir carpeta destino**: Seleccionar de carpetas existentes o crear nueva
-   ✅ **Crear carpetas sobre la marcha**: Opción integrada para crear nuevas carpetas durante la creación del documento

## Componentes Implementados

### 1. CreateDocumentDialog.tsx

-   **Ubicación**: `src/components/CreateDocumentDialog.tsx`
-   **Funcionalidades**:
    -   Campo para nombre del documento
    -   Selección de extensión (radio buttons para .md y .mdx)
    -   Dropdown para seleccionar carpeta destino (muestra estructura jerárquica)
    -   Checkbox para crear nueva carpeta
    -   Campo para nombre de nueva carpeta (aparece cuando se activa)
    -   Vista previa de la ruta final del archivo
    -   Validación de formulario
    -   Estado de carga durante la operación

### 2. Integración en Sidebar.tsx

-   **Funcionalidad**: El botón "+" en el sidebar ahora abre el diálogo avanzado
-   **Gestión de estado**: Manejo del estado del diálogo y ruta padre
-   **Creación de carpetas**: Funcionalidad simplificada para carpetas independientes

## API Backend

### Endpoints Utilizados

-   `POST /api/files/create` - Crear archivo con contenido inicial
-   `POST /api/folders/create` - Crear carpeta nueva
-   `GET /api/files` - Obtener estructura de archivos para el selector

### Campos de la API Mejorados

-   `name`: Nombre formateado para mostrar
-   `originalName`: Nombre original del archivo
-   `sizeFormatted`: Tamaño en formato legible
-   `lastModifiedFormatted`: Fecha en formato legible
-   `previewUrl`: URL para vista previa (placeholder)

## Flujo de Uso

1. **Usuario hace clic en el botón "+" del sidebar**
2. **Se abre el diálogo CreateDocumentDialog**
3. **Usuario ingresa**:
    - Nombre del documento
    - Selecciona extensión (.md o .mdx)
    - Elige carpeta destino del dropdown
    - Opcionalmente, marca "crear nueva carpeta" y especifica el nombre
4. **Vista previa muestra la ruta final**
5. **Al hacer clic en "Create Document"**:
    - Si se seleccionó crear carpeta nueva, se crea primero
    - Se crea el archivo con contenido inicial template
    - Se actualiza la interfaz automáticamente

## Mejoras Técnicas

-   **TanStack Query**: Gestión eficiente del estado de la API
-   **TypeScript**: Tipado completo en frontend y backend
-   **Validación**: Formulario con validación en tiempo real
-   **UX**: Interfaz intuitiva con iconos y retroalimentación visual
-   **Responsive**: Diseño que funciona en diferentes tamaños de pantalla

## Próximas Mejoras Posibles

-   [ ] Drag & drop para reorganizar archivos
-   [ ] Preview de imágenes reales (no placeholder)
-   [ ] Templates personalizables para nuevos documentos
-   [ ] Funcionalidad de renombrado inline
-   [ ] Historial de documentos recientes

## Pruebas Realizadas

-   ✅ Creación de archivos .md
-   ✅ Creación de archivos .mdx
-   ✅ Selección de carpetas existentes
-   ✅ Creación de nuevas carpetas
-   ✅ Validación de formularios
-   ✅ Actualización automática del sidebar
-   ✅ Integración con TanStack Query
-   ✅ Manejo de errores
