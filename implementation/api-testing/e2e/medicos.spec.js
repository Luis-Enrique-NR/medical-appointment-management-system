const { test, expect } = require("@playwright/test");

/** Pruebas de API — recurso /medicos (CRUD + horarios disponibles). */
const BASE = "http://localhost:3000/medicos";
let idCreado;

test.describe.serial("API MEDICOS", () => {
  test("TC-01 — POST: crear médico devuelve 201 con id", async ({ request }) => {
    const res = await request.post(BASE, { data: { nombres: "Miguel", apellidos: "Torres", especialidad: "Obstetricia", cmp: "99887" } });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty("id");
    idCreado = body.id;
  });
  test("TC-02 — GET: listar médicos devuelve 200 y arreglo", async ({ request }) => {
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
    const res = await request.put(`${BASE}/${idCreado}`, { data: { cmp: "99888" } });
    expect(res.status()).toBe(200);
    expect((await res.json())).toHaveProperty("cmp", "99888");
  });
  test("TC-05 — GET: horarios del médico devuelve 200 y arreglo", async ({ request }) => {
    const res = await request.get(`${BASE}/${idCreado}/horarios`);
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBeTruthy();
  });
  test("TC-06 — DELETE: eliminar devuelve 200", async ({ request }) => {
    const res = await request.delete(`${BASE}/${idCreado}`);
    expect(res.status()).toBe(200);
  });
  test("TC-07 — POST: sin especialidad debe retornar 400", async ({ request }) => {
    const res = await request.post(BASE, { data: { nombres: "X", apellidos: "Y" } });
    expect(res.status()).toBe(400);
  });
});
