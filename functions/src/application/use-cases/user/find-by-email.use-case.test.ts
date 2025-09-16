import { User } from "../../../domain/entities/user.entity";
import { IUserRepository } from "../../../domain/repositories/user.repository";
import { FindUserByEmailUseCase } from "./find-by-email.use-case";

// ==================================================================================
// CREACIÓN DEL MOCK (EL DOBLE DE ACCIÓN)
// ==================================================================================

/**
 * Creamos un objeto que "finge" ser un IUserRepository.
 * `jest.fn()` crea una función simulada que podemos controlar.
 */
const mockUserRepository: IUserRepository = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
};

// ==================================================================================
// SUITE DE PRUEBAS
// ==================================================================================
/**
 * `describe` agrupa un conjunto de pruebas relacionadas para un componente específico.
 */
describe("FindUserByEmail UseCase", () => {
  let useCase: FindUserByEmailUseCase;

  /**
   * `beforeEach` es una función de Jest que se ejecuta antes de cada prueba ('it')
   * en este bloque. Es perfecta para reiniciar el estado.
   */
  beforeEach(() => {
    // Reseteamos cualquier simulación anterior para que una prueba no afecte a la otra.
    jest.clearAllMocks();
    // Creamos una nueva instancia del caso de uso con nuestro repositorio falso.
    useCase = new FindUserByEmailUseCase(mockUserRepository);
  });

  /**
   * `it` o `test` define una prueba individual. La descripción debe explicar
   * qué se espera que suceda.
   */
  it("should return true when the user exists", async () => {
    // --- 1. Preparación (Arrange) ---
    const email = "test@example.com";
    // Le decimos a nuestro mock que cuando se llame a `findByEmail` con este email,
    // debe devolver un objeto User falso.
    (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(
      new User("123", email, new Date()),
    );

    // --- 2. Actuación (Act) ---
    // Ejecutamos el método que queremos probar.
    const result = await useCase.execute(email);

    // --- 3. Aserción (Assert) ---
    // Verificamos que el resultado es el que esperábamos.
    expect(result).toBe(true);
    // Verificamos que el método del repositorio fue llamado exactamente una vez.
    expect(mockUserRepository.findByEmail).toHaveBeenCalledTimes(1);
    // Verificamos que fue llamado CON el email correcto.
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
  });

  it("should return false when the user does not exist", async () => {
    // --- 1. Preparación (Arrange) ---
    const email = "nonexistent@example.com";
    // Ahora le decimos al mock que para este email, debe devolver `null`.
    (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);

    // --- 2. Actuación (Act) ---
    const result = await useCase.execute(email);

    // --- 3. Aserción (Assert) ---
    expect(result).toBe(false);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
  });
});
