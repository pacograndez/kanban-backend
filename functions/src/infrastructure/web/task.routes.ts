import { Router } from "express";
import { validate } from "./middlewares/validation.middleware";
import {
  createTaskSchema,
  deleteTaskSchema,
  findTasksByUserSchema,
  updateTaskSchema,
} from "../../domain/schemas/task.schema";
import { taskController } from "../../application/controllers/task.controller";
import { verifyAuthToken } from "./middlewares/auth.middleware";

/**
 * @file Contiene las definiciones de las rutas para los endpoints de tareas.
 * @description Este enrutador maneja todas las peticiones dirigidas a la gestión de tareas.
 * Es un ejemplo clave de cómo aplicar seguridad, ya que todas las rutas aquí definidas
 * están protegidas por el middleware de autenticación `verifyAuthToken`.
 */

/**
 * @constant taskRouter
 * @description Instancia del enrutador de Express para los endpoints de tareas.
 */
// eslint-disable-next-line new-cap
const router = Router();

// Aplica el middleware de autenticación a TODAS las rutas definidas en este archivo.
// Cualquier petición a /api/tasks/... deberá pasar primero por la verificación del token.
router.use(verifyAuthToken);

/**
 * @route POST /
 * @description Endpoint para crear una nueva tarea para el usuario autenticado.
 * @middleware validate - Valida el cuerpo de la petición contra `createTaskSchema`.
 */
router.post("/", validate(createTaskSchema), taskController.create);

/**
 * @route GET /
 * @description Endpoint para obtener todas las tareas del usuario autenticado.
 * No necesita parámetros adicionales, ya que el ID del usuario se obtiene del token.
 */
router.get("/", validate(findTasksByUserSchema), taskController.findByUser);

/**
 * @route PUT /:taskId
 * @description Endpoint para actualizar una tarea existente.
 * @middleware validate - Valida el `taskId` de la URL y los campos del cuerpo de la petición.
 */
router.put("/:taskId", validate(updateTaskSchema), taskController.update);

/**
 * @route DELETE /:taskId
 * @description Endpoint para eliminar una tarea existente.
 * @middleware validate - Valida el `taskId` de la URL.
 */
router.delete("/:taskId", validate(deleteTaskSchema), taskController.delete);

/**
 * @export taskRouter
 * @description Exporta el enrutador configurado para ser utilizado en la aplicación principal de Express.
 */
export { router as taskRoutes };
