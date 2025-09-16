/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Le dice a Jest que busque los archivos de prueba en todo el directorio src
  roots: ["<rootDir>/src"],
  // Ignora la carpeta lib (el código compilado) al buscar pruebas
  modulePathIgnorePatterns: ["<rootDir>/lib/"],
};
