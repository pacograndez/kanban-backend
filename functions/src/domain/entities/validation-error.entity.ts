/**
 * @file Define errores personalizados para la capa de dominio.
 * @description Centralizar las clases de error nos permite manejarlos de forma
 * tipada y consistente a lo largo de toda la aplicación.
 */

/**
 * @class ValidationError
 * @description Error personalizado para representar fallos de validación de datos.
 * @extends Error
 */
export class ValidationError extends Error {
  /**
   * @constructor
   * @param {string} message - El mensaje de error.
   */
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
