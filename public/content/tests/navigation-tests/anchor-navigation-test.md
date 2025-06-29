---
title: "Test de Navegación y Enlaces Anchor"
description: "Documento para probar la navegación interna y enlaces anchor"
author: "MDX Viewer Team"
date: "2025-06-28"
tags: ["test", "navegación", "anchors", "índice"]
---

# Test de Navegación y Enlaces Anchor

Este documento está diseñado específicamente para probar todas las funcionalidades de navegación interna, generación de IDs y enlaces anchor.

## Tabla de Contenidos

-   [Introducción](#introduccion)
-   [Sección Básica](#seccion-basica)
-   [Sección con Acentos y Ñ](#seccion-con-acentos-y-n)
-   [Sección con Números y Símbolos](#seccion-con-numeros-y-simbolos-123)
-   [Enlaces Internos](#enlaces-internos)
-   [Pruebas Avanzadas](#pruebas-avanzadas)
    -   [Subsección A](#subseccion-a)
    -   [Subsección B](#subseccion-b)
-   [Conclusión](#conclusion)

---

## Introducción

Esta sección está diseñada para probar la **generación automática de IDs** y la **navegación por el índice**. El sistema debería generar automáticamente un ID `introduccion` para este encabezado.

### Características Probadas

1. **Generación de IDs**: Conversión automática de títulos a IDs válidos
2. **Navegación suave**: Scroll automático al hacer clic en el índice
3. **Compatibilidad Unicode**: Soporte para acentos y caracteres especiales
4. **Enlaces anchor**: Enlaces que funcionan dentro del documento

---

## Sección Básica

Esta es una sección normal con texto básico. Deberías poder navegar aquí desde el índice de contenidos haciendo clic en el enlace correspondiente.

El ID generado debería ser: `seccion-basica`

### Contenido de Ejemplo

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

> **Nota importante**: Esta cita debería mostrarse correctamente con el formato aplicado.

---

## Sección con Acentos y Ñ

Esta sección prueba específicamente la **compatibilidad con caracteres especiales** del español como acentos y la ñ.

ID esperado: `seccion-con-acentos-y-n`

### Características Especiales

-   **Acentos**: á, é, í, ó, ú
-   **Diéresis**: ü
-   **Eñe**: ñ
-   **Mayúsculas**: ÁÉÍÓÚÜÑ

El sistema debería manejar correctamente todos estos caracteres y generar IDs válidos.

---

## Sección con Números y Símbolos (123)

Esta sección incluye números y símbolos en el título para probar cómo se manejan en la generación de IDs.

ID esperado: `seccion-con-numeros-y-simbolos-123`

### Lista de Pruebas

1. **Número 1**: Primera prueba
2. **Número 2**: Segunda prueba
3. **Número 3**: Tercera prueba

Código de ejemplo:

```javascript
function testFunction() {
    console.log("Esta es una función de prueba");
    return true;
}
```

---

## Enlaces Internos

En esta sección probamos los **enlaces internos** que deberían navegar a otras secciones del documento:

### Enlaces de Prueba

-   Ir a la [Introducción](#introduccion)
-   Saltar a [Sección Básica](#seccion-basica)
-   Navegar a [Sección con Acentos y Ñ](#seccion-con-acentos-y-n)
-   Ver [Conclusión](#conclusion)

### Enlaces Externos

También podemos tener enlaces externos que se abren en nueva ventana:

-   [Documentación MDX](https://mdxjs.com)
-   [React](https://react.dev)
-   [TypeScript](https://www.typescriptlang.org)

---

## Pruebas Avanzadas

Esta sección contiene **subsecciones** para probar la navegación jerárquica.

### Subsección A

Esta es la primera subsección. El índice de contenidos debería mostrarla como un elemento anidado.

ID esperado: `subseccion-a`

#### Nivel 4 de Encabezado

Este es un encabezado de nivel 4 para probar la jerarquía completa.

##### Nivel 5 de Encabezado

Y este es nivel 5.

###### Nivel 6 de Encabezado

El nivel más profundo de encabezado.

### Subsección B

Segunda subsección para completar las pruebas de navegación jerárquica.

ID esperado: `subseccion-b`

#### Contenido Diverso

-   **Listas**: Para probar el formato
-   **Texto en negrita** y _cursiva_
-   `Código inline`
-   ~~Texto tachado~~

**Tabla de ejemplo:**

| Columna 1 | Columna 2 | Columna 3 |
| --------- | --------- | --------- |
| Dato 1    | Dato 2    | Dato 3    |
| Valor A   | Valor B   | Valor C   |

---

## Conclusión

Este documento ha probado todas las funcionalidades principales:

### ✅ Funcionalidades Verificadas

1. **Generación automática de IDs** ✓
2. **Navegación desde el índice** ✓
3. **Enlaces internos con anchor** ✓
4. **Soporte para caracteres especiales** ✓
5. **Jerarquía de encabezados** ✓
6. **Scroll suave con offset** ✓

### Enlaces de Vuelta

Para probar la navegación bidireccional:

-   [Volver a la Introducción](#introduccion)
-   [Ir a Pruebas Avanzadas](#pruebas-avanzadas)
-   [Ver Enlaces Internos](#enlaces-internos)

---

**¡Fin del documento de prueba!** Si has llegado hasta aquí navegando usando el índice y los enlaces internos, ¡todo está funcionando correctamente! 🎉
