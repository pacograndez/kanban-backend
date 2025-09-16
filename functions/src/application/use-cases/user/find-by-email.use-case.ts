import { IUserRepository } from "../../../domain/repositories/user.repository";

/**
 * @file Contiene el caso de uso para verificar si un usuario existe por su email.
 * @description Este caso de uso responde a la pregunta de si un email ya está registrado en el sistema.
 */

/**
 * @class FindUserByEmailUseCase
 * @description Encapsula la lógica de negocio para verificar la existencia de un usuario.
 */
export class FindUserByEmailUseCase {
  /**
   * @constructor
   * @param {IUserRepository} userRepository - Una implementación de la interfaz IUserRepository.
   */
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * @method execute
   * @description Ejecuta la lógica de verificación.
   * @param {string} email - El email a verificar.
   * @return {Promise<boolean>} Una promesa que resuelve a `true` si el usuario existe, `false` en caso contrario.
   */
  async execute(email: string): Promise<boolean> {
    const user = await this.userRepository.findByEmail(email);

    return user !== null;
  }
}
