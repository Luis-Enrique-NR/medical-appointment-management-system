const { defineConfig } = require("@playwright/test");

/**
 * Pruebas de API (fixture `request`) contra el CRUD de citas en http://localhost:3000.
 * Reporte HTML en playwright-report/.
 */
module.exports = defineConfig({
  testDir: "./e2e",
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL: "http://localhost:3000",
  },
});
