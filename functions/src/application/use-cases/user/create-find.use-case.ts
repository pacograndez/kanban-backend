import { User } from "../../../domain/entities/user.entity";
import { IUserRepository } from "../../../domain/repositories/user.repository";
import { auth } from "../../../infrastructure/firebase.config";

/**
 * @class CreateOrFindUserUseCase
 * @description Orquesta el proceso de login/registro. Busca un usuario en Firestore por su email,
 * lo crea si no existe, y luego genera un token de autenticación personalizado para él.
 */
export class CreateOrFindUserUseCase {
  /**
   * @constructor
   * @param {IUserRepository} userRepository - Implementación de la interfaz IUserRepository.
   */
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * @method execute
   * @description Ejecuta la lógica del caso de uso.
   * @param {string} email - El email del usuario a buscar o crear.
   * @return {Promise<{ customToken: string, created: boolean }>} Un objeto que contiene el token personalizado
   * y un booleano indicando si el usuario fue recién creado en Firestore.
   */
  async execute(
    email: string,
  ): Promise<{ customToken: string; created: boolean }> {
    let fsUser = await this.userRepository.findByEmail(email);
    let wasUserCreatedInFS = false;

    if (!fsUser) {
      const newUser = new User("", email, new Date());
      fsUser = await this.userRepository.create(newUser);
      wasUserCreatedInFS = true;
    }

    let authUserUid: string;

    try {
      const authUser = await auth.getUserByEmail(email);
      authUserUid = authUser.uid;
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        const newAuthUser = await auth.createUser({
          uid: fsUser.id,
          email: fsUser.email,
        });
        authUserUid = newAuthUser.uid;
      } else {
        throw error;
      }
    }

    const customToken = await auth.createCustomToken(authUserUid);

    return { customToken, created: wasUserCreatedInFS };
  }
}
