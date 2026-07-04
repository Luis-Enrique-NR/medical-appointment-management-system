// Archivo de soporte cargado antes de cada spec de E2E.
// Importa los comandos personalizados (p. ej. cy.login).
import "./commands";
// Registra el reporter HTML (mochawesome) en el navegador.
import "cypress-mochawesome-reporter/register";

// Next.js en modo dev emite avisos de "Hydration failed" como excepciones no
// atrapadas. No son fallos reales de la app ni de la prueba, así que se ignoran
// para que Cypress no marque los tests como fallidos por ese motivo.
Cypress.on("uncaught:exception", (err) => {
  if (
    err.message.includes("Hydration failed") ||
    err.message.includes("hydrating") ||
    err.message.includes("Minified React error #418") ||
    err.message.includes("Minified React error #423")
  ) {
    return false;
  }
  return undefined;
});
