# Proyecto React 18: Visualizador Avanzado de Markdown y MDX

Crea un proyecto completamente funcional y listo para producción en React 18 + TypeScript + Vite para construir un visualizador profesional de archivos Markdown (.md) y MDX (.mdx). **IMPORTANTE: El proyecto debe ser 100% autónomo, funcional desde el primer momento sin requerir intervención manual adicional.**

## 🚀 Instrucciones de Creación Automática

**Ejecuta exactamente estos comandos en orden:**

```bash
# 1. Crear y navegar al directorio del proyecto
mkdir mdxViewer && cd mdxViewer

# 2. Inicializar proyecto con Vite + React + TypeScript
npm create vite@latest . -- --template react-ts
npm install

# 3. Instalar todas las dependencias necesarias
npm install react-markdown @mdx-js/react @mdx-js/rollup remark-gfm remark-math rehype-katex prismjs gray-matter lucide-react @radix-ui/react-slot class-variance-authority clsx tailwind-merge react-router-dom zustand html2canvas jspdf react-to-print file-saver

# 4. Instalar dependencias de desarrollo
npm install -D tailwindcss autoprefixer postcss @types/prismjs @types/file-saver

# 5. Configurar Tailwind CSS
npx tailwindcss init -p

# 6. Inicializar shadcn/ui (usar configuración por defecto)
npx shadcn-ui@latest init --defaults

# 7. Instalar componentes de shadcn/ui necesarios
npx shadcn-ui@latest add button card tabs alert sheet scroll-area separator badge input toast navigation-menu breadcrumb

# 8. Crear estructura de carpetas y archivos de ejemplo
mkdir -p src/components/ui src/components/markdown src/hooks src/utils src/types src/content/docs src/content/examples src/content/guides

# 9. Ejecutar el proyecto
npm run dev
```

## 🎯 Características Principales

-   **Layout de dos paneles**: Sidebar izquierdo con árbol de archivos + área principal de visualización
-   **Árbol de archivos interactivo**: Navegación jerárquica con carpetas expandibles/colapsables
-   **Visualizador de documentos**: Área principal para renderizar .md y .mdx con scroll independiente
-   **Funciones de documento**: Descarga (PDF/HTML) e impresión directa desde el navegador
-   **Renderizado dual**: Soporte completo para archivos .md (markdown estático) y .mdx (markdown con componentes React)
-   **Sintaxis highlighting**: Resaltado de código con Prism.js integrado
-   **Tema oscuro/claro**: Toggle de temas con persistencia local
-   **Responsive design**: Sidebar colapsable en móvil, interfaz adaptativa

## 📋 Implementación Detallada

### 1. Configuración del Proyecto (COMPLETAMENTE AUTOMATIZADA)

**Todo debe estar preconfigurado y funcionando sin intervención manual:**

-   ✅ Proyecto inicializado con Vite + React 18 + TypeScript
-   ✅ ESLint, Prettier configurados automáticamente
-   ✅ shadcn/ui instalado y configurado con defaults
-   ✅ Tailwind CSS configurado completamente
-   ✅ Estructura de carpetas creada automáticamente
-   ✅ Todas las dependencias instaladas
-   ✅ Archivos de ejemplo incluidos y funcionales
-   ✅ Routing configurado automáticamente
-   ✅ Tema oscuro/claro funcionando desde el inicio

### 2. Dependencias y Configuraciones (AUTO-INSTALADAS)

**Todas las dependencias deben estar instaladas automáticamente con los comandos iniciales:**

