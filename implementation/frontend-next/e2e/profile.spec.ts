import { test, expect, Page } from "@playwright/test";

/**
 * Pruebas E2E del MÓDULO PERFIL (Playwright, Chromium + Firefox).
 * Cubre la pantalla compartida "Mi Perfil" (UserProfile): datos de solo lectura,
 * formulario de cambio de contraseña y cierre de sesión. Se ejercita de forma
 * transversal para los tres roles. Módulo distinto al cubierto por Cypress.
 */
async function login(page: Page, username: string) {
  await page.goto("/");
  await page.getByPlaceholder("Ingrese su usuario").fill(username);
  await page.getByPlaceholder("Ingrese su contraseña").fill("clinifer");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();
  await expect(page.getByRole("button", { name: "Cerrar Sesión" })).toBeVisible();
}

test.describe("Módulo Perfil", () => {
  test("el paciente accede a su perfil y ve datos de solo lectura", async ({ page }) => {
    await login(page, "paciente");
    await page.getByRole("button", { name: "Mi Perfil" }).click();
    await expect(page.getByRole("heading", { name: "Mi Perfil" })).toBeVisible();
    await expect(page.getByText("Nombre", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Correo", { exact: false }).first()).toBeVisible();
  });

  test("el formulario de cambio de contraseña está disponible", async ({ page }) => {
    await login(page, "medico");
    await page.getByRole("button", { name: "Mi Perfil" }).click();
    await expect(page.getByText("Cambiar Contraseña")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Actualizar Contraseña" })
    ).toBeVisible();
  });

  test("la secretaria también puede abrir su perfil", async ({ page }) => {
    await login(page, "secretaria");
    await page.getByRole("button", { name: "Mi Perfil" }).click();
    await expect(page.getByRole("heading", { name: "Mi Perfil" })).toBeVisible();
  });

  test("el ítem 'Mi Perfil' queda activo tras seleccionarlo", async ({ page }) => {
    await login(page, "paciente");
    await page.getByRole("button", { name: "Mi Perfil" }).click();
    await expect(page.getByRole("button", { name: "Mi Perfil" })).toHaveClass(
      /bg-\[#006FC1\]/
    );
  });

  test("cerrar sesión desde el dashboard regresa al login", async ({ page }) => {
    await login(page, "medico");
    await page.getByRole("button", { name: "Cerrar Sesión" }).click();
    await expect(
      page.getByRole("heading", { name: "Sistema de Gestión de Citas" })
    ).toBeVisible();
  });
});
