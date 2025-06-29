# Template de Pull Request - MDXViewer

## Checklist del Agente AI ✅

**OBLIGATORIO: Marca todas las casillas antes de crear el PR**

### 🎯 Arquitectura y Patrones

-   [ ] ✅ Uso TypeScript con tipado estricto
-   [ ] ✅ Sigo la arquitectura de componentes existente
-   [ ] ✅ Uso React Query para gestión de estado servidor
-   [ ] ✅ Componentes reutilizables están en `src/components/ui/`
-   [ ] ✅ Lógica compleja está en custom hooks (`src/hooks/`)

### 🎨 Estilo y UI

-   [ ] ✅ Uso Tailwind CSS para todos los estilos
-   [ ] ✅ Uso componentes de Radix UI/shadcn cuando es posible
-   [ ] ✅ Implemento modo oscuro/claro con ThemeProvider existente
-   [ ] ✅ La UI es responsive (mobile-first)
-   [ ] ✅ Sigo el sistema de design tokens establecido

### 🔧 Código

-   [ ] ✅ Nombres descriptivos en inglés
-   [ ] ✅ JSDoc para funciones complejas
-   [ ] ✅ Interfaces TypeScript para props
-   [ ] ✅ Error boundaries implementados donde es necesario
-   [ ] ✅ React.memo para optimización donde aplica

### 🚀 Performance

-   [ ] ✅ Lazy loading para rutas
-   [ ] ✅ useMemo/useCallback para optimización
-   [ ] ✅ Debounce en búsquedas
-   [ ] ✅ React.Suspense para carga asíncrona

### 📱 UX/UI

-   [ ] ✅ Loading states implementados
-   [ ] ✅ Estados vacíos con mensajes útiles
-   [ ] ✅ Feedback visual para acciones del usuario
-   [ ] ✅ Transiciones suaves (transition-all duration-200)
-   [ ] ✅ Accesibilidad (ARIA labels, keyboard navigation)

### 🧪 Testing y Debugging

-   [ ] ✅ Console.log útiles durante desarrollo
-   [ ] ✅ Nombres de clase CSS descriptivos
-   [ ] ✅ Fallbacks para estados de error

## 📝 Descripción del Cambio

### ¿Qué hace este PR?

<!-- Describe brevemente qué funcionalidad agrega o arregla -->

### ¿Por qué es necesario?

<!-- Explica el problema que resuelve o la mejora que aporta -->

### ¿Cómo funciona?

<!-- Describe la implementación técnica -->

## 🔄 Testing

### Comandos ejecutados:

```bash
# Validación de reglas AI
./scripts/validate-ai-rules.sh

# Lint y build
npm run lint
npm run build

# Testing manual
npm run dev:watch
```

### Casos de prueba:

-   [ ] ✅ Funciona en modo claro y oscuro
-   [ ] ✅ Responsive en mobile y desktop
-   [ ] ✅ Estados de loading se muestran correctamente
-   [ ] ✅ Manejo de errores funciona
-   [ ] ✅ Performance es aceptable

## 📸 Screenshots (si aplica)

<!-- Agrega screenshots si hay cambios visuales -->

## 🔗 Enlaces relacionados

<!-- Issues, documentación, etc. -->

---

**⚠️ IMPORTANTE**: Este PR ha sido revisado contra las reglas del archivo `.ai-instructions.md` y cumple con todos los estándares establecidos para el proyecto MDXViewer.
