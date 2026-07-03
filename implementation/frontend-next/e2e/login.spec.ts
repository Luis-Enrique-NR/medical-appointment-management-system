import { test, expect } from "@playwright/test";

/**
 * Pruebas E2E del flujo de autenticación (LoginScreen).
 * El login es determinista y se resuelve en el cliente con usuarios demo:
 *   paciente / secretaria / medico  (password: "clinifer").
 */
test.describe("Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("muestra la pantalla de login al inicio", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Sistema de Gestión de Citas" })
    ).toBeVisible();
    await expect(page.getByPlaceholder("Ingrese su usuario")).toBeVisible();
    await expect(page.getByPlaceholder("Ingrese su contraseña")).toBeVisible();
    await expect(page.getByRole("button", { name: "Iniciar Sesión" })).toBeVisible();
  });

  test("rechaza credenciales incorrectas y muestra error", async ({ page }) => {
    await page.getByPlaceholder("Ingrese su usuario").fill("paciente");
    await page.getByPlaceholder("Ingrese su contraseña").fill("incorrecta");
    await page.getByRole("button", { name: "Iniciar Sesión" }).click();

    await expect(
      page.getByText("Usuario o contraseña incorrectos. Intente de nuevo.")
    ).toBeVisible();
    // Sigue en la pantalla de login
    await expect(
      page.getByRole("heading", { name: "Sistema de Gestión de Citas" })
    ).toBeVisible();
  });

  test("el botón de usuario demo rellena las credenciales", async ({ page }) => {
    await page.getByRole("button", { name: /paciente \(Paciente\)/ }).click();
    await expect(page.getByPlaceholder("Ingrese su usuario")).toHaveValue("paciente");
    await expect(page.getByPlaceholder("Ingrese su contraseña")).toHaveValue("clinifer");
  });

  test("el toggle de visibilidad cambia el tipo del campo contraseña", async ({ page }) => {
    const pass = page.getByPlaceholder("Ingrese su contraseña");
    await pass.fill("clinifer");
    await expect(pass).toHaveAttribute("type", "password");

    // El botón de ojo no tiene texto; es el único botón dentro del contenedor relativo del input.
    await page.locator("form button[type='button']").click();
    await expect(pass).toHaveAttribute("type", "text");
  });

  test("login exitoso como paciente entra al dashboard", async ({ page }) => {
    await page.getByPlaceholder("Ingrese su usuario").fill("paciente");
    await page.getByPlaceholder("Ingrese su contraseña").fill("clinifer");
    await page.getByRole("button", { name: "Iniciar Sesión" }).click();

    await expect(
      page.getByRole("complementary").getByText("Paciente", { exact: true })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Mis Citas" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cerrar Sesión" })).toBeVisible();
  });
});
