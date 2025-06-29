# Guía del Agente AI para MDXViewer

## 🤖 Sistema de Prompt Universal

Este proyecto implementa un sistema de **prompt universal** para asegurar que cualquier agente AI siga consistentemente las mejores prácticas y patrones establecidos.

### Archivos del Sistema

1. **`.ai-instructions.md`** - Instrucciones universales obligatorias
2. **`.vscode/settings.json`** - Configuración de VS Code para auto-cargar contexto
3. **`scripts/validate-ai-rules.sh`** - Script de validación automática
4. **`.github/pull_request_template.md`** - Template de PR con checklist

### Cómo Funciona

#### 1. Instrucciones Universales (`.ai-instructions.md`)

```markdown
# Instrucciones Universales para el Agente AI

## Contexto del Proyecto

Este es **MDXViewer**, un visualizador de archivos MDX...

## Principios de Desarrollo OBLIGATORIOS

-   SIEMPRE usar TypeScript con tipado estricto
-   SIEMPRE usar Tailwind CSS para estilos
-   SIEMPRE seguir la arquitectura de componentes existente
    ...
```

#### 2. Configuración VS Code

```json
{
    "ai.context.files": [".ai-instructions.md"],
    "ai.prompt.prefix": "Lee primero .ai-instructions.md y sigue todas las reglas..."
}
```

#### 3. Validación Automática

```bash
# Ejecutar validación
npm run validate:ai

# Pre-commit con validación
npm run pre-commit
```

### Comandos Disponibles

```bash
# Desarrollo con reglas AI
npm run dev:watch          # Desarrollo con hot reload
npm run validate:ai        # Validar adherencia a reglas
npm run pre-commit         # Lint + validación AI
npm run generate:index     # Generar índice de contenido
```

### Para Desarrolladores

1. **Antes de codificar**: Lee `.ai-instructions.md`
2. **Durante desarrollo**: Ejecuta `npm run dev:watch`
3. **Antes de commit**: Ejecuta `npm run pre-commit`
4. **Al crear PR**: Usa el template automático con checklist

### Para Agentes AI

El sistema automáticamente:

-   Carga las instrucciones universales
-   Valida el código contra las reglas establecidas
-   Proporciona feedback inmediato sobre adherencia

### Beneficios

✅ **Consistencia**: Todos los cambios siguen los mismos patrones
✅ **Calidad**: Validación automática de mejores prácticas
✅ **Eficiencia**: Menos revisiones manuales de código
✅ **Escalabilidad**: Fácil onboarding de nuevos desarrolladores/agentes

---

_El sistema de prompt universal asegura que MDXViewer mantenga alta calidad y consistencia en todo momento._
