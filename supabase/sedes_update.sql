-- ============================================================
-- Actualizar sedes: nombres, direcciones y orden
-- Ejecutar en Supabase SQL Editor (proyecto skxdoxgwpbvrwcqzfqax)
-- ============================================================

-- 1. Añadir columna orden si no existe
ALTER TABLE sedes ADD COLUMN IF NOT EXISTS orden INT DEFAULT 99;

-- 2. MBS San Quirce (Jonathan) → orden 1
UPDATE sedes SET
  nombre        = 'MBS San Quirce',
  direccion     = 'C. de San Quirce, 6, local 4',
  ciudad        = 'Valladolid',
  codigo_postal = '47003',
  orden         = 1
WHERE nombre ILIKE '%quirce%'
   OR nombre ILIKE '%studio%'
   OR nombre ILIKE '%stusio%';

-- 3. MBS Recoletos (Daniel) → orden 2
UPDATE sedes SET
  nombre        = 'MBS Recoletos',
  direccion     = 'Acera de Recoletos, 14',
  ciudad        = 'Valladolid',
  codigo_postal = '47004',
  orden         = 2
WHERE nombre ILIKE '%recoletos%';

-- 4. Verificación
SELECT nombre, direccion, ciudad, orden FROM sedes ORDER BY orden;
