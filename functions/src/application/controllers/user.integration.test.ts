import request from "supertest";
import { app } from "../../app"; // Importamos nuestra app de Express real.
import { CreateOrFindUserUseCase } from "../use-cases/user/create-find.use-case";
import { FindUserByEmailUseCase } from "../use-cases/user/find-by-email.use-case";

// ==================================================================================
// SIMULACIÓN (MOCK) DE LAS DEPENDENCIAS
// ==================================================================================
jest.mock("../use-cases/user/create-find.use-case");
jest.mock("../use-cases/user/find-by-email.use-case");

// ==================================================================================
// SUITE DE PRUEBAS DE INTEGRACIÓN
// ==================================================================================
describe("User Endpoints", () => {
  beforeEach(() => {
    // Limpiamos los mocks antes de cada prueba.
    (CreateOrFindUserUseCase.prototype.execute as jest.Mock).mockClear();
    (FindUserByEmailUseCase.prototype.execute as jest.Mock).mockClear();
  });

  // --- Pruebas para POST /api/users ---
  describe("POST /api/users - Create/Find User Endpoint", () => {
    it("should return 201 Created and created: true for a new user", async () => {
      // Arrange
      const userData = { email: "newuser@example.com" };
      const mockResult = { customToken: "fake-token", created: true };
      (
        CreateOrFindUserUseCase.prototype.execute as jest.Mock
      ).mockResolvedValue(mockResult);

      // Act
      const response = await request(app).post("/api/users").send(userData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ token: "fake-token", created: true });
      expect(CreateOrFindUserUseCase.prototype.execute).toHaveBeenCalledWith(
        userData.email,
      );
    });

    it("should return 200 OK and created: false for an existing user", async () => {
      // Arrange
      const userData = { email: "existinguser@example.com" };
      const mockResult = { customToken: "another-fake-token", created: false };
      (
        CreateOrFindUserUseCase.prototype.execute as jest.Mock
      ).mockResolvedValue(mockResult);

      // Act
      const response = await request(app).post("/api/users").send(userData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        token: "another-fake-token",
        created: false,
      });
      expect(CreateOrFindUserUseCase.prototype.execute).toHaveBeenCalledWith(
        userData.email,
      );
    });

    it("should return 400 Bad Request for an invalid email", async () => {
      // Arrange
      const userData = { email: "invalid-email" };

      // Act
      const response = await request(app).post("/api/users").send(userData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Formato de email inválido");
      expect(CreateOrFindUserUseCase.prototype.execute).not.toHaveBeenCalled();
    });
  });

  // --- Pruebas para GET /api/users/exists/:email ---
  describe("GET /api/users/exists/:email - Check If User Exists Endpoint", () => {
    it("should return 200 OK with exists: true for an existing user", async () => {
      // Arrange
      const email = "existing@example.com";
      (FindUserByEmailUseCase.prototype.execute as jest.Mock).mockResolvedValue(
        true,
      );

      // Act
      const response = await request(app).get(`/api/users/exists/${email}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ exists: true, email: email });
      expect(FindUserByEmailUseCase.prototype.execute).toHaveBeenCalledWith(
        email,
      );
    });

    it("should return 200 OK with exists: false for a non-existent user", async () => {
      // Arrange
      const email = "nonexistent@example.com";
      (FindUserByEmailUseCase.prototype.execute as jest.Mock).mockResolvedValue(
        false,
      );

      // Act
      const response = await request(app).get(`/api/users/exists/${email}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ exists: false, email: email });
      expect(FindUserByEmailUseCase.prototype.execute).toHaveBeenCalledWith(
        email,
      );
    });

    it("should return 400 Bad Request for an invalid email in URL params", async () => {
      // Arrange
      const email = "invalid-email";

      // Act
      const response = await request(app).get(`/api/users/exists/${email}`);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        "El email en la URL tiene un formato inválido",
      );
      expect(FindUserByEmailUseCase.prototype.execute).not.toHaveBeenCalled();
    });
  });
});