```json
{
    "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-router-dom": "^6.8.0",
        "react-markdown": "^9.0.0",
        "@mdx-js/react": "^3.0.0",
        "@mdx-js/rollup": "^3.0.0",
        "remark-gfm": "^4.0.0",
        "remark-math": "^6.0.0",
        "rehype-katex": "^7.0.0",
        "prismjs": "^1.29.0",
        "gray-matter": "^4.0.3",
        "lucide-react": "^0.400.0",
        "@radix-ui/react-slot": "^1.0.2",
        "class-variance-authority": "^0.7.0",
        "clsx": "^2.1.0",
        "tailwind-merge": "^2.2.0",
        "zustand": "^4.4.0",
        "html2canvas": "^1.4.1",
        "jspdf": "^2.5.1",
        "react-to-print": "^2.14.13",
        "file-saver": "^2.0.5"
    },
    "devDependencies": {
        "@types/react": "^18.2.0",
        "@types/react-dom": "^18.2.0",
        "@types/prismjs": "^1.26.0",
        "@types/file-saver": "^2.0.5",
        "@typescript-eslint/eslint-plugin": "^6.0.0",
        "@typescript-eslint/parser": "^6.0.0",
        "@vitejs/plugin-react": "^4.0.0",
        "autoprefixer": "^10.4.17",
        "eslint": "^8.45.0",
        "eslint-plugin-react-hooks": "^4.6.0",
        "eslint-plugin-react-refresh": "^0.4.3",
        "postcss": "^8.4.33",
        "tailwindcss": "^3.4.0",
        "tailwindcss-animate": "^1.0.7",
        "typescript": "^5.0.2",
        "vite": "^4.4.5"
    }
}
```

**Archivos de configuración que deben estar incluidos y funcionales:**

-   `vite.config.ts` - Configuración completa con MDX y path aliases
-   `tailwind.config.js` - Configuración completa de shadcn/ui
-   `tsconfig.json` - Configuración estricta de TypeScript
-   `components.json` - Configuración de shadcn/ui
-   `.eslintrc.json` - Reglas de linting
-   `postcss.config.js` - Configuración de PostCSS

### 3. Arquitectura de Componentes (Layout de dos paneles con shadcn/ui)

**Layout principal:**

-   **`AppLayout`**: Layout principal con sidebar izquierdo + área de contenido derecha
-   **`Sidebar`**: Panel izquierdo fijo con árbol de archivos (usando `Sheet` en móvil)
-   **`FileTree`**: Componente de árbol jerárquico con carpetas expandibles
-   **`DocumentViewer`**: Área principal derecha para visualizar documentos
-   **`DocumentActions`**: Barra de acciones (descarga PDF/HTML, imprimir, compartir)

**Componentes específicos:**

-   **`FileTreeNode`**: Nodo individual del árbol (carpeta o archivo) con iconos
-   **`MarkdownRenderer`**: Renderizador que detecta .md vs .mdx automáticamente
-   **`MDXProvider`**: Wrapper con componentes personalizados para MDX
-   **`CodeBlock`**: Syntax highlighting con `Card` y botón de copia
-   **`TableOfContents`**: TOC flotante/lateral con `ScrollArea` y links activos
-   **`SearchBar`**: Búsqueda global con `Input` y resultados en `Card`
-   **`ThemeToggle`**: Toggle de tema con `Button` (sol/luna)
-   **`PrintProvider`**: Componente para manejar estilos de impresión

### 4. Funcionalidades Avanzadas

**Funciones de documento:**

-   **Descarga PDF**: Conversión automática del documento a PDF usando jsPDF + html2canvas
-   **Descarga HTML**: Export del documento como archivo HTML standalone
-   **Impresión**: Función de impresión optimizada con estilos específicos usando react-to-print
-   **Compartir**: URLs directas a documentos específicos

**Navegación y UX:**

-   **Metadatos frontmatter**: Extracción y uso de metadata YAML para títulos y metadatos
-   **Lazy loading**: Carga diferida de archivos grandes en el árbol
-   **Error boundaries**: Manejo elegante de errores de renderizado
-   **Hot reload**: Recarga automática al modificar archivos (en desarrollo)
-   **Breadcrumbs**: Navegación contextual basada en la estructura de carpetas
-   **Historial**: Navegación con back/forward del navegador

### 5. Componentes MDX Personalizados (usando shadcn/ui)

Incluye ejemplos de:

