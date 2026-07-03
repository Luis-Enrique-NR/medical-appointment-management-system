# Pruebas del Sistema

Carpeta dedicada a la planificación, ejecución y reporte de pruebas.

### Contenido esperado:

- 5.1 Plan de pruebas
- 5.2 Casos de prueba
- 5.3 Errores encontrados y cómo se resolvieron
- 5.4 Validación con usuarios
- Reportes de pruebas

## Pruebas automatizadas

### Backend — JUnit 5 (`implementation/backend/medical-appointments`)

Pruebas unitarias de servicios, controladores y utilidades con JUnit 5 + Mockito
y H2 en memoria. Ejecutar:

```bash
cd implementation/backend/medical-appointments
./mvnw clean test
```

### Frontend — Playwright E2E (`implementation/frontend-next`)

Pruebas end-to-end del flujo de login y navegación por rol. Ejecutar:

```bash
cd implementation/frontend-next
npm ci
npx playwright install --with-deps chromium firefox
npm run test:e2e
```

### Integración continua

El workflow `.github/workflows/quality.yml` corre en la rama `testing-calidad`
(push y PR) las revisiones de calidad: tests de backend, typecheck + lint +
build de frontend, y pruebas E2E de Playwright.