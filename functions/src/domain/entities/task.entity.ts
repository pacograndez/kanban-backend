import { z } from "zod";

/**
 * @class Task
 * @description Representa la entidad Task en la capa de dominio.
 * Se auto-valida para garantizar que nunca exista una tarea inválida en el sistema.
 * @implements {Task}
 */
export class Task {
  private _id: string;
  private _title: string;
  private _description: string;
  private _completed: boolean;
  private _createdAt: Date;
  private _userId: string;

  /**
   * @private
   * @static
   * @property {z.ZodString} titleSchema - Esquema de validación para el título de la tarea.
   * @description Define que el título debe ser un string, no puede estar vacío después de limpiar los espacios,
   * y proporciona un mensaje de error personalizado.
   */
  private static titleSchema = z
    .string()
    .min(1, { message: "El título es requerido y no puede estar vacío." })
    .trim();

  /**
   * @private
   * @static
   * @property {z.ZodString} descriptionSchema - Esquema de validación para la descripción de la tarea.
   * @description Define que la descripción es un string y limpia los espacios en blanco de los extremos.
   */
  private static descriptionSchema = z.string().trim();

  /**
   * @private
   * @static
   * @property {z.ZodString} userIdSchema - Esquema de validación para el ID del usuario.
   * @description Define que el `userId` es un string y no puede estar vacío. Es una regla de negocio
   * crítica para mantener la integridad relacional de los datos.
   */
  private static userIdSchema = z
    .string()
    .min(1, { message: "El userId es requerido." });

  /* eslint-disable require-jsdoc */
  public get id(): string {
    return this._id;
  }
  public get title(): string {
    return this._title;
  }
  public get description(): string {
    return this._description;
  }
  public get completed(): boolean {
    return this._completed;
  }
  public get createdAt(): Date {
    return this._createdAt;
  }
  public get userId(): string {
    return this._userId;
  }
  /* eslint-disable require-jsdoc */

  /**
   * @constructor
   * @description Construye una nueva instancia de Task.
   * @param {string} id - El identificador único de la tarea.
   * @param {string} title - El título de la tarea.
   * @param {string} description - La descripción de la tarea.
   * @param {boolean} completed - El estado de completado de la tarea.
   * @param {Date} createdAt - La fecha de creación de la tarea.
   * @param {string} userId - El ID del usuario al que pertenece la tarea.
   * @throws {ValidationError} Si el título o el userId son inválidos.
   */
  constructor(
    id: string,
    title: string,
    description: string,
    completed: boolean,
    createdAt: Date,
    userId: string,
  ) {
    const titleValidation = Task.titleSchema.safeParse(title);
    if (!titleValidation.success)
      throw new Error(titleValidation.error.issues[0].message);

    const userIdValidation = Task.userIdSchema.safeParse(userId);
    if (!userIdValidation.success)
      throw new Error(userIdValidation.error.issues[0].message);

    this._id = id;
    this._title = titleValidation.data;
    this._description = Task.descriptionSchema.parse(description);
    this._completed = completed;
    this._createdAt = createdAt;
    this._userId = userId;
  }

  /**
   * @static
   * @method fromObject
   * @description Método de fábrica estático para crear una Task de forma segura desde un objeto plano.
   * @param {object} obj - El objeto con los datos de la tarea.
   * @return {Task} Una nueva instancia de la clase Task.
   * @throws {ValidationError} Si alguno de los datos requeridos es inválido o falta.
   */
  public static fromObject(obj: { [key: string]: any }): Task {
    const { id, title, description, completed, createdAt, userId } = obj;

    if (!id || typeof id !== "string") throw new Error("El ID es requerido.");

    if (!title || typeof title !== "string")
      throw new Error("El título es requerido.");

    if (!userId || typeof userId !== "string")
      throw new Error("El userId es requerido.");

    if (!createdAt || typeof createdAt.toDate !== "function")
      throw new Error("La fecha de creación (createdAt) es inválida.");

    return new Task(
      id,
      title,
      description ?? "",
      completed ?? false,
      createdAt.toDate(),
      userId,
    );
  }

  /**
   * @method toObject
   * @description Convierte la instancia de la entidad a un objeto plano para serialización.
   * @return {object} Un objeto con las propiedades públicas de la tarea.
   */
  public toObject(): {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    createdAt: string;
    userId: string;
    // eslint-disable-next-line indent
  } {
    return {
      id: this._id,
      title: this._title,
      description: this._description,
      completed: this._completed,
      createdAt: this._createdAt.toISOString(),
      userId: this._userId,
    };
  }
}
