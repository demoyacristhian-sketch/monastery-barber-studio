-- ============================================================
-- FIX COMPLETO — Monastery Barber Studio
-- Ejecutar en: https://supabase.com/dashboard/project/skxdoxgwpbvrwcqzfqax/
-- ============================================================

-- ── 1. SEDES (por ID exacto para evitar errores) ─────────────
ALTER TABLE sedes ADD COLUMN IF NOT EXISTS orden INT DEFAULT 99;

UPDATE sedes SET
  nombre        = 'MBS San Quirce',
  direccion     = 'C. de San Quirce, 6, local 4',
  ciudad        = 'Valladolid',
  codigo_postal = '47003',
  orden         = 1
WHERE id = '11111111-0000-0000-0000-000000000001';

UPDATE sedes SET
  nombre        = 'MBS Recoletos',
  direccion     = 'Acera de Recoletos, 14',
  ciudad        = 'Valladolid',
  codigo_postal = '47004',
  orden         = 2
WHERE id = '11111111-0000-0000-0000-000000000002';

-- ── 2. SERVICIOS ─────────────────────────────────────────────
UPDATE servicios SET activo = false;

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

-- ── 3. BARBEROS ──────────────────────────────────────────────
UPDATE barberos SET activo = false;

INSERT INTO barberos (nombre, activo, sede_id)
SELECT 'Jonathan Suárez', true, '11111111-0000-0000-0000-000000000001';

INSERT INTO barberos (nombre, activo, sede_id)
SELECT 'Daniel Quiñones', true, '11111111-0000-0000-0000-000000000002';

-- ── 4. VERIFICACIÓN ──────────────────────────────────────────
SELECT 'SEDES' as tabla, nombre, direccion, orden FROM sedes ORDER BY orden;
SELECT 'SERVICIOS' as tabla, nombre, categoria, precio FROM servicios WHERE activo = true ORDER BY categoria, nombre;
SELECT 'BARBEROS' as tabla, b.nombre, s.nombre as sede FROM barberos b JOIN sedes s ON b.sede_id = s.id WHERE b.activo = true;
