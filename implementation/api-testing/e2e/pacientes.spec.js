const { test, expect } = require("@playwright/test");

/** Pruebas de API — recurso /pacientes (CRUD + búsqueda por DNI). */
const BASE = "http://localhost:3000/pacientes";
let idCreado;

test.describe.serial("API PACIENTES", () => {
  test("TC-01 — POST: crear paciente devuelve 201 con id", async ({ request }) => {
    const res = await request.post(BASE, { data: { nombres: "Luis", apellidos: "Ramos", dni: "45678912", correo: "luis@mail.com" } });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty("id");
    idCreado = body.id;
  });
  test("TC-02 — GET: listar pacientes devuelve 200 y arreglo", async ({ request }) => {
    const res = await request.get(BASE);
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBeTruthy();
  });
  test("TC-03 — GET: obtener por ID devuelve 200", async ({ request }) => {
    const res = await request.get(`${BASE}/${idCreado}`);
    expect(res.status()).toBe(200);
    expect((await res.json())).toHaveProperty("id", idCreado);
  });
  test("TC-04 — PUT: actualizar devuelve 200", async ({ request }) => {
    const res = await request.put(`${BASE}/${idCreado}`, { data: { correo: "luis.ramos@mail.com" } });
    expect(res.status()).toBe(200);
    expect((await res.json())).toHaveProperty("correo", "luis.ramos@mail.com");
  });
  test("TC-05 — GET: buscar por DNI devuelve 200", async ({ request }) => {
    const res = await request.get(`${BASE}/dni/45678912`);
    expect(res.status()).toBe(200);
    expect((await res.json())).toHaveProperty("dni", "45678912");
  });
  test("TC-06 — GET: DNI inexistente devuelve 404", async ({ request }) => {
    const res = await request.get(`${BASE}/dni/00000000`);
    expect(res.status()).toBe(404);
  });
  test("TC-07 — DELETE: eliminar devuelve 200", async ({ request }) => {
    const res = await request.delete(`${BASE}/${idCreado}`);
    expect(res.status()).toBe(200);
  });
  test("TC-08 — POST: datos incompletos debe retornar 400", async ({ request }) => {
    const res = await request.post(BASE, { data: { nombres: "SoloNombre" } });
    expect(res.status()).toBe(400);
  });
});
