import { defineConfig } from "cypress";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mochawesome = require("cypress-mochawesome-reporter/plugin");

/**
 * Configuración de Cypress para las pruebas E2E de Clinifer.
 * Se ejecuta contra el servidor de Next.js levantado en http://localhost:3000
 * (usar `npm run test:cy` que lo levanta automáticamente con start-server-and-test).
 *
 * Reporte HTML: cypress-mochawesome-reporter genera un informe único y
 * autocontenido en cypress/reports/html/index.html al terminar `cypress run`.
 */
export default defineConfig({
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportDir: "cypress/reports/html",
    reportPageTitle: "Clinifer — Reporte de Pruebas E2E (Cypress)",
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
    saveJson: true,
    overwrite: true,
  },
  e2e: {
    baseUrl: "http://localhost:3000",
    // >= lg (1024px) para que la barra lateral (aside lg:static) sea visible.
    viewportWidth: 1280,
    viewportHeight: 800,
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    fixturesFolder: "cypress/fixtures",
    video: false,
    retries: { runMode: 2, openMode: 0 },
    setupNodeEvents(on, config) {
      mochawesome(on);
      return config;
    },
  },
});
