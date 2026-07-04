/// <reference types="cypress" />

/** Pruebas de API — recurso /especialidades (CRUD + médicos por especialidad). */
const BASE = "http://localhost:3000/especialidades";
let idCreado;

describe("API ESPECIALIDADES", () => {
  it("TC-01 — POST: crear especialidad devuelve 201 con id", () => {
    cy.request("POST", BASE, { nombre: "Fertilidad", descripcion: "Tratamientos", activo: true }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.have.property("id");
      idCreado = res.body.id;
    });
  });
  it("TC-02 — GET: listar especialidades devuelve 200 y arreglo", () => {
    cy.request("GET", BASE).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
    });
  });
  it("TC-03 — GET: obtener especialidad por ID devuelve 200", () => {
    cy.request("GET", `${BASE}/${idCreado}`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("id", idCreado);
    });
  });
  it("TC-04 — PUT: actualizar especialidad devuelve 200", () => {
    cy.request("PUT", `${BASE}/${idCreado}`, { activo: false }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("activo", false);
    });
  });
  it("TC-05 — DELETE: eliminar especialidad devuelve 200", () => {
    cy.request("DELETE", `${BASE}/${idCreado}`).then((res) => {
      expect(res.status).to.eq(200);
    });
  });
  it("TC-06 — POST: sin nombre debe retornar 400", () => {
    cy.request({ method: "POST", url: BASE, body: {}, failOnStatusCode: false }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });
  it("TC-07 — GET: médicos por especialidad devuelve 200 y arreglo", () => {
    cy.request("GET", `${BASE}/1/medicos`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
    });
  });
});
