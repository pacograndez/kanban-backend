import { ITaskRepository } from "../../../domain/repositories/task.repository";

/**
 * @interface DeleteTaskInput
 * @description Define la estructura de datos de entrada para el caso de uso de eliminación de tareas.
 * @property {string} taskId - El ID de la tarea a eliminar.
 * @property {string} userId - El ID del usuario que solicita la eliminación.
 */
interface DeleteTaskInput {
  taskId: string;
  userId: string;
}

/**
 * @class DeleteTaskUseCase
 * @description Contiene la lógica de negocio para la eliminación de una tarea.
 * Su responsabilidad es validar que la tarea exista y que el usuario solicitante
 * tenga permiso para eliminarla antes de orquestar la operación de borrado.
 */
export class DeleteTaskUseCase {
  /**
   * @constructor
   * @param {ITaskRepository} taskRepository - Repositorio para operaciones de persistencia de tareas.
   */
  constructor(private readonly taskRepository: ITaskRepository) {}

  /**
   * @method execute
   * @description Ejecuta la lógica para eliminar una tarea. Valida la existencia de la tarea
   * y la pertenencia al usuario antes de proceder con la eliminación.
   * @param {DeleteTaskInput} input - Los datos necesarios para la eliminación.
   * @return {Promise<void>} Una promesa que se resuelve cuando la eliminación ha sido completada.
   * @throws {Error} Si la tarea no se encuentra.
   * @throws {Error} Si el usuario no está autorizado para eliminar la tarea.
   */
  async execute(input: DeleteTaskInput): Promise<void> {
    const existingTask = await this.taskRepository.findById(input.taskId);

    if (!existingTask) {
      throw new Error("Tarea no encontrada.");
    }

    if (existingTask.userId !== input.userId) {
      throw new Error("Acción no autorizada.");
    }

    await this.taskRepository.delete(input.taskId);
  }
}
