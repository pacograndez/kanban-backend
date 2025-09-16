import { Task } from "../../../domain/entities/task.entity";
import { User } from "../../../domain/entities/user.entity";
import { ITaskRepository } from "../../../domain/repositories/task.repository";
import { IUserRepository } from "../../../domain/repositories/user.repository";
import { FindByUserkUseCase } from "./find-by-user.use-case";

// 1. Mock de ambas dependencias del repositorio.
const mockTaskRepository: ITaskRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockUserRepository: IUserRepository = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
};

// 2. Suite de pruebas para el caso de uso FindTasksByUser.
describe("FindByUserkUseCase UseCase", () => {
  let useCase: FindByUserkUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new FindByUserkUseCase(mockTaskRepository, mockUserRepository);
  });

  // --- PRUEBA 1: Flujo exitoso ---
  it("should return a list of tasks for an existing user", async () => {
    // Arrange: Preparamos el escenario.
    const userId = "user-with-tasks-123";
    const fakeUser = new User(userId, "test@example.com", new Date());
    const fakeTasks = [
      new Task("task-001", "Primera tarea", "", false, new Date(), userId),
      new Task("task-002", "Segunda tarea", "", true, new Date(), userId),
    ];

    // Simulamos que el userRepository SÍ encuentra al usuario.
    (mockUserRepository.findById as jest.Mock).mockResolvedValue(fakeUser);
    // Simulamos que el taskRepository devuelve la lista de tareas.
    (mockTaskRepository.findByUserId as jest.Mock).mockResolvedValue(fakeTasks);

    // Act: Ejecutamos el método.
    const result = await useCase.execute(userId);

    // Assert: Verificamos los resultados.
    expect(result).toEqual(fakeTasks);
    expect(result.length).toBe(2);
    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith(userId);
    expect(mockTaskRepository.findByUserId).toHaveBeenCalledTimes(1);
  });

  // --- PRUEBA 2: Flujo de error cuando el usuario no existe ---
  it("should throw an error if the user does not exist", async () => {
    // Arrange: Preparamos el escenario.
    const userId = "non-existent-user";

    // Simulamos que el userRepository NO encuentra al usuario.
    (mockUserRepository.findById as jest.Mock).mockResolvedValue(null);

    // Act & Assert: Verificamos que se lanza el error correcto.
    await expect(useCase.execute(userId)).rejects.toThrow(
      "Usuario no encontrado.",
    );

    // Verificamos que el proceso se detuvo y NO se intentó buscar ninguna tarea.
    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockTaskRepository.findByUserId).not.toHaveBeenCalled();
  });

  // --- PRUEBA 3: Flujo cuando el usuario existe pero no tiene tareas ---
  it("should return an empty array if the user exists but has no tasks", async () => {
    // Arrange: Preparamos el escenario.
    const userId = "user-without-tasks-456";
    const fakeUser = new User(userId, "notasks@example.com", new Date());

    // Simulamos que el userRepository SÍ encuentra al usuario.
    (mockUserRepository.findById as jest.Mock).mockResolvedValue(fakeUser);
    // Simulamos que el taskRepository devuelve un array vacío.
    (mockTaskRepository.findByUserId as jest.Mock).mockResolvedValue([]);

    // Act: Ejecutamos el método.
    const result = await useCase.execute(userId);

    // Assert: Verificamos los resultados.
    expect(result).toEqual([]);
    expect(result.length).toBe(0);
    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith(userId);
  });
});
