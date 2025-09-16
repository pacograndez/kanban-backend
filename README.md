# Backend de la Aplicación de Tareas (To-Do App)

Este repositorio contiene el código fuente del backend para una aplicación de lista de tareas, construido con Node.js, Express, TypeScript y Firebase (Cloud Functions y Firestore). El proyecto sigue los principios de Arquitectura Limpia para asegurar un código desacoplado, mantenible y altamente testeable.

## Características Principales

* **Arquitectura Limpia:** Separación clara de capas (Dominio, Aplicación, Infraestructura).

* **TypeScript:** Tipado estricto para un código más robusto y seguro.

* **Firebase:** Uso de Cloud Functions para el servidor y Firestore como base de datos NoSQL.

* **Autenticación Segura:** Gestión de usuarios y protección de endpoints mediante Firebase Authentication y tokens JWT.

* **Validación de Datos:** Uso de Zod para validar todas las peticiones entrantes a la API.

* **Código Documentado:** Documentación completa en formato JSDoc en todas las clases y métodos.

* **Entorno de Pruebas:** Cobertura de pruebas unitarias (Jest) para la lógica de negocio y pruebas de integración (Supertest) para los endpoints de la API.

* **Gestión de Secretos:** Manejo seguro de credenciales para entornos de desarrollo y producción.

## Configuración del Entorno de Desarrollo

Sigue estos pasos para configurar y ejecutar el proyecto en tu máquina local.

### Prerrequisitos

* Node.js (versión 18 o superior)

* npm (usualmente incluido con Node.js)

* Firebase CLI (`npm install -g firebase-tools`)

* Java JDK (versión 11 o superior) para los emuladores de Firebase.

### Pasos de Instalación

1. **Clonar el Repositorio:**