/// <reference types="cypress" />

/**
 * Pruebas E2E del MÓDULO SECRETARÍA (Cypress).
 * Cubre el dashboard administrativo: pantalla por defecto "Agendar Cita",
 * la gestión de citas (tabs + búsqueda), la búsqueda de citas por paciente/código
 * y la administración de disponibilidad de médicos.
 * Usa el comando cy.login (cypress/support/commands.ts).
 */
describe("Módulo Secretaría", () => {
  beforeEach(() => {
    cy.login("secretaria");
  });

  it("muestra 'Agendar Cita' como pantalla por defecto", () => {
    cy.contains("h1", "Agendar Cita").should("be.visible");
    cy.get('aside').contains("Secretaria Administrativa").should("be.visible");
  });

  it("el menú administrativo expone sus opciones", () => {
    cy.contains("button", "Agendar Cita").should("be.visible");
    cy.contains("button", "Gestionar Citas").should("be.visible");
    cy.contains("button", "Buscar Citas de Paciente").should("be.visible");
    cy.contains("button", "Disponibilidad de Médicos").should("be.visible");
  });

  it("gestiona citas con buscador y pestañas de estado", () => {
    cy.contains("button", "Gestionar Citas").click();
    cy.contains("h1", "Gestionar Citas").should("be.visible");
    cy.get('input[placeholder="Buscar por paciente, DNI, ID o doctor..."]')
      .should("be.visible")
      .type("López");
  });

  it("busca citas de paciente por nombre o DNI", () => {
    cy.contains("button", "Buscar Citas de Paciente").click();
    cy.contains("h1", "Buscar Citas de Paciente").should("be.visible");
    cy.get('input[placeholder*="Nombre o DNI"]').should("be.visible").type("Ana");
    cy.contains("button", "Buscar").click();
  });

  it("accede a la administración de disponibilidad de médicos", () => {
    cy.contains("button", "Disponibilidad de Médicos").click();
    cy.contains("h1", "Disponibilidad de Médicos").should("be.visible");
  });

  it("navega de vuelta a 'Agendar Cita'", () => {
    cy.contains("button", "Gestionar Citas").click();
    cy.contains("h1", "Gestionar Citas").should("be.visible");
    cy.contains("button", "Agendar Cita").click();
    cy.contains("h1", "Agendar Cita").should("be.visible");
  });
});
