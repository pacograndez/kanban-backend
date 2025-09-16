import request from "supertest";
import { app } from "../../app"; // 1. Importamos nuestra app de Express real.
import { CreateTaskUseCase } from "../use-cases/task/create.use-case";
import { UpdateTaskUseCase } from "../use-cases/task/update.use-case";
import { DeleteTaskUseCase } from "../use-cases/task/delete.use-case";
import { FindByUserkUseCase } from "../use-cases/task/find-by-user.use-case";

// ==================================================================================
// SIMULACIÓN (MOCK) DE LAS DEPENDENCIAS
// ==================================================================================
/**
 * Para las pruebas de integración, no queremos hablar con la base de datos real.
 * Por lo tanto, simulamos los casos de uso para que devuelvan respuestas predecibles.
 * Esto nos permite probar la capa HTTP (rutas, middlewares, controlador) de forma aislada.
 */
jest.mock("../use-cases/task/create.use-case");
jest.mock("../use-cases/task/update.use-case");
jest.mock("../use-cases/task/delete.use-case");
jest.mock("../use-cases/task/find-by-user.use-case");

/**
 * También simulamos nuestro middleware de autenticación. En lugar de verificar un token real,
 * creamos una versión falsa que automáticamente añade un usuario simulado a `res.locals`.
 */
jest.mock("../../infrastructure/web/middlewares/auth.middleware", () => ({
  verifyAuthToken: jest.fn((req, res, next) => {
    res.locals.user = { uid: "test-user-id", email: "test@example.com" }; // Usuario simulado
    next();
  }),
}));

