# Documentación de Testing — Sistema de Gestión de Citas Médicas (Clinifer)

Guía de cómo se prueba el proyecto, qué se prueba, cómo ejecutarlo y qué métricas se obtienen. Cubre backend (Spring Boot / JUnit 5), frontend (Next.js / Playwright) e integración continua (GitHub Actions).

---

## 1. Resumen

| Capa | Framework | Tipo de prueba | Nº de pruebas | Ubicación |
|------|-----------|----------------|---------------|-----------|
| Backend | JUnit 5 + Mockito + Spring Test + H2 | Unitarias e integración de web | **153** (1 omitida) | `implementation/backend/medical-appointments/src/test` |
| Frontend | Playwright | End-to-end (E2E) | **10** × 2 navegadores | `implementation/frontend-next/e2e` |
| Calidad | tsc, ESLint, Maven | Typecheck, lint, build | — | CI |

Objetivo: verificar la lógica de negocio del backend de forma aislada, validar los flujos de usuario críticos del frontend en un navegador real, y automatizar todo en CI sobre la rama `testing-calidad`.

---

## 2. Backend — JUnit 5

### 2.1 Stack

- **JUnit 5 (Jupiter)** — motor de pruebas.
- **Mockito** (`MockitoExtension`) — mocks de repositorios en pruebas de servicio.
- **Spring Boot Test** (`@WebMvcTest` / `MockMvc`) — pruebas de controladores REST.
- **H2 en memoria** — base de datos para las pruebas que tocan JPA.
- **Java 21** (Temurin) obligatorio.

### 2.2 Cómo ejecutar

```bash
cd implementation/backend/medical-appointments
./mvnw clean test          # Linux/macOS/Git Bash
.\mvnw.cmd clean test      # Windows PowerShell/cmd
```

Ejecutar una sola clase:

```bash
./mvnw test -Dtest=CodeGeneratorTest
./mvnw test -Dtest=CitaServiceTest#nombreDelMetodo
```

### 2.3 Qué se prueba

**Servicios (lógica de negocio, con mocks):**

| Clase | Pruebas | Cubre |
|-------|--------:|-------|
| `AuthenticationServiceTest` | 10 | login, registro de paciente/empleado, cambio de contraseña |
| `CitaServiceTest` | 27 | registrar, actualizar, cancelar, listar citas; reglas de estado |
| `DisponibilidadServiceTest` | 34 | propuestas y bloques de disponibilidad médica |
| `EspecialidadServiceTest` | 2 | listado de especialidades activas |
| `MedicoServiceTest` | 4 | consulta de médicos y horarios |
| `PacienteServiceTest` | 4 | registro/consulta de pacientes |
| `PersonaServiceTest` | 9 | gestión de personas |

**Controladores (capa HTTP con `MockMvc`):**

| Clase | Pruebas | Cubre |
|-------|--------:|-------|
| `CitaControllerTest` | 12 | endpoints de citas, códigos HTTP, validación |
| `DisponibilidadControllerTest` | 13 | endpoints de disponibilidad |
| `EspecialidadControllerTest` | 9 | endpoints de especialidades |
| `MedicoControllerTest` | 4 | endpoints de médicos |
| `PacienteControllerTest` | 13 | endpoints de pacientes |

**Utilidades:**

| Clase | Pruebas | Cubre |
|-------|--------:|-------|
| `CodeGeneratorTest` | 11 | generación de códigos (longitud fija 10, prefijos, casos límite, excepciones) |

`ProjectApplicationTests` (1) verifica que el contexto de Spring arranca; está **omitida** (`@Disabled` / sin BD real) y aparece como `Skipped`.

### 2.4 Salida y métricas

Por cada clase Maven Surefire imprime:

```
Tests run: 27, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.442 s -- in CitaServiceTest
```

| Métrica | Significado |
|---------|-------------|
| **Tests run** | Total de pruebas ejecutadas |
| **Failures** | Una aserción falló (`assertEquals`, `assertTrue`…). Indica lógica incorrecta |
| **Errors** | Excepción inesperada (NPE, etc.). Indica código roto |
| **Skipped** | Prueba deshabilitada (`@Disabled`) o `assumeTrue` falso |
| **Time elapsed** | Duración |

Resumen final esperado:

```
Tests run: 153, Failures: 0, Errors: 0, Skipped: 1
BUILD SUCCESS
```

- `BUILD SUCCESS` → todo verde.
- `BUILD FAILURE` → hay `Failures`/`Errors`; el stacktrace indica clase, línea y `expected vs actual`.

**Reportes generados:** `target/surefire-reports/`
- `*.txt` — legible por humanos.
- `*.xml` — formato JUnit consumido por CI (se sube como artefacto `surefire-reports`).

---

## 3. Frontend — Playwright (E2E)

