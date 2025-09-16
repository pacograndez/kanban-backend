import { IUserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.entity";
import { db } from "../firebase.config";

/**
 * @class FSUserRepository
 * @description Implementación del repositorio de usuarios utilizando Firebase Firestore.
 * @implements {IUserRepository}
 */
export class FSUserRepository implements IUserRepository {
  /**
   * @private
   * @readonly
   * @property {FirebaseFirestore.CollectionReference} collection - Referencia a la colección 'users'.
   */
  private readonly collection = db.collection("users");

  /**
   * @method create
   * @description Crea un nuevo documento de usuario en Firestore.
   * @param {User} user - La entidad User a guardar.
   * @return {Promise<User>} La entidad User con el ID asignado por Firestore.
   */
  public async create(user: User): Promise<User> {
    const userObject = {
      email: user.email,
      createdAt: user.createdAt,
    };
    const docRef = await this.collection.add(userObject);

    return new User(docRef.id, user.email, user.createdAt);
  }

  /**
   * @method findByEmail
   * @description Busca un usuario en Firestore por su email.
   * @param {string} email - El email a buscar.
   * @return {Promise<User | null>} La entidad User si se encuentra, o null.
   */
  public async findByEmail(email: string): Promise<User | null> {
    const query = await this.collection
      .where("email", "==", email)
      .limit(1)
      .get();

    if (query.empty) {
      return null;
    }

    const doc = query.docs[0];

    try {
      return User.fromObject({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error(
        `Error al reconstruir el usuario ${doc.id} desde Firestore:`,
        error,
      );
      return null;
    }
  }

  /**
   * @method findById
   * @description Encuentra un usuario por su ID único de documento.
   * @param {string} id - El ID del documento del usuario a buscar.
   * @return {Promise<User | null>} La entidad User si se encuentra, o null.
   */
  public async findById(id: string): Promise<User | null> {
    const docRef = this.collection.doc(id);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      return null;
    }

    try {
      return User.fromObject({ id: docSnapshot.id, ...docSnapshot.data() });
    } catch (error) {
      console.error(
        `Error al reconstruir el usuario ${id} desde Firestore:`,
        error,
      );
      return null;
    }
  }
}
