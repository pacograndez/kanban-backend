import * as admin from "firebase-admin";
import * as path from "path";

/**
 * @file Contiene la configuración y la inicialización centralizada de Firebase Admin SDK.
 * @description Este archivo asegura que la aplicación se inicialice una sola vez (patrón Singleton)
 * y que se conecte correctamente tanto a los emulators locales como a los servicios de producción.
 */

// - **En Desarrollo Local (`NODE_ENV === 'development'`):**
//   - Usamos el archivo `serviceAccountKey.json` para que el SDK pueda autenticarse
//     desde nuestra máquina local y comunicarse con los emuladores o servicios de Firebase.
//
// - **En Producción (cuando `NODE_ENV` no es 'development'):**
//   - El entorno de Cloud Functions ya tiene credenciales de administrador de forma
//     automática y segura. `admin.initializeApp()` sin parámetros las detecta y utiliza.
//   - El archivo `serviceAccountKey.json` no es necesario y no se despliega.

if (process.env.NODE_ENV === "development") {
  // --- ENTORNO DE DESARROLLO LOCAL ---
  console.log(
    "🛠️  Ejecutando en modo de desarrollo. Usando clave de cuenta de servicio local.",
  );

  // Construimos la ruta al archivo de clave. `__dirname` apunta a `.../functions/lib`.
  const serviceAccountPath = path.resolve(
    __dirname,
    "../../../serviceAccountKey.json",
  );

  admin.initializeApp({
    credential: admin.credential.cert(
      serviceAccountPath as admin.ServiceAccount,
    ),
    projectId: process.env.GCLOUD_PROJECT,
  });
} else {
  // --- ENTORNO DE PRODUCCIÓN ---
  console.log(
    "🚀 Ejecutando en modo de producción. Usando credenciales del entorno.",
  );
  admin.initializeApp();
}

/**
 * @constant db
 * @description Instancia de la base de datos de Firestore, exportada para que cualquier
 * parte de la aplicación pueda importarla y usarla.
 */
export const db = admin.firestore();

/**
 * @constant auth
 * @description Instancia del servicio de Autenticación de Firebase, exportada para uso global,
 * principalmente para la creación y verificación de tokens.
 */
export const auth = admin.auth();