-   **`<Alert>`** - Usar `Alert` de shadcn/ui con variantes (default, destructive)
-   **`<CodeSandbox>`** - Embeds usando `Card` con header y contenido
-   **`<Tabs>`** - Sistema de pestañas con `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
-   **`<Chart>`** - Gráficos envueltos en `Card` con títulos
-   **`<Timeline>`** - Línea de tiempo usando `Card` y `Separator`
-   **`<Callout>`** - Usando `Alert` con iconos de lucide-react
-   **`<Button>`** - Botones interactivos con todas las variantes de shadcn/ui

### 6. Sistema de Archivos

-   **Estructura de ejemplo**: Crea una carpeta `content/` con subcarpetas organizadas
-   **Carga dinámica**: Implementa `import.meta.glob()` para cargar archivos automáticamente
-   **Routing**: Integra React Router para URLs amigables (/docs/getting-started)
-   **API simulada**: Mock de API para simular carga desde servidor

### 7. Optimización y Performance

-   **Code splitting**: División de código por rutas
-   **Memoización**: React.memo y useMemo para componentes pesados
-   **Virtual scrolling**: Para listas grandes de archivos
-   **Caching**: Estrategia de cache para archivos ya cargados
-   **Bundle analysis**: Configuración para analizar el tamaño del bundle

### 8. Testing y Deployment

-   **Unit tests**: Tests con Vitest para componentes clave
-   **E2E tests**: Playwright para flujos completos
-   **Storybook**: Documentación de componentes
-   **CI/CD**: GitHub Actions para build y deploy automático
-   **Netlify/Vercel**: Configuración para deploy en producción

### 9. Configuración Adicional

-   **PWA**: Service worker para funcionamiento offline
-   **SEO**: Meta tags dinámicos basados en contenido
-   **Analytics**: Integración con Google Analytics
-   **Accesibilidad**: Cumplimiento WCAG 2.1 nivel AA

### 10. Troubleshooting y Errores Comunes

Documenta soluciones para:

-   Problemas de importación de MDX en Vite
-   Conflictos de estilos con componentes personalizados
-   Errores de hidratación en SSR
-   Problemas de performance con archivos grandes
-   Incompatibilidades entre versiones de dependencias

## 🖼️ Especificación Visual del Layout

```text
┌─────────────────────────────────────────────────────────┐
│ Header: Logo + Búsqueda + Theme Toggle                 │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────────────────────┐ │
│ │ SIDEBAR (20%)   │ │ ÁREA PRINCIPAL (80%)            │ │
│ │                 │ │                                 │ │
│ │ 📁 Docs/        │ │ ┌─────────────────────────────┐ │ │
│ │ ├─ 📄 intro.md  │ │ │ DOCUMENT ACTIONS            │ │ │
│ │ ├─ 📁 guides/   │ │ │ [📥 PDF] [🖨️ Print] [🔗 Link] │ │ │
│ │ │  ├─ basic.md  │ │ └─────────────────────────────┘ │ │
│ │ │  └─ advanced  │ │                                 │ │
│ │ └─ 📁 api/      │ │ ┌─────────────────────────────┐ │ │
│ │    ├─ ref.md    │ │ │                             │ │ │
│ │    └─ examples  │ │ │    MARKDOWN/MDX CONTENT     │ │ │
│ │                 │ │ │                             │ │ │
│ │ 📁 Examples/    │ │ │         (Scrollable)        │ │ │
│ │ ├─ 📄 demo.mdx  │ │ │                             │ │ │
│ │ └─ 📄 comp.mdx  │ │ │                             │ │ │
│ │                 │ │ └─────────────────────────────┘ │ │
│ │ 📁 Assets/      │ │                                 │ │
│ │ └─ 📄 styles.md │ │ ┌─────────────────────────────┐ │ │
│ │                 │ │ │ TABLE OF CONTENTS (Flotante)│ │ │
│ │ [Filter: ____]  │ │ │ • Introducción              │ │ │
│ └─────────────────┘ │ │ • Instalación               │ │ │
│                     │ │ • Configuración             │ │ │
│                     │ │ • Ejemplos                  │ │ │
│                     └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Características del Layout:**

