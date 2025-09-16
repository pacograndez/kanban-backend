import express from "express";
import cors from "cors";
import { userRoutes } from "./infrastructure/web/user.routes";
import { taskRoutes } from "./infrastructure/web/task.routes";

/**
 * @file Contiene la configuración y creación de la aplicación de Express.
 * @description Al separar la creación de la app de la exportación de la Cloud Function,
 * podemos importar la 'app' directamente en nuestros archivos de prueba de integración.
 */

// 1. Crear la instancia de la aplicación.
const app = express();

// 2. Aplicar middlewares globales.
app.use(cors({ origin: true }));
app.use(express.json());

// 3. Registrar los enrutadores.
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

// 4. Exportar la app para que pueda ser usada por index.ts y por nuestras pruebas.
export { app };
