import { z } from "zod";

/**
 * @file Contiene los esquemas de validación de Zod para la entidad Task.
 * @description Centraliza todas las reglas de validación para las peticiones
 * HTTP relacionadas con las tareas, manteniendo la lógica de validación
 * dentro de la capa de Dominio.
 */

/**
 * @constant createTaskSchema
 * @description Esquema para validar el cuerpo (body) al crear una nueva tarea.
 * @property {object} body - Define las reglas para el objeto `req.body`.
 * @property {string} body.title - El título es requerido y no puede estar vacío.
 * @property {string} [body.description] - La descripción es opcional, con un valor por defecto.
 */
export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string({ message: "El título es requerido." })
      .trim()
      .min(1, { message: "El título no puede estar vacío." }),
    description: z.string().trim().optional().default(""),
  }),
});

/**
 * @constant updateTaskSchema
 * @description Esquema para validar la petición al actualizar una tarea.
 * @property {object} params - Define las reglas para los parámetros de la URL (`req.params`).
 * @property {string} params.taskId - El ID de la tarea es requerido en la URL.
 * @property {object} body - Define las reglas para el cuerpo de la petición (`req.body`).
 * @property {string} [body.title] - El título es opcional para permitir actualizaciones parciales.
 * @property {string} [body.description] - La descripción es opcional.
 * @property {boolean} [body.completed] - El estado de completado es opcional.
 */
export const updateTaskSchema = z.object({
  params: z.object({
    taskId: z
      .string()
      .nonempty({ message: "El ID de la tarea es requerido en la URL." }),
  }),
  body: z.object({
    title: z
      .string()
      .trim()
      .min(1, { message: "El título no puede estar vacío." })
      .optional(),
    description: z.string().trim().optional(),
    completed: z.boolean().optional(),
  }),
});

/**
 * @constant deleteTaskSchema
 * @description Esquema para validar la petición al eliminar una tarea.
 * @property {object} params - Valida que el `taskId` venga en la URL.
 */
export const deleteTaskSchema = z.object({
  params: z.object({
    taskId: z
      .string()
      .nonempty({ message: "El ID de la tarea es requerido en la URL." }),
  }),
});

/**
 * @constant findTasksByUserSchema
 * @description Esquema para validar la petición al obtener las tareas de un usuario.
 * @description Este esquema está vacío porque la ruta (`GET /tasks`) ya no necesita
 * un `userId` en los parámetros; se obtiene directamente del token del usuario autenticado.
 */
export const findTasksByUserSchema = z.object({});