-   **Sidebar fijo** a la izquierda con scroll independiente
-   **Área principal** responsive con toolbar de acciones
-   **TOC flotante** que aparece en documentos largos
-   **Mobile**: Sidebar se convierte en drawer/sheet
-   **Iconos**: Carpetas (📁), archivos MD (📄), archivos MDX (⚛️)

## 🔧 Requisitos de Entrega AUTOMÁTICA

**El proyecto debe incluir TODOS estos archivos funcionales desde el primer momento:**

### Archivos principales (auto-generados):

-   `src/App.tsx` - Aplicación principal con routing
-   `src/main.tsx` - Entry point configurado
-   `src/index.css` - Estilos globales con variables de shadcn/ui
-   `src/router.tsx` - Configuración de React Router

### Componentes principales (completamente funcionales):

-   `src/components/MarkdownViewer.tsx` - Visor principal
-   `src/components/FileExplorer.tsx` - Explorador de archivos
-   `src/components/Layout.tsx` - Layout principal
-   `src/components/ThemeProvider.tsx` - Proveedor de temas
-   `src/components/Navigation.tsx` - Navegación principal

### Archivos de contenido de ejemplo (incluidos):

**OBLIGATORIO: Crear estos 6 archivos con contenido funcional completo**

-   `src/content/docs/introduction.md` - Introducción con frontmatter y markdown básico
-   `src/content/docs/getting-started.md` - Guía de instalación y primeros pasos
-   `src/content/examples/interactive-demo.mdx` - Demo con componentes shadcn/ui
-   `src/content/examples/components-showcase.mdx` - Galería de todos los componentes
-   `src/content/guides/setup.md` - Configuración avanzada y deployment
-   `src/content/guides/customization.mdx` - Guía de personalización con MDX

_Nota: El contenido completo de estos archivos está especificado en la sección "Estructura de Archivos de Ejemplo"_

### Utilidades y hooks (funcionales):

-   `src/hooks/useTheme.ts` - Hook para manejo de temas
-   `src/utils/markdown.ts` - Utilidades para procesamiento
-   `src/types/index.ts` - Tipos TypeScript

### Configuraciones (pre-configuradas):

-   `vite.config.ts` - Con soporte completo para MDX
-   `tailwind.config.js` - Configuración completa de shadcn/ui
-   `components.json` - Configuración de shadcn/ui

## ✅ Criterios de Éxito

**Al ejecutar `npm run dev`, el proyecto debe:**

1. ✅ Iniciarse sin errores en localhost:5173
2. ✅ Mostrar layout de dos paneles: sidebar izquierdo + área de contenido derecha
3. ✅ Sidebar con árbol de archivos completamente funcional (expandir/colapsar carpetas)
4. ✅ Renderizar archivos .md y .mdx correctamente en el área principal
5. ✅ Tener tema oscuro/claro funcionando con toggle
6. ✅ Mostrar ejemplos de contenido organizados en carpetas
7. ✅ Ser responsive: sidebar colapsable en móvil
8. ✅ Tener botones de descarga PDF e impresión funcionando
9. ✅ Incluir sistema de búsqueda que resalte resultados
10. ✅ Tener tabla de contenidos automática en documentos largos
11. ✅ Navegación por URL directa a documentos (/docs/carpeta/archivo)
12. ✅ Syntax highlighting funcionando en bloques de código
13. ✅ Componentes MDX personalizados operativos
14. ✅ Ser deployeable sin modificaciones adicionales

## 📦 Entregables

1. **Código fuente completo** con comentarios detallados en español
2. **README.md** con instrucciones paso a paso
3. **Ejemplos de contenido** (.md y .mdx) para demostración
4. **Scripts de desarrollo y producción**
5. **Documentación de API** de componentes personalizados
6. **Guía de despliegue** para diferentes plataformas

## 🎨 Criterios de Calidad

