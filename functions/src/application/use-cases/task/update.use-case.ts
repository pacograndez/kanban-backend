import { Task } from "../../../domain/entities/task.entity";
import { ITaskRepository } from "../../../domain/repositories/task.repository";

/**
 * @interface UpdateTaskInput
 * @description Define la estructura de datos de entrada para el caso de uso de actualización de tareas.
 * @property {string} taskId - El ID de la tarea a actualizar.
 * @property {string} userId - El ID del usuario que solicita la actualización.
 * @property {string} [title] - El nuevo título opcional para la tarea.
 * @property {string} [description] - La nueva descripción opcional para la tarea.
 * @property {boolean} [completed] - El nuevo estado de completado opcional para la tarea.
 */
interface UpdateTaskInput {
  taskId: string;
  userId: string;
  title?: string;
  description?: string;
  completed?: boolean;
}

/**
 * @class UpdateTaskUseCase
 * @description Contiene la lógica de negocio para la actualización de una tarea existente.
 * Valida la existencia de la tarea y los permisos del usuario antes de persistir los cambios.
 */
export class UpdateTaskUseCase {
  /**
   * @constructor
   * @param {ITaskRepository} taskRepository - Repositorio para operaciones de persistencia de tareas.
   */
  constructor(private readonly taskRepository: ITaskRepository) {}

  /**
   * @method execute
   * @description Ejecuta la lógica para actualizar una tarea. Valida la existencia, la pertenencia,
   * crea una nueva entidad actualizada con los cambios y la persiste.
   * @param {UpdateTaskInput} input - Los datos de la tarea a actualizar.
   * @return {Promise<Task>} Una promesa que resuelve a la entidad Task actualizada.
   * @throws {Error} Si la tarea no se encuentra.
   * @throws {Error} Si el usuario no está autorizado para modificar la tarea.
   */
  async execute(input: UpdateTaskInput): Promise<Task> {
    const existingTask = await this.taskRepository.findById(input.taskId);

    if (!existingTask) {
      throw new Error("Tarea no encontrada.");
    }

    if (existingTask.userId !== input.userId) {
      throw new Error("Acción no autorizada.");
    }

    const updatedTaskEntity = new Task(
      existingTask.id,
      input.title ?? existingTask.title,
      input.description ?? existingTask.description,
      input.completed ?? existingTask.completed,
      existingTask.createdAt,
      existingTask.userId,
    );

    return this.taskRepository.update(updatedTaskEntity);
  }
}
