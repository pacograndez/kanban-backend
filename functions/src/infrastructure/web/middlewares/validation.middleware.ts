import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

/**
 * @function validate
 * @description Middleware de Express de orden superior para validar peticiones usando un esquema de Zod.
 * @description Un middleware de "orden superior" es una función que devuelve otra función. En este caso,
 * `validate` toma un esquema como argumento y devuelve un middleware configurado con ese esquema.
 * @param {z.Schema} schema - El esquema de Zod a utilizar para la validación.
 * @returns {Function} Un middleware de Express (`(req, res, next) => void`) que valida `req.body`,
 * `req.params` y `req.query` contra el esquema proporcionado.
 */

export const validate =
  (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction) => {
    try {
      // Intenta parsear y validar la petición completa contra el esquema.
      // Zod buscará las claves 'body', 'params', etc., dentro del esquema
      // y las comparará con los objetos correspondientes en `req`.
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // Si la validación es exitosa, llama a next() para pasar al siguiente
      // middleware o al controlador final.
      next();
    } catch (error) {
      // Si schema.parse() falla, lanza un error que es capturado aquí.
      if (error instanceof ZodError) {
        // Verificamos si el error es de tipo ZodError.
        // Mapeamos los problemas de validación a un único string legible.
        const errorMessages = error.issues
          .map((issue) => issue.message)
          .join(", ");
        // Devolvemos un error 400 Bad Request, que es el código estándar
        // para peticiones malformadas por parte del cliente.
        res
          .status(400)
          .json({ message: `Error de validación: ${errorMessages}` });
        return;
      }
      // Si el error no es de Zod, es algo inesperado.
      res
        .status(500)
        .json({ message: "Error interno del servidor en la validación." });
    }
  };
