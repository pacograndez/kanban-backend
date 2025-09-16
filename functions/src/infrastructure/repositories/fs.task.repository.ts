import { Task } from "../../domain/entities/task.entity";
import { ITaskRepository } from "../../domain/repositories/task.repository";
import { db } from "../firebase.config";

/**
 * @class FSTaskRepository
 * @description Implementación concreta de ITaskRepository utilizando Firebase Firestore.
 * @implements {ITaskRepository}
 */
export class FSTaskRepository implements ITaskRepository {
  /**
   * @private
   * @readonly
   * @property {FirebaseFirestore.CollectionReference} collection - Referencia a la colección 'tasks'.
   */
  private readonly collection = db.collection("tasks");

  /**
   * @method create
   * @description Crea un nuevo documento de tarea en Firestore.
   * @param {Task} task - La entidad Task a guardar.
   * @return {Promise<Task>} La entidad Task con el ID asignado por Firestore.
   */
  public async create(task: Task): Promise<Task> {
    const taskObject = {
      title: task.title,
      description: task.description,
      completed: task.completed,
      createdAt: task.createdAt,
      userId: task.userId,
    };
    const docRef = await this.collection.add(taskObject);
    return new Task(
      docRef.id,
      task.title,
      task.description,
      task.completed,
      task.createdAt,
      task.userId,
    );
  }

  /**
   * @method findByUserId
   * @description Encuentra todas las tareas de un usuario, ordenadas por fecha de creación ascendente.
   * @param {string} userId - El ID del usuario.
   * @return {Promise<Task[]>} Un array con las tareas del usuario.
   *
   */
  public async findByUserId(userId: string): Promise<Task[]> {
    const query = await this.collection
      .where("userId", "==", userId)
      .orderBy("createdAt", "asc")
      .get();

    return query.docs
      .map((doc) => {
        try {
          return Task.fromObject({ id: doc.id, ...doc.data() });
        } catch (error) {
          console.error(`Error al reconstruir la tarea ${doc.id}:`, error);
          return null;
        }
      })
      .filter((task) => task !== null) as Task[];
  }

  /**
   * @method findById
   * @description Encuentra una única tarea por su ID.
   * @param {string} id - El ID de la tarea.
   * @return {Promise<Task | null>} La entidad Task si se encuentra, o null.
   */
  public async findById(id: string): Promise<Task | null> {
    const docRef = this.collection.doc(id);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      return null;
    }

    try {
      return Task.fromObject({ id: docSnapshot.id, ...docSnapshot.data() });
    } catch (error) {
      console.error(`Error al reconstruir la tarea ${id}:`, error);
      return null;
    }
  }

  /**
   * @method update
   * @description Actualiza los datos de una tarea existente en Firestore.
   * @param {Task} task - La entidad Task con los datos actualizados.
   * @return {Promise<Task>} La entidad Task actualizada.
   */
  public async update(task: Task): Promise<Task> {
    const docRef = this.collection.doc(task.id);

    const updateData = {
      title: task.title,
      description: task.description,
      completed: task.completed,
    };

    await docRef.update(updateData);
    return task;
  }

  /**
   * @method delete
   * @description Elimina una tarea de Firestore por su ID.
   * @param {string} id - El ID de la tarea a eliminar.
   * @return {Promise<void>}
   */
  public async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }
}
