-- ══════════════════════════════════════════════════════════════════════════
-- Migración: Control de horarios y cierres por sede
-- Ejecutar en Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════════════════

-- 1. Añadir campo de cierre de emergencia a sedes
ALTER TABLE sedes ADD COLUMN IF NOT EXISTS cerrada_emergencia boolean DEFAULT false;

-- 2. Tabla de horarios por sede y día de semana
--    dia_semana: 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
CREATE TABLE IF NOT EXISTS horarios_sedes (
  id              uuid      DEFAULT gen_random_uuid() PRIMARY KEY,
  sede_id         uuid      NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
  dia_semana      int       NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  abierto         boolean   NOT NULL DEFAULT true,
  periodo1_inicio time      NOT NULL DEFAULT '10:00',
  periodo1_fin    time      NOT NULL DEFAULT '14:00',
  periodo2_inicio time,
  periodo2_fin    time,
  UNIQUE(sede_id, dia_semana)
);

-- 3. Tabla de cierres especiales por rango de fechas
CREATE TABLE IF NOT EXISTS cierres_especiales (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  sede_id      uuid        NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
  fecha_inicio date        NOT NULL,
  fecha_fin    date        NOT NULL,
  motivo       text,
  created_at   timestamptz DEFAULT now(),
  CHECK (fecha_fin >= fecha_inicio)
);

-- 4. Row Level Security
ALTER TABLE horarios_sedes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE cierres_especiales ENABLE ROW LEVEL SECURITY;

-- Lectura pública (anon key: web de reservas)
CREATE POLICY "Public read horarios_sedes" ON horarios_sedes
  FOR SELECT USING (true);

CREATE POLICY "Public read cierres_especiales" ON cierres_especiales
  FOR SELECT USING (true);

-- Solo service_role puede escribir
CREATE POLICY "Service write horarios_sedes" ON horarios_sedes
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service write cierres_especiales" ON cierres_especiales
  FOR ALL USING (auth.role() = 'service_role');

-- ══════════════════════════════════════════════════════════════════════════
-- Datos iniciales: horario por defecto para sedes existentes
-- (10-14 / 16-20 lun-vie, 10-19 sáb, dom cerrado)
-- ══════════════════════════════════════════════════════════════════════════
INSERT INTO horarios_sedes (sede_id, dia_semana, abierto, periodo1_inicio, periodo1_fin, periodo2_inicio, periodo2_fin)
SELECT
  s.id,
  d.dia,
  CASE WHEN d.dia = 0 THEN false ELSE true END,
  CASE WHEN d.dia = 0 THEN '10:00' ELSE '10:00' END::time,
  CASE WHEN d.dia = 0 THEN '14:00' WHEN d.dia = 6 THEN '19:00' ELSE '14:00' END::time,
  CASE WHEN d.dia BETWEEN 1 AND 5 THEN '16:00'::time ELSE NULL END,
  CASE WHEN d.dia BETWEEN 1 AND 5 THEN '20:00'::time ELSE NULL END
FROM sedes s
CROSS JOIN (VALUES (0),(1),(2),(3),(4),(5),(6)) AS d(dia)
ON CONFLICT (sede_id, dia_semana) DO NOTHING;
