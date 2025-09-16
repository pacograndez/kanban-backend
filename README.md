# Backend de la Aplicación de Tareas (To-Do App)
Este repositorio contiene el código fuente del backend para una aplicación de lista de tareas, construido con Node.js, Express, TypeScript y Firebase (Cloud Functions y Firestore). El proyecto sigue los principios de Arquitectura Limpia para asegurar un código desacoplado, mantenible y altamente testeable.

## Características Principales

- Arquitectura Limpia: Separación clara de capas (Dominio, Aplicación, Infraestructura).

- TypeScript: Tipado estricto para un código más robusto y seguro.

- Firebase: Uso de Cloud Functions para el servidor y Firestore como base de datos NoSQL.

- Autenticación Segura: Gestión de usuarios y protección de endpoints mediante Firebase Authentication y tokens JWT.

- Validación de Datos: Uso de Zod para validar todas las peticiones entrantes a la API.

- Código Documentado: Documentación completa en formato JSDoc en todas las clases y métodos.

- Entorno de Pruebas: Cobertura de pruebas unitarias (Jest) para la lógica de negocio y pruebas de integración (Supertest) para los endpoints de la API.

- Gestión de Secretos: Manejo seguro de credenciales para entornos de desarrollo y producción.

## Configuración del Entorno de Desarrollo
Sigue estos pasos para configurar y ejecutar el proyecto en tu máquina local.

### Prerrequisitos
- Node.js (versión 18 o superior)

- npm (usualmente incluido con Node.js)

- Firebase CLI (npm install -g firebase-tools)

- Java JDK (versión 11 o superior) para los emuladores de Firebase.

### Pasos de Instalación
1. Clonar el Repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
cd kanban-backend
```

2. Instalar Dependencias de la Raíz:
Estas son las herramientas para orquestar el flujo de desarrollo.

```bash
npm install
```

3. Instalar Dependencias de las Funciones:
Estas son las dependencias de la API en sí.

```bash
npm install --prefix functions
```

4. Configurar Credenciales Locales (IMPORTANTE):

- Sigue la guía de Firebase para generar un archivo de clave de cuenta de servicio (JSON).

- Coloca el archivo descargado en la raíz del proyecto (kanban-backend/).

- Renombra el archivo a serviceAccountKey.json.

- Este archivo ya está incluido en el .gitignore y nunca debe ser subido a un repositorio.

## Ejecución del Proyecto
Para iniciar el entorno de desarrollo completo (compilador de TypeScript en modo "watch" y los emuladores de Firebase), ejecuta un único comando desde la raíz del proyecto:

```bash
npm run dev
```

Este comando hará lo siguiente:

- Compilará el proyecto de TypeScript.

- Iniciará el compilador en modo de vigilancia para recompilar automáticamente al guardar cambios.

- Iniciará los emuladores de Auth, Functions y Firestore.

- Los datos de Firestore se guardarán en la carpeta ./.firebase/emulator-data al detener el proceso.

## Documentación de la API
La API se ejecuta localmente en el emulador de Functions. Usa la siguiente URL base para todas las peticiones:
http://127.0.0.1:5001/[TU_ID_DE_PROYECTO]/api

### Endpoints de Usuarios
Estas rutas son públicas y se usan para el flujo de autenticación.

Método

Ruta

Descripción

Body (Ejemplo)

POST

/api/users

Crea un usuario si no existe y devuelve un token personalizado.

{ "email": "test@example.com" }

GET

/api/users/exists/:email

Verifica si un email ya está registrado.

N/A

### Endpoints de Tareas
Requieren Autenticación. Todas las peticiones a estas rutas deben incluir una cabecera Authorization: Bearer <ID_TOKEN>.

Método

Ruta

Descripción

Body (Ejemplo)

POST

/api/tasks

Crea una nueva tarea para el usuario autenticado.

{ "title": "Mi Tarea", "description": "Detalles" }

GET

/api/tasks

Obtiene la lista de tareas del usuario autenticado.

N/A

PUT

/api/tasks/:taskId

Actualiza una tarea existente.

{ "title": "Título actualizado", "completed": true }

DELETE

/api/tasks/:taskId

Elimina una tarea existente.

N/A

## Ejecución de Pruebas
Para ejecutar todas las pruebas unitarias y de integración, navega a la carpeta functions y ejecuta:

```bash
cd functions
npm test
```