### 3.1 Stack

- **Playwright** (`@playwright/test`) — pruebas end-to-end en navegador real.
- Navegadores: **Chromium** y **Firefox**.
- El servidor `next dev` se levanta automáticamente (config `webServer`).

Se eligió Playwright sobre Cypress por mejor integración con Next.js, ejecución multi-navegador nativa y auto-espera (maneja el retardo de 800 ms del login sin `sleep`).

### 3.2 Cómo ejecutar

Primera vez (instalar dependencias y navegadores):

```bash
cd implementation/frontend-next
npm ci
npx playwright install chromium firefox
```

Ejecutar:

```bash
npm run test:e2e                         # todos, ambos navegadores
npm run test:e2e:ui                      # modo UI interactivo
npx playwright test --project=chromium   # solo Chromium (más rápido)
npx playwright test e2e/login.spec.ts    # un archivo
npx playwright show-report               # ver reporte HTML tras la corrida
```

### 3.3 Qué se prueba

Flujo de autenticación y navegación por rol (login determinista en cliente, usuarios demo `paciente` / `secretaria` / `medico`, contraseña `clinifer`).

**`e2e/login.spec.ts` (5):**
- Muestra la pantalla de login al inicio.
- Rechaza credenciales incorrectas y muestra mensaje de error.
- El botón de usuario demo rellena las credenciales.
- El toggle de visibilidad cambia el tipo del campo contraseña.
- Login exitoso como paciente entra al dashboard.

**`e2e/navigation.spec.ts` (5):**
- Paciente ve su menú y pantalla por defecto.
- Secretaria ve su menú administrativo.
- Médico ve su agenda y opciones de disponibilidad.
- Navegar a "Mi Perfil" marca la pantalla activa.
- Logout regresa a la pantalla de login.

### 3.4 Salida y métricas

Reporter `list`, una línea por prueba:

```
✓  4 [chromium] › login.spec.ts:52:7 › login exitoso como paciente (3.6s)
✗  8 [chromium] › navigation.spec.ts:33:7 › el médico ve su agenda
```

Resumen esperado: `10 passed` por navegador.

Ante un fallo Playwright reporta:
- El aserto que falló (`expect(locator).toBeVisible() failed`).
- El `Locator` usado y `Expected` vs `Received`.
- **Captura de pantalla** (`screenshot: only-on-failure`) y **trace** en `test-results/`.
- Reporte HTML navegable en `playwright-report/` (`npx playwright show-report`).

> Nota: un fallo no siempre es bug de código; puede ser un test frágil (p. ej. un selector ambiguo). Leer el mensaje: *failure* apunta a la lógica, *error/timeout/locator ambiguo* apunta al test.

---

## 4. Revisiones de calidad (frontend)

Además de los tests, CI ejecuta:

```bash
cd implementation/frontend-next
npx tsc --noEmit   # typecheck: 0 errores
npm run lint       # ESLint (next/core-web-vitals)
npm run build      # build/export estático de Next.js
```

**Seguridad de dependencias:**

```bash
npm audit          # esperado: found 0 vulnerabilities
```

Se fijó `overrides.postcss` en `package.json` para forzar `postcss ≥ 8.5.16` y cerrar la advertencia GHSA-qx2v-qp2m-jg93 que traía la versión empaquetada por Next.

---

## 5. Integración continua (GitHub Actions)

Workflow: `.github/workflows/quality.yml`. Se dispara en **push** y **pull_request** contra `testing-calidad`, y manualmente (`workflow_dispatch`).

| Job | Qué hace | Artefacto |
|-----|----------|-----------|
| `backend` | JDK 21 + `mvnw clean test` | `surefire-reports` |
| `frontend-quality` | `npm ci` → `tsc --noEmit` → `lint` → `build` | — |
| `frontend-e2e` | `npm ci` → instala navegadores → `test:e2e` | `playwright-report` |

Los tres jobs corren en paralelo. El workflow falla si cualquiera falla.

También existe `.github/workflows/backend-tests.yml` (solo backend, en PR hacia `main`).

---

## 6. Resumen de métricas

| Métrica | Valor actual |
|---------|--------------|
| Pruebas backend | 153 (152 ejecutadas, 1 omitida), 0 fallos |
| Pruebas frontend E2E | 10 por navegador (Chromium + Firefox) |
| Typecheck (tsc) | 0 errores |
| Lint | 0 errores (1 warning preexistente de fuentes) |
| Vulnerabilidades npm | 0 |

### Métrica pendiente: cobertura de código

Actualmente **no** se mide el % de código cubierto. Para añadirlo en backend se puede integrar **JaCoCo** (plugin Maven) y generar reporte en `target/site/jacoco/index.html`, opcionalmente con un umbral mínimo que rompa el build si baja. Pídelo si se requiere.
