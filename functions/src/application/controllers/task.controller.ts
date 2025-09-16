import { Request, Response } from "express";
import { FSTaskRepository } from "../../infrastructure/repositories/fs.task.repository";
import { CreateTaskUseCase } from "../use-cases/task/create.use-case";
import { FSUserRepository } from "../../infrastructure/repositories/fs.user.repository";
import { UpdateTaskUseCase } from "../use-cases/task/update.use-case";
import { DeleteTaskUseCase } from "../use-cases/task/delete.use-case";
import { FindByUserkUseCase } from "../use-cases/task/find-by-user.use-case";

/**
 * @class TaskController
 * @description Controlador para manejar las peticiones HTTP relacionadas con las tareas.
 * Orquesta el flujo de datos entre la capa de infraestructura (HTTP) y la capa de dominio (casos de uso).
 */
export class TaskController {
  /**
   * @private
   * @readonly
   * @property {FirestoreTaskRepository} taskRepository - Instancia del repositorio de tareas.
   */
  private readonly taskRepository: FSTaskRepository;

  /**
   * @private
   * @readonly
   * @property {FirestoreUserRepository} userRepository - Instancia del repositorio de usuarios.
   */
  private readonly userRepository: FSUserRepository;

  /**
   * @constructor
   * @description Construye el TaskController e inicializa sus dependencias (repositorios).
   * Se instancian una sola vez para ser reutilizadas en todos los métodos, mejorando la eficiencia.
   */
  constructor() {
    this.taskRepository = new FSTaskRepository();
    this.userRepository = new FSUserRepository();
  }

  /**
   * @method create
   * @description Maneja la creación de una nueva tarea para el usuario autenticado.
   * @param {Request} req - La petición de Express. Los datos de la tarea vienen en `req.body`.
   * @param {Response} res - La respuesta de Express.
   * @return {Promise<void>}
   */
  public create = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = res.locals.user.uid;
      const { title, description } = req.body;
      const createTaskUseCase = new CreateTaskUseCase(
        this.taskRepository,
        this.userRepository,
      );

      const createdTask = await createTaskUseCase.execute({
        title,
        description,
        userId,
      });
      res.status(201).json(createdTask.toObject());
    } catch (error: any) {
      if (
        error.message ===
        "No se puede crear una tarea para un usuario que no existe."
      ) {
        res.status(404).json({ message: error.message });
        return;
      }
      console.error("Error al crear la tarea - TaskController:", error);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  };

  /**
   * @method update
   * @description Maneja la actualización de una tarea existente.
   * @param {Request} req - La petición de Express. El ID de la tarea viene en `req.params`.
   * @param {Response} res - La respuesta de Express.
   * @return {Promise<void>}
   */
  public update = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = res.locals.user.uid;
      const { taskId } = req.params;
      const { title, description, completed } = req.body;
      const updateTaskUseCase = new UpdateTaskUseCase(this.taskRepository);

      const updateTask = await updateTaskUseCase.execute({
        taskId,
        userId,
        title,
        description,
        completed,
      });

      res.status(200).json(updateTask.toObject());
    } catch (error: any) {
      if (error.message === "Tarea no encontrada.") {
        res.status(404).json({ message: error.message });
        return;
      }

      if (error.message === "Acción no autorizada.") {
        res.status(403).json({ message: error.message });
        return;
      }

      console.error("Error al actualizar la tarea - TaskController:", error);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  };

  /**
   * @method delete
   * @description Maneja la eliminación de una tarea.
   * @param {Request} req - La petición de Express.
   * @param {Response} res - La respuesta de Express.
   * @return {Promise<void>}
   */
  public delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = res.locals.user.uid;
      const { taskId } = req.params;
      const deleteTaskUseCase = new DeleteTaskUseCase(this.taskRepository);

      await deleteTaskUseCase.execute({ taskId, userId });

      res.status(204).send();
    } catch (error: any) {
      if (error.message === "Tarea no encontrada.") {
        res.status(404).json({ message: error.message });
        return;
      }

      if (error.message === "Acción no autorizada.") {
        res.status(403).json({ message: error.message });
        return;
      }

      console.error("Error al eliminar la tarea - TaskController", error);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  };

  /**
   * @method findByUser
   * @description Maneja la búsqueda de todas las tareas del usuario autenticado.
   * @param {Request} req - La petición de Express.
   * @param {Response} res - La respuesta de Express.
   * @return {Promise<void>}
   */
  public findByUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = res.locals.user.uid;
      const findTasksByUserUseCase = new FindByUserkUseCase(
        this.taskRepository,
        this.userRepository,
      );
      const tasks = await findTasksByUserUseCase.execute(userId);
      const tasksAsObjects = tasks.map((task) => task.toObject());

      res.status(200).json(tasksAsObjects);
    } catch (error: any) {
      if (error.message === "Usuario no encontrado.") {
        res.status(404).json({ message: error.message });
        return;
      }

      console.error(
        "Error al buscar tareas por usuario - TaskController:",
        error,
      );
      res.status(500).json({ message: "Error interno del servidor." });
    }
  };
}

/**
 * @constant taskController
 * @description Instancia única del TaskController (patrón Singleton) para ser utilizada en toda la aplicación.
 */
export const taskController = new TaskController();
