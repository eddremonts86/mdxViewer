# Guía Completa de Markdown - Prueba Exhaustiva

Esta es una guía completa que incluye **TODOS** los elementos posibles de Markdown para probar el visualizador.

## Tabla de Contenidos

1. [Encabezados](#encabezados)
2. [Texto y Formateo](#texto-y-formateo)
3. [Listas](#listas)
4. [Enlaces y Referencias](#enlaces-y-referencias)
5. [Imágenes](#imágenes)
6. [Código](#código)
7. [Tablas](#tablas)
8. [Citas y Bloques](#citas-y-bloques)
9. [Elementos HTML](#elementos-html)
10. [Matemáticas](#matemáticas)
11. [Elementos Avanzados](#elementos-avanzados)

---

## Encabezados

# Encabezado Nivel 1

## Encabezado Nivel 2

### Encabezado Nivel 3

#### Encabezado Nivel 4

##### Encabezado Nivel 5

###### Encabezado Nivel 6

# Encabezado Alternativo Nivel 1

## Encabezado Alternativo Nivel 2

## Texto y Formateo

### Formateo Básico

Este es un párrafo normal con texto regular. Aquí tienes **texto en negrita** y también **texto en negrita alternativo**.

Este texto está en _cursiva_ y también _en cursiva alternativa_.

Puedes combinar **_texto en negrita y cursiva_** o también **_así_**.

También puedes usar ~~texto tachado~~ para indicar eliminaciones.

### Texto Especial

Aquí hay `código inline` dentro del texto.

Este es un párrafo con ==texto resaltado== (si está soportado).

Texto con ^superíndice^ y ~subíndice~ (si está soportado).

### Saltos de Línea

Este es un párrafo con un
salto de línea manual usando dos espacios.

Este es otro párrafo separado.

## Listas

### Listas No Ordenadas

-   Elemento 1 con asterisco
-   Elemento 2 con asterisco
    -   Sub-elemento 2.1
    -   Sub-elemento 2.2
        -   Sub-sub-elemento 2.2.1
        -   Sub-sub-elemento 2.2.2
    -   Sub-elemento 2.3
-   Elemento 3 con asterisco

*   Elemento 1 con guión
*   Elemento 2 con guión
    -   Sub-elemento con guión
        -   Sub-sub-elemento con guión

-   Elemento 1 con signo más
-   Elemento 2 con signo más

### Listas Ordenadas

1. Primer elemento
2. Segundo elemento
    1. Sub-elemento 2.1
    2. Sub-elemento 2.2
        1. Sub-sub-elemento 2.2.1
        2. Sub-sub-elemento 2.2.2
    3. Sub-elemento 2.3
3. Tercer elemento

### Listas Mixtas

1. Elemento numerado
    - Sub-elemento con viñeta
    - Otro sub-elemento con viñeta
        1. Sub-sub-elemento numerado
        2. Otro sub-sub-elemento numerado
2. Otro elemento numerado

### Listas de Tareas (GitHub Flavored Markdown)

-   [x] Tarea completada
-   [ ] Tarea pendiente
-   [x] Otra tarea completada
    -   [x] Sub-tarea completada
    -   [ ] Sub-tarea pendiente
-   [ ] Tarea final pendiente

### Listas con Párrafos Múltiples

1. Este es el primer elemento de la lista.

    Este es un segundo párrafo dentro del mismo elemento de lista.

2. Este es el segundo elemento.

    > Y aquí hay una cita dentro del elemento de lista.

3. Tercer elemento con código:

    ```javascript
    function ejemplo() {
        return "código dentro de lista";
    }
    ```

## Enlaces y Referencias

### Enlaces Básicos

[Enlace simple](https://example.com)

[Enlace con título](https://example.com "Este es el título del enlace")

<https://example.com> (URL automática)

### Enlaces de Referencia

[Enlace de referencia][1]

[Otro enlace de referencia][enlace-ejemplo]

[Enlace con texto de referencia][]

[1]: https://example.com "Título del enlace de referencia"
[enlace-ejemplo]: https://example.com/ejemplo
[Enlace con texto de referencia]: https://example.com

### Enlaces Internos

[Ir a la sección de código](#código)

[Volver al inicio](#guía-completa-de-markdown---prueba-exhaustiva)

## Imágenes

### Imágenes Básicas

![Texto alternativo](https://via.placeholder.com/300x200/0066CC/FFFFFF?text=Imagen+de+Prueba)

![Imagen con título](https://via.placeholder.com/400x300/FF6600/FFFFFF?text=Con+Título "Este es el título de la imagen")

### Imágenes de Referencia

![Imagen de referencia][imagen-ref]

[imagen-ref]: https://via.placeholder.com/350x250/009900/FFFFFF?text=Referencia

### Imágenes con Enlaces

[![Imagen con enlace](https://via.placeholder.com/200x150/CC0066/FFFFFF?text=Click+Me)](https://example.com)

## Código

### Código Inline

Usa el comando `npm install` para instalar dependencias.

Variables como `const variable = 'valor'` se escriben así.

### Bloques de Código sin Sintaxis

```
Este es un bloque de código simple
sin resaltado de sintaxis.
Mantiene el formato exacto
    incluyendo la indentación.
```

### Bloques de Código con Sintaxis

#### JavaScript

```javascript
// Ejemplo de JavaScript
function saludar(nombre) {
    const mensaje = `¡Hola, ${nombre}!`;
    console.log(mensaje);
    return mensaje;
}

const usuario = "Mundo";
saludar(usuario);

// Funciones flecha
const suma = (a, b) => a + b;
const resultado = suma(5, 3);

// Promesas y async/await
async function obtenerDatos() {
    try {
        const response = await fetch("https://api.ejemplo.com/datos");
        const datos = await response.json();
        return datos;
    } catch (error) {
        console.error("Error:", error);
    }
}
```

#### Python

```python
# Ejemplo de Python
import numpy as np
from typing import List, Dict, Optional

class CalculadoraAvanzada:
    """Una calculadora con operaciones avanzadas."""

    def __init__(self, precision: int = 2):
        self.precision = precision

    def suma(self, a: float, b: float) -> float:
        """Suma dos números."""
        return round(a + b, self.precision)

    def factorial(self, n: int) -> int:
        """Calcula el factorial de un número."""
        if n < 0:
            raise ValueError("No se puede calcular factorial de número negativo")
        return 1 if n <= 1 else n * self.factorial(n - 1)

# Uso de la clase
calc = CalculadoraAvanzada()
resultado = calc.suma(3.14159, 2.71828)
print(f"Resultado: {resultado}")

# List comprehension
numeros = [1, 2, 3, 4, 5]
cuadrados = [x**2 for x in numeros if x % 2 == 0]
print(f"Cuadrados de pares: {cuadrados}")
```

#### TypeScript

```typescript
// Ejemplo de TypeScript
interface Usuario {
    id: number;
    nombre: string;
    email: string;
    activo?: boolean;
}

type EstadoAutenticacion = "autenticado" | "no_autenticado" | "pendiente";

class GestorUsuarios<T extends Usuario> {
    private usuarios: T[] = [];

    constructor(private readonly apiUrl: string) {}

    async agregarUsuario(usuario: Omit<T, "id">): Promise<T> {
        const nuevoId = this.usuarios.length + 1;
        const nuevoUsuario = { ...usuario, id: nuevoId } as T;

        this.usuarios.push(nuevoUsuario);
        return nuevoUsuario;
    }

    buscarPorEmail(email: string): T | undefined {
        return this.usuarios.find((u) => u.email === email);
    }

    filtrarActivos(): T[] {
        return this.usuarios.filter((u) => u.activo !== false);
    }
}

// Generics y utilidades
const gestor = new GestorUsuarios<Usuario>("https://api.ejemplo.com");
```

#### CSS

```css
/* Ejemplo de CSS moderno */
:root {
    --color-primario: #3b82f6;
    --color-secundario: #1e40af;
    --fuente-principal: "Inter", sans-serif;
    --fuente-codigo: "JetBrains Mono", monospace;
    --radio-bordes: 0.5rem;
    --sombra: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.contenedor {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    padding: 2rem;
    font-family: var(--fuente-principal);
}

.tarjeta {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: var(--radio-bordes);
    box-shadow: var(--sombra);
    padding: 1.5rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.tarjeta:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
    .contenedor {
        grid-template-columns: 1fr;
        padding: 1rem;
    }
}

/* Animaciones */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animado {
    animation: fadeIn 0.6s ease-out;
}
```

#### HTML

```html
<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="UTF-8" />
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
        />
        <title>Ejemplo HTML5</title>
        <link
            rel="stylesheet"
            href="styles.css"
        />
    </head>
    <body>
        <header class="header">
            <nav class="navegacion">
                <ul class="menu">
                    <li><a href="#inicio">Inicio</a></li>
                    <li><a href="#servicios">Servicios</a></li>
                    <li><a href="#contacto">Contacto</a></li>
                </ul>
            </nav>
        </header>

        <main class="contenido-principal">
            <section
                id="inicio"
                class="seccion-hero"
            >
                <h1>Bienvenido a Nuestro Sitio</h1>
                <p>Este es un ejemplo de HTML5 semántico.</p>
                <button
                    type="button"
                    class="btn btn-primario"
                >
                    Comenzar
                </button>
            </section>

            <article class="articulo">
                <header>
                    <h2>Título del Artículo</h2>
                    <time datetime="2025-06-28">28 de Junio, 2025</time>
                </header>
                <p>Contenido del artículo...</p>
            </article>
        </main>

        <footer class="pie-pagina">
            <p>&copy; 2025 Mi Empresa. Todos los derechos reservados.</p>
        </footer>

        <script src="script.js"></script>
    </body>
</html>
```

#### SQL

```sql
-- Ejemplo de SQL complejo
CREATE DATABASE IF NOT EXISTS empresa_db
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE empresa_db;

-- Tabla de empleados
CREATE TABLE empleados (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    salario DECIMAL(10,2) DEFAULT 0.00,
    fecha_contratacion DATE NOT NULL,
    departamento_id INT,
    activo BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_departamento (departamento_id)
);

-- Consulta compleja con JOINs y subconsultas
SELECT
    e.nombre,
    e.apellido,
    d.nombre AS departamento,
    e.salario,
    (SELECT AVG(salario) FROM empleados WHERE departamento_id = e.departamento_id) AS salario_promedio_depto,
    CASE
        WHEN e.salario > (SELECT AVG(salario) FROM empleados WHERE departamento_id = e.departamento_id)
        THEN 'Por encima del promedio'
        ELSE 'Por debajo del promedio'
    END AS comparacion_salario
FROM empleados e
INNER JOIN departamentos d ON e.departamento_id = d.id
WHERE e.activo = TRUE
    AND e.fecha_contratacion >= DATE_SUB(CURDATE(), INTERVAL 5 YEAR)
ORDER BY e.salario DESC, e.apellido ASC
LIMIT 10;

-- Función almacenada
DELIMITER //
CREATE FUNCTION calcular_bonus(salario DECIMAL(10,2), antiguedad INT)
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE bonus DECIMAL(10,2) DEFAULT 0.00;

    IF antiguedad >= 5 THEN
        SET bonus = salario * 0.15;
    ELSEIF antiguedad >= 2 THEN
        SET bonus = salario * 0.10;
    ELSE
        SET bonus = salario * 0.05;
    END IF;

    RETURN bonus;
END //
DELIMITER ;
```

#### JSON

```json
{
    "nombre": "Configuración de Aplicación",
    "version": "2.1.0",
    "descripcion": "Ejemplo completo de archivo JSON",
    "configuracion": {
        "servidor": {
            "host": "localhost",
            "puerto": 3000,
            "ssl": {
                "habilitado": true,
                "certificado": "/ruta/al/certificado.pem",
                "clave_privada": "/ruta/a/clave.key"
            }
        },
        "base_datos": {
            "tipo": "postgresql",
            "host": "db.ejemplo.com",
            "puerto": 5432,
            "nombre": "mi_aplicacion",
            "credenciales": {
                "usuario": "${DB_USER}",
                "contraseña": "${DB_PASSWORD}"
            },
            "opciones": {
                "pool_conexiones": 20,
                "timeout": 30000,
                "ssl_requerido": true
            }
        }
    },
    "caracteristicas": ["autenticacion", "autorizacion", "logging", "cache"],
    "usuarios_ejemplo": [
        {
            "id": 1,
            "nombre": "Juan Pérez",
            "email": "juan@ejemplo.com",
            "roles": ["admin", "usuario"],
            "activo": true,
            "ultimo_login": "2025-06-28T10:30:00Z"
        },
        {
            "id": 2,
            "nombre": "María García",
            "email": "maria@ejemplo.com",
            "roles": ["usuario"],
            "activo": true,
            "ultimo_login": null
        }
    ],
    "metadatos": {
        "creado_en": "2025-06-28T08:00:00Z",
        "actualizado_en": "2025-06-28T10:15:00Z",
        "version_esquema": "1.2",
        "tags": ["produccion", "api", "backend"]
    }
}
```

#### Bash/Shell

```bash
#!/bin/bash

# Script de ejemplo completo
set -euo pipefail

# Variables globales
readonly SCRIPT_NAME=$(basename "$0")
readonly SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly LOG_FILE="/tmp/${SCRIPT_NAME}.log"

# Colores para output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

# Función de logging
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    echo "[${timestamp}] ${level}: ${message}" | tee -a "$LOG_FILE"
}

# Función de error
error() {
    log "ERROR" "$*" >&2
    exit 1
}

# Función de limpieza
cleanup() {
    log "INFO" "Ejecutando limpieza..."
    # Limpiar archivos temporales
    rm -f /tmp/temp_*
}

# Trap para limpieza en salida
trap cleanup EXIT

# Función para verificar dependencias
check_dependencies() {
    local deps=("curl" "jq" "git")

    for cmd in "${deps[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            error "Dependencia requerida no encontrada: $cmd"
        fi
    done

    log "INFO" "Todas las dependencias están instaladas"
}

# Función para procesar archivos
process_files() {
    local input_dir="$1"
    local output_dir="$2"

    # Crear directorio de salida si no existe
    mkdir -p "$output_dir"

    # Procesar archivos .txt
    find "$input_dir" -name "*.txt" -type f | while read -r file; do
        local filename=$(basename "$file")
        local output_file="${output_dir}/${filename%.txt}.processed"

        log "INFO" "Procesando: $file"

        # Ejemplo de procesamiento
        {
            echo "# Archivo procesado: $filename"
            echo "# Fecha: $(date)"
            echo ""
            cat "$file"
        } > "$output_file"
    done
}

# Función principal
main() {
    local input_dir="${1:-./input}"
    local output_dir="${2:-./output}"

    log "INFO" "Iniciando $SCRIPT_NAME"
    log "INFO" "Directorio de entrada: $input_dir"
    log "INFO" "Directorio de salida: $output_dir"

    check_dependencies

    if [[ ! -d "$input_dir" ]]; then
        error "Directorio de entrada no existe: $input_dir"
    fi

    process_files "$input_dir" "$output_dir"

    log "INFO" "Procesamiento completado exitosamente"
}

# Manejo de argumentos
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    case "${1:-}" in
        -h|--help)
            echo "Uso: $SCRIPT_NAME [directorio_entrada] [directorio_salida]"
            exit 0
            ;;
        *)
            main "$@"
            ;;
    esac
fi
```

#### YAML

```yaml
# Ejemplo completo de YAML
---
aplicacion:
    nombre: "Mi Aplicación Web"
    version: "2.1.0"
    descripcion: |
        Esta es una aplicación web completa
        que demuestra todas las características
        de YAML incluyendo texto multilínea.

    configuracion:
        servidor:
            host: "0.0.0.0"
            puerto: 8080
            ssl:
                habilitado: true
                certificados:
                    - "/etc/ssl/cert.pem"
                    - "/etc/ssl/chain.pem"
                protocolos: ["TLSv1.2", "TLSv1.3"]

        base_datos:
            tipo: "postgresql"
            conexion: &db_conexion
                host: "db.ejemplo.com"
                puerto: 5432
                ssl: true
                timeout: 30

            credenciales:
                usuario: "${DB_USER}"
                contraseña: "${DB_PASSWORD}"
                base_datos: "produccion"

            pool:
                tamaño_minimo: 5
                tamaño_maximo: 20
                tiempo_vida: "1h"

    servicios:
        - nombre: "api"
          imagen: "mi-app:2.1.0"
          puertos:
              - "8080:8080"
          variables_entorno:
              NODE_ENV: "production"
              LOG_LEVEL: "info"
              DB_HOST: "db.ejemplo.com"

          recursos:
              limites:
                  cpu: "1000m"
                  memoria: "512Mi"
              solicitudes:
                  cpu: "500m"
                  memoria: "256Mi"

          verificaciones_salud:
              vivacidad:
                  ruta: "/health"
                  puerto: 8080
                  intervalo: "30s"
              preparacion:
                  ruta: "/ready"
                  puerto: 8080
                  periodo_inicial: "10s"

        - nombre: "redis"
          imagen: "redis:7-alpine"
          configuracion: &redis_config
              maxmemory: "256mb"
              maxmemory-policy: "allkeys-lru"

          persistencia:
              habilitada: true
              tipo: "rdb"
              intervalo: "300s"

    entornos:
        desarrollo:
            base_datos:
                <<: *db_conexion
                host: "localhost"
                ssl: false

            servicios:
                redis:
                    <<: *redis_config
                    maxmemory: "128mb"

        pruebas:
            base_datos:
                <<: *db_conexion
                base_datos: "test"

            servicios:
                redis:
                    <<: *redis_config
                    persistencia:
                        habilitada: false

    caracteristicas:
        - autenticacion
        - autorizacion
        - logging
        - metricas
        - cache

    dependencias:
        runtime:
            - "node:18"
            - "postgresql-client"

        build:
            - "npm"
            - "webpack"
            - "typescript"

metadatos:
    creado_por: "Equipo DevOps"
    fecha_creacion: 2025-06-28
    tags:
        - produccion
        - api
        - microservicio

    contactos:
        - nombre: "Juan Pérez"
          email: "juan@empresa.com"
          rol: "DevOps Lead"

        - nombre: "María García"
          email: "maria@empresa.com"
          rol: "Desarrolladora Senior"

# Ejemplo de configuración multi-documento
---
# Segundo documento en el mismo archivo
version: "3.8"

services:
    web:
        build:
            context: .
            dockerfile: Dockerfile.prod

        ports:
            - "80:8080"

        environment:
            - NODE_ENV=production

        deploy:
            replicas: 3
            update_config:
                parallelism: 1
                delay: 10s

            restart_policy:
                condition: on-failure
                delay: 5s
                max_attempts: 3

networks:
    frontend:
        driver: bridge

    backend:
        driver: overlay
        attachable: true

volumes:
    datos_app:
        driver: local
        driver_opts:
            type: none
            o: bind
            device: /opt/app/data
```

## Tablas

### Tabla Básica

| Encabezado 1 | Encabezado 2 | Encabezado 3 |
| ------------ | ------------ | ------------ |
| Celda 1,1    | Celda 1,2    | Celda 1,3    |
| Celda 2,1    | Celda 2,2    | Celda 2,3    |

### Tabla con Alineación

| Izquierda | Centrado | Derecha | Número |
| :-------- | :------: | ------: | -----: |
| Texto     |  Texto   |   Texto | 123.45 |
| Más texto | Centrado |   Final |  67.89 |

### Tabla Compleja

| Proyecto       | Lenguaje   | Frameworks/Librerías     | Estado         | Prioridad | Fecha Límite |
| -------------- | ---------- | ------------------------ | -------------- | --------- | ------------ |
| **Web App**    | TypeScript | React, Next.js, Tailwind | ✅ Completado  | Alta      | 2025-06-30   |
| **API REST**   | Python     | FastAPI, SQLAlchemy      | 🔄 En progreso | Alta      | 2025-07-15   |
| **Mobile App** | Dart       | Flutter, Provider        | ⏳ Pendiente   | Media     | 2025-08-01   |
| **Dashboard**  | JavaScript | Vue.js, Vuetify          | 🔄 En progreso | Baja      | 2025-07-30   |

### Tabla con Código y Enlaces

| Comando         | Descripción           | Ejemplo                                  |
| --------------- | --------------------- | ---------------------------------------- |
| `npm install`   | Instala dependencias  | `npm install express`                    |
| `npm run build` | Construye el proyecto | Ver [documentación](https://example.com) |
| `npm test`      | Ejecuta pruebas       | `npm test -- --coverage`                 |

## Citas y Bloques

### Citas Simples

> Esta es una cita simple.

> Esta es una cita más larga que se extiende por múltiples líneas para demostrar cómo se ve el formato cuando el texto es más extenso.

### Citas Anidadas

> Esta es una cita de primer nivel.
>
> > Esta es una cita anidada dentro de la primera.
> >
> > > Y esta es una cita de tercer nivel.
>
> De vuelta al primer nivel.

### Citas con Otros Elementos

> ## Encabezado dentro de cita
>
> Puedes incluir **texto formateado** y otros elementos dentro de las citas.
>
> 1. Lista ordenada dentro de cita
> 2. Segundo elemento
>
> ```javascript
> // También código
> const ejemplo = "dentro de cita";
> ```

### Bloques de Advertencia (GitHub Style)

> **Note**
> Esto es una nota importante.

> **Warning**
> Esto es una advertencia.

> **Important**
> Esto es información crítica.

## Elementos HTML

### HTML Básico Permitido

<p>Este es un párrafo HTML <strong>con texto en negrita</strong> y <em>cursiva</em>.</p>

<div style="border: 2px solid #007acc; padding: 10px; border-radius: 5px;">
    <h4>Caja con estilo personalizado</h4>
    <p>Este contenido está dentro de un div con estilos CSS inline.</p>
</div>

### Detalles y Resumen (Collapsible)

<details>
<summary>Click para expandir</summary>

Contenido oculto que se muestra al hacer click.

```javascript
console.log("También puede contener código");
```

</details>

<details>
<summary><strong>Sección avanzada con múltiples elementos</strong></summary>

### Sub-encabezado dentro de details

-   Lista dentro de details
-   Segundo elemento

> Cita dentro de details

</details>

### Elementos de Teclado

Presiona <kbd>Ctrl</kbd> + <kbd>C</kbd> para copiar.

Para guardar: <kbd>Ctrl</kbd> + <kbd>S</kbd>

### Elementos de Marcado y Resaltado

Este texto tiene <mark>texto resaltado</mark> importante.

<small>Este texto es más pequeño.</small>

<sub>Subíndice</sub> y <sup>superíndice</sup>

### Elementos de Tiempo y Datos

<time datetime="2025-06-28">28 de Junio, 2025</time>

<data value="12345">Doce mil trescientos cuarenta y cinco</data>

## Matemáticas

### Matemáticas Inline

La ecuación de Einstein es $E = mc^2$.

La fórmula cuadrática es $x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$.

Variables: $\alpha$, $\beta$, $\gamma$, $\pi$, $\sum$, $\int$

### Bloques de Matemáticas

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

$$
\begin{aligned}
\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} &= \frac{4\pi}{c}\vec{\mathbf{j}} \\
\nabla \cdot \vec{\mathbf{E}} &= 4 \pi \rho \\
\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t} &= \vec{\mathbf{0}} \\
\nabla \cdot \vec{\mathbf{B}} &= 0
\end{aligned}
$$

### Matrices

$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
\begin{pmatrix}
x \\
y
\end{pmatrix}
=
\begin{pmatrix}
ax + by \\
cx + dy
\end{pmatrix}
$$

## Elementos Avanzados

### Líneas Horizontales

---

---

---

### Escapes y Caracteres Especiales

\*Este asterisco está escapado\*

\[Corchetes escapados\]

\`Acento grave escapado\`

### Emojis (si están soportados)

¡Hola! 👋 Este es un texto con emojis 😀 🎉 ✨

### Footnotes (Referencias a pie de página)

Este texto tiene una referencia[^1] y otra referencia[^nota-larga].

[^1]: Esta es la primera nota al pie.
[^nota-larga]: Esta es una nota más larga que puede contener múltiples párrafos.

    Incluso puede tener párrafos adicionales.

### Definiciones

Término 1
: Definición del término 1

Término 2
: Definición del término 2
: Segunda definición del mismo término

### Abreviaciones

_[HTML]: Hyper Text Markup Language
_[CSS]: Cascading Style Sheets

HTML y CSS son tecnologías fundamentales para el desarrollo web.

### Texto de Tamaño Fijo

```
Este es un bloque de texto
que mantiene el formato exacto
    incluyendo espacios y indentación
sin resaltado de sintaxis.
```

### Comentarios HTML

<!-- Este es un comentario HTML que no debería verse en el renderizado -->

### Caracteres Unicode

© ® ™ § ¶ † ‡ • … ‰ ′ ″ ‹ › « » ¿ ¡

→ ← ↑ ↓ ↔ ↕ ⇄ ⇅

α β γ δ ε ζ η θ ι κ λ μ ν ξ ο π ρ σ τ υ φ χ ψ ω

### Código con Números de Línea

```javascript {.line-numbers}
function ejemploConNumeros() {
    const array = [1, 2, 3, 4, 5];

    return array
        .filter((x) => x % 2 === 0)
        .map((x) => x * 2)
        .reduce((acc, val) => acc + val, 0);
}
```

---

## Conclusión

Este documento contiene **todos los elementos posibles** de Markdown para probar exhaustivamente el visualizador:

-   ✅ **6 niveles de encabezados**
-   ✅ **Formateo de texto** (negrita, cursiva, tachado)
-   ✅ **Listas complejas** (ordenadas, no ordenadas, tareas, anidadas)
-   ✅ **Enlaces** (simples, con título, referencias, internos)
-   ✅ **Imágenes** (simples, con título, referencias, con enlaces)
-   ✅ **Código** (inline, bloques con múltiples lenguajes)
-   ✅ **Tablas** (básicas, con alineación, complejas)
-   ✅ **Citas** (simples, anidadas, con elementos)
-   ✅ **HTML embebido**
-   ✅ **Matemáticas** (LaTeX/KaTeX)
-   ✅ **Elementos avanzados** (footnotes, definiciones, abreviaciones)

¡Este documento es perfecto para verificar que todos los elementos se renderizan correctamente! 🎉
