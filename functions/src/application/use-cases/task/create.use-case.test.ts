import { Task } from "../../../domain/entities/task.entity";
import { User } from "../../../domain/entities/user.entity";
import { ITaskRepository } from "../../../domain/repositories/task.repository";
import { IUserRepository } from "../../../domain/repositories/user.repository";
import { CreateTaskUseCase } from "./create.use-case";

// 1. Crear los "dobles de acción" (mocks) para nuestras dependencias.
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

// 2. Definir la suite de pruebas para el caso de uso.
describe("CreateTask UseCase", () => {
  let useCase: CreateTaskUseCase;

  // Antes de cada prueba, reseteamos los mocks y creamos una nueva instancia del caso de uso.
  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateTaskUseCase(mockTaskRepository, mockUserRepository);
  });

  // --- PRUEBA 1: Flujo de creación exitosa ---
  it("should create a new task when the user exists", async () => {
    // Arrange: Preparamos el escenario.
    const input = {
      title: "Nueva tarea de prueba",
      description: "Esta es una descripción.",
      userId: "user-123",
    };
    const fakeUser = new User(input.userId, "test@example.com", new Date());

    // Simulamos que el userRepository SÍ encuentra al usuario.
    (mockUserRepository.findById as jest.Mock).mockResolvedValue(fakeUser);

    // Simulamos que el taskRepository.create devuelve la tarea creada.
    // Usamos `mockImplementation` para acceder a los argumentos y devolver una Task con un ID.
    (mockTaskRepository.create as jest.Mock).mockImplementation(
      (task: Task) => {
        return Promise.resolve(
          new Task(
            "task-abc",
            task.title,
            task.description,
            task.completed,
            task.createdAt,
            task.userId,
          ),
        );
      },
    );

    // Act: Ejecutamos el método a probar.
    const result = await useCase.execute(input);

    // Assert: Verificamos los resultados.
    expect(result).toBeInstanceOf(Task);
    expect(result.id).toBe("task-abc");
    expect(result.title).toBe(input.title);
    expect(result.completed).toBe(false); // Las tareas nuevas deben estar incompletas.
    expect(result.userId).toBe(input.userId);

    // Verificamos que se llamó a los métodos correctos.
    expect(mockUserRepository.findById).toHaveBeenCalledWith(input.userId);
    expect(mockTaskRepository.create).toHaveBeenCalledTimes(1);
  });

  // --- PRUEBA 2: Flujo de error cuando el usuario no existe ---
  it("should throw an error if the user does not exist", async () => {
    // Arrange: Preparamos el escenario de error.
    const input = {
      title: "Tarea fallida",
      description: "",
      userId: "non-existent-user",
    };

    // Simulamos que el userRepository NO encuentra al usuario.
    (mockUserRepository.findById as jest.Mock).mockResolvedValue(null);

    // Act & Assert: Verificamos que la ejecución del caso de uso lance un error.
    // `expect(...).rejects.toThrow()` es la forma correcta de probar promesas que fallan.
    await expect(useCase.execute(input)).rejects.toThrow(
      "No se puede crear una tarea para un usuario que no existe.",
    );

    // Verificamos que el proceso se detuvo y NO se intentó crear la tarea.
    expect(mockUserRepository.findById).toHaveBeenCalledWith(input.userId);
    expect(mockTaskRepository.create).not.toHaveBeenCalled();
  });
});