-   Código TypeScript estricto con tipos bien definidos
-   Componentes modulares y reutilizables basados en shadcn/ui
-   Patrones de diseño React modernos (hooks, context, suspense)
-   Manejo de estados con Zustand o Context API
-   **Diseño consistente** con Tailwind CSS y sistema de tokens de shadcn/ui
-   **Temas personalizables** usando CSS variables de shadcn/ui
-   Documentación inline y JSDoc donde corresponda

## 🎨 Configuración de shadcn/ui

### Configuración de Tailwind (tailwind.config.js)

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
```

**Nota**: El proyecto debe ser production-ready y servir como base para una documentación técnica profesional o blog personal usando shadcn/ui como sistema de diseño.

## 📁 Estructura de Archivos de Ejemplo (OBLIGATORIOS)

**El proyecto debe incluir esta estructura exacta de archivos funcionales:**

### Carpeta: `src/content/docs/` (Documentación)

**`src/content/docs/introduction.md`**

```markdown
---
title: "Introducción al Visualizador MDX"
description: "Guía de inicio rápido para el visualizador de documentos"
author: "Sistema"
date: "2025-06-21"
tags: ["introducción", "guía", "inicio"]
---

# Introducción al Visualizador MDX

Bienvenido al **Visualizador Avanzado de Markdown y MDX**. Esta aplicación te permite navegar, visualizar y exportar documentos de manera profesional.

## Características principales

-   📁 **Navegación por árbol**: Explora documentos organizados en carpetas
-   📄 **Renderizado dual**: Soporte para archivos .md y .mdx
-   🎨 **Componentes interactivos**: Elementos MDX personalizados
-   📥 **Exportación**: Descarga en PDF o HTML
-   🖨️ **Impresión**: Optimizada para documentos
-   🌙 **Temas**: Modo oscuro y claro

## Navegación

Utiliza el **sidebar izquierdo** para navegar entre documentos. Haz clic en las carpetas para expandirlas y en los archivos para visualizarlos.

## Funciones del documento

En la parte superior del área de contenido encontrarás:

-   **📥 Descargar PDF**: Convierte el documento actual a PDF
-   **🖨️ Imprimir**: Imprime con formato optimizado
-   **🔗 Compartir**: Copia el enlace directo al documento

> **Tip**: Este documento está escrito en Markdown (.md) y demuestra el renderizado básico.
```

**`src/content/docs/getting-started.md`**

````markdown
---
title: "Guía de Inicio"
description: "Primeros pasos con el visualizador"
author: "Sistema"
date: "2025-06-21"
---

# Guía de Inicio Rápido

## Instalación

```bash
# Clonar el proyecto
git clone <repository-url>
cd mdxViewer

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```
````

## Estructura del proyecto

```
src/
├── components/          # Componentes React
├── content/            # Archivos .md y .mdx
│   ├── docs/          # Documentación
│   ├── examples/      # Ejemplos de MDX
│   └── guides/        # Guías tutoriales
├── hooks/             # Custom hooks
└── utils/             # Utilidades
```

## Agregando contenido

### Archivos Markdown (.md)

Coloca archivos `.md` en las carpetas de contenido. Utiliza frontmatter para metadatos:

```yaml
---
title: "Mi Documento"
description: "Descripción del documento"
---
```

### Archivos MDX (.mdx)

Los archivos `.mdx` permiten usar componentes React:

```jsx
import { Alert } from '../components/Alert'

# Mi Documento MDX

<Alert type="info">
  Este es un componente React dentro de MDX!
</Alert>
```

## Próximos pasos

-   Explora los [ejemplos de MDX](/examples/interactive-demo)
-   Lee las [guías avanzadas](/guides/components)
-   Personaliza los [componentes](/guides/customization)

````

### Carpeta: `src/content/examples/` (Ejemplos MDX)

**`src/content/examples/interactive-demo.mdx`**
```mdx
---
title: "Demo Interactivo"
description: "Ejemplos de componentes MDX interactivos"
author: "Sistema"
date: "2025-06-21"
tags: ["mdx", "interactivo", "demo"]
---

import { Alert } from '../../components/ui/alert'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'

# Demo Interactivo MDX

Este archivo demuestra las capacidades interactivas de **MDX** con componentes de **shadcn/ui**.

