import { z } from "zod";
import { ValidationError } from "./validation-error.entity";

/**
 * @class User
 * @description Representa la entidad User en la capa de dominio.
 * Esta clase es responsable de mantener su propio estado consistente y válido.
 * @implements {User}
 */
export class User {
  private _id: string;
  private _email: string;
  private _createdAt: Date;

  /**
   * @private
   * @static
   * @property {z.ZodString} emailSchema - Esquema de validación estático para el email.
   * @description Utiliza la librería Zod para definir que el email debe tener un formato válido.
   */
  private static emailSchema = z.email({
    message: "Formato de email inválido",
  });

  /* eslint-disable require-jsdoc */
  public get id(): string {
    return this._id;
  }
  public get email(): string {
    return this._email;
  }
  public get createdAt(): Date {
    return this._createdAt;
  }
  /* eslint-disable require-jsdoc */

  /**
   * @constructor
   * @description Construye una nueva instancia de User.
   * @param {string} id - El identificador único del usuario.
   * @param {string} email - La dirección de correo electrónico del usuario.
   * @param {Date} createdAt - La fecha en que el usuario fue creado.
   * @throws {ValidationError} Si el email no tiene un formato válido.
   */
  constructor(id: string, email: string, createdAt: Date) {
    const validationResult = User.emailSchema.safeParse(email);
    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.issues[0].message);
    }

    this._id = id;
    this._email = email.toLowerCase();
    this._createdAt = createdAt;
  }

  /**
   * @static
   * @method fromObject
   * @description Método de fábrica estático para crear un User de forma segura desde un objeto plano.
   * @param {object} obj - El objeto con los datos del usuario.
   * @return {User} Una nueva instancia de la clase User.
   * @throws {ValidationError} Si alguno de los datos requeridos es inválido o falta.
   */
  public static fromObject(obj: { [key: string]: any }): User {
    const { id, email, createdAt } = obj;

    if (!id || typeof id !== "string")
      throw new Error("El ID es requerido y debe ser un string.");

    if (!email || typeof email !== "string")
      throw new Error("El email es requerido y debe ser un string.");

    if (!createdAt || typeof createdAt.toDate !== "function")
      throw new Error(
        "La fecha de creación (createdAt) es inválida o no existe.",
      );

    return new User(id, email, createdAt.toDate());
  }

  /**
   * @method toObject
   * @description Convierte la instancia de la entidad a un objeto plano sin guiones bajos.
   * @return {{id: string, email: string, createdAt: string}} Un objeto con las propiedades públicas del usuario.
   */
  public toObject(): { id: string; email: string; createdAt: string } {
    return {
      id: this._id,
      email: this._email,
      createdAt: this._createdAt.toISOString(),
    };
  }
}