// ==================================================================================
// SUITE DE PRUEBAS DE INTEGRACIÓN
// ==================================================================================
describe("Task Endpoints", () => {
  beforeEach(() => {
    // Limpiamos los mocks antes de cada prueba.
    (CreateTaskUseCase.prototype.execute as jest.Mock).mockClear();
    (UpdateTaskUseCase.prototype.execute as jest.Mock).mockClear(); // <-- 3. Limpiar el nuevo mock
  });

  // --- Pruebas para POST /api/tasks (ya existentes) ---
  describe("POST /api/tasks - Create Task Endpoint", () => {
    // --- PRUEBA 1: Flujo exitoso ---
    it("should return 201 Created when data is valid", async () => {
      // Arrange: Preparamos el escenario.
      const taskData = { title: "Mi nueva tarea", description: "Descripción" };
      const mockCreatedTask = {
        id: "task-123",
        ...taskData,
        completed: false,
        userId: "test-user-id",
        createdAt: new Date().toISOString(),
        toObject: () => ({
          id: "task-123",
          ...taskData,
          completed: false,
          userId: "test-user-id",
        }),
      };
      // Simulamos que el caso de uso se ejecuta y devuelve la tarea creada.
      (CreateTaskUseCase.prototype.execute as jest.Mock).mockResolvedValue(
        mockCreatedTask,
      );

      // Act: Hacemos la petición HTTP simulada.
      const response = await request(app).post("/api/tasks").send(taskData);

      // Assert: Verificamos la respuesta HTTP.
      expect(response.status).toBe(201);
      expect(response.body.id).toBe("task-123");
      expect(response.body.title).toBe(taskData.title);

      // Verificamos que el caso de uso fue llamado con los datos correctos.
      expect(CreateTaskUseCase.prototype.execute).toHaveBeenCalledWith({
        ...taskData,
        userId: "test-user-id", // El userId viene del auth.middleware simulado.
      });
    });

    // --- PRUEBA 2: Flujo de error de validación ---
    it("should return 400 Bad Request if title is missing", async () => {
      // Arrange: Enviamos datos inválidos (sin título).
      const taskData = { description: "Sin título" };

      // Act: Hacemos la petición.
      const response = await request(app).post("/api/tasks").send(taskData);

      // Assert: Verificamos que el middleware de validación respondió con un error 400.
      expect(response.status).toBe(400);
      expect(response.body.message).toContain("El título es requerido");

      // Verificamos que el caso de uso NUNCA fue llamado, porque el middleware detuvo la petición.
      expect(CreateTaskUseCase.prototype.execute).not.toHaveBeenCalled();
    });
  });

  // --- Pruebas para PUT /api/tasks/:taskId (nuevas) ---
  describe("PUT /api/tasks/:taskId - Update Task Endpoint", () => {
    const taskId = "existing-task-123";

    it("should return 200 OK when the update is successful", async () => {
      // Arrange
      const updateData = { title: "Título actualizado", completed: true };
      const mockUpdatedTask = {
        toObject: () => ({ id: taskId, ...updateData }),
      };
      // Simulamos que el caso de uso se ejecuta y devuelve la tarea actualizada.
      (UpdateTaskUseCase.prototype.execute as jest.Mock).mockResolvedValue(
        mockUpdatedTask,
      );

      // Act
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(taskId);
      expect(response.body.title).toBe(updateData.title);
      expect(UpdateTaskUseCase.prototype.execute).toHaveBeenCalledWith({
        taskId,
        userId: "test-user-id",
        ...updateData,
      });
    });

    it("should return 404 Not Found if the task does not exist", async () => {
      // Arrange
      // Simulamos que el caso de uso lanza el error "Tarea no encontrada".
      (UpdateTaskUseCase.prototype.execute as jest.Mock).mockRejectedValue(
        new Error("Tarea no encontrada."),
      );

      // Act
      const response = await request(app)
        .put("/api/tasks/non-existent-id")
        .send({ title: "Intento de actualización" });

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Tarea no encontrada.");
    });

    it("should return 403 Forbidden if the user is not the owner", async () => {
      // Arrange
      // Simulamos que el caso de uso lanza el error "Acción no autorizada".
      (UpdateTaskUseCase.prototype.execute as jest.Mock).mockRejectedValue(
        new Error("Acción no autorizada."),
      );

      // Act
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ title: "Intento de hackeo" });

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Acción no autorizada.");
    });
  });

  // --- Pruebas para DELETE /api/tasks/:taskId (nuevas) ---
  describe("DELETE /api/tasks/:taskId - Delete Task Endpoint", () => {
    const taskId = "existing-task-123";

    it("should return 204 No Content when the deletion is successful", async () => {
      // Arrange
      // Simulamos que el caso de uso se ejecuta correctamente.
      (DeleteTaskUseCase.prototype.execute as jest.Mock).mockResolvedValue(
        undefined,
      );

      // Act
      const response = await request(app).delete(`/api/tasks/${taskId}`);

      // Assert
      expect(response.status).toBe(204);
      expect(DeleteTaskUseCase.prototype.execute).toHaveBeenCalledWith({
        taskId,
        userId: "test-user-id",
      });
    });

    it("should return 404 Not Found if the task does not exist", async () => {
      // Arrange
      // Simulamos que el caso de uso lanza el error "Tarea no encontrada".
      (DeleteTaskUseCase.prototype.execute as jest.Mock).mockRejectedValue(
        new Error("Tarea no encontrada."),
      );

      // Act
      const response = await request(app).delete("/api/tasks/non-existent-id");

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Tarea no encontrada.");
    });

    it("should return 403 Forbidden if the user is not the owner", async () => {
      // Arrange
      // Simulamos que el caso de uso lanza el error "Acción no autorizada".
      (DeleteTaskUseCase.prototype.execute as jest.Mock).mockRejectedValue(
        new Error("Acción no autorizada."),
      );

      // Act
      const response = await request(app).delete(`/api/tasks/${taskId}`);

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Acción no autorizada.");
    });
  });
  // --- Pruebas para GET /api/tasks (nuevas) ---
  describe("GET /api/tasks - Find Tasks by User Endpoint", () => {
    it("should return 200 OK and a list of tasks for the authenticated user", async () => {
      // Arrange
      const mockTasks = [
        {
          id: "task-1",
          title: "Tarea 1",
          toObject: () => ({ id: "task-1", title: "Tarea 1" }),
        },
        {
          id: "task-2",
          title: "Tarea 2",
          toObject: () => ({ id: "task-2", title: "Tarea 2" }),
        },
      ];
      // Simulamos que el caso de uso devuelve un array de tareas.
      (FindByUserkUseCase.prototype.execute as jest.Mock).mockResolvedValue(
        mockTasks,
      );

      // Act
      const response = await request(app).get("/api/tasks");

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].title).toBe("Tarea 1");
      expect(FindByUserkUseCase.prototype.execute).toHaveBeenCalledWith(
        "test-user-id",
      );
    });

    it("should return 200 OK and an empty array if the user has no tasks", async () => {
      // Arrange
      // Simulamos que el caso de uso devuelve un array vacío.
      (FindByUserkUseCase.prototype.execute as jest.Mock).mockResolvedValue([]);

      // Act
      const response = await request(app).get("/api/tasks");

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
});
