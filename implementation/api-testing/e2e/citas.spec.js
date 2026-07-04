const { test, expect } = require("@playwright/test");

/**
 * Pruebas de API REST — CRUD de citas (CLINIFER, Grupo 1).
 * Técnica: pruebas de servicio con el fixture `request` de Playwright (sin
 * navegador), según la Especificación Técnica de Software Testing (GE709V).
 */
const BASE = "http://localhost:3000/citas";
let idCreado;

test.describe.serial("CRUD CITAS — Grupo 1 (API Playwright)", () => {
  test("TC-01 — POST: crear cita médica devuelve 201 con id", async ({ request }) => {
    const res = await request.post(BASE, {
      data: {
        paciente: "Juan Pérez",
        medico: "Dra. María López",
        fecha: "2026-07-15",
        hora: "10:00",
        estado: "pendiente",
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty("id");
    idCreado = body.id;
  });

  test("TC-02 — GET: listar todas las citas devuelve 200 y un arreglo", async ({ request }) => {
    const res = await request.get(BASE);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("TC-03 — GET: obtener cita por ID devuelve 200 y el objeto", async ({ request }) => {
    const res = await request.get(`${BASE}/${idCreado}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("id", idCreado);
  });

  test("TC-04 — PUT: actualizar estado de la cita devuelve 200", async ({ request }) => {
    const res = await request.put(`${BASE}/${idCreado}`, { data: { estado: "confirmada" } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("estado", "confirmada");
  });

  test("TC-05 — DELETE: eliminar la cita devuelve 200", async ({ request }) => {
    const res = await request.delete(`${BASE}/${idCreado}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("mensaje");
  });

  test("TC-06 — POST: datos incompletos debe retornar 400", async ({ request }) => {
    const res = await request.post(BASE, { data: {} });
    expect(res.status()).toBe(400);
  });
});
