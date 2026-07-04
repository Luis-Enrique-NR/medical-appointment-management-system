/// <reference types="cypress" />

/**
 * Pruebas E2E del flujo de autenticación (LoginScreen).
 * El login es determinista y se resuelve en el cliente con usuarios demo:
 *   paciente / secretaria / medico  (password: "clinifer").
 */
describe("Login", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("muestra la pantalla de login al inicio", () => {
    cy.contains("h1, h2", "Sistema de Gestión de Citas").should("be.visible");
    cy.get('input[placeholder="Ingrese su usuario"]').should("be.visible");
    cy.get('input[placeholder="Ingrese su contraseña"]').should("be.visible");
    cy.contains("button", "Iniciar Sesión").should("be.visible");
  });

  it("rechaza credenciales incorrectas y muestra error", () => {
    cy.get('input[placeholder="Ingrese su usuario"]').type("paciente");
    cy.get('input[placeholder="Ingrese su contraseña"]').type("incorrecta");
    cy.contains("button", "Iniciar Sesión").click();

    cy.contains("Usuario o contraseña incorrectos. Intente de nuevo.").should(
      "be.visible"
    );
    // Sigue en la pantalla de login
    cy.contains("Sistema de Gestión de Citas").should("be.visible");
  });

  it("el botón de usuario demo rellena las credenciales", () => {
    cy.contains("button", /paciente \(Paciente\)/).click();
    cy.get('input[placeholder="Ingrese su usuario"]').should(
      "have.value",
      "paciente"
    );
    cy.get('input[placeholder="Ingrese su contraseña"]').should(
      "have.value",
      "clinifer"
    );
  });

  it("el toggle de visibilidad cambia el tipo del campo contraseña", () => {
    cy.get('input[placeholder="Ingrese su contraseña"]')
      .type("clinifer")
      .should("have.attr", "type", "password");

    // El botón de ojo no tiene texto; es el único button[type=button] del form.
    cy.get("form button[type='button']").click();
    cy.get('input[placeholder="Ingrese su contraseña"]').should(
      "have.attr",
      "type",
      "text"
    );
  });

  it("login exitoso como paciente entra al dashboard", () => {
    cy.get('input[placeholder="Ingrese su usuario"]').type("paciente");
    cy.get('input[placeholder="Ingrese su contraseña"]').type("clinifer");
    cy.contains("button", "Iniciar Sesión").click();

    cy.contains("button", "Mis Citas").should("be.visible");
    cy.contains("button", "Cerrar Sesión").should("be.visible");
  });
});
