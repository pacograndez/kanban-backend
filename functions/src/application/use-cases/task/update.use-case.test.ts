import { Task } from "../../../domain/entities/task.entity";
import { ITaskRepository } from "../../../domain/repositories/task.repository";
import { UpdateTaskUseCase } from "./update.use-case";

// Mock del repositorio de tareas.
const mockTaskRepository: ITaskRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Suite de pruebas para el caso de uso UpdateTask.
describe("UpdateTask UseCase", () => {
  let useCase: UpdateTaskUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateTaskUseCase(mockTaskRepository);
  });

  // --- PRUEBA 1: Flujo de actualización exitosa ---
  it("should update the task correctly if it exists and the user is the owner", async () => {
    // Arrange: Preparamos el escenario.
    const userId = "user-owner-123";
    const taskId = "task-abc";
    const existingTask = new Task(
      taskId,
      "Título antiguo",
      "Descripción antigua",
      false,
      new Date(),
      userId,
    );

    const input = {
      taskId: taskId,
      userId: userId,
      title: "Título nuevo",
      completed: true,
    };

    // Simulamos que el repositorio SÍ encuentra la tarea.
    (mockTaskRepository.findById as jest.Mock).mockResolvedValue(existingTask);
    // Simulamos que el método update devuelve la tarea actualizada.
    (mockTaskRepository.update as jest.Mock).mockImplementation((task: Task) =>
      Promise.resolve(task),
    );

    // Act: Ejecutamos el método.
    const result = await useCase.execute(input);

    // Assert: Verificamos que los datos se actualizaron correctamente.
    expect(result).toBeInstanceOf(Task);
    expect(result.title).toBe(input.title);
    expect(result.completed).toBe(input.completed);
    expect(result.description).toBe(existingTask.description); // La descripción no cambió.

    // Verificamos que se llamó a los métodos correctos.
    expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
    expect(mockTaskRepository.update).toHaveBeenCalledTimes(1);
  });

  // --- PRUEBA 2: Flujo de error cuando la tarea no existe ---
  it("should throw an error if the task is not found", async () => {
    // Arrange: Preparamos el escenario.
    const input = { taskId: "non-existent-task", userId: "user-123" };
    (mockTaskRepository.findById as jest.Mock).mockResolvedValue(null);

    // Act & Assert: Verificamos que se lanza el error correcto.
    await expect(useCase.execute(input)).rejects.toThrow(
      "Tarea no encontrada.",
    );

    // Verificamos que el proceso se detuvo y NO se intentó actualizar.
    expect(mockTaskRepository.findById).toHaveBeenCalledWith(input.taskId);
    expect(mockTaskRepository.update).not.toHaveBeenCalled();
  });

  // --- PRUEBA 3: Flujo de error cuando el usuario no es el dueño ---
  it("should throw an error if the user is not the owner of the task", async () => {
    // Arrange: Preparamos el escenario.
    const ownerId = "owner-123";
    const attackerId = "attacker-456";
    const taskId = "task-abc";
    const existingTask = new Task(
      taskId,
      "Tarea ajena",
      "",
      false,
      new Date(),
      ownerId,
    );

    const input = {
      taskId: taskId,
      userId: attackerId, // El usuario incorrecto intenta actualizar.
      title: "Título malicioso",
    };

    // Simulamos que el repositorio encuentra la tarea, pero pertenece a otro.
    (mockTaskRepository.findById as jest.Mock).mockResolvedValue(existingTask);

    // Act & Assert: Verificamos que se lanza el error de "Acción no autorizada".
    await expect(useCase.execute(input)).rejects.toThrow(
      "Acción no autorizada.",
    );

    // Verificamos que se encontró la tarea pero NO se actualizó.
    expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
    expect(mockTaskRepository.update).not.toHaveBeenCalled();
  });
});
