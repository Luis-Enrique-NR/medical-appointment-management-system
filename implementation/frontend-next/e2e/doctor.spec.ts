import { test, expect, Page } from "@playwright/test";

/**
 * Pruebas E2E del MÓDULO MÉDICO (Playwright, Chromium + Firefox).
 * Cubre el dashboard del médico especialista: agenda diaria ("Mi Agenda"),
 * registro de disponibilidad ("Registrar Mi Disponibilidad") e historial de
 * propuestas. Es un módulo distinto al cubierto por Cypress (paciente/secretaría).
 */
async function loginMedico(page: Page) {
  await page.goto("/");
  await page.getByPlaceholder("Ingrese su usuario").fill("medico");
  await page.getByPlaceholder("Ingrese su contraseña").fill("clinifer");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();
  await expect(page.getByRole("button", { name: "Cerrar Sesión" })).toBeVisible();
}

test.describe("Módulo Médico", () => {
  test.beforeEach(async ({ page }) => {
    await loginMedico(page);
  });

  test("muestra 'Mi Agenda' como pantalla por defecto", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Mi Agenda" })).toBeVisible();
    await expect(
      page.getByRole("complementary").getByText("Médico Especialista")
    ).toBeVisible();
  });

  test("el menú del médico expone agenda, disponibilidad e historial", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Mi Agenda" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Registrar Disponibilidad" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Historial de Propuestas" })).toBeVisible();
  });

  test("la agenda incluye el control 'Hoy' para volver al día actual", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Hoy" })).toBeVisible();
  });

  test("registra disponibilidad: el envío está deshabilitado sin selección", async ({ page }) => {
    await page.getByRole("button", { name: "Registrar Disponibilidad" }).click();
    await expect(
      page.getByRole("heading", { name: "Registrar Mi Disponibilidad" })
    ).toBeVisible();
    await expect(page.getByText("Seleccione sus bloques disponibles")).toBeVisible();
    // Sin franjas seleccionadas, el panel Resumen muestra el estado vacío y no
    // hay botón "Enviar Propuesta": no se puede enviar una propuesta vacía.
    await expect(page.getByText("Seleccione bloques en el calendario")).toBeVisible();
    await expect(page.getByRole("button", { name: "Enviar Propuesta" })).toHaveCount(0);
  });

  test("consulta el historial de propuestas", async ({ page }) => {
    await page.getByRole("button", { name: "Historial de Propuestas" }).click();
    await expect(
      page.getByRole("heading", { name: "Historial de Propuestas" })
    ).toBeVisible();
  });

  test("el ítem de menú activo queda resaltado al navegar", async ({ page }) => {
    await page.getByRole("button", { name: "Registrar Disponibilidad" }).click();
    await expect(
      page.getByRole("button", { name: "Registrar Disponibilidad" })
    ).toHaveClass(/bg-\[#006FC1\]/);
  });
});
