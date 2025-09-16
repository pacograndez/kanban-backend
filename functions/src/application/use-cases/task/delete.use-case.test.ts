import { Task } from "../../../domain/entities/task.entity";
import { ITaskRepository } from "../../../domain/repositories/task.repository";
import { DeleteTaskUseCase } from "./delete.use-case";

// Mock del repositorio de tareas.
const mockTaskRepository: ITaskRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Suite de pruebas para el caso de uso DeleteTask.
describe("DeleteTask UseCase", () => {
  let useCase: DeleteTaskUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new DeleteTaskUseCase(mockTaskRepository);
  });

  // --- PRUEBA 1: Flujo de eliminación exitosa ---
  it("should delete the task if it exists and the user is the owner", async () => {
    // Arrange: Preparamos el escenario.
    const input = {
      taskId: "task-123",
      userId: "user-abc", // El dueño de la tarea.
    };
    const fakeTask = new Task(
      input.taskId,
      "Tarea existente",
      "",
      false,
      new Date(),
      input.userId,
    );

    // Simulamos que el repositorio SÍ encuentra la tarea.
    (mockTaskRepository.findById as jest.Mock).mockResolvedValue(fakeTask);
    // Simulamos que el método delete se resuelve correctamente.
    (mockTaskRepository.delete as jest.Mock).mockResolvedValue(undefined);

    // Act: Ejecutamos el método. Usamos `resolves.not.toThrow()` para asegurar que no haya errores.
    await expect(useCase.execute(input)).resolves.not.toThrow();

    // Assert: Verificamos que se llamó a los métodos correctos.
    expect(mockTaskRepository.findById).toHaveBeenCalledWith(input.taskId);
    expect(mockTaskRepository.delete).toHaveBeenCalledWith(input.taskId);
    expect(mockTaskRepository.delete).toHaveBeenCalledTimes(1);
  });

  // --- PRUEBA 2: Flujo de error cuando la tarea no existe ---
  it("should throw an error if the task is not found", async () => {
    // Arrange: Preparamos el escenario.
    const input = {
      taskId: "non-existent-task",
      userId: "user-abc",
    };

    // Simulamos que el repositorio NO encuentra la tarea.
    (mockTaskRepository.findById as jest.Mock).mockResolvedValue(null);

    // Act & Assert: Verificamos que se lanza el error correcto.
    await expect(useCase.execute(input)).rejects.toThrow(
      "Tarea no encontrada.",
    );

    // Verificamos que el proceso se detuvo y NO se intentó eliminar nada.
    expect(mockTaskRepository.findById).toHaveBeenCalledWith(input.taskId);
    expect(mockTaskRepository.delete).not.toHaveBeenCalled();
  });

  // --- PRUEBA 3: Flujo de error cuando el usuario no es el dueño ---
  it("should throw an error if the user is not the owner of the task", async () => {
    // Arrange: Preparamos el escenario.
    const correctOwnerId = "user-owner-123";
    const attackerUserId = "user-attacker-456";
    const taskId = "task-123";

    const input = {
      taskId: taskId,
      userId: attackerUserId, // El usuario incorrecto intenta eliminar.
    };
    const fakeTask = new Task(
      taskId,
      "Tarea de otro",
      "",
      false,
      new Date(),
      correctOwnerId,
    );

    // Simulamos que el repositorio SÍ encuentra la tarea, pero pertenece a otro usuario.
    (mockTaskRepository.findById as jest.Mock).mockResolvedValue(fakeTask);

    // Act & Assert: Verificamos que se lanza el error de "Acción no autorizada".
    await expect(useCase.execute(input)).rejects.toThrow(
      "Acción no autorizada.",
    );

    // Verificamos que se encontró la tarea pero NO se eliminó.
    expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
    expect(mockTaskRepository.delete).not.toHaveBeenCalled();
  });
});
