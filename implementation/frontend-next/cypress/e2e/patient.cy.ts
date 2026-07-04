/// <reference types="cypress" />

/**
 * Pruebas E2E del MÓDULO PACIENTE (Cypress).
 * Cubre el dashboard del paciente: pantalla por defecto "Mis Citas",
 * el flujo de reserva ("Disponibilidad de Médicos" → BookAppointment) y
 * el asistente de selección de especialidad.
 * Usa el comando cy.login (cypress/support/commands.ts).
 */
describe("Módulo Paciente", () => {
  beforeEach(() => {
    cy.login("paciente");
  });

  it("muestra 'Mis Citas' como pantalla por defecto", () => {
    cy.contains("h1", "Mis Citas").should("be.visible");
    cy.get('aside').contains("Paciente").should("be.visible");
  });

  it("el menú del paciente expone sus tres opciones", () => {
    cy.contains("button", "Mis Citas").should("be.visible");
    cy.contains("button", "Disponibilidad de Médicos").should("be.visible");
    cy.contains("button", "Mi Perfil").should("be.visible");
  });

  it("navega al asistente de reserva de citas", () => {
    cy.contains("button", "Disponibilidad de Médicos").click();
    cy.contains("h1", "Reservar una Cita").should("be.visible");
    cy.contains("Seleccione una Especialidad").should("be.visible");
  });

  it("permite seleccionar una especialidad en el primer paso", () => {
    cy.contains("button", "Disponibilidad de Médicos").click();
    cy.contains("h2", "Seleccione una Especialidad").should("be.visible");
    // El asistente muestra tarjetas de especialidad clicables (Ginecología, Obstetricia, Fertilidad).
    cy.contains("button", "Ginecología").click();
    // La tarjeta seleccionada muestra el indicador "Seleccionada".
    cy.contains("Seleccionada").should("be.visible");
  });

  it("regresa a 'Mis Citas' desde el asistente de reserva", () => {
    cy.contains("button", "Disponibilidad de Médicos").click();
    cy.contains("h1", "Reservar una Cita").should("be.visible");
    cy.contains("button", "Mis Citas").click();
    cy.contains("h1", "Mis Citas").should("be.visible");
  });
});
