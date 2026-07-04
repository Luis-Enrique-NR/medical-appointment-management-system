---
# API REST — Referencia para Frontend

**Base URL:** `https://medical-appointment-management-system.onrender.com/api/v1`

---

# 🔐 Autenticación (`/auth`)

## `POST /auth/pub/login`

**Descripción:** Inicio de sesión con credenciales. Retorna un JWT.

### Input (JSON)

```json
{
  "correo": "juan.perez@example.com",
  "password": "miPassword123"
}
```

### Output (JSON - HTTP 200)

```json
{
  "message": "Login exitoso",
  "codigo": "200",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

---

## `POST /auth/pub/register`

**Descripción:** Autoregistro de un nuevo paciente. Retorna el token de acceso inmediato.

### Input (JSON)

```json
{
  "correo": "maria.lopez@example.com",
  "password": "claveSegura2026"
}
```

### Output (JSON - HTTP 200)

```json
{
  "message": "Registro exitoso",
  "codigo": "200",
  "data": {
    "correo": "maria.lopez@example.com",
    "habilitado": true,
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

---

## `PATCH /auth/password`

**Descripción:** Cambio de contraseña para el usuario bajo la sesión activa. Requiere Bearer Token.

### Input (JSON)

```json
{
  "oldPassword": "miPassword123",
  "newPassword": "nuevaClave456"
}
```

### Output (JSON - HTTP 200)

```json
{
  "message": "Contraseña actualizada. Su sesión actual expirará pronto.",
  "codigo": "200",
  "data": null
}
```

---

## `POST /auth/register/employee`

**Descripción:** **[ADMIN / PANEL]** Registro de cuentas corporativas.

Roles válidos:

- `1` = SECRETARIA
- `2` = MEDICO

### Input (JSON)

```json
{
  "correo": "dr.garcia@clinica.com",
  "password": "tmpPass789",
  "idRol": 2
}
```

### Output (JSON - HTTP 200)

```json
{
  "message": "Registro exitoso",
  "codigo": "200",
  "data": null
}
```

---

# 🩺 Especialidades (`/especialidades`)

## `GET /especialidades`

**Descripción:** Listado completo de especialidades activas para selects/filtros.

### Input

N/A

### Output (JSON - HTTP 200)

```json
{
  "message": "Consulta exitosa",
  "codigo": "200",
  "data": [
    {
      "idEspecialidad": 1,
      "nombre": "Cardiología",
      "descripcion": "Atención cardiológica general"
    }
  ]
}
```

---

## `GET /especialidades/{idEspecialidad}/medicos`

**Descripción:** Listado de médicos que pertenecen a la especialidad seleccionada.

### Input

Path param:

- `idEspecialidad`

### Output (JSON - HTTP 200)

```json
{
  "message": "Consulta exitosa",
  "codigo": "200",
  "data": [
    {
      "idMedico": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "nombre": "Carlos Alejandro Mendoza Prado",
      "descripcion": "Cardiólogo especialista en hemodinamia"
    }
  ]
}
```

---

# 👨‍⚕️ Médicos (`/medicos`)

## `GET /medicos/{idMedico}/horarios`

**Descripción:** Obtiene la agenda de bloques libres y asignados a un médico para el flujo de reserva.

### Input

Path param:

- `idMedico` (UUID)

### Output (JSON - HTTP 200)

```json
{
  "message": "Consulta exitosa",
  "codigo": "200",
  "data": [
    {
      "fecha": "10-07-2026",
      "horaInicio": "08:00:00",
      "horaFin": "09:00:00"
    }
  ]
}
```

---

# 👥 Pacientes (`/pacientes`)

## `POST /pacientes`

**Descripción:** Vinculación de los datos personales del paciente. Obligatorio tras el autoregistro.

### Input (JSON)

```json
{
  "dni": "12345678",
  "nombres": "Luis Fernando",
  "apellidos": "Núñez Rojas",
  "telefono": "912345678"
}
```

### Output (JSON - HTTP 201)

```json
{
  "message": "Registro exitoso",
  "codigo": "201",
  "data": {
    "idPaciente": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "dni": "12345678",
    "nombres": "Luis Fernando",
    "apellidos": "Núñez Rojas",
    "telefono": "912345678"
  }
}
```

---

## `GET /pacientes/dni/{dni}`

**Descripción:** Buscador directo por número de documento para flujos de counter/asistencias.

### Input

Path param:

- `dni` (8 dígitos)

### Output (JSON - HTTP 200)

```json
{
  "message": "Consulta exitosa",
  "codigo": "200",
  "data": {
    "idPaciente": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "dni": "12345678",
    "nombres": "Luis Fernando",
    "apellidos": "Núñez Rojas",
    "telefono": "912345678"
  }
}
```

---

# 🗓️ Disponibilidad (`/disponibilidad`)

## `POST /disponibilidad/propuesta`

**Descripción:** **[VISTA MÉDICO]** Envío de propuesta de turnos u horarios para la semana/mes.

### Input (JSON)

```json
{
  "rangosDisponibilidad": [
    {
      "dia": "10-07-2026",
      "horaInicio": "08:00",
      "horaFin": "12:00"
    }
  ]
}
```

### Output (JSON - HTTP 200)

```json
{
  "message": "Registro exitoso",
  "codigo": "200",
  "data": null
}
```

---

## `GET /disponibilidad/pendientes?idEspecialidad={idEspecialidad}`

**Descripción:** **[VISTA PANEL/SECRETARÍA]** Visualización de agendas propuestas pendientes de aprobación.

### Input

Query param:

- `idEspecialidad`

### Output (JSON - HTTP 200)

```json
{
  "message": "Consulta exitosa",
  "codigo": "200",
  "data": [
    {
      "medico": "Carlos Alejandro Mendoza Prado",
      "bloquesHorario": [
        {
          "idBloque": 15,
          "fecha": "10-07-2026",
          "horaInicio": "08:00:00",
          "horaFin": "09:00:00"
        }
      ]
    }
  ]
}
```

---

## `PUT /disponibilidad/actualizar`

**Descripción:** **[VISTA PANEL/SECRETARÍA]** Aprobación o rechazo masivo de bloques de horarios.

### Input (JSON)

```json
[
  {
    "idAsignacion": 15,
    "aprobado": true
  }
]
```

### Output (JSON - HTTP 200)

```json
{
  "message": "Actualización exitosa",
  "codigo": "200",
  "data": null
}
```

---

# 📅 Citas (`/citas`)

## `POST /citas`

**Descripción:** Reserva de cita.

- Si eres **PACIENTE**, no envíes `idPaciente` (se extrae del token).
- Si eres **SECRETARIA**, el campo es obligatorio.

### Input (JSON)

```json
{
  "idPaciente": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "idAsignacionBloque": 15
}
```

### Output (JSON - HTTP 201)

```json
{
  "message": "Registro exitoso",
  "codigo": "201",
  "data": null
}
```

---

## `PUT /citas`

**Descripción:** Mutación de estado de una cita para procesos de cancelación o cambio de fecha.

### Input (Cancelar)

```json
{
  "idCita": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "accion": "CANCELAR",
  "motivoActualizacion": "El paciente solicitó cancelación"
}
```

### Input (Reprogramar)

```json
{
  "idCita": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "accion": "REPROGRAMAR",
  "idAsignacionBloqueNuevo": 22,
  "motivoActualizacion": "Conflicto de horario"
}
```

### Output (JSON - HTTP 200)

```json
{
  "message": "Actualización exitosa",
  "codigo": "200",
  "data": null
}
```

---

## `GET /citas/secretaria?soloHoy={bool}&search={texto}&page={n}`

**Descripción:** **[VISTA PANEL/SECRETARÍA]** Grid de control centralizado con buscador global y paginado integrado.

### Input

Query params:

- `soloHoy`
- `search`
- `page`

### Output (JSON - HTTP 200)

```json
{
  "message": "Consulta exitosa",
  "codigo": "200",
  "data": {
    "content": [
      {
        "idCita": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "idPaciente": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "dniPaciente": "12345678",
        "paciente": "Luis Fernando Núñez Rojas",
        "codigoCita": "CT-00001",
        "medico": "Carlos Alejandro Mendoza Prado",
        "especialidad": "Cardiología",
        "fecha": "10-07-2026",
        "hora": "08:00:00",
        "codigoConsultorio": "CON-001",
        "idAsignacionBloque": 15,
        "estadoCita": "PROGRAMADO",
        "fechaCreacion": "03-07-2026 10:30:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

---

## `GET /citas/me/proximas`

**Descripción:** **[VISTA PACIENTE]** Dashboard del cliente. Muestra sus reservas vigentes.

### Input

Se obtiene mediante el Bearer Token.

### Output (JSON - HTTP 200)

```json
{
  "message": "Consulta exitosa",
  "codigo": "200",
  "data": [
    {
      "idCita": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "idPaciente": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "dniPaciente": "12345678",
      "paciente": "Luis Fernando Núñez Rojas",
      "codigoCita": "CT-00001",
      "medico": "Carlos Alejandro Mendoza Prado",
      "especialidad": "Cardiología",
      "fecha": "10-07-2026",
      "hora": "08:00:00",
      "codigoConsultorio": "CON-001",
      "idAsignacionBloque": 15,
      "estadoCita": "PROGRAMADO",
      "fechaCreacion": "03-07-2026 10:30:00"
    }
  ]
}
```

---

## `GET /citas/me/historial?page={n}`

**Descripción:** **[VISTA PACIENTE]** Bitácora de citas pasadas o archivadas (`ATENDIDO`, `CANCELADO`). Paginado.

### Input

Query param:

- `page`

### Output (JSON - HTTP 200)

```json
{
  "message": "Consulta exitosa",
  "codigo": "200",
  "data": {
    "content": [
      {
        "idCita": "b2c3d4e5-...",
        "idPaciente": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "dniPaciente": "12345678",
        "paciente": "Luis Fernando Núñez Rojas",
        "codigoCita": "CT-00005",
        "medico": "María García Torres",
        "especialidad": "Pediatría",
        "fecha": "28-06-2026",
        "hora": "10:00:00",
        "codigoConsultorio": "CON-003",
        "idAsignacionBloque": 42,
        "estadoCita": "ATENDIDO",
        "fechaCreacion": "20-06-2026 15:00:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

---

## `GET /citas/agenda?fecha={dd-MM-yyyy}`

**Descripción:** **[VISTA MÉDICO]** Agenda diaria del profesional de salud con el listado de pacientes citados.

### Input

Query param:

- `fecha` (`dd-MM-yyyy`)

### Output (JSON - HTTP 200)

```json
{
  "message": "Consulta exitosa",
  "codigo": "200",
  "data": [
    {
      "idCita": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "idPaciente": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "dniPaciente": "12345678",
      "paciente": "Luis Fernando Núñez Rojas",
      "codigoCita": "CT-00001",
      "medico": "Carlos Alejandro Mendoza Prado",
      "especialidad": "Cardiología",
      "fecha": "10-07-2026",
      "hora": "08:00:00",
      "codigoConsultorio": "CON-001",
      "idAsignacionBloque": 15,
      "estadoCita": "PROGRAMADO",
      "fechaCreacion": "03-07-2026 10:30:00"
    }
  ]
}
```