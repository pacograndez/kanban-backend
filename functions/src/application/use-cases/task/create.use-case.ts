import { Task } from "../../../domain/entities/task.entity";
import { ITaskRepository } from "../../../domain/repositories/task.repository";
import { IUserRepository } from "../../../domain/repositories/user.repository";

/**
 * @interface CreateTaskInput
 * @description Define la estructura de datos de entrada para el caso de uso de creación de tareas.
 * @property {string} title - El título de la tarea.
 * @property {string} description - La descripción de la tarea.
 * @property {string} userId - El ID del usuario que crea la tarea.
 */
interface CreateTaskInput {
  title: string;
  description: string;
  userId: string;
}

/**
 * @class CreateTaskUseCase
 * @description Contiene la lógica de negocio para la creación de una nueva tarea.
 * Su responsabilidad es validar las reglas de negocio (como la existencia del usuario)
 * y orquestar la creación y persistencia de la nueva entidad Task.
 */
export class CreateTaskUseCase {
  /**
   * @constructor
   * @param {ITaskRepository} taskRepository - Repositorio para operaciones de persistencia de tareas.
   * @param {IUserRepository} userRepository - Repositorio para verificar la existencia del usuario.
   */
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * @method execute
   * @description Ejecuta la lógica para crear una tarea. Primero, valida que el usuario
   * al que se le asignará la tarea exista. Luego, crea una nueva instancia de la entidad Task
   * y la persiste en la base de datos a través del repositorio.
   * @param {CreateTaskInput} input - Los datos necesarios para crear la tarea.
   * @return {Promise<Task>} Una promesa que resuelve a la entidad Task recién creada.
   * @throws {Error} Si el usuario especificado no existe.
   */
  async execute(input: CreateTaskInput): Promise<Task> {
    const userExists = await this.userRepository.findById(input.userId);
    if (!userExists) {
      throw new Error(
        "No se puede crear una tarea para un usuario que no existe.",
      );
    }

    const newTask = new Task(
      "",
      input.title,
      input.description,
      false,
      new Date(),
      input.userId,
    );

    const createdTask = await this.taskRepository.create(newTask);

    return createdTask;
  }
}