## Alertas

<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>¡Información!</AlertTitle>
  <AlertDescription>
    Este es un componente Alert de shadcn/ui funcionando dentro de MDX.
  </AlertDescription>
</Alert>

## Tarjetas

<Card className="w-full max-w-md mx-auto my-6">
  <CardHeader>
    <CardTitle>Tarjeta de Ejemplo</CardTitle>
    <CardDescription>Esta tarjeta está renderizada con MDX</CardDescription>
  </CardHeader>
  <CardContent>
    <p>El contenido puede incluir cualquier elemento de React.</p>
    <Button className="mt-4">Botón Interactivo</Button>
  </CardContent>
</Card>

## Pestañas Interactivas

<Tabs defaultValue="tab1" className="w-full">
  <TabsList>
    <TabsTrigger value="tab1">Pestaña 1</TabsTrigger>
    <TabsTrigger value="tab2">Pestaña 2</TabsTrigger>
    <TabsTrigger value="tab3">Código</TabsTrigger>
  </TabsList>

  <TabsContent value="tab1">
    <h3>Contenido de la Pestaña 1</h3>
    <p>Este es el contenido de la primera pestaña. Puedes incluir cualquier markdown aquí.</p>

    - Lista de elementos
    - Otro elemento
    - Y más elementos
  </TabsContent>

  <TabsContent value="tab2">
    <h3>Contenido de la Pestaña 2</h3>
    <p>Contenido diferente en la segunda pestaña.</p>

    > Esta es una cita destacada dentro de la pestaña.
  </TabsContent>

  <TabsContent value="tab3">
    <h3>Ejemplo de Código</h3>

    ```javascript
    // Ejemplo de código JavaScript
    function saludar(nombre) {
      return `¡Hola, ${nombre}!`;
    }

    console.log(saludar('Mundo'));
    ```
  </TabsContent>
</Tabs>

## Código con Syntax Highlighting

```typescript
interface Usuario {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
}

class GestorUsuarios {
  private usuarios: Usuario[] = [];

  agregarUsuario(usuario: Usuario): void {
    this.usuarios.push(usuario);
  }

  buscarUsuario(id: number): Usuario | undefined {
    return this.usuarios.find(u => u.id === id);
  }
}
````

## Componentes Anidados

<Card>
  <CardHeader>
    <CardTitle>Tarjeta con Pestañas</CardTitle>
  </CardHeader>
  <CardContent>
    <Tabs defaultValue="info">
      <TabsList>
        <TabsTrigger value="info">Información</TabsTrigger>
        <TabsTrigger value="config">Configuración</TabsTrigger>
      </TabsList>

      <TabsContent value="info">
        Esta es una demostración de componentes anidados en MDX.
      </TabsContent>

      <TabsContent value="config">
        Aquí irían las opciones de configuración.
      </TabsContent>
    </Tabs>

  </CardContent>
</Card>

---

**Nota**: Este archivo demuestra cómo MDX permite combinar Markdown con componentes React de manera fluida.

````

**`src/content/examples/components-showcase.mdx`**
```mdx
---
title: "Galería de Componentes"
description: "Muestra de todos los componentes disponibles"
author: "Sistema"
date: "2025-06-21"
---

import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Separator } from '../../components/ui/separator'

# Galería de Componentes

Esta página muestra todos los componentes disponibles para usar en archivos MDX.

## Botones

<div className="flex flex-wrap gap-2 my-4">
  <Button variant="default">Default</Button>
  <Button variant="destructive">Destructive</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="ghost">Ghost</Button>
  <Button variant="link">Link</Button>
</div>

## Badges

<div className="flex flex-wrap gap-2 my-4">
  <Badge variant="default">Default</Badge>
  <Badge variant="secondary">Secondary</Badge>
  <Badge variant="destructive">Destructive</Badge>
  <Badge variant="outline">Outline</Badge>
</div>

<Separator className="my-6" />

## Texto y Formato

