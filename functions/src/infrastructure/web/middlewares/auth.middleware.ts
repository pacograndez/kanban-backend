import { Request, Response, NextFunction } from "express";
import { auth } from "../../firebase.config";

/**
 * @function verifyAuthToken
 * @description Middleware para verificar el Token de ID de Firebase enviado en la cabecera `Authorization`.
 * @description Si el token es válido, extrae la información del usuario decodificada y la adjunta a
 * la respuesta local (`res.locals.user`) para que los siguientes manejadores (controladores) puedan acceder a ella.
 * Si el token es inválido o no se proporciona, detiene la petición y envía una respuesta de error 401.
 * @param {Request} req - El objeto de la petición de Express.
 * @param {Response} res - El objeto de la respuesta de Express.
 * @param {NextFunction} next - La función para pasar al siguiente middleware o controlador.
 * @returns {Promise<void>}
 */

export const verifyAuthToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      message: "No autorizado: Token no proporcionado o en formato incorrecto.",
    });
    return;
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await auth.verifyIdToken(idToken);

    res.locals.user = decodedToken;

    next();
  } catch (error) {
    console.error("Error al verificar el token de autenticación:", error);
    res
      .status(401)
      .json({ message: "No autorizado: Token inválido o expirado." });
  }
};
