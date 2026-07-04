/// <reference types="cypress" />

/** Pruebas de API — módulo /auth (registro y autenticación). */
const BASE = "http://localhost:3000/auth";
const nuevo = `user_${Date.now()}@clinifer.com`;

describe("API AUTH", () => {
  it("TC-01 — POST /register: registro válido devuelve 201 con token", () => {
    cy.request("POST", `${BASE}/register`, { correo: nuevo, password: "Clave12345" }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.have.property("token");
    });
  });
  it("TC-02 — POST /register: correo duplicado devuelve 409", () => {
    cy.request({ method: "POST", url: `${BASE}/register`, body: { correo: nuevo, password: "Clave12345" }, failOnStatusCode: false }).then((res) => {
      expect(res.status).to.eq(409);
    });
  });
  it("TC-03 — POST /register: datos incompletos devuelve 400", () => {
    cy.request({ method: "POST", url: `${BASE}/register`, body: { correo: "x@x.com" }, failOnStatusCode: false }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });
  it("TC-04 — POST /login: credenciales válidas devuelve 200 con token", () => {
    cy.request("POST", `${BASE}/login`, { correo: "admin@clinifer.com", password: "clinifer" }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("token");
    });
  });
  it("TC-05 — POST /login: credenciales inválidas devuelve 401", () => {
    cy.request({ method: "POST", url: `${BASE}/login`, body: { correo: "admin@clinifer.com", password: "mala" }, failOnStatusCode: false }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });
  it("TC-06 — POST /login: sin password devuelve 400", () => {
    cy.request({ method: "POST", url: `${BASE}/login`, body: { correo: "admin@clinifer.com" }, failOnStatusCode: false }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });
});