### Encabezados
# H1 - Título Principal
## H2 - Título Secundario
### H3 - Título Terciario
#### H4 - Subtítulo
##### H5 - Encabezado Menor
###### H6 - Encabezado Mínimo

### Énfasis
- **Texto en negrita**
- *Texto en cursiva*
- ***Texto en negrita y cursiva***
- ~~Texto tachado~~
- `Código inline`

### Listas
1. Primer elemento ordenado
2. Segundo elemento ordenado
3. Tercer elemento ordenado

- Elemento de lista no ordenada
- Otro elemento
  - Sub-elemento anidado
  - Otro sub-elemento

### Citas
> Esta es una cita destacada.
> Puede ocupar múltiples líneas.
>
> — Autor de la cita

### Enlaces
- [Enlace a la introducción](/docs/introduction)
- [Enlace externo](https://example.com)
- [Enlace a guías](/guides/setup)

## Tablas

| Componente | Tipo | Descripción |
|------------|------|-------------|
| Button | Interactivo | Botón clickeable con variantes |
| Card | Container | Contenedor con estilo |
| Alert | Informativo | Mensaje destacado |
| Badge | Etiqueta | Pequeña etiqueta de estado |

---

*Esta galería está construida con MDX y demuestra la flexibilidad del sistema.*
````

### Carpeta: `src/content/guides/` (Guías)

**`src/content/guides/setup.md`**

````markdown
---
title: "Configuración Avanzada"
description: "Guía de configuración avanzada del visualizador"
author: "Sistema"
date: "2025-06-21"
---

# Configuración Avanzada

## Personalización de Temas

### Variables CSS

El proyecto utiliza CSS variables para los temas:

```css
:root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
}

.dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
}
```
````

## Configuración de Rutas

### React Router

El proyecto utiliza React Router para la navegación:

```typescript
const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "docs/:slug*", element: <DocumentViewer /> },
            { path: "examples/:slug*", element: <DocumentViewer /> },
            { path: "guides/:slug*", element: <DocumentViewer /> },
        ],
    },
]);
```

## Optimización

### Performance

-   Lazy loading de documentos
-   Memoización de componentes pesados
-   Virtual scrolling para listas grandes

### SEO

-   Meta tags dinámicos
-   Open Graph para compartir
-   Sitemap automático

## Deployment

### Netlify

```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Vercel

```json
{
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

````

**`src/content/guides/customization.mdx`**
```mdx
---
title: "Personalización de Componentes"
description: "Cómo personalizar y crear nuevos componentes MDX"
author: "Sistema"
date: "2025-06-21"
---

import { Alert, AlertDescription } from '../../components/ui/alert'
import { Code } from 'lucide-react'

# Personalización de Componentes

## Creando Componentes Personalizados

### Componente Básico

```tsx
interface MiComponenteProps {
  titulo: string;
  children: React.ReactNode;
}

export function MiComponente({ titulo, children }: MiComponenteProps) {
  return (
    <div className="border rounded-lg p-4 my-4">
      <h3 className="font-semibold mb-2">{titulo}</h3>
      <div>{children}</div>
    </div>
  );
}
````

### Uso en MDX

<Alert>
  <Code className="h-4 w-4" />
  <AlertDescription>
    Los componentes personalizados se pueden usar directamente en archivos MDX.
  </AlertDescription>
</Alert>

## Provider de Componentes

Para que los componentes estén disponibles globalmente en MDX:

```tsx
import { MDXProvider } from "@mdx-js/react";
import { Alert } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";

const components = {
    Alert,
    Button,
    Card,
    // Agregar más componentes aquí
};

export function AppMDXProvider({ children }: { children: React.ReactNode }) {
    return <MDXProvider components={components}>{children}</MDXProvider>;
}
```

## Estilos Personalizados

### Tailwind CSS

Utiliza clases de Tailwind para estilos rápidos:

```tsx
<div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
    Contenido con gradiente
</div>
```

### CSS Modules

Para estilos más complejos:

```css
/* styles.module.css */
.customComponent {
    background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

---

Esta guía te ayuda a personalizar completamente la experiencia del visualizador.

```

```
