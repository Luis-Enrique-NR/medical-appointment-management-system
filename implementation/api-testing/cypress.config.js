const { defineConfig } = require("cypress");
const mochawesome = require("cypress-mochawesome-reporter/plugin");

/**
 * Pruebas de API (cy.request) contra el CRUD de citas en http://localhost:3000.
 * Reporte HTML autocontenido en cypress/reports/html/index.html.
 */
module.exports = defineConfig({
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportDir: "cypress/reports/html",
    reportPageTitle: "CLINIFER — Pruebas de API (Cypress)",
    charts: true,
    inlineAssets: true,
    saveJson: true,
    overwrite: true,
  },
  e2e: {
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",
    video: false,
    setupNodeEvents(on, config) {
      mochawesome(on);
      return config;
    },
  },
});
