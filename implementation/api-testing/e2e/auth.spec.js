const { test, expect } = require("@playwright/test");

/** Pruebas de API — módulo /auth (registro y autenticación). */
const BASE = "http://localhost:3000/auth";
const nuevo = `user_pw_${Date.now()}@clinifer.com`;

test.describe.serial("API AUTH", () => {
  test("TC-01 — POST /register: registro válido devuelve 201 con token", async ({ request }) => {
    const res = await request.post(`${BASE}/register`, { data: { correo: nuevo, password: "Clave12345" } });
    expect(res.status()).toBe(201);
    expect((await res.json())).toHaveProperty("token");
  });
  test("TC-02 — POST /register: correo duplicado devuelve 409", async ({ request }) => {
    const res = await request.post(`${BASE}/register`, { data: { correo: nuevo, password: "Clave12345" } });
    expect(res.status()).toBe(409);
  });
  test("TC-03 — POST /register: datos incompletos devuelve 400", async ({ request }) => {
    const res = await request.post(`${BASE}/register`, { data: { correo: "x@x.com" } });
    expect(res.status()).toBe(400);
  });
  test("TC-04 — POST /login: credenciales válidas devuelve 200 con token", async ({ request }) => {
    const res = await request.post(`${BASE}/login`, { data: { correo: "admin@clinifer.com", password: "clinifer" } });
    expect(res.status()).toBe(200);
    expect((await res.json())).toHaveProperty("token");
  });
  test("TC-05 — POST /login: credenciales inválidas devuelve 401", async ({ request }) => {
    const res = await request.post(`${BASE}/login`, { data: { correo: "admin@clinifer.com", password: "mala" } });
    expect(res.status()).toBe(401);
  });
  test("TC-06 — POST /login: sin password devuelve 400", async ({ request }) => {
    const res = await request.post(`${BASE}/login`, { data: { correo: "admin@clinifer.com" } });
    expect(res.status()).toBe(400);
  });
});
