import { Router } from "express";
import { validate } from "./middlewares/validation.middleware";
import { userController } from "../../application/controllers/user.controller";
import {
  createUserSchema,
  findUserSchema,
} from "../../domain/schemas/user.schema";

/**
 * @file Contiene las definiciones de las rutas para los endpoints de usuarios.
 * @description Este enrutador maneja todas las peticiones dirigidas a la gestión de usuarios,
 * aplicando los middlewares de validación correspondientes antes de pasar el control al controlador.
 * Estas rutas son públicas y no requieren autenticación.
 */

/**
 * @constant userRouter
 * @description Instancia del enrutador de Express para los endpoints de usuarios.
 */
// eslint-disable-next-line new-cap
const router = Router();

/**
 * @route POST /users
 * @description Endpoint para crear un nuevo usuario si no existe, o encontrar uno existente.
 * Se encarga del flujo de "login" o registro inicial.
 * @middleware validate - Valida el cuerpo de la petición contra `createUserSchema`.
 */
router.post("/", validate(createUserSchema), userController.create);

/**
 * @route GET /users/exists/:email
 * @description Endpoint para verificar si un usuario con un email específico ya existe en el sistema.
 * Es ideal para validaciones en tiempo real en el frontend.
 * @middleware validate - Valida los parámetros de la URL contra `findUserSchema`.
 */
router.get(
  "/exists/:email",
  validate(findUserSchema), // 1. Validar los parámetros de la URL.
  userController.checkIfExists, // 2. Si es válido, pasar al controlador.
);

/**
 * @export userRouter
 * @description Exporta el enrutador configurado para ser utilizado en la aplicación principal de Express.
 */
export { router as userRoutes };
