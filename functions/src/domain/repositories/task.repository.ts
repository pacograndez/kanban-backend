import { Task } from "../entities/task.entity";

/**
 * @interface ITaskRepository
 * @description Define el contrato CRUD para el repositorio de Tareas.
 * Este contrato desacopla la lógica de negocio de la implementación
 * específica de la base de datos.
 */
export interface ITaskRepository {
  /**
   * @method create
   * @description Crea una nueva tarea en el almacén de datos.
   * @param {Task} task - La entidad Task a crear.
   * @returns {Promise<Task>} Una promesa que resuelve a la entidad Task creada,
   * incluyendo el ID asignado por la base de datos.
   */
  create(task: Task): Promise<Task>;

  /**
   * @method findByUserId
   * @description Encuentra todas las tareas asociadas a un usuario específico.
   * @param {string} userId - El ID del usuario cuyas tareas se van a recuperar.
   * @returns {Promise<Task[]>} Una promesa que resuelve a un array de entidades Task.
   */
  findByUserId(userId: string): Promise<Task[]>;

  /**
   * @method findById
   * @description Encuentra una única tarea por su ID único.
   * @param {string} id - El ID de la tarea a encontrar.
   * @returns {Promise<Task | null>} Una promesa que resuelve a la entidad Task si se encuentra, de lo contrario null.
   */
  findById(id: string): Promise<Task | null>;

  /**
   * @method update
   * @description Actualiza una tarea existente en el almacén de datos.
   * @param {Task} task - La entidad Task con la información actualizada.
   * @returns {Promise<Task>} Una promesa que resuelve a la entidad Task actualizada.
   */
  update(task: Task): Promise<Task>;

  /**
   * @method delete
   * @description Elimina una tarea del almacén de datos por su ID único.
   * @param {string} id - El ID de la tarea a eliminar.
   * @returns {Promise<void>} Una promesa que se resuelve cuando la eliminación está completa.
   */
  delete(id: string): Promise<void>;
}
