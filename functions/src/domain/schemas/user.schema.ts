import { z } from "zod";

/**
 * @file Contiene los esquemas de validación de Zod para la entidad User.
 * @description Centraliza todas las reglas de validación de datos para las peticiones HTTP
 * relacionadas con los usuarios, manteniendo las reglas de negocio en la capa de Dominio.
 */

/**
 * @constant createUserSchema
 * @description Esquema para validar el cuerpo (body) de la petición al crear un usuario.
 * @property {object} body - Define que las reglas se aplican al objeto `req.body`.
 * @property {string} body.email - Reglas específicas para el campo email.
 */
export const createUserSchema = z.object({
  body: z.object({
    email: z
      .email({ message: "Formato de email inválido" })
      .nonempty({ message: "El email es requerido" })
      .trim()
      .toLowerCase(),
  }),
});

/**
 * @constant findUserSchema
 * @description Esquema para validar los parámetros (params) de la ruta al buscar un usuario.
 * @property {object} params - Define que las reglas se aplican al objeto `req.params`.
 * @property {string} params.email - Reglas específicas para el parámetro de ruta 'email'.
 */
export const findUserSchema = z.object({
  params: z.object({
    email: z
      .email("El email en la URL tiene un formato inválido.")
      .nonempty({ message: "El email es requerido." })
      .toLowerCase(),
  }),
});
