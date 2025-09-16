import { User } from "../entities/user.entity";

/**
 * @interface IUserRepository
 * @description Define el contrato para el repositorio de Usuarios, desacoplando la lógica de negocio
 * de la implementación de la base de datos.
 */
export interface IUserRepository {
  /**
   * @method create
   * @description Crea un nuevo usuario en el almacén de datos.
   * @param {User} user - La entidad User a persistir.
   * @returns {Promise<User>} Una promesa que resuelve a la entidad User creada.
   */
  create(user: User): Promise<User>;

  /**
   * @method findByEmail
   * @description Busca un usuario por su dirección de correo electrónico.
   * @param {string} email - El email a buscar.
   * @returns {Promise<User | null>} Una promesa que resuelve a la entidad User si se encuentra, o null.
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * @method findById
   * @description Busca un usuario por su identificador único.
   * @param {string} id - El ID del usuario a buscar.
   * @returns {Promise<User | null>} Una promesa que resuelve a la entidad User si se encuentra, o null.
   */
  findById(id: string): Promise<User | null>;
}
