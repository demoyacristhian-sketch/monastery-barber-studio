-- ============================================================
-- FIX DEFINITIVO: Servicios y Barberos — Monastery Barber Studio
-- Ejecutar en Supabase SQL Editor (proyecto skxdoxgwpbvrwcqzfqax)
-- ============================================================

-- ── 1. SERVICIOS ─────────────────────────────────────────────
-- Desactivar TODOS los servicios existentes
UPDATE servicios SET activo = false;

-- Insertar los 8 servicios reales con categorías válidas del ENUM
INSERT INTO servicios (nombre, categoria, precio, duracion_minutos, activo)
VALUES
  ('Corte Estándar',   'corte',        17,  35, true),
  ('Corte Medium',     'corte',        25,  45, true),
  ('Corte Premium',    'corte',        35,  60, true),
  ('Solo Barba',       'barba',        12,  20, true),
  ('Retoque de Corte', 'corte',        12,  20, true),
  ('Corte + Diseño',   'corte',        20,  45, true),
  ('Tinte Completo',   'tratamiento',  65,  90, true),
  ('Mechas',           'tratamiento',  50,  90, true);

-- ── 2. BARBEROS ──────────────────────────────────────────────
-- Desactivar TODOS los barberos existentes
UPDATE barberos SET activo = false;

-- Jonathan Suárez → MBS San Quirce
INSERT INTO barberos (nombre, activo, sede_id)
SELECT 'Jonathan Suárez', true, s.id
FROM sedes s
WHERE s.nombre = 'MBS San Quirce'
LIMIT 1;

-- Daniel Quiñones → MBS Recoletos
INSERT INTO barberos (nombre, activo, sede_id)
SELECT 'Daniel Quiñones', true, s.id
FROM sedes s
WHERE s.nombre = 'MBS Recoletos'
LIMIT 1;

-- ── 3. VERIFICACIÓN ──────────────────────────────────────────
SELECT nombre, categoria, precio, duracion_minutos, activo
FROM servicios WHERE activo = true ORDER BY categoria, nombre;

SELECT b.nombre AS barbero, s.nombre AS sede, b.activo
FROM barberos b
LEFT JOIN sedes s ON b.sede_id = s.id
WHERE b.activo = true;
