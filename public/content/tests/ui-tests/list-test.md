# Test de Listas Anidadas

Este archivo está diseñado para probar específicamente el formato de listas anidadas como las que aparecen en el archivo SonarQube.

## Ejemplo del Problema Original

5. **Acceder a la Interfaz Web de SonarQube y Configurar Credenciales Iniciales:**

    - **Acción:** Abre un navegador web y navega a la URL del servidor SonarQube. Cambia las credenciales por defecto.
    - **URL:** `http://localhost:9000`
    - **Credenciales por defecto:** `admin` / `admin`
    - **Proceso:** Inicia sesión con las credenciales por defecto. El sistema te pedirá automáticamente que cambies la contraseña. Realiza este cambio.

## Otro Ejemplo de Lista Compleja

1. **Crear un Proyecto en SonarQube:**

    - **Acción:** Dentro de la interfaz web de SonarQube (`http://localhost:9000`), crea un nuevo proyecto.
    - **Proceso:** Haz clic en "Create new project". Sigue el asistente, proporciona un "Project key" y un "Display name". Selecciona la opción de "Locally" para la configuración manual.

2. **Generar un Token de Proyecto:**

    - **Acción:** Durante el proceso de creación del proyecto en SonarQube, se te pedirá generar un token para la autenticación del análisis.
    - **Proceso:** Proporciona un nombre para el token y haz clic en "Generate". **Copia este token de inmediato**, ya que solo se mostrará una vez. Guárdalo de forma segura.

## Lista Simple para Comparación

-   Elemento 1
-   Elemento 2
-   Elemento 3
    -   Sub-elemento A
    -   Sub-elemento B
    -   Sub-elemento C
        -   Sub-sub-elemento I
        -   Sub-sub-elemento II

## Lista Numerada Simple

1. Primer item
2. Segundo item
3. Tercer item
    1. Sub-item 1
    2. Sub-item 2
    3. Sub-item 3
        1. Sub-sub-item a
        2. Sub-sub-item b
