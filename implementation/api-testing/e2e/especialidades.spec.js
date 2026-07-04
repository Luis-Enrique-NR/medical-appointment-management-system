const { test, expect } = require("@playwright/test");

/** Pruebas de API — recurso /especialidades (CRUD + médicos por especialidad). */
const BASE = "http://localhost:3000/especialidades";
let idCreado;

test.describe.serial("API ESPECIALIDADES", () => {
  test("TC-01 — POST: crear especialidad devuelve 201 con id", async ({ request }) => {
    const res = await request.post(BASE, { data: { nombre: "Fertilidad", descripcion: "Tratamientos", activo: true } });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty("id");
    idCreado = body.id;
  });
  test("TC-02 — GET: listar especialidades devuelve 200 y arreglo", async ({ request }) => {
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
    const res = await request.put(`${BASE}/${idCreado}`, { data: { activo: false } });
    expect(res.status()).toBe(200);
    expect((await res.json())).toHaveProperty("activo", false);
  });
  test("TC-05 — DELETE: eliminar devuelve 200", async ({ request }) => {
    const res = await request.delete(`${BASE}/${idCreado}`);
    expect(res.status()).toBe(200);
  });
  test("TC-06 — POST: sin nombre debe retornar 400", async ({ request }) => {
    const res = await request.post(BASE, { data: {} });
    expect(res.status()).toBe(400);
  });
  test("TC-07 — GET: médicos por especialidad devuelve 200 y arreglo", async ({ request }) => {
    const res = await request.get(`${BASE}/1/medicos`);
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBeTruthy();
  });
});
