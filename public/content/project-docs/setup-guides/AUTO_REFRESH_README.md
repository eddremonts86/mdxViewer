# 🔄 Sistema de Auto-actualización de Archivos

Este sistema monitorea automáticamente los cambios en `public/content/` y actualiza la sidebar en tiempo real.

## 🚀 Cómo usar

### Desarrollo Normal (sin auto-actualización)

```bash
npm run dev
```

### Desarrollo con Auto-actualización ⭐

```bash
npm run dev:watch
```

### Solo monitoreo de archivos

```bash
npm run watch:content
```

### Regenerar índice manualmente

```bash
npm run generate:index
```

## 🔧 Cómo funciona

### 1. **File Watcher (`contentWatcher.js`)**

-   Monitorea `public/content/` usando `chokidar`
-   Detecta cuando se agregan, eliminan o modifican archivos `.md` y `.mdx`
-   Regenera automáticamente `src/api/contentIndex.ts`
-   Debounce de 500ms para evitar actualizaciones excesivas

### 2. **Dev Server Concurrent (`devWithWatcher.js`)**

-   Ejecuta Vite dev server y file watcher simultáneamente
-   Maneja cleanup automático al cerrar
-   Separa los logs de cada proceso

### 3. **API Dinámica (`fileSystemAPI.ts`)**

-   Carga dinámicamente el índice de archivos
-   Auto-refresh cada 5 segundos para cambios
-   Fallback a caché si falla la carga

### 4. **Hook Auto-refresh (`useFileSystemDynamic.ts`)**

-   Verifica cambios en contentIndex cada 2 segundos
-   Actualiza automáticamente la sidebar cuando detecta cambios
-   No afecta performance en producción

## 📁 Flujo de Actualización

```
1. Agregas/modificas archivo en public/content/
2. File watcher detecta el cambio
3. Se regenera contentIndex.ts automáticamente
4. Hook detecta el cambio en contentIndex.ts
5. Se actualiza la sidebar automáticamente
6. ¡Los cambios aparecen sin refrescar!
```

## 🎯 Casos de Uso

### ✅ Detecta automáticamente:

-   ✅ Nuevos archivos `.md` y `.mdx`
-   ✅ Archivos eliminados
-   ✅ Archivos renombrados
-   ✅ Nuevas carpetas
-   ✅ Cambios en estructura de directorio

### ⚠️ No detecta (requiere restart):

-   ❌ Cambios en configuración de Vite
-   ❌ Cambios en componentes React
-   ❌ Cambios en estilos CSS

## 🐛 Troubleshooting

### El watcher no inicia

```bash
# Instalar dependencias
npm install chokidar --save-dev
```

### Los cambios no aparecen

1. Verificar que el file watcher esté corriendo
2. Comprobar que los archivos estén en `public/content/`
3. Revisar la consola por errores
4. Restart con `npm run dev:watch`

### Performance issues

-   El watcher tiene debounce de 500ms
-   Auto-refresh cada 2-5 segundos
-   Solo monitorea archivos .md/.mdx

## 🔧 Configuración Avanzada

### Modificar delay del debounce

```javascript
// En contentWatcher.js
this.debounceDelay = 1000; // 1 segundo
```

### Cambiar frecuencia de auto-refresh

```javascript
// En useFileSystemDynamic.ts
const interval = setInterval(checkForUpdates, 5000); // 5 segundos
```

### Agregar más tipos de archivo

```javascript
// En contentWatcher.js
const isTargetFile =
    filePath.endsWith(".md") ||
    filePath.endsWith(".mdx") ||
    filePath.endsWith(".txt"); // Agregar más tipos
```

## 📊 Logs del Sistema

```
[WATCHER] 🔍 Iniciando monitoreo de archivos...
[WATCHER] ✅ File watcher listo y monitoreando cambios...
[WATCHER] 📄 Archivo added: examples/nuevo-archivo.md
[WATCHER] 🔄 Índice actualizado: 25 archivos encontrados
[VITE] ⚡ Local: http://localhost:5174/
```

## 🎉 Beneficios

-   ⚡ **Desarrollo más rápido**: No necesitas refresh manual
-   🔄 **Sincronización automática**: Los cambios aparecen al instante
-   🎯 **Foco en contenido**: Solo te preocupas por escribir
-   🛡️ **Robusto**: Maneja errores y fallbacks automáticamente
-   🚀 **Performance**: Solo actualiza cuando es necesario

---

**¡Ahora puedes crear, editar y organizar archivos Markdown/MDX y verlos aparecer automáticamente en la sidebar!** 🎊
