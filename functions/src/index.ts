import * as functions from "firebase-functions";
import { app } from "./app"; // Importamos la app de Express ya configurada

/**
 * @file Punto de entrada principal para la API de Cloud Functions.
 * @description Su única responsabilidad es importar la aplicación de Express
 * configurada en `app.ts` y exportarla como una Cloud Function HTTP para
 * su despliegue en Firebase. Esta separación es clave para permitir
 * las pruebas de integración.
 */

/**
 * @constant api
 * @description Exporta la aplicación de Express (`app`) como una Cloud Function HTTP.
 * Firebase se encargará de dirigir todas las peticiones HTTP entrantes a esta función.
 */
export const api = functions.https.onRequest(app);
