/// <reference types="cypress" />

/** Pruebas de API — recurso /pacientes (CRUD + búsqueda por DNI). */
const BASE = "http://localhost:3000/pacientes";
let idCreado;

describe("API PACIENTES", () => {
  it("TC-01 — POST: crear paciente devuelve 201 con id", () => {
    cy.request("POST", BASE, { nombres: "Luis", apellidos: "Ramos", dni: "45678912", correo: "luis@mail.com" }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.have.property("id");
      idCreado = res.body.id;
    });
  });
  it("TC-02 — GET: listar pacientes devuelve 200 y arreglo", () => {
    cy.request("GET", BASE).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
    });
  });
  it("TC-03 — GET: obtener paciente por ID devuelve 200", () => {
    cy.request("GET", `${BASE}/${idCreado}`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("id", idCreado);
    });
  });
  it("TC-04 — PUT: actualizar paciente devuelve 200", () => {
    cy.request("PUT", `${BASE}/${idCreado}`, { correo: "luis.ramos@mail.com" }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("correo", "luis.ramos@mail.com");
    });
  });
  it("TC-05 — GET: buscar paciente por DNI devuelve 200", () => {
    cy.request("GET", `${BASE}/dni/45678912`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("dni", "45678912");
    });
  });
  it("TC-06 — GET: DNI inexistente devuelve 404", () => {
    cy.request({ method: "GET", url: `${BASE}/dni/00000000`, failOnStatusCode: false }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });
  it("TC-07 — DELETE: eliminar paciente devuelve 200", () => {
    cy.request("DELETE", `${BASE}/${idCreado}`).then((res) => {
      expect(res.status).to.eq(200);
    });
  });
  it("TC-08 — POST: datos incompletos debe retornar 400", () => {
    cy.request({ method: "POST", url: BASE, body: { nombres: "SoloNombre" }, failOnStatusCode: false }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });
});
