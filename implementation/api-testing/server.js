/**
 * API REST de CLINIFER (mock para pruebas de servicio) — GE709V Software Testing.
 *
 * Reproduce el contrato de los recursos principales del sistema para poder
 * ejercitarlos con Cypress (cy.request) y Playwright (request) sin navegador ni
 * infraestructura. Almacenamiento en memoria → pruebas reproducibles.
 *
 * Recursos:
 *   /citas            CRUD  (paciente, medico, fecha, hora, estado)
 *   /especialidades   CRUD  (nombre, descripcion, activo) + /:id/medicos
 *   /pacientes        CRUD  (nombres, apellidos, dni, correo) + /dni/:dni
 *   /medicos          CRUD  (nombres, apellidos, especialidad, cmp) + /:id/horarios
 *   /auth             POST /auth/register, POST /auth/login
 */
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Factory de CRUD en memoria para un recurso.
 * @param {string} name  ruta base (sin barra), p.ej. "citas"
 * @param {string[]} required  campos obligatorios (validación 400)
 * @param {object} defaults  valores por defecto al crear
 * @param {Array} seed  registros iniciales
 */
function crud(name, required, defaults = {}, seed = []) {
  let items = seed.map((s, i) => ({ id: i + 1, ...s }));
  let nextId = items.length + 1;
  const editable = [...required, ...Object.keys(defaults)];

  const router = express.Router();

  router.post(`/${name}`, (req, res) => {
    const body = req.body || {};
    const faltantes = required.filter((c) => body[c] === undefined || body[c] === "");
    if (faltantes.length > 0) {
      return res.status(400).json({ error: `Campos obligatorios faltantes: ${faltantes.join(", ")}` });
    }
    const item = { id: nextId++, ...defaults };
    editable.forEach((k) => { if (body[k] !== undefined) item[k] = body[k]; });
    items.push(item);
    return res.status(201).json(item);
  });

  router.get(`/${name}`, (_req, res) => res.status(200).json(items));

  router.get(`/${name}/:id`, (req, res) => {
    const item = items.find((x) => x.id === Number(req.params.id));
    if (!item) return res.status(404).json({ error: `${name} no encontrado` });
    return res.status(200).json(item);
  });

  router.put(`/${name}/:id`, (req, res) => {
    const item = items.find((x) => x.id === Number(req.params.id));
    if (!item) return res.status(404).json({ error: `${name} no encontrado` });
    const body = req.body || {};
    editable.forEach((k) => { if (body[k] !== undefined) item[k] = body[k]; });
    return res.status(200).json(item);
  });

  router.delete(`/${name}/:id`, (req, res) => {
    const idx = items.findIndex((x) => x.id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ error: `${name} no encontrado` });
    items.splice(idx, 1);
    return res.status(200).json({ mensaje: `${name} eliminado correctamente` });
  });

  return { router, all: () => items };
}

// ---- Recursos CRUD ----
const citas = crud("citas", ["paciente", "medico", "fecha", "hora"], { estado: "pendiente" });
const especialidades = crud(
  "especialidades",
  ["nombre"],
  { descripcion: "", activo: true },
  [{ nombre: "Ginecología", descripcion: "Salud femenina", activo: true },
   { nombre: "Obstetricia", descripcion: "Embarazo", activo: true }]
);
const pacientes = crud(
  "pacientes",
  ["nombres", "apellidos", "dni"],
  { correo: "" },
  [{ nombres: "Ana", apellidos: "Torres", dni: "40123456", correo: "ana@mail.com" }]
);
const medicos = crud(
  "medicos",
  ["nombres", "apellidos", "especialidad"],
  { cmp: "" },
  [{ nombres: "Carmen", apellidos: "López", especialidad: "Ginecología", cmp: "12345" }]
);

app.use(citas.router);
app.use(especialidades.router);
app.use(pacientes.router);
app.use(medicos.router);

// ---- Endpoints especiales ----

// Médicos por especialidad
app.get("/especialidades/:id/medicos", (req, res) => {
  const esp = especialidades.all().find((e) => e.id === Number(req.params.id));
  if (!esp) return res.status(404).json({ error: "especialidad no encontrada" });
  const lista = medicos.all().filter((m) => m.especialidad === esp.nombre);
  return res.status(200).json(lista);
});

// Horarios disponibles de un médico (demo)
app.get("/medicos/:id/horarios", (req, res) => {
  const med = medicos.all().find((m) => m.id === Number(req.params.id));
  if (!med) return res.status(404).json({ error: "medico no encontrado" });
  return res.status(200).json([
    { fecha: "2026-07-15", hora: "09:00", disponible: true },
    { fecha: "2026-07-15", hora: "09:30", disponible: true },
  ]);
});

// Paciente por DNI
app.get("/pacientes/dni/:dni", (req, res) => {
  const p = pacientes.all().find((x) => x.dni === req.params.dni);
  if (!p) return res.status(404).json({ error: "paciente no encontrado" });
  return res.status(200).json(p);
});

// ---- Auth ----
const usuarios = [{ correo: "admin@clinifer.com", password: "clinifer" }];
function fakeToken(correo) {
  return "tok_" + Buffer.from(correo + ":" + Date.now()).toString("base64").slice(0, 24);
}

app.post("/auth/register", (req, res) => {
  const { correo, password } = req.body || {};
  if (!correo || !password) {
    return res.status(400).json({ error: "correo y password son obligatorios" });
  }
  if (usuarios.some((u) => u.correo === correo)) {
    return res.status(409).json({ error: "el correo ya está registrado" });
  }
  usuarios.push({ correo, password });
  return res.status(201).json({ correo, token: fakeToken(correo) });
});

app.post("/auth/login", (req, res) => {
  const { correo, password } = req.body || {};
  if (!correo || !password) {
    return res.status(400).json({ error: "correo y password son obligatorios" });
  }
  const u = usuarios.find((x) => x.correo === correo && x.password === password);
  if (!u) return res.status(401).json({ error: "credenciales inválidas" });
  return res.status(200).json({ token: fakeToken(correo) });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`API CLINIFER (mock) escuchando en http://localhost:${PORT}`));
}

module.exports = app;
