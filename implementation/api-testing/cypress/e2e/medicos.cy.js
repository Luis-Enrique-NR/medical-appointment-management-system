/// <reference types="cypress" />

/** Pruebas de API — recurso /medicos (CRUD + horarios disponibles). */
const BASE = "http://localhost:3000/medicos";
let idCreado;

describe("API MEDICOS", () => {
  it("TC-01 — POST: crear médico devuelve 201 con id", () => {
    cy.request("POST", BASE, { nombres: "Miguel", apellidos: "Torres", especialidad: "Obstetricia", cmp: "99887" }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.have.property("id");
      idCreado = res.body.id;
    });
  });
  it("TC-02 — GET: listar médicos devuelve 200 y arreglo", () => {
    cy.request("GET", BASE).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
    });
  });
  it("TC-03 — GET: obtener médico por ID devuelve 200", () => {
    cy.request("GET", `${BASE}/${idCreado}`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("id", idCreado);
    });
  });
  it("TC-04 — PUT: actualizar médico devuelve 200", () => {
    cy.request("PUT", `${BASE}/${idCreado}`, { cmp: "99888" }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("cmp", "99888");
    });
  });
  it("TC-05 — GET: horarios disponibles del médico devuelve 200 y arreglo", () => {
    cy.request("GET", `${BASE}/${idCreado}/horarios`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
    });
  });
  it("TC-06 — DELETE: eliminar médico devuelve 200", () => {
    cy.request("DELETE", `${BASE}/${idCreado}`).then((res) => {
      expect(res.status).to.eq(200);
    });
  });
  it("TC-07 — POST: sin especialidad debe retornar 400", () => {
    cy.request({ method: "POST", url: BASE, body: { nombres: "X", apellidos: "Y" }, failOnStatusCode: false }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });
});
