import { Task } from "../../../domain/entities/task.entity";
import { ITaskRepository } from "../../../domain/repositories/task.repository";
import { IUserRepository } from "../../../domain/repositories/user.repository";

/**
 * @class FindTasksByUserUseCase
 * @description Contiene la lógica de negocio para encontrar todas las tareas de un usuario específico.
 * Su responsabilidad es validar que el usuario exista antes de solicitar sus tareas al repositorio.
 */
export class FindByUserkUseCase {
  /**
   * @constructor
   * @param {ITaskRepository} taskRepository - Repositorio para buscar las tareas.
   * @param {IUserRepository} userRepository - Repositorio para verificar que el usuario exista.
   */
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * @method execute
   * @description Ejecuta la lógica del caso de uso para obtener las tareas de un usuario.
   * @param {string} userId - El ID del usuario cuyas tareas se van a buscar.
   * @return {Promise<Task[]>} Una promesa que resuelve a un array de entidades Task.
   * @throws {Error} Si el usuario no se encuentra en la base de datos.
   */
  async execute(userId: string): Promise<Task[]> {
    const userExists = await this.userRepository.findById(userId);

    if (!userExists) {
      throw new Error("Usuario no encontrado.");
    }

    return this.taskRepository.findByUserId(userId);
  }
}
