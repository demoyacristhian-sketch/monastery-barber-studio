-- ============================================================
-- Migración: Servicios y Barberos reales — Monastery Barber Studio
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ── 1. SERVICIOS ─────────────────────────────────────────────
-- Desactivar servicios anteriores de prueba
UPDATE servicios SET activo = false;

-- Insertar servicios principales
INSERT INTO servicios (nombre, categoria, precio, duracion_minutos, activo)
VALUES
  ('Corte Estándar',   'Principal',    17,  35, true),
  ('Corte Medium',     'Principal',    25,  45, true),
  ('Corte Premium',    'Principal',    35,  60, true),
  ('Solo Barba',       'Complemento',  12,  20, true),
  ('Retoque de Corte', 'Complemento',  12,  20, true),
  ('Corte + Diseño',   'Complemento',  20,  45, true),
  ('Tinte Completo',   'Complemento',  65,  90, true),
  ('Mechas',           'Complemento',  50,  90, true)
ON CONFLICT DO NOTHING;

-- ── 2. BARBEROS ──────────────────────────────────────────────
-- Desactivar barberos anteriores de prueba
UPDATE barberos SET activo = false;

-- Obtener IDs de sedes (necesarios para asignar barbero a sede)
-- Sede 1: San Quirce → Jonathan Suárez
-- Sede 2: Recoletos  → Daniel Quiñones

-- Insertar/actualizar Jonathan Suárez (sede San Quirce)
INSERT INTO barberos (nombre, activo, sede_id)
SELECT
  'Jonathan Suárez',
  true,
  s.id
FROM sedes s
WHERE s.nombre ILIKE '%quirce%' OR s.nombre ILIKE '%histórico%' OR s.nombre ILIKE '%san quirce%'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insertar/actualizar Daniel Quiñones (sede Recoletos)
INSERT INTO barberos (nombre, activo, sede_id)
SELECT
  'Daniel Quiñones',
  true,
  s.id
FROM sedes s
WHERE s.nombre ILIKE '%recoletos%'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ── 3. VERIFICACIÓN ──────────────────────────────────────────
-- Ejecuta estas consultas para comprobar el resultado:
-- SELECT id, nombre, categoria, precio, duracion_minutos, activo FROM servicios ORDER BY categoria, nombre;
-- SELECT b.nombre AS barbero, s.nombre AS sede, b.activo FROM barberos b LEFT JOIN sedes s ON b.sede_id = s.id ORDER BY b.nombre;
