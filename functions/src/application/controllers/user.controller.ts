import { Request, Response } from "express";
import { FSUserRepository } from "../../infrastructure/repositories/fs.user.repository";
import { CreateOrFindUserUseCase } from "../use-cases/user/create-find.use-case";
import { FindUserByEmailUseCase } from "../use-cases/user/find-by-email.use-case";
import { ValidationError } from "../../domain/entities/validation-error.entity";

/**
 * @class UserController
 * @description Controlador para manejar las peticiones HTTP relacionadas con los usuarios.
 * Orquesta el flujo entre las peticiones entrantes y los casos de uso correspondientes.
 */
export class UserController {
  /**
   * @private
   * @readonly
   * @property {FirestoreUserRepository} userRepository - Instancia del repositorio de usuarios.
   * @description Se crea una sola vez en el constructor para ser reutilizada por todos los métodos,
   * siguiendo el principio DRY y mejorando la eficiencia.
   */
  private readonly userRepository: FSUserRepository;

  /**
   * @constructor
   * @description Construye el UserController e inicializa sus dependencias (repositorios).
   */
  constructor() {
    this.userRepository = new FSUserRepository();
  }

  /**
   * @method create
   * @description Maneja el "login" o registro de un usuario y genera un token de autenticación.
   * @param {Request} req - La petición de Express. El email debe venir en `req.body`.
   * @param {Response} res - La respuesta de Express.
   * @return {Promise<void>}
   */
  public create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      const createOrFindUseCase = new CreateOrFindUserUseCase(
        this.userRepository,
      );
      const { customToken, created } = await createOrFindUseCase.execute(email);

      res.status(created ? 201 : 200).json({
        token: customToken,
        created: created,
      });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
        return;
      }

      console.error("Error al crear el usuario - UserController:", error);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  };

  /**
   * @method checkIfExists
   * @description Verifica si un usuario existe, devolviendo una respuesta booleana.
   * @param {Request} req - La petición de Express. El email debe venir en `req.params`.
   * @param {Response} res - La respuesta de Express.
   * @return {Promise<void>}
   */
  public checkIfExists = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.params;
      const doesUserExistUseCase = new FindUserByEmailUseCase(
        this.userRepository,
      );
      const exists = await doesUserExistUseCase.execute(email);

      res.status(200).json({ exists, email });
    } catch (error) {
      console.error(
        "Error validar si el usuario existe - UserController:",
        error,
      );
      res.status(500).json({ message: "Error interno del servidor." });
    }
  };
}

/**
 * @constant userController
 * @description Instancia única del UserController (patrón Singleton) para ser utilizada en toda la aplicación.
 */
export const userController = new UserController();
