/// <reference types="cypress" />

/**
 * Inicia sesión con un usuario demo y espera a que cargue el dashboard.
 * Usuarios: paciente / secretaria / medico  (password: "clinifer").
 */
Cypress.Commands.add("login", (username: string) => {
  cy.visit("/");
  cy.get('input[placeholder="Ingrese su usuario"]').type(username);
  cy.get('input[placeholder="Ingrese su contraseña"]').type("clinifer");
  cy.contains("button", "Iniciar Sesión").click();
  cy.contains("button", "Cerrar Sesión").should("be.visible");
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Inicia sesión con un usuario demo (paciente/secretaria/medico). */
      login(username: string): Chainable<void>;
    }
  }
}

export {};
