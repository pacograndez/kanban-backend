import { User } from "../../../domain/entities/user.entity";
import { IUserRepository } from "../../../domain/repositories/user.repository";
import { auth } from "../../../infrastructure/firebase.config";
// ¡Importante! Importamos 'auth' para poder simular sus métodos.
import { CreateOrFindUserUseCase } from "./create-find.use-case";

// ==================================================================================
// SIMULACIÓN (MOCK) DEL MÓDULO 'firebase-admin'
// ==================================================================================
/**
 * jest.mock() intercepta cualquier importación de 'firebase.config'.
 * En lugar de devolver el módulo real, devuelve este objeto falso que definimos.
 * Esto nos permite controlar lo que hacen `auth.getUserByEmail`, `auth.createUser`, etc.,
 * sin hablar nunca con los servicios reales de Firebase.
 */
jest.mock("../../../infrastructure/firebase.config", () => ({
  auth: {
    getUserByEmail: jest.fn(),
    createUser: jest.fn(),
    createCustomToken: jest.fn(),
  },
}));

// Mock para nuestro repositorio, igual que en la prueba anterior.
const mockUserRepository: IUserRepository = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
};

// ==================================================================================
// SUITE DE PRUEBAS
// ==================================================================================
describe("CreateOrFindUser UseCase", () => {
  let useCase: CreateOrFindUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateOrFindUserUseCase(mockUserRepository);
  });

  // --- PRUEBA 1: Flujo cuando el usuario YA EXISTE ---
  it("should return an existing user and created: false", async () => {
    // 1. Arrange (Preparación)
    const email = "existing@example.com";
    const existingUser = new User("firestore-123", email, new Date());
    const mockAuthUser = { uid: "auth-123", email };

    // Simulamos que el repositorio encuentra al usuario en Firestore.
    (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(
      existingUser,
    );
    // Simulamos que Auth también encuentra al usuario.
    (auth.getUserByEmail as jest.Mock).mockResolvedValue(mockAuthUser);
    // Simulamos la creación del token.
    (auth.createCustomToken as jest.Mock).mockResolvedValue(
      "fake-custom-token",
    );

    // 2. Act (Actuación)
    const result = await useCase.execute(email);

    // 3. Assert (Aserción)
    expect(result.created).toBe(false);
    expect(result.customToken).toBe("fake-custom-token");
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    expect(auth.getUserByEmail).toHaveBeenCalledWith(email);
    // Verificamos que los métodos de CREACIÓN NO fueron llamados.
    expect(mockUserRepository.create).not.toHaveBeenCalled();
    expect(auth.createUser).not.toHaveBeenCalled();
  });

  // --- PRUEBA 2: Flujo cuando el usuario ES NUEVO ---
  it("should create a new user in Firestore and Auth, and return created: true", async () => {
    // 1. Arrange (Preparación)
    const email = "new@example.com";
    const newUser = new User("new-firestore-id", email, new Date());
    const newAuthUser = { uid: newUser.id, email }; // El UID de Auth debe coincidir con el de Firestore

    // Simulamos que el repositorio NO encuentra al usuario.
    (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    // Simulamos que el repositorio CREA al usuario y devuelve la nueva entidad.
    (mockUserRepository.create as jest.Mock).mockResolvedValue(newUser);
    // Simulamos que Auth lanza un error "user-not-found".
    (auth.getUserByEmail as jest.Mock).mockRejectedValue({
      code: "auth/user-not-found",
    });
    // Simulamos que Auth CREA al usuario.
    (auth.createUser as jest.Mock).mockResolvedValue(newAuthUser);
    // Simulamos la creación del token.
    (auth.createCustomToken as jest.Mock).mockResolvedValue(
      "fake-custom-token-for-new-user",
    );

    // 2. Act (Actuación)
    const result = await useCase.execute(email);

    // 3. Assert (Aserción)
    expect(result.created).toBe(true);
    expect(result.customToken).toBe("fake-custom-token-for-new-user");
    // Verificamos que los métodos de CREACIÓN SÍ fueron llamados.
    expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
    expect(auth.createUser).toHaveBeenCalledTimes(1);
    // Verificamos que el UID de Firestore se usó para crear el usuario de Auth.
    expect(auth.createUser).toHaveBeenCalledWith({
      uid: newUser.id,
      email: newUser.email,
    });
  });
});
