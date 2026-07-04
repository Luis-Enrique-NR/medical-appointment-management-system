/// <reference types="cypress" />

/**
 * Pruebas de API REST — CRUD de citas (CLINIFER, Grupo 1).
 * Técnica: pruebas de servicio con cy.request (sin navegador), según la
 * Especificación Técnica de Software Testing (GE709V). Cubre el ciclo CRUD
 * completo más un caso negativo de validación (400).
 */
const BASE = "http://localhost:3000/citas";
let idCreado;

describe("CRUD CITAS — Grupo 1 (API Cypress)", () => {
  it("TC-01 — POST: crear cita médica devuelve 201 con id", () => {
    cy.request("POST", BASE, {
      paciente: "Juan Pérez",
      medico: "Dra. María López",
      fecha: "2026-07-15",
      hora: "10:00",
      estado: "pendiente",
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.have.property("id");
      idCreado = res.body.id;
    });
  });

  it("TC-02 — GET: listar todas las citas devuelve 200 y un arreglo", () => {
    cy.request("GET", BASE).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
    });
  });

  it("TC-03 — GET: obtener cita por ID devuelve 200 y el objeto", () => {
    cy.request("GET", `${BASE}/${idCreado}`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("id", idCreado);
    });
  });

  it("TC-04 — PUT: actualizar estado de la cita devuelve 200", () => {
    cy.request("PUT", `${BASE}/${idCreado}`, { estado: "confirmada" }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("estado", "confirmada");
    });
  });

  it("TC-05 — DELETE: eliminar la cita devuelve 200", () => {
    cy.request("DELETE", `${BASE}/${idCreado}`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("mensaje");
    });
  });

  it("TC-06 — POST: datos incompletos debe retornar 400", () => {
    cy.request({ method: "POST", url: BASE, body: {}, failOnStatusCode: false }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });
});
