import { test, expect, Page } from "@playwright/test";

/** Inicia sesión con un usuario demo y espera a que cargue el dashboard. */
async function login(page: Page, username: string) {
  await page.goto("/");
  await page.getByPlaceholder("Ingrese su usuario").fill(username);
  await page.getByPlaceholder("Ingrese su contraseña").fill("clinifer");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();
  await expect(page.getByRole("button", { name: "Cerrar Sesión" })).toBeVisible();
}

test.describe("Navegación por rol", () => {
  test("el paciente ve su menú y su pantalla por defecto", async ({ page }) => {
    await login(page, "paciente");
    await expect(
      page.getByRole("complementary").getByText("Paciente", { exact: true })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Mis Citas" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Disponibilidad de Médicos" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Mi Perfil" })).toBeVisible();
  });

  test("la secretaria ve su menú administrativo", async ({ page }) => {
    await login(page, "secretaria");
    await expect(
      page.getByRole("complementary").getByText("Secretaria Administrativa")
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Agendar Cita" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Gestionar Citas" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Buscar Citas de Paciente" })
    ).toBeVisible();
  });

  test("el médico ve su agenda y opciones de disponibilidad", async ({ page }) => {
    await login(page, "medico");
    await expect(
      page.getByRole("complementary").getByText("Médico Especialista")
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Mi Agenda" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Registrar Disponibilidad" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Historial de Propuestas" })
    ).toBeVisible();
  });

  test("navegar a Mi Perfil cambia la pantalla activa", async ({ page }) => {
    await login(page, "paciente");
    await page.getByRole("button", { name: "Mi Perfil" }).click();
    // El item de perfil queda como activo (Layout aplica clase bg-[#006FC1]).
    await expect(page.getByRole("button", { name: "Mi Perfil" })).toHaveClass(
      /bg-\[#006FC1\]/
    );
  });

  test("logout regresa a la pantalla de login", async ({ page }) => {
    await login(page, "paciente");
    await page.getByRole("button", { name: "Cerrar Sesión" }).click();
    await expect(
      page.getByRole("heading", { name: "Sistema de Gestión de Citas" })
    ).toBeVisible();
  });
});
